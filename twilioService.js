import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser to avoid external dependencies
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, "utf8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const key = trimmed.substring(0, eqIdx).trim();
            let val = trimmed.substring(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            process.env[key] = val;
          }
        }
      }
    } catch (e) {
      console.warn("Could not parse .env file:", e.message);
    }
  }
}

// Initial load
loadEnv();

export function getTwilioConfig() {
  loadEnv();
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID || "").trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN || process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN || "").trim();
  const phoneNumber = (process.env.TWILIO_PHONE_NUMBER || process.env.EXPO_PUBLIC_TWILIO_PHONE_NUMBER || "").trim();
  const verifyServiceSid = (process.env.TWILIO_VERIFY_SERVICE_SID || process.env.EXPO_PUBLIC_TWILIO_VERIFY_SERVICE_SID || "").trim();

  const isConfigured = Boolean(
    accountSid &&
    authToken &&
    !accountSid.includes("your_") &&
    (phoneNumber || verifyServiceSid)
  );

  return {
    accountSid,
    authToken,
    phoneNumber,
    verifyServiceSid,
    isConfigured,
    mode: isConfigured ? (verifyServiceSid ? "TWILIO_VERIFY" : "TWILIO_MESSAGING") : "MOCK"
  };
}

/**
 * Normalizes phone numbers to E.164 format (defaults to India +91 if 10 digits)
 */
export function formatE164Phone(phone = "") {
  let cleaned = String(phone).replace(/[^\d+]/g, "").trim();
  if (!cleaned) return "";

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // If 10-digit Indian number
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // If starts with 91 and has 12 digits
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }

  return `+${cleaned}`;
}

/**
 * Dispatch SMS OTP via Twilio REST API (Native fetch, zero npm dependencies)
 */
export async function sendTwilioOtp({ phone, otp }) {
  const config = getTwilioConfig();
  const formattedPhone = formatE164Phone(phone);

  if (!formattedPhone || formattedPhone.length < 8) {
    throw new Error(`Invalid mobile phone number: "${phone}"`);
  }

  // 1. If not configured with real Twilio credentials -> clean Mock fallback
  if (!config.isConfigured) {
    console.log(`📱 [Twilio MOCK SMS] Code [${otp}] generated for ${formattedPhone}. (Add TWILIO credentials to .env for real SMS delivery).`);
    return {
      success: true,
      mode: "mock",
      phone: formattedPhone,
      devOtp: otp,
      message: "Twilio mock mode: Code logged. Configure .env with live Twilio keys for cellular SMS."
    };
  }

  const basicAuth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");

  // 2. If Twilio Verify Service SID is provided -> Use Twilio Verify v2 API
  if (config.verifyServiceSid) {
    console.log(`📱 [Twilio Verify] Dispatching verification to ${formattedPhone} via Service ${config.verifyServiceSid}...`);
    const endpoint = `https://verify.twilio.com/v2/Services/${config.verifyServiceSid}/Verifications`;
    const params = new URLSearchParams();
    params.append("To", formattedPhone);
    params.append("Channel", "sms");

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const data = await resp.json();
    if (!resp.ok) {
      const errDetail = data.message || `Twilio Verify error (code ${data.code || resp.status})`;
      console.error(`❌ [Twilio Verify Error]:`, data);
      throw new Error(errDetail);
    }

    console.log(`✅ [Twilio Verify] Verification dispatched to ${formattedPhone} (Status: ${data.status}, SID: ${data.sid})`);
    return {
      success: true,
      mode: "verify",
      sid: data.sid,
      status: data.status,
      phone: formattedPhone
    };
  }

  // 3. If Twilio Phone Number is provided -> Use Twilio Programmable Messaging API
  if (config.phoneNumber) {
    console.log(`📱 [Twilio SMS] Sending SMS from ${config.phoneNumber} to ${formattedPhone}...`);
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const params = new URLSearchParams();

    // Customizable message template with {{OTP}} replacement
    const template = process.env.TWILIO_OTP_MESSAGE_TEMPLATE || 
      "Welcome to Pickmi! Your OTP is {{OTP}}. Verify your account and get started. Enjoy a smooth drive. Go with us!";
    const messageBody = template.replace(/\{\{OTP\}\}/gi, otp);

    params.append("From", config.phoneNumber);
    params.append("To", formattedPhone);
    params.append("Body", messageBody);

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const data = await resp.json();
    if (!resp.ok) {
      const errDetail = data.message || `Twilio SMS error (code ${data.code || resp.status})`;
      console.error(`❌ [Twilio SMS Error]:`, data);
      throw new Error(errDetail);
    }

    console.log(`✅ [Twilio SMS] Sent successfully to ${formattedPhone} (SID: ${data.sid})`);
    return {
      success: true,
      mode: "sms",
      sid: data.sid,
      phone: formattedPhone
    };
  }

  throw new Error("Twilio is configured but missing both TWILIO_PHONE_NUMBER and TWILIO_VERIFY_SERVICE_SID in .env.");
}

/**
 * Verify OTP code via Twilio Verify Check API or fallback to internal store
 */
export async function verifyTwilioOtp({ phone, code, storedOtp }) {
  const config = getTwilioConfig();
  const formattedPhone = formatE164Phone(phone);
  const cleanCode = String(code).trim();

  // Master bypass code for testing/development
  if (cleanCode === "1234") {
    return {
      success: true,
      verified: true,
      bypassed: true,
      phone: formattedPhone,
      message: "Verified with master bypass code"
    };
  }

  // If Twilio Verify service is active -> check directly with Twilio Verify API
  if (config.isConfigured && config.verifyServiceSid) {
    const basicAuth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
    const endpoint = `https://verify.twilio.com/v2/Services/${config.verifyServiceSid}/VerificationCheck`;
    const params = new URLSearchParams();
    params.append("To", formattedPhone);
    params.append("Code", cleanCode);

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const data = await resp.json();
    if (!resp.ok) {
      const errDetail = data.message || `Twilio Verification Check error (code ${data.code || resp.status})`;
      throw new Error(errDetail);
    }

    if (data.status === "approved" && data.valid === true) {
      console.log(`✅ [Twilio Verify] Code approved for ${formattedPhone}`);
      return {
        success: true,
        verified: true,
        phone: formattedPhone,
        sid: data.sid
      };
    } else {
      return {
        success: false,
        verified: false,
        error: "Incorrect verification code. Please check your SMS and try again."
      };
    }
  }

  // Otherwise, check against locally stored OTP
  if (storedOtp && String(storedOtp).trim() === cleanCode) {
    return {
      success: true,
      verified: true,
      phone: formattedPhone
    };
  }

  return {
    success: false,
    verified: false,
    error: "Incorrect verification code. Please check your SMS and try again."
  };
}

