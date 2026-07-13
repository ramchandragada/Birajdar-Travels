/**
 * Birajdar Travels — Booking Engine (pricing, validation, reference IDs)
 */
(function (global) {
  const TOUR_PACKAGES = {
    2: { total: 20000, perPerson: 10000, defaultVehicle: 'hatchback' },
    3: { total: 25500, perPerson: 8500, defaultVehicle: 'hatchback' },
    4: { total: 30000, perPerson: 7500, defaultVehicle: 'sedan' },
    5: { total: 32500, perPerson: 6500, defaultVehicle: 'innova' },
    6: { total: 36000, perPerson: 6000, defaultVehicle: 'innova' }
  };

  /** Full package price per tier + vehicle (500 km tour) */
  const TOUR_VEHICLE_PRICES = {
    2: { hatchback: 20000, sedan: 22000, innova: 26000 },
    3: { hatchback: 25500, sedan: 27500, innova: 31500 },
    4: { hatchback: null, sedan: 30000, innova: 33500 },
    5: { hatchback: null, sedan: null, innova: 32500 },
    6: { hatchback: null, sedan: null, innova: 36000 }
  };

  const TOUR_VEHICLES = {
    hatchback: {
      id: 'hatchback',
      label: 'Hatchback — Maruti Baleno',
      shortLabel: 'Hatchback (Maruti Baleno)',
      maxSeats: 3
    },
    sedan: {
      id: 'sedan',
      label: 'Sedan — Tata Tigor',
      shortLabel: 'Sedan (Tata Tigor)',
      maxSeats: 4
    },
    innova: {
      id: 'innova',
      label: 'Innova — Toyota Innova Crysta',
      shortLabel: 'Innova (Toyota Innova Crysta)',
      maxSeats: 6
    }
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

  function getDefaultVehicleId(tier) {
    return TOUR_PACKAGES[tier]?.defaultVehicle || 'hatchback';
  }

  function getVehicleLabel(vehicleId) {
    return TOUR_VEHICLES[vehicleId]?.shortLabel || vehicleId;
  }

  function getAvailableTourVehicles(tier, seatCount) {
    const prices = TOUR_VEHICLE_PRICES[tier] || {};
    return Object.keys(TOUR_VEHICLES).filter(id => {
      if (prices[id] == null) return false;
      return TOUR_VEHICLES[id].maxSeats >= seatCount;
    });
  }

  function resolveTourVehicle(tier, seatCount, requestedId) {
    const available = getAvailableTourVehicles(tier, seatCount);
    const defaultId = getDefaultVehicleId(tier);
    if (requestedId && available.includes(requestedId)) return requestedId;
    if (available.includes(defaultId)) return defaultId;
    return available[0] || defaultId;
  }

  function getAdultPricingTier(adults) {
    return Math.max(2, Math.min(6, adults));
  }

  function estimateTourPrice(adults, childHalf, tourVehicleId) {
    const tier = getAdultPricingTier(adults);
    const pkg = TOUR_PACKAGES[tier];
    const seatCount = adults + childHalf;
    const vehicleId = resolveTourVehicle(tier, seatCount, tourVehicleId);
    const prices = TOUR_VEHICLE_PRICES[tier];
    const baseTotal = prices[vehicleId] ?? pkg.total;
    const defaultId = getDefaultVehicleId(tier);
    const vehicleUpgrade = baseTotal - (prices[defaultId] ?? pkg.total);
    const halfPerChild = Math.round(pkg.perPerson / 2);

    return {
      tier,
      seatCount,
      vehicleId,
      vehicle: getVehicleLabel(vehicleId),
      defaultVehicleId: defaultId,
      defaultVehicle: getVehicleLabel(defaultId),
      perPerson: pkg.perPerson,
      baseTotal,
      vehicleUpgrade,
      childHalfCharge: childHalf * halfPerChild,
      estimatedTotal: baseTotal + childHalf * halfPerChild,
      availableVehicles: getAvailableTourVehicles(tier, seatCount)
    };
  }

  function renderLivePriceSidebar(containerEl, opts) {
    if (!containerEl) return null;

    const adults = opts.adults ?? 2;
    const childHalf = opts.childHalf ?? 0;
    const childFree = opts.childFree ?? 0;
    const vehicleId = opts.vehicleId || opts.tourVehicleId || getDefaultVehicleId(getAdultPricingTier(adults));

    const q = estimateTourPrice(adults, childHalf, vehicleId);
    const isUpgrade = q.vehicleId !== q.defaultVehicleId;

    let html = `<div class="bk-price-row"><span>${q.vehicle} · ${q.tier} travellers</span><strong>${formatINR(q.baseTotal)}</strong></div>`;

    if (isUpgrade && q.vehicleUpgrade > 0) {
      html += `<div class="bk-price-row"><span>Upgrade from ${q.defaultVehicle}</span><strong>+${formatINR(q.vehicleUpgrade)}</strong></div>`;
    }

    if (childHalf > 0) {
      html += `<div class="bk-price-row"><span>Children 5–12 (${childHalf} × 50%)</span><strong>${formatINR(q.childHalfCharge)}</strong></div>`;
    }

    if (childFree > 0) {
      html += `<div class="bk-price-row"><span>Children 0–5 (${childFree})</span><strong>Free</strong></div>`;
    }

    html += `<div class="bk-price-row total"><span>Estimated total</span><strong>${formatINR(q.estimatedTotal)}</strong></div>`;

    containerEl.innerHTML = html;
    return q;
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
        if (!state.tourVehicle) errors.push('Please select a vehicle.');
        else {
          const tier = getAdultPricingTier(state.adults);
          const seats = state.adults + state.childHalf;
          const available = getAvailableTourVehicles(tier, seats);
          if (!available.includes(state.tourVehicle)) {
            errors.push('Selected vehicle cannot fit your group size. Please choose another option.');
          }
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
      const quote = estimateTourPrice(payload.adults, payload.childHalf, state.tourVehicle);
      payload.tourVehicle = quote.vehicleId;
      payload.vehicle = quote.vehicle;
      payload.pricingTier = quote.tier;
      payload.perPerson = quote.perPerson;
      payload.baseTotal = quote.baseTotal;
      payload.vehicleUpgrade = quote.vehicleUpgrade;
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
    TOUR_VEHICLES,
    TOUR_VEHICLE_PRICES,
    FLEET_RATES,
    SERVICE_TYPES,
    estimateTourPrice,
    renderLivePriceSidebar,
    getAdultPricingTier,
    getDefaultVehicleId,
    getAvailableTourVehicles,
    resolveTourVehicle,
    getVehicleLabel,
    generateBookingRef,
    formatINR,
    formatDate,
    validateStep,
    buildBookingPayload,
    normalizePhone
  };
})(window);
