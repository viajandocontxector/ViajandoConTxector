const viajesBtn = document.querySelector('.nav-item--megamenu');
const viajesMenu = document.getElementById('viajes-menu');
const panels = [...document.querySelectorAll('.viajes-panel')];

let closeTimeout = null;

/* ===============================
   HELPERS
================================ */

function openMenu() {
  viajesMenu.classList.add('is-open');
  viajesMenu.setAttribute('aria-hidden', 'false');
  viajesBtn.setAttribute('aria-expanded', 'true');

  // Solo panel nivel 1 activo
  panels.forEach(p => {
    p.classList.toggle('is-active', p.dataset.level === '1');
  });
}

function closeMenu() {
  viajesMenu.classList.remove('is-open');
  viajesMenu.setAttribute('aria-hidden', 'true');
  viajesBtn.setAttribute('aria-expanded', 'false');
  panels.forEach(p => p.classList.remove('is-active'));
}

/**
 * Activa una rama concreta:
 * - mantiene los padres
 * - cierra hermanos
 */
function activateBranch(targetPanel) {
  const targetLevel = Number(targetPanel.dataset.level);
  const targetParent = targetPanel.dataset.parent;

  panels.forEach(panel => {
    const level = Number(panel.dataset.level);

    // Nivel 1 siempre visible
    if (level === 1) {
      panel.classList.add('is-active');
      return;
    }

    // Panel objetivo
    if (panel === targetPanel) {
      panel.classList.add('is-active');
      return;
    }

    // Padre directo del panel objetivo
    if (
      level === targetLevel - 1 &&
      panel.dataset.panel === targetParent
    ) {
      panel.classList.add('is-active');
      return;
    }

    // Todo lo demás se cierra
    panel.classList.remove('is-active');
  });
}

/**
 * Alinea el panel hijo exactamente
 * desde el LI que lo invoca
 */
function alignPanelToItem(item, panel) {
  const itemRect = item.getBoundingClientRect();
  const menuRect = viajesMenu.getBoundingClientRect();

  const left =
    itemRect.left - menuRect.left - panel.offsetWidth;

  const top =
    itemRect.top - menuRect.top;

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

/* ===============================
   BOTÓN VIAJES
================================ */

viajesBtn.addEventListener('mouseenter', () => {
  clearTimeout(closeTimeout);
  openMenu();
});

viajesBtn.addEventListener('mouseleave', () => {
  closeTimeout = setTimeout(closeMenu, 150);
});

/* ===============================
   MENÚ COMPLETO
================================ */

viajesMenu.addEventListener('mouseenter', () => {
  clearTimeout(closeTimeout);
});

viajesMenu.addEventListener('mouseleave', () => {
  closeTimeout = setTimeout(closeMenu, 150);
});

/* ===============================
   ITEMS CON HIJOS
================================ */

document.querySelectorAll('.has-children').forEach(item => {
  const target = item.dataset.target;
  const targetPanel = document.querySelector(
    `.viajes-panel[data-panel="${target}"]`
  );

  if (!targetPanel) return;

  item.addEventListener('mouseenter', () => {
    const parentPanel = item.closest('.viajes-panel');
    if (!parentPanel || !parentPanel.classList.contains('is-active')) return;
    
    activateBranch(targetPanel);
    alignPanelToItem(item, targetPanel);
  });
});

/* ===============================
   ITEMS SIN HIJOS (ej: Rutas)
   → cierran subpaneles
================================ */

document.querySelectorAll(
  '.viajes-panel li:not(.has-children)'
).forEach(item => {
  item.addEventListener('mouseenter', () => {
    const parentPanel = item.closest('.viajes-panel');
    if (!parentPanel) return;

    const level = Number(parentPanel.dataset.level);

    // ⚠️ Si estamos en nivel 3 (ciudades), NO hacer nada
    if (level >= 3) return;

    // Solo cerrar paneles más profundos
    panels.forEach(panel => {
      const panelLevel = Number(panel.dataset.level);
      panel.classList.toggle('is-active', panelLevel <= level);
    });
  });
}); 
