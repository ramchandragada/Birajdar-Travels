// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function setActiveNav() {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}
window.addEventListener('scroll', setActiveNav, { passive: true });
setActiveNav();

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinksEl = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
  const icon = menuToggle.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-xmark');
});

document.querySelectorAll('.nav-link').forEach(a =>
  a.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    menuToggle.querySelector('i').classList.add('fa-bars');
    menuToggle.querySelector('i').classList.remove('fa-xmark');
  })
);

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Booking form -> WhatsApp
const form = document.getElementById('bookingForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('fName').value.trim();
  const phone = document.getElementById('fPhone').value.trim();
  const pickup = document.getElementById('fPickup').value.trim();
  const drop = document.getElementById('fDrop').value.trim();
  const date = document.getElementById('fDate').value;
  const city = document.getElementById('fCity')?.value || '';
  const car = document.getElementById('fCar').value;

  const msg =
`*New Booking Request - Birajdar Travels*%0A
*Name:* ${name}%0A
*Phone:* ${phone}%0A
*Traveling From:* ${city}%0A
*Pickup:* ${pickup}%0A
*Drop:* ${drop}%0A
*Date:* ${date}%0A
*Car:* ${car}`;

  window.open(`https://wa.me/919322613925?text=${msg}`, '_blank');

  const status = document.getElementById('formStatus');
  if (status) {
    status.textContent = `Thanks ${name}! Opening WhatsApp to confirm your booking...`;
    status.classList.add('success');
  }
});

// Scroll reveal with stagger
const revealEls = document.querySelectorAll(
  '.section-head, .service-card, .fleet-card, .testi-card, .contact-card, ' +
  '.about-img, .about-text, .booking-info, .booking-form, .rate-table-wrap, ' +
  '.tour-train-card, .tour-places-card, .itinerary-wrap, .include-card, .tour-cta, ' +
  '.tour-pricing, .timeline-day, .hero-stat, .tour-highlight, .tour-arrival-banner'
);

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  if (i % 3 === 1) el.classList.add('reveal-delay-1');
  if (i % 3 === 2) el.classList.add('reveal-delay-2');
});

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => io.observe(el));

// Set min date to today
const dateField = document.getElementById('fDate');
if (dateField) {
  dateField.setAttribute('min', new Date().toISOString().split('T')[0]);
}

// Spiritual tour quick-book from CTA
const cityTravelInfo = {
  mumbai: {
    city: 'Mumbai',
    pickup: 'Solapur Junction (arriving via Siddheshwar Express 12115)',
    note: 'Board 12115 night before Day 1 from Mumbai CSMT 22:40'
  },
  pune: {
    city: 'Pune',
    pickup: 'Solapur Junction (arriving via Pune-Solapur 11417 or 16381)',
    note: 'Board night train from Pune — arrive Solapur before 7:30 AM'
  },
  nagpur: {
    city: 'Nagpur',
    pickup: 'Solapur (overnight bus or arrive 1 day prior evening)',
    note: 'Overnight AC bus Nagpur→Solapur or arrive previous evening'
  },
  hyderabad: {
    city: 'Hyderabad',
    pickup: 'Solapur Junction (arriving via train 17030 or 22731)',
    note: 'Board night train from Hyderabad — arrive Solapur before 7:30 AM'
  },
  bengaluru: {
    city: 'Bengaluru',
    pickup: 'Solapur Junction (arriving via Karnataka Express 12627 or 11312)',
    note: 'Board evening train from Bengaluru — arrive Solapur morning Day 1'
  }
};

// City tabs for spiritual tour
const cityTabs = document.querySelectorAll('.city-tab');
const cityPanels = document.querySelectorAll('.city-panel');

cityTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const city = tab.dataset.city;
    cityTabs.forEach(t => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
    });
    cityPanels.forEach(panel => {
      const isActive = panel.id === `city-${city}`;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
    });
    const citySelect = document.getElementById('fCity');
    const info = cityTravelInfo[city];
    if (citySelect && info) citySelect.value = info.city;
  });
});

document.querySelectorAll('[data-tour="spiritual"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const carSelect = document.getElementById('fCar');
    const citySelect = document.getElementById('fCity');
    const pickup = document.getElementById('fPickup');
    const drop = document.getElementById('fDrop');
    const activeTab = document.querySelector('.city-tab.active');
    const cityKey = activeTab?.dataset.city || 'mumbai';
    const info = cityTravelInfo[cityKey];

    if (carSelect) carSelect.value = 'Spiritual Tour – 2 Day Package';
    if (citySelect && info) citySelect.value = info.city;
    if (pickup && info) pickup.value = info.pickup;
    if (drop) drop.value = 'Gangapur, Akkalkot, Tuljapur, Pandharpur';
  });
});
