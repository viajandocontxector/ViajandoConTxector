
// =========================
// Main – Inicialización segura
// =========================
document.addEventListener('DOMContentLoaded', () => {
  
  // =========================
  // Consentimiento de Cookies + GA4 + iframes diferidos
  // =========================
  const STORAGE_KEY = 'cookie_consent_v3'; // sube versión si quieres forzar de nuevo
  const GA_MEASUREMENT_ID = 'G-WENLWPMP23';

  const defaultCategories = { essential: true, analytics: false, functional: false, marketing: false };

  const Consent = {
    get() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; } },
    set(obj) { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); },
    clear() { localStorage.removeItem(STORAGE_KEY); }
  };

  // Helpers UI
  const banner        = document.getElementById('cookie-banner');
  const settings      = document.getElementById('cookie-settings');
  const manageBtn     = document.getElementById('manage-cookies');
  const acceptAll     = document.getElementById('accept-all');
  const rejectAll     = document.getElementById('reject-all');
  const customize     = document.getElementById('customize');
  const saveBtn       = document.getElementById('save-preferences');
  const closeBtn      = document.getElementById('close-settings');
  const chkAnalytics  = document.getElementById('analytics');
  const chkFunctional = document.getElementById('functional');
  const chkMarketing  = document.getElementById('marketing');

  function showBanner() {
    if (banner) {
      banner.style.display = 'flex';
      // (Opcional) evitar que el banner tape contenido
      document.body.style.paddingBottom = '96px';
    }
    if (settings) { settings.style.display = 'none'; settings.setAttribute('aria-hidden', 'true'); }
  }
  function hideBanner() {
    if (banner) banner.style.display = 'none';
    document.body.style.paddingBottom = '';
  }
  function openSettings(prefillFromSaved = true) {
    if (!settings) return;
    if (prefillFromSaved) {
      const saved = Consent.get() || defaultCategories;
      if (chkAnalytics)  chkAnalytics.checked  = !!saved.analytics;
      if (chkFunctional) chkFunctional.checked = !!saved.functional;
      if (chkMarketing)  chkMarketing.checked  = !!saved.marketing;
    }
    settings.style.display = 'flex';
    settings.setAttribute('aria-hidden', 'false');
    hideBanner();
  }
  function closeSettings() {
    if (!settings) return;
    settings.style.display = 'none';
    settings.setAttribute('aria-hidden', 'true');
    showBanner();
  }

  // Init
  function initConsent() {
    const saved = Consent.get();
    if (saved) {
      hideBanner();
      if (manageBtn) manageBtn.hidden = false;
      if (saved.analytics)  loadGA4();
      if (saved.functional) enableDeferredIframes();
    } else {
      showBanner();
    }
  }

  // Actions
  if (acceptAll) {
    acceptAll.addEventListener('click', () => {
      const consent = { essential: true, analytics: true, functional: true, marketing: true };
      Consent.set(consent);
      hideBanner();
      if (manageBtn) manageBtn.hidden = false;
      loadGA4();
      enableDeferredIframes();
    });
  }
  if (rejectAll) {
    rejectAll.addEventListener('click', () => {
      Consent.set({ ...defaultCategories });
      hideBanner();
      if (manageBtn) manageBtn.hidden = false;
      revokeAnalytics();
    });
  }
  if (customize) customize.addEventListener('click', () => openSettings(true));
  if (closeBtn)  closeBtn.addEventListener('click', () => closeSettings());
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const consent = {
        essential: true,
        analytics:  !!(chkAnalytics && chkAnalytics.checked),
        functional: !!(chkFunctional && chkFunctional.checked),
        marketing:  !!(chkMarketing && chkMarketing.checked),
      };
      Consent.set(consent);
      settings.style.display = 'none';
      if (manageBtn) manageBtn.hidden = false;
      if (consent.analytics)  loadGA4(); else revokeAnalytics();
      if (consent.functional) enableDeferredIframes();
    });
  }
  if (manageBtn) {
    // UX definida: mostrar el banner al pulsar "Gestionar cookies"
    manageBtn.addEventListener('click', () => showBanner());
  }

  // GA4 condicional
  function loadGA4() {
    if (!GA_MEASUREMENT_ID || window.__gaLoaded) return;
    window.__gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());

    // (Opcional) Respeta Do Not Track
    const dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1';
    if (dnt) { console.warn('Do Not Track activado. GA4 no se cargará.'); return; }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onload = () => gtag('config', GA_MEASUREMENT_ID);
    document.head.appendChild(script);
  }

  
  function revokeAnalytics() {
    try {
      // 1) Consent Mode: negar almacenamiento analítico
      if (window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
        // Opcional: desactivar señales y pageview automáticos (por si quedaron configurados)
        window.gtag('config', GA_MEASUREMENT_ID, {
          allow_google_signals: false,
          send_page_view: false
        });
      }

      // 2) No-op para futuros gtag() si analíticas están denegadas
      const saved = Consent.get() || defaultCategories;
      const analyticsDenied = !saved.analytics;
      if (analyticsDenied) {
        window.gtag = function () { /* no-op: analíticas denegadas */ };
        // Vaciar dataLayer para evitar pushes pendientes
        window.dataLayer = [];
      }

      // 3) Eliminar scripts de GA del DOM (evita recarga futura inadvertida)
      document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').forEach(s => s.remove());

      // 4) Intentar borrar cookies de GA (_ga, _gid, _ga_*) — sólo funciona si están en tu dominio
      const cookieNames = ['_ga', '_gid'];
      // Borrar también las variantes _ga_XXXX
      document.cookie.split(';').forEach(c => {
        const name = c.split('=')[0].trim();
        if (name.startsWith('_ga')) cookieNames.push(name);
      });
      cookieNames.forEach(name => {
        // Borrado estándar
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
        // Borrado intentando otros paths/common patterns
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${location.hostname};SameSite=Lax`;
      });

      // 5) Reset de flags para evitar usos posteriores
      window.__gaLoaded = false;
    } catch (e) {
      console.warn('Revocación de Analytics encontró un problema:', e);
    }
  }

  // Iframes diferidos (Maps, etc.)
  function enableDeferredIframes() {
    const iframes = document.querySelectorAll('iframe[data-cookie-category]');
    const saved = Consent.get();
    iframes.forEach((el) => {
      const category = el.getAttribute('data-cookie-category'); // e.g., 'functional'
      if (saved && saved[category]) {
        const src = el.getAttribute('data-src');
        if (src && !el.src) {
          el.src = src;
          el.style.display = '';
          const ph = document.querySelector(`[data-placeholder-for="${el.id}"]`);
          if (ph) ph.remove();
        }
      }
    });

    // CTA del placeholder para abrir el modal con "Funcionales" preseleccionado
    const ctas = document.querySelectorAll('.cookie-iframe-blocked .cta[data-activate]');
    ctas.forEach((cta) => {
      cta.addEventListener('click', () => {
        if (chkFunctional) chkFunctional.checked = true;
        openSettings(false);
      });
    });
  }

  // Utilidad de depuración: borra consentimiento y recarga manualmente
  window.__cookiesReset = function() { Consent.clear(); console.info('Consentimiento borrado. Recarga la página.'); };

  // Lanzar
  initConsent();

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

  document.querySelectorAll('.mobile-toggle').forEach(btn => {
    const submenu = btn.nextElementSibling;

    if (!submenu || !submenu.classList.contains('mobile-submenu')) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      btn.setAttribute('aria-expanded', String(!isOpen));
      submenu.hidden = isOpen;
    });
  });
  
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
  
// === Carrusel Swiper (inicialización simple) ===
  try {
    const swiperEl = document.querySelector('.swiper');

    if (typeof Swiper !== 'undefined' && swiperEl) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const slidesCount = swiperEl.querySelectorAll('.swiper-slide').length;

      new Swiper(swiperEl, {
        loop: slidesCount > 1,
        spaceBetween: 20,
        slidesPerView: 1,
        speed: prefersReduced ? 0 : 400,

        lazy: {
          loadPrevNext: true
        },

        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },

        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },

        breakpoints: {
          768: {
            slidesPerView: 2
          },
          1024: {
            slidesPerView: 3
          }
        },

        a11y: {
          enabled: true
        }
      });
    }
  } catch (err) {
    console.error('Error inicializando Swiper:', err);
  }

});