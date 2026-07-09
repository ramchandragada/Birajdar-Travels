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
  const car = document.getElementById('fCar').value;

  const msg =
`*New Booking Request - Birajdar Travels*%0A
*Name:* ${name}%0A
*Phone:* ${phone}%0A
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
  '.tour-pricing, .timeline-day, .hero-stat, .tour-highlight'
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
document.querySelectorAll('[data-tour="spiritual"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const carSelect = document.getElementById('fCar');
    const pickup = document.getElementById('fPickup');
    const drop = document.getElementById('fDrop');
    if (carSelect) carSelect.value = 'Spiritual Tour – 2 Day Package (Mumbai–Solapur)';
    if (pickup) pickup.value = 'Mumbai CSMT (Siddheshwar Express 12115)';
    if (drop) drop.value = 'Gangapur, Akkalkot, Tuljapur, Pandharpur';
  });
});
