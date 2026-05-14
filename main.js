/* ══════════════════════════════════════════════════════
   ILYA · main.js  —  2026
   ▸ WebGL Aurora Nebula background (native Three.js r128)
   ▸ GSAP 3.12 cinematic idle animations
   ▸ 60 fps on mid-range mobile, zero jank
   ▸ Zero admin code · Memory-safe
   ══════════════════════════════════════════════════════ */

'use strict';

/* ── Tiny utils ── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp  = (a, b, t)   => a + (b - a) * t;
const CFG   = window.ILYA || {};

/* ══════════════════════════════════════════════════════
   VISITOR COUNTER
══════════════════════════════════════════════════════ */
function initVisitor() {
  try {
    const key = 'ilya_vc';
    const n   = (parseInt(localStorage.getItem(key) || '0', 10)) + 1;
    localStorage.setItem(key, String(n));
    const el = $('#visit-count');
    if (el) el.textContent = n.toLocaleString('en-US');
  } catch (_) {}
}

/* ══════════════════════════════════════════════════════
   APPLY CONFIG TO DOM
══════════════════════════════════════════════════════ */
function applyConfig() {
  const map = {
    '#profile-name'    : 'profileName',
    '#profile-subtitle': 'profileSubtitle',
    '#profile-desc'    : 'profileDesc',
    '#section-title'   : 'sectionTitle',
    '#footer-copy'     : 'footerCopy',
    '#site-label'      : 'siteLabel',
  };
  for (const [sel, key] of Object.entries(map)) {
    const el = $(sel);
    if (el && CFG[key]) el.textContent = CFG[key];
  }

  const siteLink = $('#site-link');
  if (siteLink && CFG.siteUrl) siteLink.href = CFG.siteUrl;

  if (CFG.bannerUrl) {
    const b = $('#banner-img');
    if (b) b.src = CFG.bannerUrl;
  }
  if (CFG.profileUrl) {
    const p = $('#profile-img');
    if (p) p.src = CFG.profileUrl;
  }
  const ldrLogo = $('#ldr-logo');
  if (ldrLogo && CFG.logoUrl) ldrLogo.src = CFG.logoUrl;
}

/* ══════════════════════════════════════════════════════
   BUILD LINK CARDS
══════════════════════════════════════════════════════ */
function buildLinks() {
  const grid  = $('#links-grid');
  const links = Array.isArray(CFG.links) ? CFG.links : [];
  if (!grid || !links.length) return;

  grid.innerHTML = '';

  links.forEach(({ name = '', url = '#', icon = '', handle = '', color = '#ff0033', glow = 'rgba(255,0,51,0.28)' }) => {
    const a   = document.createElement('a');
    a.className   = 'lnk';
    a.href        = url;
    a.target      = '_blank';
    a.rel         = 'noopener noreferrer';
    a.setAttribute('aria-label', name);

    a.innerHTML = `
      <div class="lnk-glow"  aria-hidden="true"></div>
      <div class="lnk-sheen" aria-hidden="true"></div>
      <div class="lnk-icon"
           style="box-shadow:0 0 20px ${glow}, 0 5px 14px rgba(0,0,0,.72);">
        <div class="lnk-halo"
             style="box-shadow:0 0 20px ${glow} inset;"
             aria-hidden="true"></div>
        <i class="${icon}" style="color:${color};" aria-hidden="true"></i>
      </div>
      <span class="lnk-name">${name}</span>
      <span class="lnk-handle">${handle}</span>
    `;
    grid.appendChild(a);
  });
}

/* ══════════════════════════════════════════════════════
   LOADER
   Arc progress + linear bar animate together
══════════════════════════════════════════════════════ */
const BOOT_MSGS = [
  'BOOT SEQUENCE',
  'LOADING ASSETS',
  'CALIBRATING GPU',
  'BUILDING NEBULA',
  'SYSTEM ONLINE'
];

function runLoader(onDone) {
  const loader  = $('#loader');
  const arc     = $('#ldr-arc');       /* SVG circle element  */
  const bar     = $('#ldr-bar');       /* linear fill         */
  const barGlow = $('#ldr-bar-glow');
  const pctEl   = $('#ldr-pct');
  const statEl  = $('#ldr-status');
  if (!loader) { onDone(); return; }

  const CIRC    = 276.46;            /* 2π × 44 (r=44, SVG 100×100) */
  let pct       = 0;
  let msgIdx    = 0;
  let raf;
  const start   = performance.now();
  const minMs   = 2800;

  function tick(now) {
    const natural = clamp((now - start) / minMs * 100, 0, 100);
    /* Smooth ease-in catch-up */
    pct = clamp(pct + (natural - pct) * 0.055, 0, 100);
    const pi = Math.round(pct);

    /* Arc (SVG stroke-dashoffset) */
    if (arc) arc.style.strokeDashoffset = String(CIRC * (1 - pct / 100));

    /* Linear bar */
    if (bar)     bar.style.width           = pct + '%';
    if (barGlow) barGlow.style.marginInlineStart = pct + '%';

    /* Percentage text */
    if (pctEl) pctEl.textContent = pi + '%';

    /* Status messages */
    const ni = Math.min(Math.floor(pct / 22), BOOT_MSGS.length - 1);
    if (ni !== msgIdx && statEl) {
      msgIdx = ni;
      statEl.style.opacity = '0';
      setTimeout(() => {
        if (statEl) { statEl.textContent = BOOT_MSGS[msgIdx]; statEl.style.opacity = ''; }
      }, 180);
    }

    if (pct < 99.85) {
      raf = requestAnimationFrame(tick);
    } else {
      if (pctEl) pctEl.textContent = '100%';
      if (arc)   arc.style.strokeDashoffset = '0';

      setTimeout(() => {
        loader.classList.add('out');
        loader.addEventListener('transitionend', () => {
          loader.remove();
          onDone();
        }, { once: true });
        /* Failsafe */
        setTimeout(() => { loader.remove(); onDone(); }, 1200);
      }, 400);
    }
  }

  raf = requestAnimationFrame(tick);

  /* Hard timeout failsafe */
  setTimeout(() => {
    cancelAnimationFrame(raf);
    if (loader.isConnected) {
      loader.classList.add('out');
      loader.addEventListener('transitionend', () => { loader.remove(); onDone(); }, { once: true });
      setTimeout(() => { if (loader.isConnected) { loader.remove(); onDone(); } }, 1200);
    }
  }, 9000);
}

/* ══════════════════════════════════════════════════════
   WebGL — AURORA NEBULA BACKGROUND
   ▸ Layered additive particles forming soft nebula clouds
   ▸ Slow autonomous drift — no jarring movement
   ▸ Mouse / gyro parallax with heavy smoothing
   ▸ Auto-resize, memory-safe dispose
══════════════════════════════════════════════════════ */
const Aurora = (() => {

  /* State */
  let renderer, scene, camera, animId;
  let nebulaMesh, starField, dustField;
  let W = window.innerWidth, H = window.innerHeight;
  const mouse  = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };

  /* ── Adaptive counts ── */
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const dpr      = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  const STARS    = isMobile ? 3000 : 7000;
  const DUST     = isMobile ? 1200 : 2800;
  const NEBULA_P = isMobile ? 1800 : 4200;

  /* ════════════════════════════════════════
     SHADERS
  ════════════════════════════════════════ */

  /* ── Stars (small, sharp, twinkling) ── */
  const starVert = /* glsl */`
    attribute float aSize;
    attribute float aPhase;
    attribute vec3  aColor;
    varying   vec3  vColor;
    varying   float vA;
    uniform   float uTime;
    void main(){
      vColor = aColor;
      /* Twinkle = soft sine oscillation */
      vA = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase * 6.283);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = aSize * (280.0 / -mv.z);
      gl_Position  = projectionMatrix * mv;
    }
  `;
  const starFrag = /* glsl */`
    varying vec3  vColor;
    varying float vA;
    void main(){
      vec2  uv = gl_PointCoord * 2.0 - 1.0;
      float d  = length(uv);
      if(d > 1.0) discard;
      /* Sharp gaussian star */
      float core = exp(-d * d * 4.5);
      float ray  = exp(-d * d * 1.2) * 0.35;
      gl_FragColor = vec4(vColor * (core + ray), (core + ray) * vA);
    }
  `;

  /* ── Dust / nebula particles (large, soft, additive) ── */
  const dustVert = /* glsl */`
    attribute float aSize;
    attribute float aAlpha;
    attribute float aSpeed;
    attribute vec3  aColor;
    varying   vec3  vColor;
    varying   float vA;
    uniform   float uTime;
    void main(){
      vColor = aColor;
      /* Soft drift */
      vec3 p = position;
      float drift = sin(uTime * aSpeed * 0.38 + p.x * 1.2 + p.z * 0.8) * 0.12;
      p.y += drift;
      vA = aAlpha * (0.68 + 0.32 * sin(uTime * aSpeed * 0.55 + p.z));
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = aSize * (340.0 / -mv.z);
      gl_Position  = projectionMatrix * mv;
    }
  `;
  const dustFrag = /* glsl */`
    varying vec3  vColor;
    varying float vA;
    void main(){
      vec2  uv = gl_PointCoord * 2.0 - 1.0;
      float d  = length(uv);
      if(d > 1.0) discard;
      /* Very soft gaussian blob */
      float soft = exp(-d * d * 2.2);
      gl_FragColor = vec4(vColor * soft, soft * vA);
    }
  `;

  /* ════════════════════════════════════════
     GEOMETRY BUILDERS
  ════════════════════════════════════════ */

  /* Star field — distributed across a large sphere shell */
  function buildStars() {
    const pos   = new Float32Array(STARS * 3);
    const sizes = new Float32Array(STARS);
    const phase = new Float32Array(STARS);
    const color = new Float32Array(STARS * 3);

    for (let i = 0; i < STARS; i++) {
      /* Uniform sphere distribution */
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 14 + Math.random() * 8;
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.cos(phi);
      pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);

      /* 85% white-blue, 10% warm, 5% red */
      const t = Math.random();
      if (t < 0.85) {
        /* cool white / blue-white */
        const f = Math.random();
        color[i*3]   = 0.82 + f * 0.18;
        color[i*3+1] = 0.86 + f * 0.14;
        color[i*3+2] = 1.0;
      } else if (t < 0.95) {
        /* warm */
        color[i*3]   = 1.0;
        color[i*3+1] = 0.82 + Math.random() * 0.12;
        color[i*3+2] = 0.72 + Math.random() * 0.18;
      } else {
        /* accent red */
        color[i*3]   = 1.0;
        color[i*3+1] = 0.1 + Math.random() * 0.12;
        color[i*3+2] = 0.1 + Math.random() * 0.12;
      }

      sizes[i] = 0.6 + Math.random() * 1.8;
      phase[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,   3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase',   new THREE.BufferAttribute(phase, 1));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(color, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader:   starVert,
      fragmentShader: starFrag,
      uniforms: { uTime: { value: 0 } },
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geo, mat);
  }

  /* Nebula dust — soft large particles in a flat galactic plane */
  function buildDust() {
    const pos   = new Float32Array(NEBULA_P * 3);
    const sizes = new Float32Array(NEBULA_P);
    const alpha = new Float32Array(NEBULA_P);
    const speed = new Float32Array(NEBULA_P);
    const color = new Float32Array(NEBULA_P * 3);

    for (let i = 0; i < NEBULA_P; i++) {
      /* Galaxy-plane ellipsoid distribution */
      const arms  = 3;
      const arm   = Math.floor(Math.random() * arms);
      const base  = (arm / arms) * Math.PI * 2;
      const r     = 1.2 + Math.pow(Math.random(), 0.52) * 7.5;
      const spin  = r * 0.48;
      const theta = base + spin + (Math.random() - 0.5) * 0.9 / (r * 0.4 + 0.6);
      const phi   = (Math.random() - 0.5) * 0.22 / (r * 0.3 + 1);

      pos[i*3]   = r * Math.cos(theta) * Math.cos(phi);
      pos[i*3+1] = r * Math.sin(phi) * 0.5;
      pos[i*3+2] = r * Math.sin(theta) * Math.cos(phi);

      /* Color: deep crimson core → blood red mid → dark burgundy edge */
      const t = clamp(r / 8.5, 0, 1);
      let cr, cg, cb;
      if (t < 0.18) {
        /* Core: very warm white-pink */
        cr = 1.0; cg = 0.72; cb = 0.68;
      } else if (t < 0.42) {
        const f = (t - 0.18) / 0.24;
        cr = 1.0;
        cg = lerp(0.72, 0.04, f);
        cb = lerp(0.68, 0.06, f);
      } else if (t < 0.72) {
        const f = (t - 0.42) / 0.30;
        cr = lerp(1.0, 0.78, f);
        cg = lerp(0.04, 0.0, f);
        cb = lerp(0.06, 0.04, f);
      } else {
        const f = clamp((t - 0.72) / 0.28, 0, 1);
        cr = lerp(0.78, 0.22, f);
        cg = 0.0;
        cb = lerp(0.04, 0.08, f);
      }

      const bright = 0.55 + Math.random() * 0.65;
      color[i*3]   = clamp(cr * bright, 0, 1);
      color[i*3+1] = clamp(cg * bright, 0, 1);
      color[i*3+2] = clamp(cb * bright, 0, 1);

      sizes[i] = 1.8 + Math.random() * 5.5;
      alpha[i] = t < 0.25 ? 0.28 + Math.random() * 0.38
                           : 0.08 + Math.random() * 0.26;
      speed[i] = 0.08 + Math.random() * 0.45;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,   3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aAlpha',   new THREE.BufferAttribute(alpha, 1));
    geo.setAttribute('aSpeed',   new THREE.BufferAttribute(speed, 1));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(color, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader:   dustVert,
      fragmentShader: dustFrag,
      uniforms: { uTime: { value: 0 } },
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geo, mat);
  }

  /* Fine ambient dust — very small, scattered everywhere */
  function buildFineDust() {
    const N   = DUST;
    const pos = new Float32Array(N * 3);
    const sz  = new Float32Array(N);
    const al  = new Float32Array(N);
    const sp  = new Float32Array(N);
    const col = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 22;
      pos[i*3+1] = (Math.random() - 0.5) * 10;
      pos[i*3+2] = (Math.random() - 0.5) * 12;

      /* Random warm-red tint */
      col[i*3]   = 0.6 + Math.random() * 0.4;
      col[i*3+1] = Math.random() * 0.08;
      col[i*3+2] = Math.random() * 0.08;

      sz[i] = 0.8 + Math.random() * 3.5;
      al[i] = 0.04 + Math.random() * 0.12;
      sp[i] = 0.06 + Math.random() * 0.38;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sz,  1));
    geo.setAttribute('aAlpha',   new THREE.BufferAttribute(al,  1));
    geo.setAttribute('aSpeed',   new THREE.BufferAttribute(sp,  1));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(col, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader:   dustVert,
      fragmentShader: dustFrag,
      uniforms: { uTime: { value: 0 } },
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geo, mat);
  }

  /* ════════════════════════════════════════
     INIT & RENDER LOOP
  ════════════════════════════════════════ */
  function init() {
    if (typeof THREE === 'undefined') return;

    const canvas = $('#webgl-canvas');
    if (!canvas) return;

    /* Renderer */
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias   : false,
      alpha       : true,
      powerPreference: 'high-performance',
      stencil     : false,
      depth       : false
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false); /* false = don't set CSS size */
    renderer.setClearColor(0x000000, 0);

    /* Fix canvas CSS to fill viewport */
    canvas.style.position = 'fixed';
    canvas.style.inset    = '0';
    canvas.style.width    = '100%';
    canvas.style.height   = '100%';

    /* Scene & camera */
    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 100);
    camera.position.set(0, 0.6, 9.5);
    camera.lookAt(0, 0, 0);

    /* Build geometry */
    starField  = buildStars();
    nebulaMesh = buildDust();
    dustField  = buildFineDust();

    scene.add(starField, nebulaMesh, dustField);

    /* ── Input ── */

    /* Mouse parallax — heavy smoothing (0.022) prevents jitter */
    window.addEventListener('mousemove', e => {
      mouse.x = (e.clientX / W) * 2 - 1;
      mouse.y = (e.clientY / H) * 2 - 1;
    }, { passive: true });

    /* Touch parallax */
    window.addEventListener('touchmove', e => {
      if (!e.touches[0]) return;
      mouse.x = (e.touches[0].clientX / W) * 2 - 1;
      mouse.y = (e.touches[0].clientY / H) * 2 - 1;
    }, { passive: true });

    /* Gyroscope — mobile tilt */
    window.addEventListener('deviceorientation', e => {
      if (e.beta !== null && e.gamma !== null) {
        mouse.x = clamp(e.gamma / 35, -1, 1);
        mouse.y = clamp((e.beta - 45) / 45, -1, 1);
      }
    }, { passive: true });

    /* ── Render loop ── */
    let t0 = null;
    let lastFrame = 0;
    /* Target: 60 fps. Skip frame if under 14ms since last (prevents 120fps battery drain) */
    const MIN_FRAME_MS = 14;

    function frame(now) {
      animId = requestAnimationFrame(frame);

      const delta = now - lastFrame;
      if (delta < MIN_FRAME_MS) return;   /* Frame skip for 120Hz screens */
      lastFrame = now;

      if (!t0) t0 = now;
      const t = (now - t0) * 0.001;

      /* Update uniforms */
      nebulaMesh.material.uniforms.uTime.value = t;
      dustField.material.uniforms.uTime.value  = t;
      starField.material.uniforms.uTime.value  = t;

      /* Smooth mouse → camera tilt */
      smooth.x = lerp(smooth.x, mouse.x, 0.022);
      smooth.y = lerp(smooth.y, mouse.y, 0.022);

      /* Autonomous slow rotation */
      nebulaMesh.rotation.y = t * 0.018  + smooth.x * 0.28;
      nebulaMesh.rotation.x = Math.sin(t * 0.011) * 0.08 + smooth.y * 0.14;
      nebulaMesh.rotation.z = Math.cos(t * 0.007) * 0.04;

      dustField.rotation.y  = t * 0.012  + smooth.x * 0.22;
      dustField.rotation.x  = Math.sin(t * 0.009) * 0.06 + smooth.y * 0.10;

      starField.rotation.y  = t * 0.006;   /* Stars rotate very slowly */
      starField.rotation.x  = smooth.y * 0.06;

      /* Camera subtle drift */
      camera.position.x = smooth.x * 0.32;
      camera.position.y = 0.6 + smooth.y * 0.18;

      renderer.render(scene, camera);
    }

    animId = requestAnimationFrame(frame);
    window.addEventListener('resize', onResize, { passive: true });
  }

  function onResize() {
    W = window.innerWidth;
    H = window.innerHeight;
    if (!renderer || !camera) return;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);
  }

  /* Dispose everything — no memory leaks */
  function destroy() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);

    const meshes = [nebulaMesh, dustField, starField];
    meshes.forEach(m => {
      if (!m) return;
      m.geometry.dispose();
      m.material.dispose();
    });

    if (renderer) renderer.dispose();
  }

  return { init, destroy };
})();

/* ══════════════════════════════════════════════════════
   IMAGE MODAL
══════════════════════════════════════════════════════ */
function initModal() {
  const modal    = $('#modal');
  const modalImg = $('#modal-img');
  const closeBtn = $('#modal-close');
  if (!modal || !modalImg || !closeBtn) return;

  function open(src) {
    if (!src) return;
    modalImg.src = src;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { if (modalImg) modalImg.src = ''; }, 460);
  }

  /* Triggers */
  const bannerWrap  = $('#banner');
  const avatarWrap  = $('#avatar-wrap');
  const bannerImg   = $('#banner-img');
  const profileImg  = $('#profile-img');

  function attachTrigger(wrap, imgEl) {
    if (!wrap || !imgEl) return;
    const go = () => open(imgEl.src);
    wrap.addEventListener('click',   go);
    wrap.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  }

  attachTrigger(bannerWrap, bannerImg);
  attachTrigger(avatarWrap, profileImg);

  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
}

/* ══════════════════════════════════════════════════════
   GSAP CINEMATIC IDLE ANIMATIONS
   All perpetual motion via GSAP Yoyo + Repeat
   No CSS keyframe conflict
══════════════════════════════════════════════════════ */
function initAnimations() {
  if (typeof gsap === 'undefined') return;

  /* ── Card entrance ── */
  gsap.to('#card', {
    opacity: 1, y: 0,
    duration: 1.5,
    ease: 'expo.out',
    delay: 0.08,
    clearProps: 'transform'
  });

  /* ── Card heartbeat (Y drift only, no scale) ── */
  gsap.to('#card', {
    y: -6,
    duration: 8,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    delay: 1.8
  });

  /* ── Avatar perpetual float ── */
  gsap.to('#avatar-wrap', {
    y: -13,
    duration: 4.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    delay: 0.3
  });

  /* ── Banner breathe (scale on Y only, transform-origin=bottom) ── */
  gsap.to('#banner-img', {
    scaleY: 1.016,
    duration: 6.5,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    transformOrigin: 'center bottom'
  });

  /* ── Bio block float ── */
  gsap.to('.bio-wrap', {
    y: -5,
    duration: 5.8,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    delay: 1.1
  });

  /* ── Section heading ── */
  gsap.to('.links-heading', {
    y: -6,
    duration: 5.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    delay: 0.9
  });

  /* ── Link cards: staggered entrance + random perpetual float ── */
  const cards = $$('.lnk');
  cards.forEach((card, i) => {
    /* Entrance */
    gsap.fromTo(
      card,
      { opacity: 0, y: 26, scale: 0.82 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.68,
        ease: 'back.out(1.7)',
        delay: 0.6 + i * 0.09,
        clearProps: 'scale'  /* remove scale after entrance */
      }
    );

    /* Perpetual float — unique per card */
    const yAmt  = 7  + Math.random() * 10;
    const dur   = 2.8 + Math.random() * 2.8;
    const delay = i * 0.18 + Math.random() * 0.55;
    gsap.to(card, {
      y: -yAmt,
      duration: dur,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay
    });
  });

  /* ── Footer entrance ── */
  gsap.fromTo('.footer',
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', delay: 1.1 }
  );

  /* ── Info section entrance (stagger) ── */
  gsap.fromTo(
    ['.name-block', '.subtitle-line', '.bio-wrap'],
    { opacity: 0, y: 18 },
    {
      opacity: 1, y: 0,
      duration: 0.85,
      ease: 'expo.out',
      stagger: 0.12,
      delay: 0.35
    }
  );
}

/* ══════════════════════════════════════════════════════
   CARD 3D TILT (desktop only, no mobile)
   Pure CSS var approach — no transforms that conflict
══════════════════════════════════════════════════════ */
function initTilt() {
  const card = $('#card');
  if (!card) return;
  if (window.matchMedia('(hover: none)').matches) return; /* Skip on touch */

  let cx = 0, cy = 0, ticking = false;

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    cx = (e.clientX - rect.left) / rect.width  - 0.5;
    cy = (e.clientY - rect.top)  / rect.height - 0.5;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        /* Max ±5deg tilt — subtle premium feel */
        card.style.transform = `perspective(1000px) rotateX(${-cy * 5}deg) rotateY(${cx * 5}deg) translateY(${card._baseY || 0}px)`;
        ticking = false;
      });
    }
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0, rotateY: 0,
      duration: 0.9, ease: 'expo.out',
      clearProps: 'transform'
    });
  });
}

/* ══════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════ */
function boot() {
  applyConfig();
  buildLinks();
  initVisitor();
  initModal();
  Aurora.init();

  runLoader(() => {
    initAnimations();
    initTilt();
  });
}

/* ── Entry point ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

/* ── Memory cleanup ── */
window.addEventListener('pagehide', () => Aurora.destroy(), { once: true });
