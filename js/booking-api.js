/**
 * Birajdar Travels — Booking API (Supabase, FormSubmit, localStorage)
 */
(function (global) {
  const STORAGE_KEY = 'birajdar_bookings';

  function getLocalBookings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveLocalBooking(booking) {
    const list = getLocalBookings();
    list.unshift(booking);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
    sessionStorage.setItem('bt_last_booking', JSON.stringify(booking));
  }

  function getLastBooking() {
    try {
      const raw = sessionStorage.getItem('bt_last_booking');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function getBookingByRef(ref) {
    const local = getLocalBookings().find(b => b.bookingRef === ref);
    if (local) return local;
    const last = getLastBooking();
    if (last?.bookingRef === ref) return last;
    return null;
  }

  async function submitToSupabase(booking) {
    const cfg = global.BT_CONFIG?.supabase;
    if (!cfg?.url || !cfg?.anonKey) return { ok: false, skipped: true };

    const res = await fetch(`${cfg.url}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        booking_ref: booking.bookingRef,
        status: booking.status,
        payment_status: booking.paymentStatus,
        service_type: booking.serviceType,
        service_label: booking.serviceLabel,
        customer_name: booking.customerName,
        customer_phone: booking.customerPhone,
        customer_email: booking.customerEmail,
        travel_date: booking.travelDate,
        traveling_from: booking.travelingFrom,
        pickup: booking.pickup,
        drop_location: booking.drop,
        adults: booking.adults,
        child_half: booking.childHalf,
        child_free: booking.childFree,
        vehicle: booking.vehicle,
        estimated_total: booking.estimatedTotal,
        special_notes: booking.specialNotes,
        booking_data: booking
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Supabase save failed');
    }
    return { ok: true };
  }

  async function notifyViaFormSubmit(booking) {
    const email = global.BT_CONFIG?.business?.notificationEmail;
    if (!email) return { ok: false, skipped: true };

    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        _subject: `New Booking ${booking.bookingRef} — Birajdar Travels`,
        _template: 'table',
        booking_ref: booking.bookingRef,
        status: booking.status,
        service: booking.serviceLabel,
        customer_name: booking.customerName,
        phone: booking.customerPhone,
        email: booking.customerEmail || '—',
        travel_date: booking.travelDate,
        traveling_from: booking.travelingFrom || '—',
        pickup: booking.pickup,
        drop: booking.drop,
        adults: booking.adults,
        children_5_12: booking.childHalf,
        children_0_5: booking.childFree,
        vehicle: booking.vehicle,
        estimated_total: booking.estimatedTotal
          ? `₹${booking.estimatedTotal.toLocaleString('en-IN')}`
          : 'Confirm on call',
        notes: booking.specialNotes || '—'
      })
    });

    if (!res.ok) throw new Error('Email notification failed');
    return { ok: true };
  }

  async function submitBooking(booking) {
    saveLocalBooking(booking);

    const results = { local: true, supabase: false, email: false, errors: [] };

    try {
      const sb = await submitToSupabase(booking);
      results.supabase = sb.ok;
    } catch (e) {
      results.errors.push('Cloud save: ' + e.message);
    }

    try {
      const em = await notifyViaFormSubmit(booking);
      results.email = em.ok;
    } catch (e) {
      results.errors.push('Email: ' + e.message);
    }

    return results;
  }

  async function fetchSupabaseBookings() {
    const cfg = global.BT_CONFIG?.supabase;
    if (!cfg?.url || !cfg?.anonKey) return [];

    const res = await fetch(
      `${cfg.url}/rest/v1/bookings?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: cfg.anonKey,
          Authorization: `Bearer ${cfg.anonKey}`
        }
      }
    );

    if (!res.ok) throw new Error('Failed to load bookings');
    return res.json();
  }

  async function updateBookingStatus(ref, status, paymentStatus) {
    const cfg = global.BT_CONFIG?.supabase;
    if (!cfg?.url || !cfg?.anonKey) {
      const list = getLocalBookings();
      const idx = list.findIndex(b => b.bookingRef === ref);
      if (idx >= 0) {
        list[idx].status = status;
        if (paymentStatus) list[idx].paymentStatus = paymentStatus;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
      return { ok: true, local: true };
    }

    const body = { status };
    if (paymentStatus) body.payment_status = paymentStatus;

    const res = await fetch(
      `${cfg.url}/rest/v1/bookings?booking_ref=eq.${encodeURIComponent(ref)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: cfg.anonKey,
          Authorization: `Bearer ${cfg.anonKey}`,
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(body)
      }
    );

    if (!res.ok) throw new Error('Update failed');
    return { ok: true };
  }

  global.BTBookingAPI = {
    submitBooking,
    getLocalBookings,
    getBookingByRef,
    getLastBooking,
    fetchSupabaseBookings,
    updateBookingStatus
  };
})(window);
