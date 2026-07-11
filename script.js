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

// Scroll reveal with stagger
const revealEls = document.querySelectorAll(
  '.section-head, .service-card, .fleet-card, .testi-card, .contact-card, ' +
  '.about-img, .about-text, .booking-engine-wrap, .rate-table-wrap, ' +
  '.tour-train-card, .tour-places-card, .itinerary-wrap, .include-card, .tour-cta, ' +
  '.tour-pricing, .timeline-day, .hero-stat, .tour-highlight, .tour-arrival-banner, ' +
  '.vehicle-allocation, .children-policy'
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

// Spiritual tour city tabs → prefill booking wizard
const cityMap = {
  mumbai: 'Mumbai',
  pune: 'Pune',
  nagpur: 'Nagpur',
  hyderabad: 'Hyderabad',
  bengaluru: 'Bengaluru'
};

document.querySelectorAll('.city-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const city = cityMap[tab.dataset.city];
    if (city && window.BTBookingUI) {
      window.BTBookingUI.setState({
        serviceType: 'spiritual',
        travelingFrom: city,
        drop: 'Gangapur, Akkalkot, Tuljapur, Pandharpur'
      });
    }
  });
});

// Init booking engine (run immediately if DOM already loaded)
function initBookingEngine() {
  if (window.BTBookingUI) window.BTBookingUI.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBookingEngine);
} else {
  initBookingEngine();
}
