/* ─────────────────────────────────────────────────────────
   SPACE — shared Three.js scene primitives for the solar-system
   scenes. Only the genuinely identical building blocks live here
   (noise, starfield, the Sun, orbit-camera controls, label
   projection); each scene keeps its own bespoke logic inline.
   Requires the global THREE (loaded via the r128 UMD build).
   ───────────────────────────────────────────────────────── */
'use strict';
window.SPACE = (function () {

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── GLSL simplex noise (Ashima Arts / Stefan Gustavson) ──
  const GLSL_NOISE = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float fbm(vec3 p) {
  float f = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++) { f += a * snoise(p); p *= 2.02; a *= 0.5; }
  return f;
}
`;

  // ── Twinkling starfield ──
  function createStarfield(opts) {
    opts = opts || {};
    const count = opts.count || 4500;
    const innerR = opts.innerR || 600;
    const outerR = opts.outerR || 1000;
    const uniforms = { uTime: { value: 0 } };

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = innerR + Math.random() * (outerR - innerR);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i*3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3 + 2] = r * Math.cos(phi);
      const t = Math.random();
      const tint = t < 0.7 ? [1, 1, 1] : t < 0.85 ? [1, 0.92, 0.78] : [0.78, 0.86, 1];
      colors[i*3] = tint[0]; colors[i*3+1] = tint[1]; colors[i*3+2] = tint[2];
      sizes[i] = Math.random() < 0.05 ? 5.5 : (1.5 + Math.random() * 2.0);
      phases[i] = Math.random() * Math.PI * 2;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    const material = new THREE.ShaderMaterial({
      uniforms, vertexColors: true, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float size; attribute float phase;
        uniform float uTime; varying vec3 vColor; varying float vTwinkle;
        void main() {
          vColor = color;
          vTwinkle = 0.65 + 0.35 * sin(uTime * 1.7 + phase);
          gl_PointSize = size * (0.85 + 0.3 * sin(uTime * 2.3 + phase * 1.7));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vTwinkle;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d) * vTwinkle * 0.9;
          gl_FragColor = vec4(vColor, a);
        }`
    });
    return { points: new THREE.Points(geometry, material), uniforms };
  }

  // ── A back-side additive glow shell (sun halo / corona) ──
  function glowShell(radius, color, bias, exp, mult) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 64),
      new THREE.ShaderMaterial({
        transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: { c: { value: new THREE.Color(color) }, b: { value: bias }, e: { value: exp }, m: { value: mult } },
        vertexShader: `
          varying vec3 vN;
          void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          varying vec3 vN; uniform vec3 c; uniform float b; uniform float e; uniform float m;
          void main() {
            float intensity = pow(max(b - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), e);
            gl_FragColor = vec4(c, 1.0) * intensity * m;
          }`
      })
    );
  }

  // ── The Sun: turbulent granulating core + two glow shells ──
  function createSun(radius) {
    const group = new THREE.Group();
    const uniforms = { uTime: { value: 0 } };
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 64),
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
          varying vec3 vPos; varying vec3 vN;
          void main() {
            vPos = position; vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: GLSL_NOISE + `
          varying vec3 vPos; varying vec3 vN; uniform float uTime;
          void main() {
            vec3 p = normalize(vPos);
            float n1 = fbm(p * 3.5 + vec3(uTime * 0.04, uTime * 0.03, -uTime * 0.02));
            float n2 = fbm(p * 9.0 - vec3(uTime * 0.06, 0.0, uTime * 0.05));
            float v = clamp(0.5 + n1 * 0.55 + n2 * 0.35, 0.0, 1.0);
            vec3 deep = vec3(0.82, 0.28, 0.02);
            vec3 mid  = vec3(1.00, 0.62, 0.12);
            vec3 hot  = vec3(1.00, 0.95, 0.74);
            vec3 col = mix(deep, mid, smoothstep(0.18, 0.55, v));
            col = mix(col, hot, smoothstep(0.55, 0.92, v));
            float limb = clamp(dot(normalize(vN), vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
            col *= 0.5 + 0.7 * limb;
            gl_FragColor = vec4(col * 1.45, 1.0);
          }`
      })
    );
    const inner  = glowShell(radius * 1.08, 0xffba50, 0.7, 2.0, 1.0);
    const corona = glowShell(radius * 1.45, 0xff8a30, 0.55, 3.0, 0.6);
    group.add(core, inner, corona);
    return { group, core, inner, corona, uniforms };
  }

  // ── Custom orbit-camera controls (mouse + touch, optional pick) ──
  function createOrbitControls(camera, dom, opts) {
    opts = opts || {};
    const cam = {
      target: opts.target ? opts.target.clone() : new THREE.Vector3(0, 0, 0),
      azimuth: opts.azimuth != null ? opts.azimuth : 0.3,
      elevation: opts.elevation != null ? opts.elevation : 0.2,
      distance: opts.distance != null ? opts.distance : 11
    };
    cam.azimuthTarget = cam.azimuth;
    cam.elevationTarget = cam.elevation;
    cam.distanceTarget = cam.distance;

    const minD = opts.minDistance != null ? opts.minDistance : 3;
    const maxDFn = typeof opts.maxDistance === 'function'
      ? opts.maxDistance : (() => (opts.maxDistance != null ? opts.maxDistance : 55));
    const zoomSpeed = opts.zoomSpeed != null ? opts.zoomSpeed : 0.012;
    const zoomScale = opts.zoomDistanceScale != null ? opts.zoomDistanceScale : 0;
    const damp = opts.damping != null ? opts.damping : 0.12;
    const distDamp = opts.distanceDamping != null ? opts.distanceDamping : damp;
    const onPick = opts.onPick;
    const pickThresh = opts.pickThreshold != null ? opts.pickThreshold : 6;
    const EL = Math.PI / 2 - 0.05;

    function applyCamera() {
      camera.position.set(
        cam.target.x + cam.distance * Math.cos(cam.elevation) * Math.sin(cam.azimuth),
        cam.target.y + cam.distance * Math.sin(cam.elevation),
        cam.target.z + cam.distance * Math.cos(cam.elevation) * Math.cos(cam.azimuth)
      );
      camera.lookAt(cam.target);
    }
    applyCamera();

    let dragging = false, dragDist = 0, lastX = 0, lastY = 0;
    dom.addEventListener('mousedown', (e) => { dragging = true; dragDist = 0; lastX = e.clientX; lastY = e.clientY; });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      dragDist += Math.abs(dx) + Math.abs(dy);
      cam.azimuthTarget   -= dx * 0.005;
      cam.elevationTarget += dy * 0.005;
      cam.elevationTarget = clamp(cam.elevationTarget, -EL, EL);
      lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener('mouseup', (e) => {
      if (dragging && onPick && dragDist < pickThresh) onPick(e.clientX, e.clientY);
      dragging = false;
    });
    window.addEventListener('mouseleave', () => dragging = false);
    dom.addEventListener('wheel', (e) => {
      cam.distanceTarget += e.deltaY * zoomSpeed * (1 + cam.distance * zoomScale);
      cam.distanceTarget = clamp(cam.distanceTarget, minD, maxDFn());
      e.preventDefault();
    }, { passive: false });

    let touchPrev = null, pinchPrev = null, touchStart = null, touchMoved = 0;
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchPrev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchMoved = 0;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchPrev = Math.hypot(dx, dy);
        touchStart = null; // a pinch is not a tap — don't let touchend pick a body
      }
    }, { passive: true });
    dom.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && touchPrev) {
        const dx = e.touches[0].clientX - touchPrev.x, dy = e.touches[0].clientY - touchPrev.y;
        touchMoved += Math.abs(dx) + Math.abs(dy);
        cam.azimuthTarget   -= dx * 0.005;
        cam.elevationTarget += dy * 0.005;
        cam.elevationTarget = clamp(cam.elevationTarget, -EL, EL);
        touchPrev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        e.preventDefault();
      } else if (e.touches.length === 2 && pinchPrev) {
        const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY;
        const d = Math.hypot(dx, dy);
        cam.distanceTarget *= pinchPrev / d;
        cam.distanceTarget = clamp(cam.distanceTarget, minD, maxDFn());
        pinchPrev = d;
        e.preventDefault();
      }
    }, { passive: false });
    dom.addEventListener('touchend', (e) => {
      if (e.touches.length === 0 && onPick && touchStart && touchMoved < 10) {
        onPick(touchStart.x, touchStart.y);
      }
      touchPrev = e.touches.length === 1
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : null;
      pinchPrev = null;
      touchStart = null;
    });
    dom.addEventListener('touchcancel', () => {
      touchPrev = null; pinchPrev = null; touchStart = null; touchMoved = 0;
    });

    cam.maxDistance = maxDFn;
    cam.update = function () {
      cam.azimuth   += (cam.azimuthTarget   - cam.azimuth)   * damp;
      cam.elevation += (cam.elevationTarget - cam.elevation) * damp;
      cam.distanceTarget = clamp(cam.distanceTarget, minD, maxDFn());
      cam.distance  += (cam.distanceTarget  - cam.distance)  * distDamp;
      applyCamera();
    };
    return cam;
  }

  // ── Adaptive quality governor ──
  // Watches a running average of frame time and steps render cost down
  // (pixel ratio → bloom → shadow-map size) when the device can't hold a
  // smooth frame rate, and back up when there's headroom again. All hooks
  // are optional so each scene wires in only what it has.
  function createQualityGovernor(opts) {
    const renderer = opts.renderer;
    const composer = opts.composer || null;
    const bloomPass = opts.bloomPass || null;
    const fxaaPass = opts.fxaaPass || null;
    const shadowLight = opts.shadowLight || null;
    const basePR = Math.min(window.devicePixelRatio || 1, 2);
    // Cap every later tier by basePR so degradation never raises the
    // pixel ratio (e.g. DPR 1 would otherwise jump to 1.25 at tier 2).
    const PR_STEPS = [
      basePR,
      Math.min(basePR, 1.5),
      Math.min(basePR, 1.25),
      Math.min(basePR, 1)
    ];
    const SHADOW_STEPS = [2048, 2048, 1024, 512];
    // Ignore gaps larger than this — typically tab suspension / resume,
    // not sustained slow rendering. Keep high enough that ~10 FPS devices
    // (dt ≈ 0.1s) still feed the EMA and can degrade quality.
    const MAX_SAMPLE_S = 1;
    // Upgrade needs to be reachable on 60 Hz displays (~16.7 ms vsync).
    const UPGRADE_MS = 18;
    const DOWNGRADE_MS = 24;
    let tier = 0, ema = 16, cooldownUntil = 0, headroomTime = 0;

    function apply() {
      const pr = PR_STEPS[tier];
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h);
      if (composer) {
        composer.setPixelRatio(pr);
        composer.setSize(w, h);
      }
      if (fxaaPass) {
        fxaaPass.material.uniforms.resolution.value.set(1 / (w * pr), 1 / (h * pr));
      }
      if (bloomPass) bloomPass.enabled = tier < 2;
      if (shadowLight && shadowLight.shadow && shadowLight.shadow.mapSize.x !== SHADOW_STEPS[tier]) {
        shadowLight.shadow.mapSize.set(SHADOW_STEPS[tier], SHADOW_STEPS[tier]);
        if (shadowLight.shadow.map) {
          shadowLight.shadow.map.dispose();
          shadowLight.shadow.map = null;
        }
      }
    }

    return {
      frame(rawDt) {
        if (!(rawDt > 0) || rawDt > MAX_SAMPLE_S) return;
        ema = ema * 0.95 + rawDt * 1000 * 0.05;
        const now = performance.now();
        if (now < cooldownUntil) return;
        if (ema > DOWNGRADE_MS && tier < 3) {
          tier++; apply(); cooldownUntil = now + 4000; headroomTime = 0;
        } else if (ema < UPGRADE_MS && tier > 0) {
          headroomTime += rawDt;
          if (headroomTime > 6) {
            tier--; apply(); cooldownUntil = now + 4000; headroomTime = 0;
          }
        } else headroomTime = 0;
      },
      get tier() { return tier; }
    };
  }

  // ── Write textContent only when the value actually changed ──
  function setText(el, text) {
    if (el.__spaceText !== text) {
      el.__spaceText = text;
      el.textContent = text;
    }
  }

  // ── Keyboard camera control (arrows rotate, +/− zoom) ──
  // Works with any cam exposing azimuthTarget / elevationTarget /
  // distanceTarget. Ignored while a form field has focus so native
  // behaviours (e.g. arrow keys on range sliders) are preserved.
  function bindCameraKeys(cam, opts) {
    opts = opts || {};
    const rotStep = opts.rotateStep != null ? opts.rotateStep : 0.08;
    const elStep = opts.elevateStep != null ? opts.elevateStep : 0.06;
    const minD = opts.minDistance != null ? opts.minDistance : 1.5;
    const maxDFn = typeof opts.maxDistance === 'function'
      ? opts.maxDistance : (() => (opts.maxDistance != null ? opts.maxDistance : 100));
    const EL = Math.PI / 2 - 0.05;
    window.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target;
      if (t && t.closest && t.closest('input, select, textarea, [contenteditable]')) return;
      let handled = true;
      switch (e.key) {
        case 'ArrowLeft':  cam.azimuthTarget += rotStep; break;
        case 'ArrowRight': cam.azimuthTarget -= rotStep; break;
        case 'ArrowUp':    cam.elevationTarget = clamp(cam.elevationTarget + elStep, -EL, EL); break;
        case 'ArrowDown':  cam.elevationTarget = clamp(cam.elevationTarget - elStep, -EL, EL); break;
        case '+': case '=': cam.distanceTarget = clamp(cam.distanceTarget * 0.9, minD, maxDFn()); break;
        case '-': case '_': cam.distanceTarget = clamp(cam.distanceTarget * 1.12, minD, maxDFn()); break;
        default: handled = false;
      }
      if (handled) e.preventDefault();
    });
  }

  // ── Project a 3D object to a screen-space label element ──
  // Lazily created so pages without THREE (e.g. sky-tonight, missions) can still
  // use buildNav — common.js must not touch THREE at load time.
  let _v;
  function projectToScreen(obj, el, camera, offsetY, visible) {
    if (!_v) _v = new THREE.Vector3();
    obj.getWorldPosition(_v);
    _v.project(camera);
    if (
      !visible ||
      _v.z < -1 || _v.z > 1 ||
      Math.abs(_v.x) > 1.1 || Math.abs(_v.y) > 1.1
    ) {
      el.style.opacity = 0;
      el.style.display = 'none';
      return;
    }
    el.style.display = '';
    // transform keeps per-frame label movement on the compositor; left/top
    // stay at their CSS defaults (0) so no layout work is triggered.
    el.style.transform =
      'translate(-50%, -50%) translate(' +
      ((_v.x * 0.5 + 0.5) * window.innerWidth) + 'px, ' +
      ((_v.y * -0.5 + 0.5) * window.innerHeight + offsetY) + 'px)';
    el.style.opacity = 1;
  }

  // ── WebGL renderer with a visible failure path ──
  function failWebGL(err) {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.remove('hidden');
      const text = loader.querySelector('.loader-text');
      if (text) {
        text.textContent =
          'This device cannot run the 3D view. Try another browser, or turn on hardware acceleration.';
        text.style.animation = 'none';
      }
      loader.setAttribute('role', 'alert');
    }
    if (err) console.error(err);
  }

  function createRenderer(opts) {
    let renderer = null;
    try {
      renderer = new THREE.WebGLRenderer(opts || {});
    } catch (err) {
      failWebGL(err);
      return null;
    }
    if (!renderer.getContext()) {
      failWebGL(new Error('WebGL context unavailable'));
      return null;
    }
    return renderer;
  }

  // ── Dismiss the gesture hint after the first real interaction ──
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
    // Auto-fade after a few seconds so it never permanently covers the scene.
    window.setTimeout(dismiss, 8000);
  }

  // ── Shared scene switcher used by every page ──
  const SCENES = [
    { key: 'light',    href: 'index.html',        label: 'Light Study' },
    { key: 'tour',     href: 'solar-system.html', label: 'Grand Tour' },
    { key: 'seasons',  href: 'seasons.html',      label: 'Seasons' },
    { key: 'scale',    href: 'scale-walk.html',   label: 'Scale Walk' },
    { key: 'sky',      href: 'sky-tonight.html',  label: 'Sky Tonight' },
    { key: 'missions', href: 'missions.html',     label: 'Missions' }
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
    SCENES.forEach(s => {
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

  // ── Compact educational panels on mobile ──
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

  return {
    bindCameraKeys,
    buildNav,
    clamp,
    createOrbitControls,
    createQualityGovernor,
    createRenderer,
    createStarfield,
    createSun,
    failWebGL,
    GLSL_NOISE,
    glowShell,
    initMobileHints,
    initMobileInfoPanels,
    prefersReducedMotion,
    projectToScreen,
    setText
  };
})();
