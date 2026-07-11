/**
 * Birajdar Travels — Admin dashboard
 */
(function () {
  const SESSION_KEY = 'bt_admin_session';
  let allBookings = [];

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  function login(pin) {
    if (pin === String(window.BT_CONFIG?.adminPin || '3925')) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
  }

  function showLogin() {
    document.getElementById('adminLogin').hidden = false;
    document.getElementById('adminDashboard').hidden = true;
  }

  function showDashboard() {
    document.getElementById('adminLogin').hidden = true;
    document.getElementById('adminDashboard').hidden = false;
    loadBookings();
  }

  function normalizeBooking(raw) {
    if (raw.booking_data) return raw.booking_data;
    if (raw.bookingRef) return raw;
    return {
      bookingRef: raw.booking_ref,
      createdAt: raw.created_at,
      status: raw.status,
      paymentStatus: raw.payment_status,
      serviceType: raw.service_type,
      serviceLabel: raw.service_label,
      customerName: raw.customer_name,
      customerPhone: raw.customer_phone,
      customerEmail: raw.customer_email,
      travelDate: raw.travel_date,
      travelingFrom: raw.traveling_from,
      pickup: raw.pickup,
      drop: raw.drop_location || raw.drop,
      adults: raw.adults,
      childHalf: raw.child_half,
      childFree: raw.child_free,
      vehicle: raw.vehicle,
      estimatedTotal: raw.estimated_total,
      specialNotes: raw.special_notes
    };
  }

  async function loadBookings() {
    const local = window.BTBookingAPI.getLocalBookings();
    let cloud = [];

    try {
      cloud = await window.BTBookingAPI.fetchSupabaseBookings();
    } catch (_) { /* Supabase not configured */ }

    const merged = new Map();
    [...cloud.map(normalizeBooking), ...local].forEach(b => {
      if (b?.bookingRef) merged.set(b.bookingRef, b);
    });

    allBookings = Array.from(merged.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    renderTable();
  }

  function renderTable() {
    const search = document.getElementById('adminSearch').value.toLowerCase();
    const statusFilter = document.getElementById('adminFilterStatus').value;

    const filtered = allBookings.filter(b => {
      if (statusFilter && b.status !== statusFilter) return false;
      if (!search) return true;
      const hay = [b.bookingRef, b.customerName, b.customerPhone, b.serviceLabel].join(' ').toLowerCase();
      return hay.includes(search);
    });

    document.getElementById('adminStats').textContent =
      `${filtered.length} booking(s) · ${allBookings.filter(b => b.status === 'pending_confirmation').length} pending`;

    const tbody = document.getElementById('adminTableBody');
    const empty = document.getElementById('adminEmpty');

    if (!filtered.length) {
      tbody.innerHTML = '';
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    tbody.innerHTML = filtered.map(b => `
      <tr>
        <td><code>${b.bookingRef}</code></td>
        <td>${window.BTBooking.formatDate(b.travelDate)}</td>
        <td>${b.customerName}<br><small>${b.customerPhone}</small></td>
        <td>${b.serviceLabel}</td>
        <td>${b.serviceType === 'spiritual' ? b.travelingFrom : b.pickup}</td>
        <td>${b.estimatedTotal ? window.BTBooking.formatINR(b.estimatedTotal) : 'TBD'}</td>
        <td><span class="status-pill ${b.status}">${formatStatus(b.status)}</span></td>
        <td>
          <button type="button" class="btn btn-sm btn-outline" data-view="${b.bookingRef}">View</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => showDetail(btn.dataset.view));
    });
  }

  function formatStatus(s) {
    return (s || '').replace(/_/g, ' ');
  }

  function showDetail(ref) {
    const b = allBookings.find(x => x.bookingRef === ref);
    if (!b) return;

    const content = document.getElementById('adminDetailContent');
    content.innerHTML = `
      <h2>${b.bookingRef}</h2>
      <p class="admin-detail-meta">Placed ${new Date(b.createdAt).toLocaleString('en-IN')}</p>
      <div class="admin-detail-grid">
        <div><label>Customer</label><p>${b.customerName}<br>${b.customerPhone}${b.customerEmail ? '<br>' + b.customerEmail : ''}</p></div>
        <div><label>Service</label><p>${b.serviceLabel}</p></div>
        <div><label>Travel date</label><p>${window.BTBooking.formatDate(b.travelDate)}</p></div>
        <div><label>Amount</label><p>${b.estimatedTotal ? window.BTBooking.formatINR(b.estimatedTotal) : 'Confirm on call'}</p></div>
        ${b.serviceType === 'spiritual' ? `
          <div><label>From</label><p>${b.travelingFrom}</p></div>
          <div><label>Travellers</label><p>${b.adults} adults, ${b.childHalf} child (5–12), ${b.childFree} child (0–5)</p></div>
        ` : `
          <div><label>Pickup</label><p>${b.pickup}</p></div>
          <div><label>Drop</label><p>${b.drop}</p></div>
        `}
        <div><label>Vehicle</label><p>${b.vehicle || '—'}</p></div>
        <div><label>Notes</label><p>${b.specialNotes || '—'}</p></div>
      </div>
      <div class="admin-detail-actions">
        <button type="button" class="btn btn-primary btn-sm" data-action="confirmed" data-ref="${b.bookingRef}">Mark Confirmed</button>
        <button type="button" class="btn btn-outline btn-sm" data-action="paid" data-ref="${b.bookingRef}">Mark Paid</button>
        <button type="button" class="btn btn-outline btn-sm" data-action="cancelled" data-ref="${b.bookingRef}">Cancel</button>
        <a href="tel:${b.customerPhone}" class="btn btn-dark btn-sm"><i class="fa-solid fa-phone"></i> Call</a>
        <a href="https://wa.me/${b.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Hi ' + b.customerName + ', regarding your booking ' + b.bookingRef)}" class="btn btn-whatsapp btn-sm" target="_blank"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
      </div>
    `;

    content.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.action;
        const ref = btn.dataset.ref;
        let status = 'pending_confirmation';
        let payment = null;
        if (action === 'confirmed') status = 'confirmed';
        if (action === 'cancelled') status = 'cancelled';
        if (action === 'paid') { status = 'confirmed'; payment = 'paid'; }
        await window.BTBookingAPI.updateBookingStatus(ref, status, payment);
        const idx = allBookings.findIndex(x => x.bookingRef === ref);
        if (idx >= 0) {
          allBookings[idx].status = status;
          if (payment) allBookings[idx].paymentStatus = payment;
        }
        renderTable();
        showDetail(ref);
      });
    });

    document.getElementById('adminDetail').hidden = false;
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(allBookings, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `birajdar-bookings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  document.getElementById('adminLoginBtn')?.addEventListener('click', () => {
    const pin = document.getElementById('adminPinInput').value;
    if (login(pin)) {
      document.getElementById('adminLoginErr').hidden = true;
      showDashboard();
    } else {
      document.getElementById('adminLoginErr').hidden = false;
    }
  });

  document.getElementById('adminPinInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('adminLoginBtn').click();
  });

  document.getElementById('adminLogout')?.addEventListener('click', logout);
  document.getElementById('adminRefresh')?.addEventListener('click', loadBookings);
  document.getElementById('adminExport')?.addEventListener('click', exportJSON);
  document.getElementById('adminSearch')?.addEventListener('input', renderTable);
  document.getElementById('adminFilterStatus')?.addEventListener('change', renderTable);
  document.getElementById('adminDetailClose')?.addEventListener('click', () => {
    document.getElementById('adminDetail').hidden = true;
  });

  if (isLoggedIn()) showDashboard();
  else showLogin();
})();
