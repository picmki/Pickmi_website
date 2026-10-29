export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const name = body.name || 'User';

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ success: false, error: 'A valid email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const env = context.env || {};
    const resendApiKey = env.RESEND_API_KEY;
    const fromEmail = env.EMAIL_FROM || 'Pickmi <onboarding@resend.dev>';

    let delivered = false;
    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: `Pickmi Verification Code: ${otp}`,
            html: `<div style="font-family: sans-serif; padding: 20px;"><h2>Your Pickmi Verification Code</h2><p>Hello ${name},</p><p>Your code is: <b style="font-size: 24px; color: #0043DC;">${otp}</b></p></div>`
          })
        });
        if (resendRes.ok) {
          delivered = true;
        }
      } catch (e) {}
    }

    return new Response(JSON.stringify({
      success: true,
      emailDelivered: delivered,
      devOtp: delivered ? undefined : otp
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
