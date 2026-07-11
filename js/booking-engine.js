/**
 * Birajdar Travels — Booking Engine (pricing, validation, reference IDs)
 */
(function (global) {
  const TOUR_PACKAGES = {
    2: { total: 20000, perPerson: 10000, vehicle: 'Hatchback (Maruti Baleno)' },
    3: { total: 25500, perPerson: 8500, vehicle: 'Hatchback (Maruti Baleno)' },
    4: { total: 30000, perPerson: 7500, vehicle: 'Sedan (Tata Tigor)' },
    5: { total: 32500, perPerson: 6500, vehicle: 'Innova (Toyota Innova Crysta)' },
    6: { total: 36000, perPerson: 6000, vehicle: 'Innova (Toyota Innova Crysta)' }
  };

  const FLEET_RATES = {
    'Tata Tigor': { rate: 11, label: 'Tata Tigor – Sedan (₹11/km)' },
    'Maruti Baleno': { rate: 11, label: 'Maruti Baleno – Hatchback (₹11/km)' },
    'Toyota Innova': { rate: 20, label: 'Toyota Innova (₹20/km)' }
  };

  const SERVICE_TYPES = {
    spiritual: {
      id: 'spiritual',
      label: 'Spiritual Tour – 2 Day Package',
      icon: 'fa-om',
      description: 'Gangapur, Akkalkot, Tuljapur & Pandharpur with hotel & meals'
    },
    local: {
      id: 'local',
      label: 'Local Taxi',
      icon: 'fa-city',
      description: 'Hourly or point-to-point travel within Solapur'
    },
    outstation: {
      id: 'outstation',
      label: 'Outstation Trip',
      icon: 'fa-route',
      description: 'One-way or round trip to Pune, Mumbai, Hyderabad & more'
    },
    airport: {
      id: 'airport',
      label: 'Airport Transfer',
      icon: 'fa-plane',
      description: 'Solapur Airport pickup or drop'
    }
  };

  function getVehicle(seatCount) {
    if (seatCount <= 3) return 'Hatchback (Maruti Baleno)';
    if (seatCount === 4) return 'Sedan (Tata Tigor)';
    return 'Innova (Toyota Innova Crysta)';
  }

  function getAdultPricingTier(adults) {
    return Math.max(2, Math.min(6, adults));
  }

  function estimateTourPrice(adults, childHalf) {
    const tier = getAdultPricingTier(adults);
    const pkg = TOUR_PACKAGES[tier];
    const halfPerChild = Math.round(pkg.perPerson / 2);
    const seatCount = adults + childHalf;
    return {
      tier,
      seatCount,
      vehicle: getVehicle(seatCount),
      perPerson: pkg.perPerson,
      baseTotal: pkg.total,
      childHalfCharge: childHalf * halfPerChild,
      estimatedTotal: pkg.total + childHalf * halfPerChild
    };
  }

  function generateBookingRef() {
    const prefix = global.BT_CONFIG?.bookingPrefix || 'BT';
    const d = new Date();
    const date = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('');
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    return `${prefix}-${date}-${rand}`;
  }

  function formatINR(amount) {
    if (amount == null || Number.isNaN(amount)) return '—';
    return '₹' + Number(amount).toLocaleString('en-IN');
  }

  function formatDate(isoDate) {
    if (!isoDate) return '—';
    return new Date(isoDate + 'T12:00:00').toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  }

  function normalizePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return '+91' + digits;
    if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
    return phone.trim();
  }

  function validateStep(state, step) {
    const errors = [];

    if (step === 1) {
      if (!state.serviceType) errors.push('Please select a service.');
    }

    if (step === 2) {
      if (!state.travelDate) errors.push('Travel date is required.');
      else if (state.travelDate < new Date().toISOString().split('T')[0]) {
        errors.push('Travel date cannot be in the past.');
      }

      if (state.serviceType === 'spiritual') {
        if (!state.travelingFrom) errors.push('Please select your city.');
        if (state.adults < 1) errors.push('At least 1 adult is required.');
        if (state.adults + state.childHalf > 6) {
          errors.push('Maximum 6 paying travellers per vehicle. Contact us for larger groups.');
        }
      } else {
        if (!state.pickup?.trim()) errors.push('Pickup location is required.');
        if (!state.drop?.trim()) errors.push('Drop location is required.');
        if (!state.vehicle) errors.push('Please select a vehicle.');
      }
    }

    if (step === 3) {
      if (!state.customerName?.trim()) errors.push('Full name is required.');
      if (!state.customerPhone?.trim()) errors.push('Phone number is required.');
      else if (!validatePhone(state.customerPhone)) errors.push('Enter a valid 10-digit mobile number.');
      if (state.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.customerEmail)) {
        errors.push('Enter a valid email address.');
      }
    }

    if (step === 4) {
      if (!state.agreedTerms) errors.push('Please accept the booking terms.');
    }

    return errors;
  }

  function buildBookingPayload(state) {
    const payload = {
      bookingRef: state.bookingRef || generateBookingRef(),
      createdAt: new Date().toISOString(),
      status: 'pending_confirmation',
      paymentStatus: 'awaiting_payment',
      serviceType: state.serviceType,
      serviceLabel: SERVICE_TYPES[state.serviceType]?.label || state.serviceType,
      customerName: state.customerName.trim(),
      customerPhone: normalizePhone(state.customerPhone),
      customerEmail: state.customerEmail?.trim() || '',
      travelDate: state.travelDate,
      travelingFrom: state.travelingFrom || '',
      pickup: state.pickup?.trim() || '',
      drop: state.drop?.trim() || '',
      adults: state.adults || 0,
      childHalf: state.childHalf || 0,
      childFree: state.childFree || 0,
      vehicle: state.vehicle || '',
      estimatedKm: state.estimatedKm || null,
      specialNotes: state.specialNotes?.trim() || '',
      agreedTerms: !!state.agreedTerms
    };

    if (state.serviceType === 'spiritual') {
      const quote = estimateTourPrice(payload.adults, payload.childHalf);
      payload.vehicle = quote.vehicle;
      payload.pricingTier = quote.tier;
      payload.perPerson = quote.perPerson;
      payload.baseTotal = quote.baseTotal;
      payload.childHalfCharge = quote.childHalfCharge;
      payload.estimatedTotal = quote.estimatedTotal;
      payload.pickup = payload.pickup || `Solapur Junction (arriving from ${payload.travelingFrom})`;
      payload.drop = payload.drop || 'Gangapur, Akkalkot, Tuljapur, Pandharpur';
    } else {
      payload.estimatedTotal = null;
      payload.priceNote = 'Final fare confirmed on call based on distance';
    }

    return payload;
  }

  global.BTBooking = {
    TOUR_PACKAGES,
    FLEET_RATES,
    SERVICE_TYPES,
    estimateTourPrice,
    generateBookingRef,
    formatINR,
    formatDate,
    validateStep,
    buildBookingPayload,
    normalizePhone
  };
})(window);
