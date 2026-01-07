// =========================
// Plugins inicialización
// =========================
AOS.init({
  once: true,
  duration: 700,
  easing: 'ease-out-cubic'
});

// =========================
// Header scroll
// =========================
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// =========================
// Menú móvil
// =========================
const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.menu-overlay');

menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  overlay.classList.toggle('open');
});

overlay.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  overlay.classList.remove('open');
});

// =========================
// Parallax hero
// =========================
const heroBg = document.querySelector('.hero-bg');

window.addEventListener('scroll', () => {
  if (heroBg) {
    const offset = window.scrollY * 0.2; // velocidad parallax
    heroBg.style.transform = `scale(1.05) translateY(${offset}px)`;
  }
});
