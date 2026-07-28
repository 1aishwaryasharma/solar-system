/* ─────────────────────────────────────────────────────────
   Grand Tour procedural planet / ring textures.
   Isolated from solar-system.html so the page script stays
   scene orchestration, not canvas paint routines.
   Requires global THREE and SPACE.
   ───────────────────────────────────────────────────────── */
'use strict';
window.createTourTextures = function (renderer) {
  const clamp = SPACE.clamp;
  const seededRandom = SPACE.seededRandom;

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
  }

  function shadeDot(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.round(v * f);
    return 'rgb(' + c((n >> 16) & 255) + ',' + c((n >> 8) & 255) + ',' + c(n & 255) + ')';
  }

  // Stable texture identity from body key — never display names.
  function seedFor(p, salt) {
    let h = salt >>> 0;
    const key = p.key;
    for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
    return (h ^ ((p.radiusKm || 0) >>> 0)) >>> 0;
  }

  function finishTexture(canvas) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return tex;
  }

  function makeBandedTexture(p, W, H) {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const rand = seededRandom(seedFor(p, 9173));
    const bands = p.bands;
    const rows = 26;
    for (let i = 0; i < rows; i++) {
      const y0 = (i / rows) * H;
      const y1 = ((i + 1) / rows) * H;
      ctx.fillStyle = bands[Math.floor(rand() * bands.length)];
      ctx.fillRect(0, y0, W, y1 - y0 + 1);
    }
    for (let i = 0; i < 900; i++) {
      const y = rand() * H;
      const h = 2 + rand() * 10;
      ctx.globalAlpha = 0.05 + rand() * 0.12;
      ctx.fillStyle = bands[Math.floor(rand() * bands.length)];
      ctx.fillRect(0, y, W, h);
    }
    ctx.globalAlpha = 1;
    if (p.spot) {
      const s = p.spot;
      ctx.save();
      ctx.translate(s.x * W, s.y * H);
      ctx.scale(1, (s.ry * H) / (s.rx * W));
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s.rx * W);
      g.addColorStop(0, s.color);
      g.addColorStop(0.6, s.color + 'cc');
      g.addColorStop(1, s.color + '00');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, s.rx * W, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    return finishTexture(c);
  }

  function makeRockTexture(p, W, H) {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const rand = seededRandom(seedFor(p, 4441));
    ctx.fillStyle = shadeDot(p.dot, 0.82);
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 1400; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const r = 4 + rand() * 40;
      const light = rand() < 0.5;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const col = light ? '255,255,255' : hexToRgb(p.dot);
      g.addColorStop(0, 'rgba(' + col + ',' + (0.05 + rand() * 0.10) + ')');
      g.addColorStop(1, 'rgba(' + col + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (p.polarCaps) {
      ctx.fillStyle = 'rgba(235,240,245,0.85)';
      ctx.beginPath();
      ctx.ellipse(W / 2, 8, W * 0.30, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(W / 2, H - 8, W * 0.24, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    return finishTexture(c);
  }

  function makeVenusTexture(p, W, H) {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const rand = seededRandom(7788);
    ctx.fillStyle = shadeDot(p.dot, 0.88);
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 1200; i++) {
      const y = rand() * H;
      const h = 6 + rand() * 26;
      ctx.globalAlpha = 0.04 + rand() * 0.08;
      ctx.fillStyle = rand() < 0.5 ? '#f0dca8' : shadeDot(p.dot, 0.72);
      ctx.beginPath();
      ctx.ellipse(rand() * W, y, 60 + rand() * 200, h, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return finishTexture(c);
  }

  const loadingManager = new THREE.LoadingManager();
  const textureLoader = new THREE.TextureLoader(loadingManager);

  function planetTexture(p) {
    const W = 1024;
    const H = 512;
    if (p.type === 'earth') {
      const tex = textureLoader.load('assets/earth/day.jpg');
      tex.encoding = THREE.sRGBEncoding;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return tex;
    }
    if (p.type === 'gas' || p.type === 'ice') return makeBandedTexture(p, W, H);
    if (p.type === 'venus') return makeVenusTexture(p, W, H);
    return makeRockTexture(p, W, H);
  }

  function makeRingTexture() {
    const W = 512;
    const H = 16;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const rand = seededRandom(2024);
    for (let x = 0; x < W; x++) {
      const t = x / W;
      let a = 0.55 + 0.35 * Math.sin(t * 40) * 0.4;
      if (t > 0.62 && t < 0.68) a *= 0.15;
      if (t < 0.06 || t > 0.98) a *= 0.2;
      a = clamp(a + (rand() - 0.5) * 0.15, 0, 0.85);
      const shade = 200 + Math.floor(rand() * 40);
      ctx.fillStyle = 'rgba(' + shade + ',' + (shade - 20) + ',' + (shade - 60) + ',' + a + ')';
      ctx.fillRect(x, 0, 1, H);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  return { loadingManager, makeRingTexture, planetTexture };
};
