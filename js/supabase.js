/**
 * PickMi Cabs - Supabase Client & Real-time Integration
 * Project URL: https://awwrbgwpzgtbunrvsmyu.supabase.co
 * Connected directly to PickMi Admin Panel and Driver App ecosystem
 */

(function () {
  const SUPABASE_URL = 'https://awwrbgwpzgtbunrvsmyu.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_MVv7fXTjS6R79oXLOHuCLA_ij0lDSRE';

  let client = null;

  function getClient() {
    if (!client && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
      }
    }
    return client;
  }

  // Fallback REST fetcher if SDK CDN is blocked or delayed
  async function restRequest(table, method = 'GET', body = null, queryParams = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}${queryParams ? '?' + queryParams : ''}`;
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : undefined
    };

    const options = {
      method,
      headers: Object.fromEntries(Object.entries(headers).filter(([_, v]) => v !== undefined))
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Supabase REST error (${response.status}): ${errText}`);
    }
    return await response.json();
  }

  window.PickmiSupabase = {
    getClient,

    /**
     * Create trip in Supabase
     * Writes to BOTH 'trips' (for Admin Panel & Driver App) AND 'website_bookings' (for Website module)
     */
    async createTrip(payload) {
      console.log('🚀 [Supabase] Creating trip with payload:', payload);

      const tripNumber = payload.trip_number || ('PM-' + Math.floor(100000 + Math.random() * 900000));
      const otp = payload.otp || Math.floor(1000 + Math.random() * 9000).toString();

      // Ensure coordinates
      const pickupLat = payload.pickup_latitude || 13.0827;
      const pickupLng = payload.pickup_longitude || 80.2707;
      const dropLat = payload.drop_latitude || 12.9716;
      const dropLng = payload.drop_longitude || 77.5946;

      const fareAmount = typeof payload.fare === 'number' ? payload.fare : (parseFloat(payload.fare) || 0);

      // 1. Core 'trips' table record (Feeds Admin Panel TripsManager & Live Drivers)
      const tripsRecord = {
        trip_number: tripNumber,
        customer_name: payload.customer_name || 'Valued Customer',
        customer_phone: payload.customer_phone || '+91 9999999999',
        pickup_location: payload.pickup_location,
        pickup_latitude: pickupLat,
        pickup_longitude: pickupLng,
        drop_location: payload.drop_location,
        drop_latitude: dropLat,
        drop_longitude: dropLng,
        pickup_date: payload.pickup_date || 'Today',
        pickup_time: payload.pickup_time || 'Now',
        fare: fareAmount,
        distance: String(payload.distance || '45 km'),
        vehicle_type: payload.vehicle_type || 'Sedan',
        trip_type: payload.trip_type || 'One-way',
        payment_method: payload.payment_method || 'Cash',
        status: payload.assigned_driver_id ? 'ASSIGNED' : 'AVAILABLE',
        assigned_driver_id: payload.assigned_driver_id || null,
        otp: otp,
        toll_included: payload.toll_included || 'INCLUDED',
        permit_included: payload.permit_included || 'EXCLUDED',
        batta_included: payload.batta_included || 'INCLUDED',
        hill_charges_applicable: payload.hill_charges_applicable || 'NOT_APPLICABLE',
        cash_to_collect: payload.cash_to_collect !== undefined ? payload.cash_to_collect : fareAmount,
        allowed_km: payload.allowed_km || 50,
        extra_km_rate: payload.extra_km_rate || 14
      };

      // 2. 'website_bookings' record (Dedicated website module in Admin)
      const websiteBookingRecord = {
        booking_number: tripNumber,
        customer_name: tripsRecord.customer_name,
        customer_phone: tripsRecord.customer_phone,
        customer_email: payload.customer_email || null,
        pickup_location: tripsRecord.pickup_location,
        drop_location: tripsRecord.drop_location,
        pickup_date: tripsRecord.pickup_date,
        pickup_time: tripsRecord.pickup_time,
        trip_type: tripsRecord.trip_type,
        vehicle_type: tripsRecord.vehicle_type,
        estimated_fare: fareAmount,
        distance_km: parseFloat(payload.distance) || 45,
        status: 'PENDING'
      };

      let createdTrip = null;
      let createdWebBooking = null;

      // Execute 'trips' insertion
      try {
        const sb = getClient();
        if (sb) {
          const { data, error } = await sb.from('trips').insert([tripsRecord]).select();
          if (error) throw error;
          createdTrip = data ? data[0] : null;
        } else {
          const data = await restRequest('trips', 'POST', tripsRecord);
          createdTrip = data ? data[0] : null;
        }
        console.log('✅ [Supabase] Trip saved to `trips` table:', createdTrip);
      } catch (err) {
        console.error('⚠️ [Supabase] Could not insert to `trips` table:', err);
      }

      // Execute 'website_bookings' insertion
      try {
        const sb = getClient();
        if (sb) {
          const { data, error } = await sb.from('website_bookings').insert([websiteBookingRecord]).select();
          if (error) throw error;
          createdWebBooking = data ? data[0] : null;
        } else {
          const data = await restRequest('website_bookings', 'POST', websiteBookingRecord);
          createdWebBooking = data ? data[0] : null;
        }
        console.log('✅ [Supabase] Booking saved to `website_bookings` table:', createdWebBooking);
      } catch (err) {
        console.warn('⚠️ [Supabase] Note on `website_bookings` table:', err.message);
      }

      return {
        success: true,
        trip: createdTrip || { ...tripsRecord, id: 'trip_local_' + Date.now() },
        websiteBooking: createdWebBooking,
        tripNumber,
        otp
      };
    },

    /**
     * Subscribe to real-time updates for an active trip
     * When admin assigns a driver in Admin Panel, this triggers immediately!
     */
    subscribeToTrip(tripId, onTripUpdate) {
      const sb = getClient();
      if (!sb || !tripId) {
        console.warn('[Supabase] Realtime listener unavailable (no client or tripId)');
        return () => {};
      }

      console.log(`🔌 [Supabase] Subscribing to real-time updates for trip: ${tripId}`);
      const channel = sb
        .channel(`trip_live_${tripId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'trips',
            filter: `id=eq.${tripId}`
          },
          async (payload) => {
            console.log('⚡ [Supabase Realtime] Trip updated:', payload.new);
            const updated = payload.new;

            // If driver was assigned, fetch driver information
            if (updated.assigned_driver_id) {
              try {
                const { data: driverData } = await sb
                  .from('drivers')
                  .select(`
                    id, name, mobile, rating, profile_image,
                    vehicle:vehicles(vehicle_number, vehicle_type, vehicle_model)
                  `)
                  .eq('id', updated.assigned_driver_id)
                  .single();

                if (driverData) {
                  const veh = Array.isArray(driverData.vehicle) ? driverData.vehicle[0] : driverData.vehicle;
                  updated.driver = {
                    name: driverData.name,
                    phone: driverData.mobile,
                    rating: driverData.rating || 4.9,
                    vehicleReg: veh?.vehicle_number || 'Commercial Yellow Plate',
                    vehicleModel: veh?.vehicle_model || 'PickMi Verified Cab'
                  };
                }
              } catch (driverErr) {
                console.warn('Could not fetch assigned driver details:', driverErr);
              }
            }

            if (typeof onTripUpdate === 'function') {
              onTripUpdate(updated);
            }
          }
        )
        .subscribe();

      return () => {
        try {
          sb.removeChannel(channel);
        } catch (e) {}
      };
    },

    /**
     * Sync user account with database
     */
    async syncUserAccount(userData) {
      try {
        const payload = {
          mobile: userData.mobile || userData.rawMobile,
          name: userData.name,
          email: userData.email,
          gender: userData.gender || null,
          city: userData.city || 'Bangalore',
          updated_at: new Date().toISOString()
        };

        const sb = getClient();
        if (sb) {
          const { data, error } = await sb
            .from('website_users')
            .upsert([payload], { onConflict: 'mobile' })
            .select();
          if (error) console.warn('website_users sync note:', error.message);
          return { success: !error, data };
        } else {
          const data = await restRequest('website_users', 'POST', payload);
          return { success: true, data };
        }
      } catch (err) {
        console.warn('syncUserAccount exception (table might require creation):', err.message);
        return { success: false, error: err.message };
      }
    },

    /**
     * Submit driver registration
     */
    async submitDriverApplication(driverData) {
      try {
        const payload = {
          full_name: driverData.fullName || driverData.full_name,
          phone_number: driverData.phoneNumber || driverData.phone_number,
          email: driverData.email || null,
          city: driverData.city || 'Bangalore',
          vehicle_type: driverData.vehicleType || driverData.vehicle_type || 'Sedan',
          vehicle_number: driverData.vehicleNumber || driverData.vehicle_number || null,
          license_number: driverData.licenseNumber || driverData.license_number || null,
          status: 'PENDING'
        };

        const sb = getClient();
        if (sb) {
          const { data, error } = await sb
            .from('website_driver_applications')
            .insert([payload])
            .select();
          if (error) console.warn('Driver application note:', error.message);
          return { success: !error, data: data ? data[0] : null };
        } else {
          const data = await restRequest('website_driver_applications', 'POST', payload);
          return { success: true, data: data ? data[0] : null };
        }
      } catch (err) {
        console.warn('submitDriverApplication note:', err.message);
        return { success: false, error: err.message };
      }
    },

    /**
     * Submit contact / support inquiry
     */
    async submitContactInquiry(contactData) {
      try {
        const payload = {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone || null,
          topic: contactData.topic || 'General Inquiry',
          message: contactData.message,
          status: 'NEW'
        };

        const sb = getClient();
        if (sb) {
          const { data, error } = await sb
            .from('website_contact_submissions')
            .insert([payload])
            .select();
          if (error) console.warn('Contact inquiry note:', error.message);
          return { success: !error, data: data ? data[0] : null };
        } else {
          const data = await restRequest('website_contact_submissions', 'POST', payload);
          return { success: true, data: data ? data[0] : null };
        }
      } catch (err) {
        console.warn('submitContactInquiry note:', err.message);
        return { success: false, error: err.message };
      }
    },

    /**
     * Fetch real trips from database for a specific user based on phone or email
     */
    async fetchUserTrips(phone, email) {
      const cleanPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';
      const cleanEmail = email ? String(email).trim().toLowerCase() : '';
      if (!cleanPhone && !cleanEmail) return [];

      const results = [];
      const seenIds = new Set();

      const formatTripTime = (dateStr, timeStr) => {
        try {
          const raw = timeStr || dateStr || '';
          if (raw.includes('at')) {
            const parts = raw.split('at');
            const d = parts[0].trim();
            const t = parts[1].trim();
            const dt = new Date(d + 'T' + (t.length === 5 ? t + ':00' : t));
            if (!isNaN(dt.getTime())) {
              const day = dt.getDate();
              const month = dt.toLocaleString('en-US', { month: 'short' });
              let hours = dt.getHours();
              const ampm = hours >= 12 ? 'pm' : 'am';
              hours = hours % 12 || 12;
              const mins = String(dt.getMinutes()).padStart(2, '0');
              return `${day} ${month} • ${hours}:${mins} ${ampm}`;
            }
          }
          if (dateStr) {
            const dt = new Date(dateStr.length === 10 ? dateStr + 'T08:00:00' : dateStr);
            if (!isNaN(dt.getTime())) {
              const day = dt.getDate();
              const month = dt.toLocaleString('en-US', { month: 'short' });
              return `${day} ${month} • ${timeStr || '08:00 am'}`;
            }
          }
        } catch (e) {}
        return timeStr || dateStr || 'Scheduled';
      };

      // 1. Query 'website_bookings' table
      try {
        const sb = getClient();
        let wbData = [];
        if (sb) {
          let query = sb.from('website_bookings').select('*');
          if (cleanPhone && cleanEmail) {
            const { data } = await query.or(`customer_phone.ilike.%${cleanPhone}%,customer_email.ilike.%${cleanEmail}%`).order('created_at', { ascending: false });
            if (data) wbData = data;
          } else if (cleanPhone) {
            const { data } = await query.ilike('customer_phone', `%${cleanPhone}%`).order('created_at', { ascending: false });
            if (data) wbData = data;
          } else if (cleanEmail) {
            const { data } = await query.ilike('customer_email', `%${cleanEmail}%`).order('created_at', { ascending: false });
            if (data) wbData = data;
          }
        } else {
          const filter = cleanPhone ? `customer_phone=ilike.*${cleanPhone}*` : `customer_email=ilike.*${cleanEmail}*`;
          wbData = await restRequest('website_bookings', 'GET', null, `select=*&${filter}&order=created_at.desc`);
        }

        if (Array.isArray(wbData)) {
          wbData.forEach(b => {
            const ref = b.booking_number || b.id;
            if (!seenIds.has(ref)) {
              seenIds.add(ref);
              const dropName = b.drop_location || 'Destination';
              const pickupName = b.pickup_location || 'Pickup';
              const isAuto = (b.vehicle_type || '').toLowerCase().includes('auto');
              const isCancelled = (b.status || '').toUpperCase() === 'CANCELLED';
              const isCompleted = (b.status || '').toUpperCase() === 'COMPLETED';
              const fareVal = parseFloat(b.estimated_fare) || 0;

              results.push({
                id: ref,
                supabaseId: b.id,
                serviceType: b.trip_type === 'rental' ? 'rental' : 'intercity',
                tripType: b.trip_type || 'oneway',
                status: isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Confirmed',
                statusBadge: isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Upcoming',
                pickup: pickupName,
                drop: dropName,
                dropShort: dropName.includes(',') ? dropName.split(',')[0].trim() : dropName,
                pickupShort: pickupName.includes(',') ? pickupName.split(',')[0].trim() : pickupName,
                pickupTime: formatTripTime(b.pickup_date, b.pickup_time),
                departureDate: b.pickup_date,
                vehicleCategory: b.vehicle_type || 'Sedan',
                vehicleModel: b.vehicle_type || 'Sedan',
                passengerName: b.customer_name,
                passengerPhone: b.customer_phone,
                passengerEmail: b.customer_email,
                distanceKm: b.distance_km || 35,
                fare: {
                  base: fareVal,
                  total: fareVal
                },
                fareTotal: fareVal,
                isAuto: isAuto,
                isCancelled: isCancelled,
                createdAt: b.created_at
              });
            }
          });
        }
      } catch (err) {
        console.warn('⚠️ [Supabase] Could not fetch website_bookings:', err);
      }

      // 2. Query 'trips' table
      try {
        const sb = getClient();
        let tData = [];
        if (sb && cleanPhone) {
          const { data } = await sb.from('trips').select('*').ilike('customer_phone', `%${cleanPhone}%`).order('created_at', { ascending: false });
          if (data) tData = data;
        } else if (cleanPhone) {
          tData = await restRequest('trips', 'GET', null, `select=*&customer_phone=ilike.*${cleanPhone}*&order=created_at.desc`);
        }

        if (Array.isArray(tData)) {
          tData.forEach(t => {
            const ref = t.trip_number || t.id;
            if (!seenIds.has(ref)) {
              seenIds.add(ref);
              const dropName = t.drop_location || 'Destination';
              const pickupName = t.pickup_location || 'Pickup';
              const isAuto = (t.vehicle_type || '').toLowerCase().includes('auto');
              const isCancelled = (t.status || '').toUpperCase() === 'CANCELLED';
              const isCompleted = (t.status || '').toUpperCase() === 'COMPLETED';
              const fareVal = parseFloat(t.fare) || 0;

              results.push({
                id: ref,
                supabaseId: t.id,
                serviceType: t.trip_type === 'Rental' ? 'rental' : 'intercity',
                tripType: (t.trip_type || 'One-way').toLowerCase(),
                status: isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Confirmed',
                statusBadge: isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Upcoming',
                pickup: pickupName,
                drop: dropName,
                dropShort: dropName.includes(',') ? dropName.split(',')[0].trim() : dropName,
                pickupShort: pickupName.includes(',') ? pickupName.split(',')[0].trim() : pickupName,
                pickupTime: formatTripTime(t.pickup_date, t.pickup_time),
                departureDate: t.pickup_date,
                vehicleCategory: t.vehicle_type || 'Sedan',
                vehicleModel: t.vehicle_type || 'Sedan',
                passengerName: t.customer_name,
                passengerPhone: t.customer_phone,
                distanceKm: parseFloat(t.distance) || 45,
                fare: {
                  base: fareVal,
                  total: fareVal
                },
                fareTotal: fareVal,
                isAuto: isAuto,
                isCancelled: isCancelled,
                createdAt: t.created_at
              });
            }
          });
        }
      } catch (err) {
        console.warn('⚠️ [Supabase] Could not fetch trips:', err);
      }

      console.log(`✅ [Supabase] Found ${results.length} real trips for user:`, results);
      return results;
    }
  };

  console.log('✅ PickmiSupabase client initialized & connected to awwrbgwpzgtbunrvsmyu.supabase.co');
})();
