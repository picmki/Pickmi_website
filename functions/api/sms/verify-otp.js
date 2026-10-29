export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const rawPhone = (body.phone || body.mobile || '').trim();
    const cleanNum = rawPhone.replace(/\D/g, '').slice(-10);
    const enteredOtp = String(body.otp || '').trim();

    if (!cleanNum || !enteredOtp) {
      return new Response(JSON.stringify({ success: false, error: 'Phone and OTP are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      verified: true,
      phone: cleanNum
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
