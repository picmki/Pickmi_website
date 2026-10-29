export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const enteredOtp = String(body.otp || '').trim();

    if (!email || !enteredOtp) {
      return new Response(JSON.stringify({ success: false, error: 'Email and OTP are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      verified: true,
      email
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
