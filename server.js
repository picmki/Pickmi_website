import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  sendEmail,
  getEmailConfig,
  buildWelcomeEmailTemplate,
  buildBookingEmailTemplate,
  buildPaymentReceiptEmailTemplate,
  buildOtpEmailTemplate
} from './emailService.js';
import {
  sendTwilioOtp,
  verifyTwilioOtp,
  getTwilioConfig,
  formatE164Phone
} from './twilioService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 4200;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const placesCache = new Map();
const otpStore = new Map();

// Helper to parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2e6) { // 2MB max
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const reqPath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // ==========================================
  // 📧 Email Notification API Endpoints
  // ==========================================

  // 1. Get current email service status
  if (reqPath === '/api/email/config' && req.method === 'GET') {
    const config = getEmailConfig();
    const isConfigured = Boolean(
      (config.provider === 'resend' && config.resendApiKey) ||
      (config.provider === 'sendgrid' && config.sendgridApiKey)
    );
    return sendJsonResponse(res, 200, {
      provider: config.provider,
      from: config.fromEmail,
      adminNotification: config.adminEmail,
      isConfigured,
      mode: isConfigured ? 'LIVE' : 'MOCK (Saving to sent_emails/)'
    });
  }

  // 2. Send Welcome Email upon new user registration
  if (reqPath === '/api/email/welcome' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const { email, name, mobile } = payload;

      if (!email || !email.includes('@')) {
        return sendJsonResponse(res, 400, { success: false, error: 'Valid email is required' });
      }

      const html = buildWelcomeEmailTemplate({ name, email, mobile });
      const result = await sendEmail({
        to: email,
        subject: `Welcome to Pickmi, ${name || 'Rider'}!`, 
        html
      });

      return sendJsonResponse(res, 200, { success: true, message: 'Welcome email sent', result });
    } catch (err) {
      console.error('❌ [Email] Welcome email error:', err);
      return sendJsonResponse(res, 500, { success: false, error: err.message });
    }
  }

  // 3. Send Booking Confirmation Email
  if (reqPath === '/api/email/booking' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const booking = payload.booking || payload;

      const recipient = booking.passengerEmail;
      if (!recipient || !recipient.includes('@')) {
        return sendJsonResponse(res, 400, {
          success: false,
          error: 'Booking passengerEmail is required'
        });
      }

      const html = buildBookingEmailTemplate({ booking });
      const result = await sendEmail({
        to: recipient,
        subject: `Pickmi Booking Verification: #${booking.id} (${booking.pickup?.split(',')[0] || 'Pickup'} to ${booking.drop?.split(',')[0] || 'Drop'})`,
        html
      });

      // Optionally send notification copy to admin
      const config = getEmailConfig();
      if (config.adminEmail && config.adminEmail !== recipient) {
        sendEmail({
          to: config.adminEmail,
          subject: `[Admin Alert] New Booking: #${booking.id} by ${booking.passengerName || 'Customer'}`,
          html
        }).catch(e => console.warn('Admin booking email alert error:', e.message));
      }

      return sendJsonResponse(res, 200, { success: true, message: 'Booking confirmation email sent', result });
    } catch (err) {
      console.error('❌ [Email] Booking email error:', err);
      return sendJsonResponse(res, 500, { success: false, error: err.message });
    }
  }

  // 4. Send Payment Receipt Email
  if (reqPath === '/api/email/payment' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const booking = payload.booking || {};
      const paymentDetails = payload.paymentDetails || payload;

      const recipient = booking.passengerEmail || paymentDetails.passengerEmail;
      if (!recipient || !recipient.includes('@')) {
        return sendJsonResponse(res, 400, {
          success: false,
          error: 'Passenger email is required'
        });
      }

      const html = buildPaymentReceiptEmailTemplate({ booking, paymentDetails });
      const result = await sendEmail({
        to: recipient,
        subject: `Payment Receipt: Booking #${booking.id || 'PKM'} - Rs. ${paymentDetails.amount || 100}`,
        html
      });

      return sendJsonResponse(res, 200, { success: true, message: 'Payment receipt email sent', result });
    } catch (err) {
      console.error('❌ [Email] Payment email error:', err);
      return sendJsonResponse(res, 500, { success: false, error: err.message });
    }
  }

  // 5. Test Email Endpoint
  if (reqPath === '/api/email/test' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const targetEmail = payload.email;
      if (!targetEmail || !targetEmail.includes('@')) {
        return sendJsonResponse(res, 400, { success: false, error: 'Target email is required' });
      }

      const testBooking = {
        id: 'PKM-TEST-' + Math.floor(1000 + Math.random() * 9000),
        reservationOtp: '7821',
        pickup: 'Kempegowda International Airport (BLR), Bengaluru',
        drop: 'Electronic City Phase 1, Bengaluru',
        pickupTime: 'Today at 07:30 PM',
        vehicleCategory: 'Sedan',
        vehicleModel: 'Toyota Etios / Swift Dzire',
        passengerName: payload.name || 'Test Traveler',
        passengerEmail: targetEmail,
        distanceKm: 52,
        fare: { total: 1499 },
        advancePaid: 100,
        paymentMethod: 'Advance ₹100 Paid Online'
      };

      const html = buildBookingEmailTemplate({ booking: testBooking });
      const result = await sendEmail({
        to: targetEmail,
        subject: `Pickmi Booking Verification: #${testBooking.id}`,
        html
      });

      return sendJsonResponse(res, 200, { success: true, message: 'Test email dispatched', result });
    } catch (err) {
      console.error('❌ [Email] Test email error:', err);
      return sendJsonResponse(res, 500, { success: false, error: err.message });
    }
  }

  // ==========================================
  // 🚗 Fleet & Rental Configuration API
  // ==========================================
  if (reqPath === '/api/fleet-config') {
    const configPath = path.join(__dirname, 'config', 'fleet-config.json');

    if (req.method === 'GET') {
      try {
        if (fs.existsSync(configPath)) {
          const raw = fs.readFileSync(configPath, 'utf8');
          return sendJsonResponse(res, 200, JSON.parse(raw));
        }
      } catch (err) {
        console.error('Error reading fleet config:', err);
      }
      return sendJsonResponse(res, 200, { fleet: [], rentalPackages: [], pricing: {} });
    }

    if (req.method === 'POST') {
      try {
        const payload = await parseJsonBody(req);
        const configDir = path.join(__dirname, 'config');
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
        fs.writeFileSync(configPath, JSON.stringify(payload, null, 2), 'utf8');
        console.log('✅ [Fleet Config] Updated fleet & rental rules configuration');
        return sendJsonResponse(res, 200, { success: true, message: 'Configuration saved successfully' });
      } catch (err) {
        console.error('Error saving fleet config:', err);
        return sendJsonResponse(res, 500, { success: false, error: err.message });
      }
    }
  }

  // ==========================================
  // 🗺️ Google Maps Place Search API Endpoint
  // ==========================================
  if (reqPath === '/api/places') {
    const query = (parsedUrl.searchParams.get('q') || '').trim();
    if (!query || query.length < 2) {
      return sendJsonResponse(res, 200, { query, results: [] });
    }

    const cacheKey = query.toLowerCase();
    if (placesCache.has(cacheKey)) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600'
      });
      return res.end(JSON.stringify({ query, results: placesCache.get(cacheKey) }));
    }

    try {
      const results = [];
      const seen = new Set();

      // Query Nominatim with India countrycode bias
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=in&limit=8`;
      const osmRes = await fetch(nominatimUrl, {
        headers: { 'User-Agent': 'Pickmi-Cabs-GoogleMapsSearch/1.0', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      }).catch(() => null);

      if (osmRes && osmRes.ok) {
        const data = await osmRes.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            const addr = item.address || {};
            const area = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.commercial || addr.road || addr.village || item.name || '';
            const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.state_district || '';
            const state = addr.state || '';
            const postcode = addr.postcode ? ` - ${addr.postcode}` : '';

            let primary = item.name || area || city || item.display_name.split(',')[0].trim();
            if (city && primary && primary.toLowerCase() !== city.toLowerCase() && !primary.toLowerCase().includes(city.toLowerCase())) {
              primary = `${primary}, ${city}`;
            }

            const secParts = [];
            if (addr.state_district && addr.state_district !== city) secParts.push(addr.state_district);
            if (state) secParts.push(state);
            if (postcode) secParts.push(postcode.replace(' - ', ''));
            const secondary = secParts.join(', ') || 'India';

            const key = (primary + ' ' + (city || state)).toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              results.push({
                id: `gmap-${item.place_id || Math.random()}`,
                primary,
                secondary,
                label: `${primary}${secondary ? ', ' + secondary : ''}`,
                city: city || primary,
                area: area || primary,
                state,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                type: item.type || item.class || 'area',
                source: 'gmaps'
              });
            }
          }
        }
      }

      // Fallback to Photon
      if (results.length === 0) {
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`;
        const photonRes = await fetch(photonUrl, { signal: AbortSignal.timeout(3000) }).catch(() => null);
        if (photonRes && photonRes.ok) {
          const pData = await photonRes.json();
          if (pData && Array.isArray(pData.features)) {
            for (const feat of pData.features) {
              const props = feat.properties || {};
              const [lon, lat] = feat.geometry?.coordinates || [0, 0];
              const name = props.name || '';
              const city = props.city || props.town || props.village || props.district || '';
              const state = props.state || '';
              let primary = name || city;
              if (city && name && name.toLowerCase() !== city.toLowerCase()) {
                primary = `${name}, ${city}`;
              }
              const sec = [props.district !== city ? props.district : '', state, props.postcode].filter(Boolean).join(', ') || 'India';
              const key = (primary + ' ' + (city || state)).toLowerCase();
              if (!seen.has(key)) {
                seen.add(key);
                results.push({
                  id: `gmap-${props.osm_id || Math.random()}`,
                  primary,
                  secondary: sec,
                  label: `${primary}, ${sec}`,
                  city: city || name,
                  area: name || city,
                  state,
                  lat: parseFloat(lat),
                  lon: parseFloat(lon),
                  type: props.osm_value || 'area',
                  source: 'gmaps'
                });
              }
            }
          }
        }
      }

      if (results.length > 0) {
        placesCache.set(cacheKey, results);
      }

      return sendJsonResponse(res, 200, { query, results });
    } catch (e) {
      return sendJsonResponse(res, 200, { query, results: [], error: e.message });
    }
  }

  // ==========================================
  // 📍 User Location Auto-Detect API Endpoint
  // ==========================================
  if (reqPath === '/api/user-location' && req.method === 'GET') {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || '');
    const isLocal = !ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::ffff:127.0.0.1';

    try {
      // 1. Try BigDataCloud client reverse geocoding
      const bdcUrl = isLocal
        ? 'https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en'
        : `https://api.bigdatacloud.net/data/reverse-geocode-client?ip=${encodeURIComponent(ip)}&localityLanguage=en`;
      const bdcRes = await fetch(bdcUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      }).catch(() => null);

      if (bdcRes && bdcRes.ok) {
        const bData = await bdcRes.json();
        const detectedCity = bData.city || bData.locality || bData.principalSubdivision;
        if (detectedCity) {
          return sendJsonResponse(res, 200, {
            success: true,
            city: detectedCity,
            region: bData.principalSubdivision || '',
            country: bData.countryName || 'India',
            latitude: bData.latitude,
            longitude: bData.longitude,
            source: 'bigdatacloud'
          });
        }
      }

      // 2. Try ipwho.is fallback
      const ipwhoUrl = isLocal ? 'https://ipwho.is/' : `https://ipwho.is/${encodeURIComponent(ip)}`;
      const whoRes = await fetch(ipwhoUrl, { signal: AbortSignal.timeout(3000) }).catch(() => null);
      if (whoRes && whoRes.ok) {
        const whoData = await whoRes.json();
        if (whoData.success && whoData.city) {
          return sendJsonResponse(res, 200, {
            success: true,
            city: whoData.city,
            region: whoData.region,
            country: whoData.country,
            latitude: whoData.latitude,
            longitude: whoData.longitude,
            source: 'ipwho'
          });
        }
      }

      // 3. Try ipapi.co fallback
      const ipapiUrl = isLocal ? 'https://ipapi.co/json/' : `https://ipapi.co/${encodeURIComponent(ip)}/json/`;
      const apiRes = await fetch(ipapiUrl, {
        headers: { 'User-Agent': 'Pickmi-Cabs/1.0', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      }).catch(() => null);
      if (apiRes && apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.city) {
          return sendJsonResponse(res, 200, {
            success: true,
            city: apiData.city,
            region: apiData.region,
            country: apiData.country_name,
            latitude: apiData.latitude,
            longitude: apiData.longitude,
            source: 'ipapi'
          });
        }
      }

      // Default Indian metro fallback
      return sendJsonResponse(res, 200, {
        success: true,
        city: 'Bangalore',
        region: 'Karnataka',
        country: 'India',
        source: 'fallback'
      });
    } catch (e) {
      return sendJsonResponse(res, 200, {
        success: true,
        city: 'Bangalore',
        region: 'Karnataka',
        source: 'error_fallback'
      });
    }
  }

  // ==========================================
  // 🧭 Reverse Geocoding API Endpoint
  // ==========================================
  if (reqPath === '/api/reverse-geocode' && req.method === 'GET') {
    const lat = parsedUrl.searchParams.get('lat');
    const lon = parsedUrl.searchParams.get('lon');
    if (!lat || !lon) {
      return sendJsonResponse(res, 400, { success: false, error: 'lat and lon are required' });
    }

    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=10`;
      const revRes = await fetch(nominatimUrl, {
        headers: { 'User-Agent': 'Pickmi-Cabs-LocationService/1.0', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      }).catch(() => null);

      if (revRes && revRes.ok) {
        const data = await revRes.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.suburb || addr.municipality || addr.state_district || data.name || '';
        const state = addr.state || '';
        return sendJsonResponse(res, 200, { success: true, city, state, displayName: data.display_name });
      }

      // Fallback to BigDataCloud
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&localityLanguage=en`;
      const bdcRes = await fetch(bdcUrl, { signal: AbortSignal.timeout(3000) }).catch(() => null);
      if (bdcRes && bdcRes.ok) {
        const bData = await bdcRes.json();
        const city = bData.city || bData.locality || bData.principalSubdivision;
        const state = bData.principalSubdivision || '';
        return sendJsonResponse(res, 200, { success: true, city, state });
      }

      return sendJsonResponse(res, 404, { success: false, error: 'Could not reverse geocode coordinates' });
    } catch (e) {
      return sendJsonResponse(res, 500, { success: false, error: e.message });
    }
  }


  // 6. Send Email OTP via Resend
  if (reqPath === '/api/email/send-otp' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const email = (payload.email || '').trim().toLowerCase();
      const name = payload.name || '';

      if (!email || !email.includes('@')) {
        return sendJsonResponse(res, 400, { success: false, error: 'A valid email address is required' });
      }

      // Generate a 4-digit code (e.g. 4829)
      const otp = String(Math.floor(1000 + Math.random() * 9000));
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      otpStore.set(email, {
        otp,
        expiresAt,
        name,
        email,
        createdAt: Date.now()
      });

      console.log(`📧 [Email OTP] Generated code ${otp} for ${email}`);

      // Dispatch real email via Resend
      const html = buildOtpEmailTemplate({ email, otp, name });
      let sendResult = { success: false, error: 'Not dispatched' };
      let emailDelivered = false;

      try {
        sendResult = await sendEmail({
          to: email,
          subject: `Pickmi Verification Code: ${otp}`,
          html
        });
        emailDelivered = sendResult.success === true;
        if (emailDelivered) {
          console.log(`✅ [Email OTP] Real email dispatched to ${email} via ${sendResult.provider} (ID: ${sendResult.id || 'ok'})`);
        } else {
          console.warn(`⚠️ [Email OTP] Dispatch returned non-success for ${email}:`, JSON.stringify(sendResult));
        }
      } catch (emailErr) {
        console.warn(`⚠️ [Email OTP] Resend dispatch failed for ${email}: ${emailErr.message}`);
        sendResult = { success: false, error: emailErr.message };
      }

      return sendJsonResponse(res, 200, {
        success: true,
        message: `Verification code sent to ${email}. Please check your inbox.`,
        emailDelivered,
        expiresInSeconds: 600,
        provider: sendResult.provider || 'resend',
        devOtp: otp
      });
    } catch (err) {
      console.error('❌ [Email OTP] Error:', err);
      return sendJsonResponse(res, 500, { success: false, error: err.message });
    }
  }

  // 7. Verify Email OTP
  if (reqPath === '/api/email/verify-otp' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const email = (payload.email || '').trim().toLowerCase();
      const enteredOtp = (payload.otp || '').trim();

      if (!email || !enteredOtp) {
        return sendJsonResponse(res, 400, { success: false, error: 'Email and OTP code are required' });
      }

      const stored = otpStore.get(email);
      const isValid = stored && stored.otp === enteredOtp && Date.now() <= stored.expiresAt;

      if (!isValid) {
        return sendJsonResponse(res, 400, {
          success: false,
          error: stored && Date.now() > stored.expiresAt
            ? 'Verification code has expired. Please request a new code.'
            : 'Invalid verification code. Please check your inbox and try again.'
        });
      }

      // Successful verification -> clear from store
      otpStore.delete(email);

      return sendJsonResponse(res, 200, {
        success: true,
        verified: true,
        email,
        message: 'Email verified successfully'
      });
    } catch (err) {
      console.error('❌ [Email OTP Verify] Error:', err);
      return sendJsonResponse(res, 500, { success: false, error: err.message });
    }
  }

  // ==========================================
  // 📱 Twilio Mobile SMS / Verify OTP API
  // ==========================================

  // 8. Get Twilio SMS service configuration status
  if (reqPath === '/api/sms/config' && req.method === 'GET') {
    const config = getTwilioConfig();
    return sendJsonResponse(res, 200, {
      isConfigured: config.isConfigured,
      mode: config.mode,
      phoneNumber: config.phoneNumber ? config.phoneNumber.replace(/.(?=.{4})/g, '*') : '',
      verifyServiceSid: config.verifyServiceSid ? config.verifyServiceSid.replace(/.(?=.{4})/g, '*') : ''
    });
  }

  // 9. Send Mobile OTP via Twilio SMS or Twilio Verify
  if (reqPath === '/api/sms/send-otp' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const rawPhone = (payload.phone || payload.mobile || '').trim();
      const cleanNum = rawPhone.replace(/\D/g, '').slice(-10);

      if (!cleanNum || cleanNum.length !== 10) {
        return sendJsonResponse(res, 400, { success: false, error: 'A valid 10-digit mobile number is required' });
      }

      // Generate a 4-digit code (e.g. 4829)
      const otp = String(Math.floor(1000 + Math.random() * 9000));
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      otpStore.set(cleanNum, {
        otp,
        expiresAt,
        phone: cleanNum,
        createdAt: Date.now()
      });

      console.log(`📱 [Mobile OTP] Triggered for +91 ${cleanNum}`);
      const result = await sendTwilioOtp({ phone: cleanNum, otp });

      return sendJsonResponse(res, 200, {
        success: true,
        message: result.mode === 'mock'
          ? `Verification code generated for +91 ${cleanNum}. (Twilio mock mode: code is ${otp})`
          : `Verification code sent to +91 ${cleanNum} via SMS.`,
        phone: cleanNum,
        expiresInSeconds: 600,
        mode: result.mode,
        devOtp: result.devOtp
      });
    } catch (err) {
      console.error('❌ [Mobile OTP Send] Error:', err);
      return sendJsonResponse(res, 500, { success: false, error: err.message });
    }
  }

  // 10. Verify Mobile OTP
  if (reqPath === '/api/sms/verify-otp' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const rawPhone = (payload.phone || payload.mobile || '').trim();
      const cleanNum = rawPhone.replace(/\D/g, '').slice(-10);
      const enteredOtp = (payload.otp || payload.code || '').trim();

      if (!cleanNum || !enteredOtp) {
        return sendJsonResponse(res, 400, { success: false, error: 'Mobile number and verification code are required' });
      }

      const stored = otpStore.get(cleanNum);

      if (stored && Date.now() > stored.expiresAt) {
        return sendJsonResponse(res, 400, {
          success: false,
          error: 'Verification code has expired. Please request a new code.'
        });
      }

      const verification = await verifyTwilioOtp({
        phone: cleanNum,
        code: enteredOtp,
        storedOtp: stored ? stored.otp : null
      });

      if (!verification.verified) {
        return sendJsonResponse(res, 400, {
          success: false,
          error: verification.error || 'Invalid verification code. Please check your SMS and try again.'
        });
      }

      // Successful verification -> clear from store
      otpStore.delete(cleanNum);

      return sendJsonResponse(res, 200, {
        success: true,
        verified: true,
        phone: cleanNum,
        message: 'Mobile number verified successfully'
      });
    } catch (err) {
      console.error('❌ [Mobile OTP Verify] Error:', err);
      return sendJsonResponse(res, 500, { success: false, error: err.message });
    }
  }

  // ==========================================
  // 📁 Static File Serving
  // ==========================================
  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Pickmi server running at http://localhost:${PORT}`);
  console.log(`📧 Email service initialized. Endpoints available:`);
  console.log(`   - POST http://localhost:${PORT}/api/email/welcome`);
  console.log(`   - POST http://localhost:${PORT}/api/email/booking`);
  console.log(`   - POST http://localhost:${PORT}/api/email/payment`);
  console.log(`   - POST http://localhost:${PORT}/api/email/test`);
  console.log(`📱 Twilio SMS service initialized. Endpoints available:`);
  console.log(`   - GET  http://localhost:${PORT}/api/sms/config`);
  console.log(`   - POST http://localhost:${PORT}/api/sms/send-otp`);
  console.log(`   - POST http://localhost:${PORT}/api/sms/verify-otp`);
});
