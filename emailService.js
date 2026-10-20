import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inlined Pickmi white logo (5.8 KB)
const PICKMI_LOGO_BASE64 = "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";

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

export function getEmailConfig() {
  loadEnv();
  return {
    provider: (process.env.EMAIL_PROVIDER || "resend").toLowerCase(),
    resendApiKey: process.env.RESEND_API_KEY || "",
    sendgridApiKey: process.env.SENDGRID_API_KEY || "",
    fromEmail: process.env.EMAIL_FROM || "Pickmi <onboarding@resend.dev>",
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || "info@pickmicabs.com"
  };
}

/**
 * Send an email via Resend or SendGrid REST API
 * Zero third-party npm dependencies (uses native fetch)
 */
export async function sendEmail({ to, subject, html, replyTo }) {
  const config = getEmailConfig();

  if (!to || !to.includes("@")) {
    throw new Error(`Invalid recipient email address: "${to}"`);
  }

  // 1. Resend API
  if (config.provider === "resend") {
    if (!config.resendApiKey) {
      console.warn("[Email] RESEND_API_KEY is not configured in .env. Falling back to local logging.");
      return logMockEmail({ provider: "Resend", to, subject, html });
    }

    const payload = {
      from: config.fromEmail,
      to: [to],
      subject,
      html
    };
    if (replyTo) payload.reply_to = replyTo;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`Resend API Error (${res.status}): ${JSON.stringify(data)}`);
    }

    console.log(`[Email] Sent successfully via Resend to ${to} (ID: ${data.id || "ok"})`);
    return { success: true, provider: "resend", id: data.id };
  }

  // 2. SendGrid API
  if (config.provider === "sendgrid") {
    if (!config.sendgridApiKey) {
      console.warn("[Email] SENDGRID_API_KEY is not configured in .env. Falling back to local logging.");
      return logMockEmail({ provider: "SendGrid", to, subject, html });
    }

    let fromEmail = config.fromEmail;
    let fromName = "Pickmi";
    const match = config.fromEmail.match(/^(.*)<(.*)>$/);
    if (match) {
      fromName = match[1].trim();
      fromEmail = match[2].trim();
    }

    const payload = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: fromName },
      subject,
      content: [{ type: "text/html", value: html }]
    };
    if (replyTo) payload.reply_to = { email: replyTo };

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.sendgridApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`SendGrid API Error (${res.status}): ${errText}`);
    }

    console.log(`[Email] Sent successfully via SendGrid to ${to}`);
    return { success: true, provider: "sendgrid" };
  }

  return logMockEmail({ provider: config.provider, to, subject, html });
}

function logMockEmail({ provider, to, subject, html }) {
  const dir = path.join(__dirname, "sent_emails");
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filename = `email_${Date.now()}_${to.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
    fs.writeFileSync(path.join(dir, filename), html, "utf8");
    console.log(`[Email Mock] Preview saved to ${path.join(dir, filename)}`);
  } catch (e) {}

  return {
    success: true,
    mock: true,
    provider: `${provider} (Mock Mode - set API key in .env for live sending)`,
    to,
    subject
  };
}

// ==========================================
// Branded Pickmi HTML Templates (No Emojis, Logo Included)
// ==========================================

export function buildWelcomeEmailTemplate({ name, email, mobile }) {
  const customerName = name || "Valued Member";
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Pickmi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6fa; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);" cellpadding="0" cellspacing="0">
          
          <!-- Header Banner with Pickmi Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #0043DC 0%, #002d94 100%); padding: 36px 32px; text-align: center;">
              <img src="data:image/png;base64,${PICKMI_LOGO_BASE64}" alt="Pickmi" style="height: 44px; width: auto; display: inline-block; margin-bottom: 8px;" />
              <p style="margin: 6px 0 0; color: #e0e7ff; font-size: 14px; font-weight: 500; letter-spacing: 0.3px;">Premium Intercity and Local Travel</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 700;">Welcome, ${customerName}!</h2>
              <p style="margin: 0 0 20px; line-height: 1.6; color: #4b5563; font-size: 15px;">
                Your Pickmi account has been successfully created. You are now ready to experience seamless outstation rides, airport transfers, and one-way journeys with zero surge pricing and transparent billing.
              </p>

              <!-- Account Summary Card -->
              <table width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 24px 0; padding: 20px;" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Registered Email</strong>
                    <div style="color: #0f172a; font-size: 15px; font-weight: 600; margin-top: 2px;">${email}</div>
                  </td>
                </tr>
                ${mobile ? `
                <tr>
                  <td style="padding-top: 8px; border-top: 1px solid #edf2f7;">
                    <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Mobile Number</strong>
                    <div style="color: #0f172a; font-size: 15px; font-weight: 600; margin-top: 2px;">${mobile}</div>
                  </td>
                </tr>` : ""}
              </table>

              <!-- Perks Grid (No Emojis) -->
              <h3 style="margin: 28px 0 16px; color: #111827; font-size: 16px; font-weight: 700;">Why riders choose Pickmi:</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="33%" style="padding: 12px 8px; vertical-align: top;">
                    <div style="width: 28px; height: 28px; line-height: 28px; text-align: center; background-color: #eff6ff; color: #0043DC; font-weight: 800; font-size: 13px; border-radius: 6px; margin-bottom: 8px;">01</div>
                    <strong style="color: #1e293b; font-size: 13px; display: block; margin-bottom: 4px;">Verified Chauffeurs</strong>
                    <span style="color: #64748b; font-size: 12px; line-height: 1.4;">Strictly background-checked and commercially licensed.</span>
                  </td>
                  <td width="33%" style="padding: 12px 8px; vertical-align: top;">
                    <div style="width: 28px; height: 28px; line-height: 28px; text-align: center; background-color: #eff6ff; color: #0043DC; font-weight: 800; font-size: 13px; border-radius: 6px; margin-bottom: 8px;">02</div>
                    <strong style="color: #1e293b; font-size: 13px; display: block; margin-bottom: 4px;">Zero Surge</strong>
                    <span style="color: #64748b; font-size: 12px; line-height: 1.4;">Fixed, all-inclusive kilometer fares anytime.</span>
                  </td>
                  <td width="33%" style="padding: 12px 8px; vertical-align: top;">
                    <div style="width: 28px; height: 28px; line-height: 28px; text-align: center; background-color: #eff6ff; color: #0043DC; font-weight: 800; font-size: 13px; border-radius: 6px; margin-bottom: 8px;">03</div>
                    <strong style="color: #1e293b; font-size: 13px; display: block; margin-bottom: 4px;">Instant OTP</strong>
                    <span style="color: #64748b; font-size: 12px; line-height: 1.4;">Secure ride authentication before every trip starts.</span>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                <tr>
                  <td align="center">
                    <a href="http://localhost:4200" target="_blank" style="display: inline-block; background-color: #0043DC; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px;">
                      Book Your First Ride
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 13px; line-height: 1.5;">
              <p style="margin: 0 0 8px;">Pickmi Technologies Private Limited</p>
              <p style="margin: 0;">Need help? Email <a href="mailto:support@pickmicabs.com" style="color: #0043DC; text-decoration: none;">support@pickmicabs.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export function buildBookingEmailTemplate({ booking }) {
  const pName = booking.passengerName || "Valued Passenger";
  const bookingId = booking.id || "PKM-" + Date.now();
  const otp = booking.reservationOtp || "----";
  const pickup = booking.pickup || "Pickup Location";
  const drop = booking.drop || "Drop Location";
  const pickupTime = booking.pickupTime || "Scheduled Pickup";
  const vehicle = (booking.vehicleCategory || "Sedan") + " (" + (booking.vehicleModel || "Etios / Dzire") + ")";
  const totalFare = booking.fare?.total || 0;
  const advancePaid = typeof booking.advancePaid === "number" ? booking.advancePaid : 0;
  const balanceDue = Math.max(0, totalFare - advancePaid);
  const paymentMethod = booking.paymentMethod || "Pay Full to Driver";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickmi Booking Verification - ${bookingId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6fa; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);" cellpadding="0" cellspacing="0">
          
          <!-- Header Banner with Pickmi Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #0043DC 0%, #002d94 100%); padding: 32px; text-align: center;">
              <img src="data:image/png;base64,${PICKMI_LOGO_BASE64}" alt="Pickmi" style="height: 42px; width: auto; display: inline-block; margin-bottom: 12px;" />
              <div>
                <span style="display: inline-block; background-color: rgba(255,255,255,0.18); color: #ffffff; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px;">Pickmi Booking Verification</span>
              </div>
              <h1 style="margin: 6px 0 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.3px;">Booking ID: ${bookingId}</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px; font-size: 15px; color: #4b5563;">
                Hi <strong>${pName}</strong>, your ride has been successfully booked with Pickmi. Below are your verified travel details:
              </p>

              <!-- OTP Card -->
              <table width="100%" style="background-color: #eff6ff; border: 1.5px dashed #3b82f6; border-radius: 12px; margin-bottom: 24px; padding: 18px;" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="color: #1e40af; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;">Trip Start OTP</span>
                    <div style="font-size: 32px; font-weight: 900; color: #0043DC; letter-spacing: 6px; margin: 4px 0;">${otp}</div>
                    <span style="color: #64748b; font-size: 12px;">Share this OTP with your chauffeur only when you board the vehicle.</span>
                  </td>
                </tr>
              </table>

              <!-- Route Card (No Emojis) -->
              <table width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; padding: 20px;" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <div style="color: #10b981; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">PICKUP LOCATION</div>
                    <div style="color: #0f172a; font-size: 15px; font-weight: 600;">${pickup}</div>
                    <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Scheduled: ${pickupTime}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px; border-top: 1px solid #edf2f7;">
                    <div style="color: #ef4444; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">DROP LOCATION</div>
                    <div style="color: #0f172a; font-size: 15px; font-weight: 600;">${drop}</div>
                  </td>
                </tr>
              </table>

              <!-- Vehicle & Chauffeur Info -->
              <table width="100%" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; padding: 18px;" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <span style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 600;">Selected Vehicle</span>
                    <div style="color: #0f172a; font-size: 15px; font-weight: 700; margin-top: 2px;">${vehicle}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; border-top: 1px solid #f1f5f9;">
                    <span style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 600;">Chauffeur Status</span>
                    <div style="color: #0284c7; font-size: 14px; font-weight: 600; margin-top: 2px;">
                      ${booking.driver ? booking.driver.name + " (" + booking.driver.phone + ")" : "Chauffeur details will be assigned and SMS-alerted prior to pickup"}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Price Breakdown -->
              <h3 style="margin: 0 0 12px; color: #111827; font-size: 15px; font-weight: 700;">Fare Breakdown:</h3>
              <table width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #64748b; font-size: 14px; padding-bottom: 8px;">Estimated Distance:</td>
                  <td align="right" style="color: #0f172a; font-size: 14px; font-weight: 600; padding-bottom: 8px;">${booking.distanceKm || "45"} km</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 14px; padding-bottom: 8px;">Payment Mode:</td>
                  <td align="right" style="color: #0f172a; font-size: 14px; font-weight: 600; padding-bottom: 8px;">${paymentMethod}</td>
                </tr>
                ${advancePaid > 0 ? `
                <tr>
                  <td style="color: #10b981; font-size: 14px; padding-bottom: 8px;">Advance Paid Online:</td>
                  <td align="right" style="color: #10b981; font-size: 14px; font-weight: 700; padding-bottom: 8px;">- Rs. ${advancePaid}</td>
                </tr>` : ""}
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="color: #0f172a; font-size: 15px; font-weight: 800; padding-top: 10px;">${advancePaid > 0 ? "Remaining to Pay Driver" : "Total Fare Payable"}:</td>
                  <td align="right" style="color: #0043DC; font-size: 18px; font-weight: 800; padding-top: 10px;">Rs. ${balanceDue.toLocaleString("en-IN")}</td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="http://localhost:4200" target="_blank" style="display: inline-block; background-color: #0043DC; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px;">
                      Track Ride on Website
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 13px;">
              <p style="margin: 0 0 6px;">Toll taxes, driver allowance and GST included per quotation terms.</p>
              <p style="margin: 0;">Need immediate changes? Contact 24/7 Support Desk at <a href="tel:+919999999999" style="color: #0043DC; text-decoration: none;">+91 99999 99999</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export function buildPaymentReceiptEmailTemplate({ booking, paymentDetails }) {
  const pName = booking.passengerName || "Valued Customer";
  const bookingId = booking.id || "PKM-" + Date.now();
  const amount = paymentDetails?.amount || (booking.advancePaid > 0 ? booking.advancePaid : booking.fare?.total || 0);
  const paymentMode = paymentDetails?.method || (booking.advancePaid > 0 ? "Online Payment (Advance Rs. 100)" : "Cash / UPI to Driver");
  const txnId = paymentDetails?.transactionId || ("TXN_" + Math.floor(10000000 + Math.random() * 90000000));
  const dateStr = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - ${txnId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6fa; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);" cellpadding="0" cellspacing="0">
          
          <!-- Header Banner with Pickmi Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center;">
              <img src="data:image/png;base64,${PICKMI_LOGO_BASE64}" alt="Pickmi" style="height: 42px; width: auto; display: inline-block; margin-bottom: 12px;" />
              <div>
                <span style="display: inline-block; background-color: rgba(255,255,255,0.2); color: #ffffff; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px;">Payment Successful</span>
              </div>
              <h1 style="margin: 6px 0 0; color: #ffffff; font-size: 24px; font-weight: 800;">Receipt Ref: ${txnId}</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px; font-size: 15px; color: #4b5563;">
                Hi <strong>${pName}</strong>, thank you for your payment. Here is your official payment receipt for booking <strong>#${bookingId}</strong>.
              </p>

              <!-- Payment Amount Card -->
              <table width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin-bottom: 24px; padding: 20px; text-align: center;" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="color: #166534; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Amount Paid</span>
                    <div style="font-size: 34px; font-weight: 900; color: #059669; margin: 4px 0;">Rs. ${Number(amount).toLocaleString("en-IN")}</div>
                    <span style="color: #64748b; font-size: 13px;">${dateStr}</span>
                  </td>
                </tr>
              </table>

              <!-- Details Table -->
              <table width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; padding: 18px;" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #64748b; font-size: 14px; padding-bottom: 10px;">Booking Reference:</td>
                  <td align="right" style="color: #0f172a; font-size: 14px; font-weight: 700; padding-bottom: 10px;">#${bookingId}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 14px; padding-bottom: 10px;">Payment Method:</td>
                  <td align="right" style="color: #0f172a; font-size: 14px; font-weight: 600; padding-bottom: 10px;">${paymentMode}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 14px; padding-bottom: 10px;">Pickup Route:</td>
                  <td align="right" style="color: #0f172a; font-size: 13px; font-weight: 600; padding-bottom: 10px; max-width: 250px;">${booking.pickup}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 14px; padding-bottom: 10px;">Destination:</td>
                  <td align="right" style="color: #0f172a; font-size: 13px; font-weight: 600; padding-bottom: 10px; max-width: 250px;">${booking.drop}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 14px; padding-top: 10px; border-top: 1px solid #e2e8f0;">Total Trip Quotation:</td>
                  <td align="right" style="color: #0f172a; font-size: 15px; font-weight: 700; padding-top: 10px; border-top: 1px solid #e2e8f0;">Rs. ${Number(booking.fare?.total || amount).toLocaleString("en-IN")}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 13px;">
              <p style="margin: 0 0 4px;">This is a computer-generated receipt for your records.</p>
              <p style="margin: 0;">For billing queries, reach us at <a href="mailto:billing@pickmicabs.com" style="color: #059669; text-decoration: none;">billing@pickmicabs.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}


export function buildOtpEmailTemplate({ email, otp, name }) {
  const customerName = name || "Valued Rider";
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pickmi Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6fa; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);" cellpadding="0" cellspacing="0">
          
          <!-- Header Banner with Pickmi Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #0043DC 0%, #002d94 100%); padding: 32px; text-align: center;">
              <img src="data:image/png;base64,${PICKMI_LOGO_BASE64}" alt="Pickmi" style="height: 40px; width: auto; display: inline-block; margin-bottom: 6px;" />
              <p style="margin: 4px 0 0; color: #e0e7ff; font-size: 13px; font-weight: 500; letter-spacing: 0.3px;">Account Security & Verification</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 12px; color: #111827; font-size: 20px; font-weight: 800;">Verify Your Pickmi Account</h2>
              <p style="margin: 0 0 20px; line-height: 1.6; color: #4b5563; font-size: 14px;">
                Hello <strong>${customerName}</strong>,<br/>
                We received a sign-in or registration request for <strong>${email}</strong>. Use the verification code below to complete your login:
              </p>

              <!-- OTP Code Display Card -->
              <table width="100%" style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 14px; margin: 24px 0; padding: 24px 16px; text-align: center;" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your Verification Code</div>
                    <div style="font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #0043DC; padding: 8px 0;">${otp}</div>
                    <div style="font-size: 12px; color: #94a3b8; font-weight: 500; margin-top: 8px;">Valid for 10 minutes • Do not share with anyone</div>
                  </td>
                </tr>
              </table>

              <!-- Security Tips -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; margin: 16px 0;">
                <tr>
                  <td style="color: #166534; font-size: 12px; line-height: 1.5;">
                    <strong>Security Notice:</strong> Pickmi representatives will never ask you for this OTP over the phone or email. If you did not request this code, no action is needed.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0 0 4px;">Pickmi Cab Technologies Pvt Ltd</p>
              <p style="margin: 0;">Need help? Contact <a href="mailto:support@pickmicabs.com" style="color: #0043DC; text-decoration: none;">support@pickmicabs.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
