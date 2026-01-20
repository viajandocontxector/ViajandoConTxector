const viajesBtn = document.querySelector('.nav-item--megamenu');
const viajesMenu = document.getElementById('viajes-menu');
const panels = [...document.querySelectorAll('.viajes-panel')];

let closeTimeout;

/* ---------- helpers ---------- */

function openMenu() {
  viajesMenu.classList.add('is-open');
  viajesMenu.setAttribute('aria-hidden', 'false');
  viajesBtn.setAttribute('aria-expanded', 'true');
  activateLevel(1);
}

function closeMenu() {
  viajesMenu.classList.remove('is-open');
  viajesMenu.setAttribute('aria-hidden', 'true');
  viajesBtn.setAttribute('aria-expanded', 'false');
  panels.forEach(p => p.classList.remove('is-active'));
}

function activateLevel(level) {
  panels.forEach(p => {
    const panelLevel = Number(p.dataset.level);
    if (panelLevel <= level) {
      p.classList.add('is-active');
    } else {
      p.classList.remove('is-active');
    }
  });
}

/* ---------- botón viajes ---------- */

viajesBtn.addEventListener('mouseenter', () => {
  clearTimeout(closeTimeout);
  openMenu();
});

viajesBtn.addEventListener('mouseleave', () => {
  closeTimeout = setTimeout(closeMenu, 150);
});

/* ---------- menú completo ---------- */

viajesMenu.addEventListener('mouseenter', () => {
  clearTimeout(closeTimeout);
});

viajesMenu.addEventListener('mouseleave', () => {
  closeTimeout = setTimeout(closeMenu, 150);
});

let activeTarget = null;

/* ---------- navegación entre niveles ---------- */

document.querySelectorAll('.has-children').forEach(item => {
  const target = item.dataset.target;
  const targetPanel = document.querySelector(
    `.viajes-panel[data-panel="${target}"]`
  );

  if (!targetPanel) return;

  const level = Number(targetPanel.dataset.level);

  item.addEventListener('mouseenter', () => {
    activeTarget = target;
    activateLevel(level);
  });

  item.addEventListener('mouseleave', () => {
    // Pequeño delay para permitir mover el ratón al panel hijo
    setTimeout(() => {
      // Si no estamos ni en el item ni en su panel, cerramos
      if (
        activeTarget === target &&
        !item.matches(':hover') &&
        !targetPanel.matches(':hover')
      ) {
        activeTarget = null;
        activateLevel(level - 1);
      }
    }, 80);
  });

  targetPanel.addEventListener('mouseenter', () => {
    activeTarget = target;
  });

  targetPanel.addEventListener('mouseleave', () => {
    setTimeout(() => {
      if (
        activeTarget === target &&
        !item.matches(':hover') &&
        !targetPanel.matches(':hover')
      ) {
        activeTarget = null;
        activateLevel(level - 1);
      }
    }, 80);
  });
});

/* ---------- cerrar hijos al moverse por el panel padre ---------- */

document.querySelectorAll('.viajes-panel').forEach(panel => {
  panel.addEventListener('mousemove', () => {
    document.querySelectorAll('.has-children').forEach(item => {
      const target = item.dataset.target;
      const childPanel = document.querySelector(
        `.viajes-panel[data-panel="${target}"]`
      );

      if (!childPanel) return;

      const level = Number(childPanel.dataset.level);

      // Si NO estamos ni en el item ni en su panel → cerrar hijos
      if (
        !item.matches(':hover') &&
        !childPanel.matches(':hover') &&
        activeTarget === target
      ) {
        activeTarget = null;
        activateLevel(level - 1);
      }
    });
  });
});
