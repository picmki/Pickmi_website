/**
 * PickMi Cabs - Professional Tax Invoice PDF & A4 Preview Engine
 * Generates standards-compliant PDF (v1.4) without external dependencies
 * and renders high-fidelity A4 printable previews.
 */
(function(window) {
  'use strict';

  function sanitize(str) {
    if (!str) return '';
    return String(str).replace(/[\\()]/g, '').trim();
  }

  function formatCurrency(val) {
    const num = Number(val) || 0;
    return (num % 1 !== 0) ? num.toFixed(2) : num.toLocaleString('en-IN');
  }

  const InvoiceEngine = {
    /**
     * Generate standard PDF 1.4 binary string
     */
    generatePDFString(trip) {
      const invNum = trip.invoiceNumber || ('INV-2026-10-' + String(trip.id || '').replace('PKM-', ''));
      const passengerName = sanitize(trip.passengerName || 'Karthik Prabhu');
      const phone = sanitize(trip.passengerPhone || '+91 9840123456');
      const email = sanitize(trip.passengerEmail || 'info@pickmicabs.com');
      const bookingId = sanitize(trip.id || 'PKM-46587');
      const service = sanitize((trip.serviceType || 'Intercity').toUpperCase());
      const vehicle = sanitize(trip.vehicleCategory || trip.vehicle?.name || 'Prime Sedan');
      const pickup = sanitize(trip.pickup || 'Pickup Location');
      const drop = sanitize(trip.drop || 'Drop Location');
      const date = sanitize(trip.departureDate || '13 Oct 2026');
      const time = sanitize(trip.pickupTime || '08:00 AM');
      const dist = trip.distanceKm || trip.fare?.distanceKm || 160;

      const fare = trip.fare || {};
      const base = fare.base || 2720;
      const tolls = typeof fare.tolls === 'number' ? fare.tolls : 0;
      const driverAllowance = fare.driverAllowance || 0;
      const interstateCharge = fare.interstateCharge || 0;
      const tax = fare.tax || 149;
      const total = fare.total || 3299;
      const isAdv = trip.paymentMode === 'advance_100' || (typeof trip.advancePaid === 'number' && trip.advancePaid > 0) || (trip.paymentMethod && trip.paymentMethod.toLowerCase().includes('advance ₹100'));
      const adv = isAdv ? (trip.advancePaid || 100) : 0;
      const balance = isAdv ? Math.max(0, total - adv) : total;

      const ops = [];
      function op(c) { ops.push(c); }

      // 1. Background and outer borders
      op('1 1 1 rg 0 0 595 842 re f');
      op('0.08 0.12 0.2 RG 2 w 25 25 545 792 re S');
      op('0.85 0.88 0.92 RG 0.75 w 28 28 539 786 re S');

      // 2. Header banner
      op('0.0 0.34 0.84 rg 28 745 539 69 re f');
      op('BT /F2 20 Tf 1 1 1 rg 45 785 Td (PICKMI CAB SERVICES) Tj ET');
      op('BT /F1 8.5 Tf 0.9 0.95 1 rg 45 768 Td (India\'s Premium Intercity & Outstation Mobility Platform) Tj ET');
      op('BT /F1 7.5 Tf 0.85 0.9 1 rg 45 754 Td (GSTIN: 33AAECP8892K1Z9 | CIN: U63090TN2026PTC109823 | Helpline: 1800-209-7425 / info@pickmicabs.com) Tj ET');

      // 3. Right Tax Invoice Badge in Header
      op('BT /F2 16 Tf 1 1 1 rg 415 785 Td (TAX INVOICE) Tj ET');
      op('BT /F1 9 Tf 1 1 1 rg 415 768 Td (' + invNum + ') Tj ET');
      op('BT /F1 8 Tf 0.9 0.95 1 rg 415 754 Td (Date: ' + date + ') Tj ET');

      // 4. Billed To Card
      op('0.97 0.98 1.0 rg 45 635 245 92 re f');
      op('0.8 0.86 0.94 RG 1 w 45 635 245 92 re S');
      op('BT /F2 9.5 Tf 0.0 0.3 0.7 rg 55 710 Td (BILLED TO (CUSTOMER DETAILS)) Tj ET');
      op('BT /F2 10 Tf 0.1 0.15 0.2 rg 55 694 Td (' + passengerName + ') Tj ET');
      op('BT /F1 9 Tf 0.25 0.3 0.4 rg 55 678 Td (Mobile: ' + phone + ') Tj ET');
      op('BT /F1 8.5 Tf 0.25 0.3 0.4 rg 55 662 Td (Email: ' + email + ') Tj ET');
      op('BT /F1 8 Tf 0.05 0.55 0.35 rg 55 646 Td (Status: Confirmed Passenger) Tj ET');

      // 5. Booking Details Card
      op('0.97 0.98 1.0 rg 305 635 245 92 re f');
      op('0.8 0.86 0.94 RG 1 w 305 635 245 92 re S');
      op('BT /F2 9.5 Tf 0.0 0.3 0.7 rg 315 710 Td (BOOKING & TRIP IDENTIFIERS) Tj ET');
      op('BT /F2 10 Tf 0.1 0.15 0.2 rg 315 694 Td (Booking ID: ' + bookingId + ') Tj ET');
      op('BT /F1 9 Tf 0.25 0.3 0.4 rg 315 678 Td (Service: ' + service + ' Cab) Tj ET');
      op('BT /F1 9 Tf 0.25 0.3 0.4 rg 315 662 Td (Vehicle: ' + vehicle + ') Tj ET');
      op('BT /F1 8.5 Tf 0.25 0.3 0.4 rg 315 646 Td (Pickup Schedule: ' + time + ' on ' + date + ') Tj ET');

      // 6. Route Itinerary Box
      op('0.95 0.97 0.99 rg 45 560 505 62 re f');
      op('0.82 0.87 0.93 RG 1 w 45 560 505 62 re S');
      op('0.05 0.6 0.3 rg 58 598 6 6 re f');
      op('BT /F2 9 Tf 0.05 0.6 0.3 rg 70 598 Td (PICKUP LOCATION:) Tj ET');
      op('BT /F1 8.5 Tf 0.1 0.15 0.2 rg 170 598 Td (' + pickup.substring(0, 65) + ') Tj ET');

      op('0.1 0.4 0.85 rg 58 574 6 6 re f');
      op('BT /F2 9 Tf 0.1 0.4 0.85 rg 70 574 Td (DROP LOCATION:  ) Tj ET');
      op('BT /F1 8.5 Tf 0.1 0.15 0.2 rg 170 574 Td (' + drop.substring(0, 65) + ') Tj ET');

      // 7. Table Header
      op('0.08 0.16 0.3 rg 45 515 505 26 re f');
      op('BT /F2 9 Tf 1 1 1 rg 60 523 Td (ITEM  DESCRIPTION) Tj ET');
      op('BT /F2 9 Tf 1 1 1 rg 345 523 Td (SAC CODE) Tj ET');
      op('BT /F2 9 Tf 1 1 1 rg 460 523 Td (AMOUNT (INR)) Tj ET');

      // 8. Table Rows
      let y = 490;
      const items = [
        { name: 'Base Chauffeur Cab Fare (' + dist + ' km included)', sac: '9964', amt: 'INR ' + base }
      ];
      if (tolls > 0) {
        items.push({ name: 'Tolls & State Highway Permits', sac: '9964', amt: 'INR ' + tolls });
      } else {
        items.push({ name: 'Tolls & Parking Charges', sac: '9964', amt: 'Extra (route)' });
      }
      if (driverAllowance > 0) {
        items.push({ name: 'Chauffeur Night/Outstation Allowance', sac: '9964', amt: 'INR ' + driverAllowance });
      }
      items.push({ name: 'Interstate State Border Entry Permit', sac: '9964', amt: 'Extra (route)' });
      items.push({ name: 'GST on Passenger Transport Service (5%)', sac: '9964', amt: '5% Extra' });

      items.forEach((item, idx) => {
        op('0.98 0.99 1.0 rg 45 ' + (y - 5) + ' 505 24 re f');
        op('0.88 0.91 0.94 RG 0.5 w 45 ' + (y - 5) + ' 505 24 re S');
        op('BT /F1 8.5 Tf 0.15 0.2 0.3 rg 60 ' + y + ' Td (' + (idx + 1) + '. ' + item.name + ') Tj ET');
        op('BT /F1 8.5 Tf 0.3 0.35 0.4 rg 355 ' + y + ' Td (' + item.sac + ') Tj ET');
        op('BT /F2 9 Tf 0.1 0.15 0.25 rg 475 ' + y + ' Td (' + item.amt + ') Tj ET');
        y -= 26;
      });

      // 9. Total Row
      op('0.9 0.94 1.0 rg 45 ' + (y - 8) + ' 505 30 re f');
      op('0.1 0.4 0.85 RG 1.5 w 45 ' + (y - 8) + ' 505 30 re S');
      op('BT /F2 11 Tf 0.05 0.2 0.5 rg 60 ' + (y + 1) + ' Td (TOTAL TRIP FARE (NET AMOUNT)) Tj ET');
      op('BT /F2 12 Tf 0.05 0.2 0.5 rg 455 ' + (y + 1) + ' Td (INR ' + total + ') Tj ET');

      // 10. Settlement Row
      y -= 38;
      op('0.98 0.98 0.99 rg 45 ' + (y - 6) + ' 505 28 re f');
      op('0.85 0.88 0.92 RG 1 w 45 ' + (y - 6) + ' 505 28 re S');
      if (isAdv) {
        op('BT /F1 8.5 Tf 0.05 0.6 0.35 rg 60 ' + y + ' Td (Advance Online Payment Received: INR ' + adv + ') Tj ET');
        op('BT /F2 9.5 Tf 0.1 0.35 0.8 rg 340 ' + y + ' Td (Balance Due to Chauffeur: INR ' + balance + ') Tj ET');
      } else {
        op('BT /F1 8.5 Tf 0.4 0.45 0.5 rg 60 ' + y + ' Td (Advance Online Payment: INR 0 (Zero Advance Paid)) Tj ET');
        op('BT /F2 9.5 Tf 0.1 0.35 0.8 rg 320 ' + y + ' Td (Full Fare Due to Chauffeur: INR ' + balance + ') Tj ET');
      }

      // 11. Legal & Declaration
      op('0.85 0.88 0.92 RG 0.5 w 45 155 505 0 re S');
      op('BT /F2 8 Tf 0.2 0.25 0.3 rg 45 140 Td (LEGAL & TAX DECLARATION:) Tj ET');
      op('BT /F1 7.2 Tf 0.4 0.45 0.5 rg 45 127 Td (1. This is a computer generated electronic tax invoice issued under GST Rules, 2017.) Tj ET');
      op('BT /F1 7.2 Tf 0.4 0.45 0.5 rg 45 115 Td (2. SAC 9964 applies to passenger transport services. Taxes collected as per statutory norms.) Tj ET');
      op('BT /F1 7.2 Tf 0.4 0.45 0.5 rg 45 103 Td (3. 24x7 Customer Helpline: 1800-209-7425 | Email: info@pickmicabs.com | Web: www.pickmicabs.com) Tj ET');
      op('BT /F1 7.2 Tf 0.4 0.45 0.5 rg 45 91 Td (4. Head Office: PickMi Technologies India Pvt Ltd, Anna Nagar, Chennai, Tamil Nadu - 600040.) Tj ET');

      // 12. Official Seal
      op('0.94 0.98 0.95 rg 410 40 140 55 re f');
      op('0.1 0.55 0.3 RG 1.2 w 410 40 140 55 re S');
      op('BT /F2 7.5 Tf 0.1 0.5 0.25 rg 425 78 Td (PICKMI TECHNOLOGIES) Tj ET');
      op('BT /F2 8.5 Tf 0.1 0.5 0.25 rg 432 65 Td (OFFICIAL TAX INVOICE) Tj ET');
      op('BT /F1 7 Tf 0.2 0.55 0.3 rg 435 52 Td (DIGITALLY VERIFIED) Tj ET');

      const streamContent = ops.join('\n');
      const streamLength = new TextEncoder().encode(streamContent).length;

      const objects = [];
      objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
      objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
      objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj');
      objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
      objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');
      objects.push('6 0 obj\n<< /Length ' + streamLength + ' >>\nstream\n' + streamContent + '\nendstream\nendobj');

      let out = '%PDF-1.4\n';
      const xref = [0];
      objects.forEach((obj) => {
        xref.push(new TextEncoder().encode(out).length);
        out += obj + '\n';
      });

      const startxref = new TextEncoder().encode(out).length;
      out += 'xref\n0 ' + (objects.length + 1) + '\n';
      out += '0000000000 65535 f \n';
      for (let i = 1; i <= objects.length; i++) {
        const offset = String(xref[i]).padStart(10, '0');
        out += offset + ' 00000 n \n';
      }
      out += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF\n';
      return out;
    },

    /**
     * Download PDF file directly to user device
     */
    downloadPDF(trip) {
      try {
        const pdfString = this.generatePDFString(trip);
        const blob = new Blob([pdfString], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const filename = `PickMi_Tax_Invoice_${trip.id || 'Booking'}.pdf`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 4000);
        return { success: true, filename: filename };
      } catch (err) {
        console.error('Failed to download invoice PDF:', err);
        return { success: false, error: err };
      }
    },

    /**
     * Render high-fidelity A4 Preview HTML
     */
    renderA4PreviewHTML(trip) {
      const invNum = trip.invoiceNumber || ('INV-2026-10-' + String(trip.id || '').replace('PKM-', ''));
      const pName = trip.passengerName || 'Karthik Prabhu';
      const pPhone = trip.passengerPhone || '+91 9840123456';
      const pEmail = trip.passengerEmail || 'info@pickmicabs.com';
      const bookingId = trip.id || 'PKM-46587';
      const service = (trip.serviceType || 'Intercity').toUpperCase();
      const vehicle = trip.vehicleCategory || trip.vehicle?.name || 'Prime Sedan';
      const vehicleReg = trip.vehicleReg || 'Commercial Yellow Plate (Sent via SMS)';
      const pickup = trip.pickup || 'Anna Nagar, Chennai, Tamil Nadu';
      const drop = trip.drop || 'Pondicherry (Puducherry), Tamil Nadu';
      const date = trip.departureDate || '13 Oct 2026';
      const time = trip.pickupTime || '08:00 AM';
      const dist = trip.distanceKm || trip.fare?.distanceKm || 160;

      const fare = trip.fare || {};
      const base = fare.base || 2720;
      const tolls = typeof fare.tolls === 'number' ? fare.tolls : 0;
      const driverAllowance = fare.driverAllowance || 0;
      const interstateCharge = fare.interstateCharge || 0;
      const tax = fare.tax || 149;
      const discount = fare.discount || 0;
      const total = fare.total || 3299;

      const isAdv = trip.paymentMode === 'advance_100' || (typeof trip.advancePaid === 'number' && trip.advancePaid > 0) || (trip.paymentMethod && trip.paymentMethod.toLowerCase().includes('advance ₹100'));
      const adv = isAdv ? (trip.advancePaid || 100) : 0;
      const balance = isAdv ? Math.max(0, total - adv) : total;

      return `
        <div class="a4-invoice-sheet" id="printable-tax-invoice">
          <!-- Corporate Header -->
          <div class="a4-inv-header">
            <div class="a4-inv-brand">
              <div class="a4-brand-logo-text">PICKMI CAB SERVICES</div>
              <div class="a4-brand-tagline">India's Premier Chauffeur Mobility Platform</div>
              <div class="a4-company-meta">
                <span><strong>GSTIN:</strong> 33AAECP8892K1Z9</span> &bull; 
                <span><strong>CIN:</strong> U63090TN2026PTC109823</span> &bull; 
                <span><strong>SAC:</strong> 9964</span>
              </div>
              <div class="a4-company-meta">
                <span><strong>24x7 Helpline:</strong> 1800-209-7425 (Toll-Free)</span> &bull; 
                <span><strong>Email:</strong> info@pickmicabs.com</span>
              </div>
            </div>
            <div class="a4-inv-title-badge">
              <div class="a4-badge-tag">TAX INVOICE</div>
              <div class="a4-inv-number">${invNum}</div>
              <div class="a4-inv-date">Date: <strong>${date}</strong></div>
              <div class="a4-inv-recipient">Original for Recipient</div>
            </div>
          </div>

          <div class="a4-inv-divider"></div>

          <!-- Two Column Party / Ride Grid -->
          <div class="a4-inv-grid-two">
            <div class="a4-inv-card">
              <div class="a4-card-heading">BILLED TO (PASSENGER DETAILS)</div>
              <div class="a4-party-name">${pName}</div>
              <div class="a4-meta-row"><strong>Phone:</strong> ${pPhone}</div>
              <div class="a4-meta-row"><strong>Email:</strong> ${pEmail}</div>
              <div class="a4-meta-row" style="color:#059669;font-weight:600;margin-top:4px;">
                Passenger Identity Verified
              </div>
            </div>

            <div class="a4-inv-card">
              <div class="a4-card-heading">BOOKING &amp; CHAUFFEUR DETAILS</div>
              <div class="a4-meta-row"><strong>Booking Reference:</strong> <span class="mono-code">${bookingId}</span></div>
              <div class="a4-meta-row"><strong>Service Category:</strong> ${service} CAB</div>
              <div class="a4-meta-row"><strong>Vehicle Model:</strong> ${vehicle}</div>
              <div class="a4-meta-row"><strong>Registration:</strong> ${vehicleReg}</div>
              <div class="a4-meta-row"><strong>Pickup Time:</strong> ${time} on ${date}</div>
            </div>
          </div>

          <!-- Route Itinerary Card -->
          <div class="a4-inv-route-box">
            <div class="a4-route-heading">JOURNEY ROUTE ITINERARY (${dist} KM)</div>
            <div class="a4-route-row">
              <span class="a4-point-dot origin"></span>
              <div class="a4-route-text">
                <span class="a4-point-label green">PICKUP:</span>
                <span class="a4-point-val">${pickup}</span>
              </div>
            </div>
            <div class="a4-route-row" style="margin-top:0.4rem;">
              <span class="a4-point-dot destination"></span>
              <div class="a4-route-text">
                <span class="a4-point-label blue">DROP:</span>
                <span class="a4-point-val">${drop}</span>
              </div>
            </div>
          </div>

          <!-- Itemized Charges Table -->
          <table class="a4-charges-table">
            <thead>
              <tr>
                <th style="width:8%;text-align:center;">#</th>
                <th style="width:52%;">Description</th>
                <th style="width:15%;text-align:center;">SAC Code</th>
                <th style="width:25%;text-align:right;">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align:center;">1</td>
                <td>
                  <strong>Base Chauffeur Ride Fare</strong>
                  <div style="font-size:0.75rem;color:#64748b;">Includes vehicle rental, chauffeur charges &amp; ${dist} km route quota</div>
                </td>
                <td style="text-align:center;">9964</td>
                <td style="text-align:right;font-weight:600;">₹${formatCurrency(base)}</td>
              </tr>
              ${tolls > 0 ? `
                <tr>
                  <td style="text-align:center;">2</td>
                  <td>
                    <strong>Tolls &amp; State Highway Permits</strong>
                    <div style="font-size:0.75rem;color:#64748b;">Fastag toll fees and interstate commercial entry fee</div>
                  </td>
                  <td style="text-align:center;">9964</td>
                  <td style="text-align:right;font-weight:600;">₹${formatCurrency(tolls)}</td>
                </tr>
              ` : `
                <tr style="background:#fff7ed;">
                  <td style="text-align:center;">2</td>
                  <td>
                    <strong style="color:#9a3412;">Tolls &amp; Parking Charges</strong>
                    <div style="font-size:0.75rem;color:#c2410c;">Payable directly as per actuals based on your route &amp; toll plazas</div>
                  </td>
                  <td style="text-align:center;color:#c2410c;">-</td>
                  <td style="text-align:right;font-weight:700;color:#ea580c;font-size:0.82rem;">Extra (as per route)</td>
                </tr>
              `}
              ${driverAllowance > 0 ? `
                <tr>
                  <td style="text-align:center;">3</td>
                  <td>
                    <strong>Chauffeur Night / Outstation Allowance</strong>
                  </td>
                  <td style="text-align:center;">9964</td>
                  <td style="text-align:right;font-weight:600;">₹${formatCurrency(driverAllowance)}</td>
                </tr>
              ` : ''}
              <tr>
                <td style="text-align:center;">3</td>
                <td>
                  <strong>Interstate State Border Crossing Permit</strong>
                  <div style="font-size:0.75rem;color:#ea580c;">Payable as per actual route &amp; state checkposts</div>
                </td>
                <td style="text-align:center;">9964</td>
                <td style="text-align:right;font-weight:700;color:#ea580c;">Extra (route)</td>
              </tr>
              <tr>
                <td style="text-align:center;">4</td>
                <td>
                  <strong>Goods and Services Tax (GST 5%)</strong>
                  <div style="font-size:0.75rem;color:#ea580c;">Central &amp; State statutory tax on passenger road transportation</div>
                </td>
                <td style="text-align:center;">9964</td>
                <td style="text-align:right;font-weight:700;color:#ea580c;">5% Extra</td>
              </tr>
              ${discount > 0 ? `
                <tr style="color:#059669;">
                  <td style="text-align:center;">*</td>
                  <td><strong>Promotional Voucher Discount Applied</strong></td>
                  <td style="text-align:center;">--</td>
                  <td style="text-align:right;font-weight:700;">- ₹${formatCurrency(discount)}</td>
                </tr>
              ` : ''}
              <tr class="a4-total-row">
                <td colspan="3" style="text-align:right;font-weight:800;font-size:1.05rem;">TOTAL TRIP INVOICE AMOUNT (NET):</td>
                <td style="text-align:right;font-weight:800;font-size:1.15rem;color:#0056d6;">₹${formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Settlement Breakdown Card -->
          <div class="a4-settlement-card">
            ${isAdv ? `
              <div class="a4-settlement-col">
                <span class="a4-settle-label">Online Advance Received:</span>
                <span class="a4-settle-val green">₹${formatCurrency(adv)}</span>
              </div>
              <div class="a4-settlement-col" style="border-left:1px solid #cbd5e1;padding-left:1.5rem;">
                <span class="a4-settle-label">Balance Due to Chauffeur:</span>
                <span class="a4-settle-val blue">₹${formatCurrency(balance)}</span>
              </div>
            ` : `
              <div class="a4-settlement-col">
                <span class="a4-settle-label">Advance Online Paid:</span>
                <span class="a4-settle-val text-muted">₹0 (Zero Advance Paid)</span>
              </div>
              <div class="a4-settlement-col" style="border-left:1px solid #cbd5e1;padding-left:1.5rem;">
                <span class="a4-settle-label">Full Fare Payable to Chauffeur:</span>
                <span class="a4-settle-val blue">₹${formatCurrency(total)}</span>
              </div>
            `}
          </div>

          <!-- Bottom Terms and Digital Seal -->
          <div class="a4-bottom-section">
            <div class="a4-terms-box">
              <div class="a4-terms-title">TERMS &amp; STATUTORY DECLARATION:</div>
              <ol class="a4-terms-list">
                <li>This is an authentic computer generated electronic tax invoice issued under the provisions of the Central Goods and Services Tax Act, 2017.</li>
                <li>SAC 9964 applies to passenger road transport services. No physical signature is required.</li>
                <li>Highway tolls, Fastag deductions, and parking fees are extra payable directly as per actuals based on route toll plazas.</li>
                <li>For corporate GST input claims, billing queries or support: <strong>1800-209-7425</strong> / <strong>info@pickmicabs.com</strong>.</li>
                <li>PickMi Technologies India Pvt. Ltd., Anna Nagar, Chennai, Tamil Nadu - 600040.</li>
              </ol>
            </div>

            <div class="a4-seal-box">
              <div class="a4-seal-badge">
                <div class="a4-seal-corp">PICKMI TECHNOLOGIES</div>
                <div class="a4-seal-title">TAX INVOICE ISSUED</div>
                <div class="a4-seal-sub">DIGITALLY VERIFIED</div>
                <div class="a4-seal-ref">${bookingId}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  };

  window.InvoiceEngine = InvoiceEngine;
})(window);
