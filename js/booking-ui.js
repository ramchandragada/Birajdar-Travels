/**
 * Birajdar Travels — Multi-step booking wizard UI
 */
(function () {
  let currentStep = 1;
  const totalSteps = 4;

  const state = {
    serviceType: 'spiritual',
    travelDate: '',
    travelingFrom: 'Mumbai',
    pickup: '',
    drop: '',
    adults: 2,
    childHalf: 0,
    childFree: 0,
    tourVehicle: 'hatchback',
    vehicle: 'Maruti Baleno',
    estimatedKm: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    specialNotes: '',
    agreedTerms: false
  };

  const els = {};

  function BT() {
    return window.BTBooking;
  }

  function $(id) { return document.getElementById(id); }

  function cacheElements() {
    els.wizard = $('bookingWizard');
    if (!els.wizard) return false;

    els.steps = els.wizard.querySelectorAll('.bk-step');
    els.panels = els.wizard.querySelectorAll('.bk-panel');
    els.progressFill = $('bkProgressFill');
    els.stepLabel = $('bkStepLabel');
    els.btnPrev = $('bkPrev');
    els.btnNext = $('bkNext');
    els.btnSubmit = $('bkSubmit');
    els.errors = $('bkErrors');
    els.livePrice = $('bkLivePrice');
    els.reviewSummary = $('bkReviewSummary');
    els.serviceCards = els.wizard.querySelectorAll('.bk-service-card');

    els.travelDate = $('bkTravelDate');
    els.travelingFrom = $('bkTravelingFrom');
    els.pickup = $('bkPickup');
    els.drop = $('bkDrop');
    els.adults = $('bkAdults');
    els.childHalf = $('bkChildHalf');
    els.childFree = $('bkChildFree');
    els.tourVehicle = $('bkTourVehicle');
    els.vehicle = $('bkVehicle');
    els.estimatedKm = $('bkEstimatedKm');
    els.customerName = $('bkName');
    els.customerPhone = $('bkPhone');
    els.customerEmail = $('bkEmail');
    els.specialNotes = $('bkNotes');
    els.agreedTerms = $('bkTerms');

    els.tourFields = $('bkTourFields');
    els.taxiFields = $('bkTaxiFields');
    return true;
  }

  function setBtnVisible(btn, visible) {
    if (!btn) return;
    btn.hidden = !visible;
    btn.classList.toggle('is-hidden', !visible);
    btn.style.display = visible ? '' : 'none';
  }

  function showErrors(messages) {
    if (!els.errors) return;
    if (!messages.length) {
      els.errors.hidden = true;
      els.errors.innerHTML = '';
      return;
    }
    els.errors.hidden = false;
    els.errors.innerHTML = messages.map(m => `<p><i class="fa-solid fa-circle-exclamation"></i> ${m}</p>`).join('');
  }

  function readFormState() {
    state.serviceType = els.wizard.querySelector('.bk-service-card.selected')?.dataset.service || state.serviceType;
    state.travelDate = els.travelDate?.value || '';
    state.travelingFrom = els.travelingFrom?.value || '';
    state.pickup = els.pickup?.value || '';
    state.drop = els.drop?.value || '';
    state.adults = parseInt(els.adults?.value || '2', 10);
    state.childHalf = parseInt(els.childHalf?.value || '0', 10);
    state.childFree = parseInt(els.childFree?.value || '0', 10);
    state.tourVehicle = els.tourVehicle?.value || state.tourVehicle;
    state.vehicle = els.vehicle?.value || '';
    state.estimatedKm = els.estimatedKm?.value || '';
    state.customerName = els.customerName?.value || '';
    state.customerPhone = els.customerPhone?.value || '';
    state.customerEmail = els.customerEmail?.value || '';
    state.specialNotes = els.specialNotes?.value || '';
    state.agreedTerms = els.agreedTerms?.checked || false;
  }

  function syncFormFromState() {
    if (els.travelDate) els.travelDate.value = state.travelDate;
    if (els.travelingFrom) els.travelingFrom.value = state.travelingFrom;
    if (els.pickup) els.pickup.value = state.pickup;
    if (els.drop) els.drop.value = state.drop;
    if (els.adults) els.adults.value = state.adults;
    if (els.childHalf) els.childHalf.value = state.childHalf;
    if (els.childFree) els.childFree.value = state.childFree;
    updateTourVehicleOptions(true);
    if (els.tourVehicle) els.tourVehicle.value = state.tourVehicle;
    if (els.vehicle) els.vehicle.value = state.vehicle;
    if (els.estimatedKm) els.estimatedKm.value = state.estimatedKm;
    if (els.customerName) els.customerName.value = state.customerName;
    if (els.customerPhone) els.customerPhone.value = state.customerPhone;
    if (els.customerEmail) els.customerEmail.value = state.customerEmail;
    if (els.specialNotes) els.specialNotes.value = state.specialNotes;
    if (els.agreedTerms) els.agreedTerms.checked = state.agreedTerms;

    els.serviceCards?.forEach(card => {
      card.classList.toggle('selected', card.dataset.service === state.serviceType);
    });

    toggleServiceFields();
    updateLivePrice();
  }

  function toggleServiceFields() {
    const isTour = state.serviceType === 'spiritual';
    if (els.tourFields) els.tourFields.hidden = !isTour;
    if (els.taxiFields) els.taxiFields.hidden = isTour;
  }

  function updateTourVehicleOptions(preserveSelection) {
    if (!els.tourVehicle || !BT()) return;

    const { getAdultPricingTier, getAvailableTourVehicles, resolveTourVehicle,
      TOUR_VEHICLES, TOUR_VEHICLE_PRICES, formatINR } = BT();

    const tier = getAdultPricingTier(state.adults);
    const seatCount = state.adults + state.childHalf;
    const available = getAvailableTourVehicles(tier, seatCount);
    const prices = TOUR_VEHICLE_PRICES[tier];

    const currentSelection = preserveSelection
      ? (els.tourVehicle.value || state.tourVehicle)
      : state.tourVehicle;

    state.tourVehicle = resolveTourVehicle(tier, seatCount, currentSelection);

    els.tourVehicle.innerHTML = available.map(id => {
      const v = TOUR_VEHICLES[id];
      const price = prices[id];
      const isDefault = id === BT().getDefaultVehicleId(tier);
      const defaultTag = isDefault ? ' (recommended)' : '';
      return `<option value="${id}">${v.label} — ${formatINR(price)}${defaultTag}</option>`;
    }).join('');

    els.tourVehicle.value = state.tourVehicle;
  }

  function refreshLivePrice() {
    const livePrice = document.getElementById('bkLivePrice');
    if (!livePrice || !BT()) return null;

    readFormState();

    if (state.serviceType !== 'spiritual') {
      livePrice.innerHTML = '<span class="bk-price-note">Fare confirmed on call based on distance</span>';
      return null;
    }

    const vehicleEl = document.getElementById('bkTourVehicle');
    const vehicleId = vehicleEl?.value || state.tourVehicle;

    const q = BT().renderLivePriceSidebar(livePrice, {
      adults: state.adults,
      childHalf: state.childHalf,
      childFree: state.childFree,
      vehicleId
    });

    if (q) state.tourVehicle = q.vehicleId;
    return q;
  }

  function updateLivePrice() {
    refreshLivePrice();
  }

  function bindLivePriceListeners() {
    const ids = ['bkTourVehicle', 'bkAdults', 'bkChildHalf', 'bkChildFree'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el || el.dataset.priceBound) return;
      el.dataset.priceBound = '1';
      el.addEventListener('change', () => {
        if (id === 'bkAdults' || id === 'bkChildHalf') {
          readFormState();
          updateTourVehicleOptions(true);
        } else {
          readFormState();
        }
        refreshLivePrice();
      });
      el.addEventListener('input', () => {
        if (id === 'bkAdults' || id === 'bkChildHalf' || id === 'bkChildFree') {
          readFormState();
          if (id === 'bkAdults' || id === 'bkChildHalf') updateTourVehicleOptions(true);
          refreshLivePrice();
        }
      });
    });
  }

  function buildReviewHTML() {
    readFormState();
    const { SERVICE_TYPES, estimateTourPrice, formatINR, formatDate } = BT();

    const rows = [
      ['Service', SERVICE_TYPES[state.serviceType]?.label],
      ['Travel date', formatDate(state.travelDate)],
      ['Name', state.customerName],
      ['Phone', state.customerPhone]
    ];

    if (state.customerEmail) rows.push(['Email', state.customerEmail]);

    if (state.serviceType === 'spiritual') {
      const q = estimateTourPrice(state.adults, state.childHalf, state.tourVehicle);
      rows.push(['Traveling from', state.travelingFrom]);
      rows.push(['Adults', state.adults]);
      if (state.childHalf) rows.push(['Children (5–12)', state.childHalf]);
      if (state.childFree) rows.push(['Children (0–5)', state.childFree + ' (free)']);
      rows.push(['Vehicle', q.vehicle]);
      rows.push(['Estimated total', formatINR(q.estimatedTotal)]);
    } else {
      rows.push(['Pickup', state.pickup]);
      rows.push(['Drop', state.drop]);
      rows.push(['Vehicle', state.vehicle]);
      if (state.estimatedKm) rows.push(['Est. distance', state.estimatedKm + ' km']);
    }

    if (state.specialNotes) rows.push(['Notes', state.specialNotes]);

    return rows.map(([k, v]) =>
      `<div class="bk-review-row"><span>${k}</span><strong>${v || '—'}</strong></div>`
    ).join('');
  }

  function goToStep(step) {
    currentStep = Math.max(1, Math.min(totalSteps, step));
    showErrors([]);

    els.steps?.forEach(s => {
      const n = parseInt(s.dataset.step, 10);
      s.classList.toggle('active', n === currentStep);
      s.classList.toggle('done', n < currentStep);
    });

    els.panels?.forEach(p => {
      const show = parseInt(p.dataset.panel, 10) === currentStep;
      p.hidden = !show;
    });

    if (els.progressFill) {
      els.progressFill.style.width = `${((currentStep - 1) / (totalSteps - 1)) * 100}%`;
    }
    if (els.stepLabel) {
      els.stepLabel.textContent = `Step ${currentStep} of ${totalSteps}`;
    }

    setBtnVisible(els.btnPrev, currentStep !== 1);
    setBtnVisible(els.btnNext, currentStep !== totalSteps);
    setBtnVisible(els.btnSubmit, currentStep === totalSteps);

    if (currentStep === totalSteps && els.reviewSummary) {
      readFormState();
      els.reviewSummary.innerHTML = buildReviewHTML();
      updateLivePrice();
    }

    if (currentStep === 2) {
      readFormState();
      toggleServiceFields();
      updateTourVehicleOptions(true);
      bindLivePriceListeners();
      refreshLivePrice();
    }
  }

  async function submitBooking() {
    readFormState();
    const errors = BT().validateStep(state, 4);
    if (errors.length) {
      showErrors(errors);
      return;
    }

    const booking = BT().buildBookingPayload(state);
    els.btnSubmit.disabled = true;
    els.btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Placing booking…';

    try {
      await window.BTBookingAPI.submitBooking(booking);
      window.location.href = `confirm.html?ref=${encodeURIComponent(booking.bookingRef)}`;
    } catch (e) {
      showErrors(['Could not place booking. Please call us at +91 9322613925.']);
      els.btnSubmit.disabled = false;
      els.btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Confirm Booking';
    }
  }

  function bindEvents() {
    els.serviceCards?.forEach(card => {
      card.addEventListener('click', () => {
        state.serviceType = card.dataset.service;
        syncFormFromState();
      });
    });

    ['input', 'change'].forEach(evt => {
      els.wizard.addEventListener(evt, (e) => {
        if (e.target.matches('input, select, textarea')) {
          if (e.target.id === 'bkAdults' || e.target.id === 'bkChildHalf') {
            readFormState();
            updateTourVehicleOptions(true);
          } else {
            readFormState();
          }
          updateLivePrice();
        }
      });
    });

    els.tourVehicle?.addEventListener('change', () => {
      readFormState();
      refreshLivePrice();
    });

    els.adults?.addEventListener('input', () => {
      readFormState();
      updateTourVehicleOptions(true);
      refreshLivePrice();
    });

    els.childHalf?.addEventListener('input', () => {
      readFormState();
      updateTourVehicleOptions(true);
      refreshLivePrice();
    });

    bindLivePriceListeners();

    els.btnPrev?.addEventListener('click', () => goToStep(currentStep - 1));

    els.btnNext?.addEventListener('click', () => {
      readFormState();
      const errors = BT().validateStep(state, currentStep);
      if (errors.length) {
        showErrors(errors);
        return;
      }
      goToStep(currentStep + 1);
    });

    els.btnSubmit?.addEventListener('click', submitBooking);

    if (els.travelDate) {
      els.travelDate.setAttribute('min', new Date().toISOString().split('T')[0]);
    }
  }

  function prefillFromParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('service')) state.serviceType = params.get('service');
    if (params.get('city')) state.travelingFrom = params.get('city');
    if (params.get('adults')) state.adults = parseInt(params.get('adults'), 10) || 2;
  }

  function prefillFromTourCTA() {
    document.querySelectorAll('[data-tour="spiritual"]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.serviceType = 'spiritual';
        state.drop = 'Gangapur, Akkalkot, Tuljapur, Pandharpur';
        const activeTab = document.querySelector('.city-tab.active');
        const cityMap = { mumbai: 'Mumbai', pune: 'Pune', nagpur: 'Nagpur', hyderabad: 'Hyderabad', bengaluru: 'Bengaluru' };
        if (activeTab) state.travelingFrom = cityMap[activeTab.dataset.city] || 'Mumbai';
        syncFormFromState();
        goToStep(1);
      });
    });
  }

  function init() {
    if (!window.BTBooking || !window.BTBookingAPI) {
      console.error('Booking engine scripts failed to load.');
      return;
    }
    if (!cacheElements()) return;
    prefillFromParams();
    bindEvents();
    syncFormFromState();
    prefillFromTourCTA();
    goToStep(1);
  }

  window.BTBookingUI = {
    init,
    setState(partial) {
      Object.assign(state, partial);
      if (cacheElements()) syncFormFromState();
    }
  };
})();
