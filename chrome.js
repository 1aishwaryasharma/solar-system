/* ─────────────────────────────────────────────────────────
   Chrome helpers shared by every page — navigation, mobile
   drawers, hints, and tiny DOM utilities. No Three.js here so
   Missions and Sky Tonight stay lightweight.
   ───────────────────────────────────────────────────────── */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setText(el, text) {
  if (el.__spaceText !== text) {
    el.__spaceText = text;
    el.textContent = text;
  }
}

function initMobileHints() {
  const hints = document.querySelectorAll('.hint');
  if (!hints.length) return;
  let done = false;
  function dismiss() {
    if (done) return;
    done = true;
    hints.forEach((h) => h.classList.add('is-dismissed'));
    window.removeEventListener('pointerdown', dismiss, true);
    window.removeEventListener('keydown', dismiss, true);
    window.removeEventListener('wheel', dismiss, true);
  }
  window.addEventListener('pointerdown', dismiss, true);
  window.addEventListener('keydown', dismiss, true);
  window.addEventListener('wheel', dismiss, true);
  window.setTimeout(dismiss, 8000);
}

const SCENES = [
  { href: 'index.html', key: 'light', label: 'Light Study' },
  { href: 'solar-system.html', key: 'tour', label: 'Grand Tour' },
  { href: 'seasons.html', key: 'seasons', label: 'Seasons' },
  { href: 'scale-walk.html', key: 'scale', label: 'Scale Walk' },
  { href: 'sky-tonight.html', key: 'sky', label: 'Sky Tonight' },
  { href: 'missions.html', key: 'missions', label: 'Missions' }
];

function buildNav(currentKey) {
  const nav = document.createElement('nav');
  nav.className = 'scene-nav';
  nav.setAttribute('aria-label', 'Explore scenes');
  const btn = document.createElement('button');
  btn.className = 'scene-nav-btn';
  btn.type = 'button';
  btn.textContent = '✦ Explore';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-haspopup', 'true');
  const menu = document.createElement('div');
  menu.className = 'scene-menu';
  menu.id = 'scene-menu';
  menu.hidden = true;
  btn.setAttribute('aria-controls', menu.id);
  SCENES.forEach((s) => {
    const a = document.createElement('a');
    a.href = s.href;
    a.className = s.key === currentKey ? 'current' : '';
    if (s.key === currentKey) a.setAttribute('aria-current', 'page');
    a.innerHTML = '<span class="dot"></span>' + s.label;
    menu.appendChild(a);
  });
  nav.appendChild(btn);
  nav.appendChild(menu);
  function setOpen(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  }
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!nav.classList.contains('open'));
  });
  nav.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      btn.focus();
    }
  });
  document.addEventListener('click', () => setOpen(false));
  document.body.appendChild(nav);
}

function initMobileInfoPanels() {
  document.querySelectorAll('.info-panel').forEach((panel, index) => {
    if (panel.classList.contains('mobile-info-panel')) return;

    panel.classList.add('mobile-info-panel');
    panel.classList.remove('is-expanded');

    if (!panel.id) panel.id = 'info-panel-' + (index + 1);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-info-toggle';
    toggle.textContent = 'Read';
    toggle.setAttribute('aria-controls', panel.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Read the full explanation');

    toggle.addEventListener('click', () => {
      const expanded = panel.classList.toggle('is-expanded');
      toggle.textContent = expanded ? 'Close' : 'Read';
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.setAttribute(
        'aria-label',
        expanded ? 'Close the full explanation' : 'Read the full explanation'
      );
    });

    panel.appendChild(toggle);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initMobileInfoPanels();
    initMobileHints();
  }, { once: true });
} else {
  initMobileInfoPanels();
  initMobileHints();
}

const SPACE = {
  buildNav,
  clamp,
  initMobileHints,
  initMobileInfoPanels,
  prefersReducedMotion,
  setText
};

window.SPACE = SPACE;

export {
  SPACE,
  buildNav,
  clamp,
  initMobileHints,
  initMobileInfoPanels,
  prefersReducedMotion,
  setText
};
