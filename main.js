/* ═══════════════════════════════════════════════════════════════════════════
   TR⁷ · main.js — WebGL Particle Engine + Cinematic Micro-Interactions
   Zero-latency · 60fps+ · Memory-safe · Gyroscope-ready · ES2026
   ═══════════════════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  /* ─── Device Tier Detection ─── */
  const IS_MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const CORES = navigator.hardwareConcurrency || 2;
  const TIER = CORES <= 2 || IS_MOBILE ? 0 : CORES <= 4 ? 1 : 2;

  /* ──────────────────────────────────────────────
     1. CONFIG LOADER
     ────────────────────────────────────────────── */
  const cfg = window.trConfig || {};

  /* Apply config to DOM */
  const setText = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.textContent = val; };
  const setAttr = (id, attr, val) => { const el = document.getElementById(id); if (el && val != null) el.setAttribute(attr, val); };
  const setSrc = (id, val) => { const el = document.getElementById(id); if (el && val) { el.src = val; el.onerror = () => { el.style.display = 'none'; }; el.onload = () => { el.style.display = ''; }; } };
  const setHref = (id, val) => { const el = document.getElementById(id); if (el && val) el.href = val; };
  const setStyleProp = (prop, val) => { if (val) document.documentElement.style.setProperty(prop, val); };

  if (cfg.pageTitle) document.title = cfg.pageTitle;
  setText('page-title', cfg.pageTitle);
  setAttr('page-icon', 'href', cfg.logoUrl);
  setText('profile-name-txt', cfg.profileName);
  setText('profile-subtitle-txt', cfg.profileSubtitle);
  setText('profile-desc-txt', cfg.profileDesc);
  setText('section-title-txt', cfg.sectionTitle);
  setText('cover-hud-txt', cfg.bannerHudText);
  setText('footer-copy-txt', cfg.footerCopy);
  setText('footer-url-label-txt', cfg.footerUrlLabel);
  setHref('footer-url-link', cfg.footerUrl);
  setText('footer-vis-label', cfg.footerVisLabel);
  setText('footer-gem-txt', cfg.footerGem);
  setText('ldr-brand-txt', cfg.loaderBrand);
  setSrc('banner-img', cfg.bannerUrl);
  setSrc('profile-img', cfg.profileUrl);
  setSrc('ldr-logo-img', cfg.logoUrl);

  setStyleProp('--col-primary', cfg.colorPrimary);
  setStyleProp('--col-deep', cfg.colorDeep);
  setStyleProp('--col-accent', cfg.colorAccent);
  setStyleProp('--col-bg', cfg.colorBg);
  setStyleProp('--col-text', cfg.colorText);

  /* Render Links */
  const linksGrid = document.getElementById('links-grid');
  const links = cfg.links || [];
  if (linksGrid) {
    linksGrid.innerHTML = '';
    links.forEach((link) => {
      const card = document.createElement('a');
      card.className = 'app-card';
      card.href = link.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.setAttribute('aria-label', link.name);
      card.innerHTML = `
        <div class="ac-glow" aria-hidden="true"></div>
        <div class="ac-sheen" aria-hidden="true"></div>
        <div class="aib">
          <svg class="ihalo" viewBox="0 0 100 100" aria-hidden="true">
            <defs><radialGradient id="ihalo-grad-${link.name}"><stop offset="0%" stop-color="var(--col-primary)" stop-opacity="0.3"/><stop offset="100%" stop-color="var(--col-primary)" stop-opacity="0"/></radialGradient></defs>
            <rect width="100" height="100" fill="url(#ihalo-grad-${link.name})" rx="20"/>
          </svg>
          <i class="${link.icon || 'fas fa-link'}" aria-hidden="true"></i>
        </div>
        <span class="an">${link.name}</span>
        <span class="ah">${new URL(link.url).hostname}</span>
      `;
      linksGrid.appendChild(card);
    });
  }

  /* ──────────────────────────────────────────────
     2. CINEMATIC LOADER
     ────────────────────────────────────────────── */
  const loaderEl = document.getElementById('loader');
  const fillEl = document.getElementById('ldr-fill');
  const headEl = document.getElementById('ldr-head');
  const pctEl = document.getElementById('ldr-pct');
  const statEl = document.getElementById('ldr-status');
  const LOADER_DURATION = 4800;
  const PHASES = [
    [0.00, 'INITIALIZING SYSTEM'],
    [0.18, 'LOADING ASSETS'],
    [0.42, 'RENDERING INTERFACE'],
    [0.68, 'CALIBRATING VISUALS'],
    [0.90, 'SYSTEM READY'],
  ];
  let phaseIdx = 0;
  if (statEl) statEl.style.transition = 'opacity 0.2s';

  let ldStart = null;
  function loaderFrame(ts) {
    if (!ldStart) ldStart = ts;
    const prog = Math.min((ts - ldStart) / LOADER_DURATION, 1);
    const pct = Math.floor(prog * 100);
    if (fillEl) fillEl.style.width = prog * 100 + '%';
    if (headEl) headEl.style.left = `calc(${prog * 100}% - 5px)`;
    if (pctEl) pctEl.textContent = pct;

    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (prog >= PHASES[i][0] && phaseIdx <= i) {
        phaseIdx = i + 1;
        if (statEl) {
          statEl.style.opacity = '0';
          const msg = PHASES[i][1];
          setTimeout(() => { if (statEl) { statEl.textContent = msg; statEl.style.opacity = '0.9'; } }, 170);
        }
        break;
      }
    }
    if (prog < 1) {
      requestAnimationFrame(loaderFrame);
    } else {
      setTimeout(() => {
        if (loaderEl) loaderEl.classList.add('hidden');
        document.body.style.overflow = '';
        revealMainCard();
      }, 400);
    }
  }
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(loaderFrame);

  /* ──────────────────────────────────────────────
     3. WEBGL PARTICLE ENGINE
     ────────────────────────────────────────────── */
  const canvas = document.getElementById('gl-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  }) || canvas.getContext('webgl', {
    alpha: false,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });

  if (!gl) {
    console.warn('WebGL not supported, falling back to solid background');
    canvas.style.display = 'none';
    return;
  }

  /* Vertex Shader */
  const VERTEX_SHADER = `#version 300 es
    precision highp float;
    in vec2 a_position;
    in vec2 a_texcoord;
    in float a_size;
    in float a_alpha;
    in vec3 a_color;
    out vec2 v_texcoord;
    out float v_alpha;
    out vec3 v_color;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
    uniform float u_tier;
    void main() {
      vec2 pos = a_position;
      // Subtle mouse parallax
      pos += (u_mouse - 0.5) * 12.0;
      vec2 clip = (pos / u_resolution) * 2.0 - 1.0;
      clip.y *= -1.0;
      gl_Position = vec4(clip, 0.0, 1.0);
      gl_PointSize = a_size * (1.0 + u_tier * 0.5);
      v_texcoord = a_texcoord;
      v_alpha = a_alpha;
      v_color = a_color;
    }
  `;

  /* Fragment Shader */
  const FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    in vec2 v_texcoord;
    in float v_alpha;
    in vec3 v_color;
    out vec4 outColor;
    uniform float u_time;
    void main() {
      float dist = length(v_texcoord - 0.5) * 2.0;
      float glow = exp(-dist * 3.5) * 0.7;
      float core = smoothstep(0.5, 0.0, dist) * 0.5;
      float alpha = (glow + core) * v_alpha;
      vec3 color = v_color * (1.0 + glow * 0.6);
      outColor = vec4(color, alpha);
    }
  `;

  /* Compile Shader */
  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  /* Buffers */
  const positionLoc = gl.getAttribLocation(program, 'a_position');
  const texcoordLoc = gl.getAttribLocation(program, 'a_texcoord');
  const sizeLoc = gl.getAttribLocation(program, 'a_size');
  const alphaLoc = gl.getAttribLocation(program, 'a_alpha');
  const colorLoc = gl.getAttribLocation(program, 'a_color');
  const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
  const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
  const timeLoc = gl.getUniformLocation(program, 'u_time');
  const tierLoc = gl.getUniformLocation(program, 'u_tier');

  /* Particle System */
  const MAX_PARTICLES = TIER === 0 ? 2000 : TIER === 1 ? 4000 : 8000;
  const particles = new Float32Array(MAX_PARTICLES * 8); // x,y,u,v,size,alpha,r,g,b
  const particleData = [];

  function initParticle(i, randomY = true) {
    const x = Math.random() * canvas.width;
    const y = randomY ? Math.random() * canvas.height : canvas.height + 10;
    const speed = 0.15 + Math.random() * 0.6;
    const angle = Math.random() * Math.PI * 2;
    const vx = Math.cos(angle) * speed;
    const vy = -(0.2 + Math.random() * 0.8);
    const size = 1.5 + Math.random() * 3.5;
    const alpha = 0.15 + Math.random() * 0.5;
    const isRed = Math.random() > 0.6;
    const r = isRed ? 1.0 : 0.75 + Math.random() * 0.25;
    const g = isRed ? 0.0 + Math.random() * 0.1 : 0.65 + Math.random() * 0.35;
    const b = isRed ? 0.1 + Math.random() * 0.2 : 0.75 + Math.random() * 0.25;
    return { x, y, vx, vy, size, alpha, r, g, b, life: randomY ? Math.random() : 0 };
  }

  for (let i = 0; i < MAX_PARTICLES; i++) {
    particleData.push(initParticle(i));
  }

  function updateParticles(dt) {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particleData[i];
      p.x += p.vx + (mouseX - 0.5) * 0.15;
      p.y += p.vy;
      p.life += dt * 0.0015;

      if (p.life > 1 || p.y < -15 || p.x < -15 || p.x > canvas.width + 15) {
        Object.assign(p, initParticle(i, false));
        p.life = 0;
      }

      const fadeIn = Math.min(p.life * 3, 1);
      const fadeOut = Math.min((1 - p.life) * 3, 1);
      const alpha = p.alpha * fadeIn * fadeOut;

      const offset = i * 8;
      particles[offset] = p.x;
      particles[offset + 1] = p.y;
      particles[offset + 2] = 0.5; // u
      particles[offset + 3] = 0.5; // v
      particles[offset + 4] = p.size;
      particles[offset + 5] = alpha;
      particles[offset + 6] = p.r;
      particles[offset + 7] = p.g;
    }
  }

  /* Buffers */
  const positionBuffer = gl.createBuffer();
  const texcoordBuffer = gl.createBuffer();
  const sizeBuffer = gl.createBuffer();
  const alphaBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();

  /* Mouse tracking */
  let mouseX = 0.5, mouseY = 0.5, targetMX = 0.5, targetMY = 0.5;

  window.addEventListener('mousemove', (e) => {
    targetMX = e.clientX / canvas.width;
    targetMY = 1.0 - e.clientY / canvas.height;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
      targetMX = e.touches[0].clientX / canvas.width;
      targetMY = 1.0 - e.touches[0].clientY / canvas.height;
    }
  }, { passive: true });

  /* Gyroscope for mobile */
  if (IS_MOBILE && 'DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma != null && e.beta != null) {
        targetMX = 0.5 + (e.gamma / 45) * 0.3;
        targetMY = 0.5 + (e.beta / 90) * 0.3;
        targetMX = Math.max(0, Math.min(1, targetMX));
        targetMY = Math.max(0, Math.min(1, targetMY));
      }
    }, { passive: true });
  }

  /* Resize Handler */
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* Render Loop */
  let lastTime = 0;
  const FPS_TARGET = IS_MOBILE ? 60 : 120;
  const FRAME_MS = 1000 / FPS_TARGET;

  function render(timestamp) {
    requestAnimationFrame(render);

    const dtRaw = timestamp - lastTime;
    if (dtRaw < FRAME_MS - 0.5) return;
    const dt = Math.min(dtRaw, FRAME_MS * 2);
    lastTime = timestamp - (dtRaw % FRAME_MS);

    // Smooth mouse
    mouseX += (targetMX - mouseX) * 0.05;
    mouseY += (targetMY - mouseY) * 0.05;

    updateParticles(dt);

    gl.clearColor(0.012, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
    gl.uniform2f(mouseLoc, mouseX, mouseY);
    gl.uniform1f(timeLoc, timestamp * 0.001);
    gl.uniform1f(tierLoc, TIER);

    // Position
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, particles, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 32, 0);

    // Texcoord
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, particles, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(texcoordLoc);
    gl.vertexAttribPointer(texcoordLoc, 2, gl.FLOAT, false, 32, 8);

    // Size
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, particles, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(sizeLoc);
    gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 32, 16);

    // Alpha
    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, particles, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(alphaLoc);
    gl.vertexAttribPointer(alphaLoc, 1, gl.FLOAT, false, 32, 20);

    // Color
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, particles, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 32, 24);

    gl.drawArrays(gl.POINTS, 0, MAX_PARTICLES);
    gl.disable(gl.BLEND);
  }

  requestAnimationFrame(render);

  /* ──────────────────────────────────────────────
     4. MAIN CARD REVEAL
     ────────────────────────────────────────────── */
  const mainCard = document.getElementById('main-card');
  function revealMainCard() {
    if (mainCard) {
      mainCard.style.opacity = '1';
      mainCard.style.transform = 'translateY(0)';
    }
  }

  /* ──────────────────────────────────────────────
     5. IMAGE MODAL (Lightbox)
     ────────────────────────────────────────────── */
  const modal = document.getElementById('img-modal');
  const modalImg = document.getElementById('modal-img');
  const modalClose = document.getElementById('modal-close');
  const bannerWrap = document.getElementById('banner-wrap');
  const profileWrap = document.getElementById('profile-wrap');
  let lastFocus = null;

  function openModal(src, trigger) {
    if (!modal || !modalImg) return;
    modalImg.src = '';
    setTimeout(() => { modalImg.src = src; }, 15);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lastFocus = trigger;
    document.body.style.overflow = 'hidden';
    if (modalClose) setTimeout(() => modalClose.focus(), 60);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  const getImgSrc = (el) => el?.querySelector('img')?.src || '';

  if (bannerWrap) {
    bannerWrap.addEventListener('click', () => openModal(getImgSrc(bannerWrap), bannerWrap));
    bannerWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bannerWrap.click(); }
    });
  }

  if (profileWrap) {
    profileWrap.addEventListener('click', () => openModal(getImgSrc(profileWrap), profileWrap));
    profileWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); profileWrap.click(); }
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
    modalClose.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeModal(); }
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal();
  });

  /* ──────────────────────────────────────────────
     6. VISITOR COUNTER
     ────────────────────────────────────────────── */
  const countEl = document.getElementById('visit-count');
  const LS_KEY = 'tr7_visits_v2';

  function fmt(n) { return Number(n).toLocaleString('en-US'); }

  function rollTo(target) {
    if (!countEl) return;
    const from = parseInt((countEl.textContent || '0').replace(/[^0-9]/g, '')) || 0;
    if (from === target) return;
    const diff = target - from;
    const steps = Math.min(Math.abs(diff), 50);
    const interval = Math.max(Math.floor(900 / steps), 12);
    let step = 0;
    const timer = setInterval(() => {
      step++;
      countEl.textContent = fmt(Math.round(from + diff * step / steps));
      if (step >= steps) { clearInterval(timer); countEl.textContent = fmt(target); }
    }, interval);
    countEl.style.transform = 'scale(1.35)';
    setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 300);
  }

  function localFallback() {
    const current = (parseInt(localStorage.getItem(LS_KEY)) || 0) + 1;
    localStorage.setItem(LS_KEY, String(current));
    rollTo(current);
  }

  function fetchCounter(update = false) {
    const endpoint = update
      ? 'https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits/up'
      : 'https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    fetch(endpoint, { signal: controller.signal, cache: 'no-store' })
      .then(r => { clearTimeout(timeout); if (!r.ok) throw new Error('API fail'); return r.json(); })
      .then(data => {
        const val = data.count ?? data.value ?? data.hits;
        if (val != null) {
          const currentDisplay = parseInt((countEl?.textContent || '0').replace(/[^0-9]/g, '')) || 0;
          if (parseInt(val) !== currentDisplay) rollTo(parseInt(val));
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        if (!update) localFallback();
      });
  }

  fetchCounter(true);

  /* Auto refresh every 35s */
  setInterval(() => fetchCounter(), 35000);

  /* ──────────────────────────────────────────────
     7. MEMORY SAFETY — Periodic cleanup
     ────────────────────────────────────────────── */
  setInterval(() => {
    // Ensure particle life is within bounds
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (particleData[i].life > 2) {
        Object.assign(particleData[i], initParticle(i, false));
      }
    }
    // Clear any orphaned GPU resources
    if (gl.isContextLost()) {
      console.warn('WebGL context lost, reloading...');
      location.reload();
    }
  }, 30000);

})();
