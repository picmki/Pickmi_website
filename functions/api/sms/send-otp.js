export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const rawPhone = (body.phone || body.mobile || '').trim();
    const cleanNum = rawPhone.replace(/\D/g, '').slice(-10);

    if (!cleanNum || cleanNum.length !== 10) {
      return new Response(JSON.stringify({ success: false, error: 'A valid 10-digit mobile number is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const env = context.env || {};
    const accountSid = env.TWILIO_ACCOUNT_SID;
    const authToken = env.TWILIO_AUTH_TOKEN;
    const fromPhone = env.TWILIO_PHONE_NUMBER;
    const toPhone = `+91${cleanNum}`;
    const smsMessage = `Welcome to Pickmi! Your OTP is ${otp}. Verify your account and get started. Enjoy a smooth drive. Go with us!`;

    let sent = false;
    let errorMsg = '';

    if (accountSid && authToken && fromPhone) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const basicAuth = btoa(`${accountSid}:${authToken}`);
        const formBody = new URLSearchParams({
          To: toPhone,
          From: fromPhone,
          Body: smsMessage
        });

        const twilioRes = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formBody.toString()
        });

        const twilioData = await twilioRes.json().catch(() => ({}));
        if (twilioRes.ok && twilioData.sid) {
          sent = true;
        } else {
          errorMsg = twilioData.message || 'Twilio dispatch failed';
        }
      } catch (e) {
        errorMsg = e.message;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      mode: sent ? 'live' : 'mock',
      devOtp: sent ? undefined : otp,
      message: sent ? `SMS sent to +91 ${cleanNum}` : `Verification code generated for +91 ${cleanNum}`,
      error: errorMsg || undefined
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
