
// =========================
// Main – Inicialización segura
// =========================
document.addEventListener('DOMContentLoaded', () => {
  // Preferencias del usuario (reduce motion)
  const mediaReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduceMotion = mediaReduceMotion.matches;

  // -------------------------
  // AOS: inicialización condicional
  // -------------------------
  if (!reduceMotion && typeof AOS !== 'undefined' && AOS?.init) {
    AOS.init({
      once: true,
      duration: 700,
      easing: 'ease-out-cubic',
    });
  }

  // -------------------------
  // Header: estado scrolled o estático por página
  // -------------------------
  const header = document.querySelector('.header');
  const logoImg = document.querySelector('.logo-img');
  const isHeaderStatic = document.body.getAttribute('data-header') === 'static';

  const updateHeaderState = () => {
    if (!header) return;

    if (isHeaderStatic) {
      // Páginas estáticas (Servicio/Contacto): siempre blanco, logo a color
      header.classList.add('header--static');
      header.classList.remove('header-transparent', 'scrolled');
      return;
    }

    // Home: comportamiento original transparente → blanco al hacer scroll
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
      header.classList.remove('header-transparent');
      if (logoImg?.getAttribute('data-logo-dark')) {
        logoImg.src = logoImg.getAttribute('data-logo-dark');
      }
    } else {
      header.classList.remove('scrolled');
      header.classList.add('header-transparent');
      if (logoImg?.getAttribute('data-logo-light')) {
        logoImg.src = logoImg.getAttribute('data-logo-light');
      }
    }
  };

  // Ejecuta al cargar y escucha scroll (pasivo)
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  // -------------------------
  // Menú móvil (off-canvas) con ARIA
  // -------------------------
  const menuBtn = document.querySelector('.menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.menu-overlay');

  const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  const openMenu = () => {
    if (!mobileMenu || !overlay || !menuBtn) return;
    mobileMenu.classList.add('open');
    overlay.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    lastFocused = document.activeElement;
    const firstFocusable = mobileMenu.querySelector(focusableSelectors);
    firstFocusable?.focus();
    document.addEventListener('keydown', onKeydownEscape);
  };

  const closeMenu = () => {
    if (!mobileMenu || !overlay || !menuBtn) return;
    mobileMenu.classList.remove('open');
    overlay.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKeydownEscape);
    lastFocused?.focus?.();
  };

  const toggleMenu = () => {
    const isOpen = mobileMenu?.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  };

  const onKeydownEscape = (e) => {
    if (e.key === 'Escape') closeMenu();
  };

  if (menuBtn && mobileMenu && overlay) {
    menuBtn.setAttribute('aria-controls', 'mobile-menu');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('id', 'mobile-menu');
    mobileMenu.setAttribute('aria-hidden', 'true');

    menuBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);
  }

  // -------------------------
  // Parallax hero (solo en Home; respeta reduce motion)
  // -------------------------
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && !reduceMotion && !isHeaderStatic) {
    let ticking = false;
    const updateParallax = () => {
      const offset = window.scrollY * 0.2;
      heroBg.style.transform = `scale(1.05) translateY(${offset}px)`;
      ticking = false;
    };
    const onScrollParallax = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };
    updateParallax();
    window.addEventListener('scroll', onScrollParallax, { passive: true });
  }

  // REDIRECT A PÁGINA GRACIAS
  // Si venimos de haber enviado el form (misma pestaña y sesión),
  // redirigimos directamente a la página de gracias.
  try {
    const wasSubmitted = sessionStorage.getItem('contact_submitted') === '1';
    if (wasSubmitted) {
      sessionStorage.removeItem('contact_submitted');
      // replace() evita que "Atrás" vuelva al formulario con datos
      window.location.replace('/pages/gracias.html'); // ajusta la ruta si es distinta
      return;
    }
  } catch (e) { /* ignora storage bloqueado */ }

  // Opcional: si vuelven con el back-forward cache, limpia el formulario
  const form = document.querySelector('.form-contacto');
  window.addEventListener('pageshow', (evt) => {
    if (evt.persisted) form?.reset();
  });

});