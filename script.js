// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const icon = menuToggle.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-xmark');
});
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
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

// Scroll reveal animation
const revealEls = document.querySelectorAll('.section-head, .service-card, .fleet-card, .testi-card, .contact-card, .about-img, .about-text, .booking-info, .booking-form, .rate-table-wrap');
revealEls.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// Set min date to today
const dateField = document.getElementById('fDate');
if (dateField) {
  const today = new Date().toISOString().split('T')[0];
  dateField.setAttribute('min', today);
}
