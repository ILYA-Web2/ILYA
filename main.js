/* ================================================================
   TR7 · main.js v2.0
   Three.js WebGL · Bloom · Fluid Interactions · Memory-Safe
   ================================================================ */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

(function () {
  "use strict";

  /* ═══════════════════════════════════════
     CONFIG & TIER
  ═══════════════════════════════════════ */
  const config = window.TR7 || {};
  const IS_MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                 || window.matchMedia('(pointer: coarse)').matches;
  const CORES = navigator.hardwareConcurrency || 2;
  const TIER  = (CORES <= 2 || IS_MOBILE) ? 0 : CORES <= 4 ? 1 : 2;

  const COLORS = {
    bg:      config.colorBg       || '#030000',
    primary: config.colorPrimary  || '#ff0033',
    deep:    config.colorDeep     || '#cc001a',
    dark:    config.colorDark     || '#8b0000',
    accent:  config.colorAccent   || '#ff1744',
    text:    config.colorText     || '#ffffff',
  };

  /* ═══════════════════════════════════════
     1. CINEMATIC LOADER
  ═══════════════════════════════════════ */
  const loaderEl = document.getElementById('loader');
  const fillEl   = document.getElementById('ldr-fill');
  const headEl   = document.getElementById('ldr-head');
  const pctEl    = document.getElementById('ldr-pct');
  const statEl   = document.getElementById('ldr-status');
  const LDUR     = 5500;
  const PHASES   = [
    [0.00,'INITIALIZING SYSTEM'],
    [0.20,'LOADING ASSETS'],
    [0.45,'RENDERING INTERFACE'],
    [0.72,'CALIBRATING VISUALS'],
    [0.92,'SYSTEM READY — TR7'],
  ];
  let phIdx = 0;
  if (statEl) statEl.style.transition = 'opacity .2s';

  let ldStart = null;
  function ldFrame(ts) {
    if (!ldStart) ldStart = ts;
    const prog = Math.min((ts - ldStart) / LDUR, 1);
    const pct  = Math.floor(prog * 100);
    if (fillEl) fillEl.style.width = prog * 100 + '%';
    if (headEl) headEl.style.left  = 'calc(' + (prog * 100) + '% - 4px)';
    if (pctEl)  pctEl.textContent  = pct + '%';
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (prog >= PHASES[i][0] && phIdx <= i) {
        phIdx = i + 1;
        if (statEl) {
          statEl.style.opacity = '0';
          const msg = PHASES[i][1];
          setTimeout(() => { if (statEl) { statEl.textContent = msg; statEl.style.opacity = '.9'; } }, 180);
        }
        break;
      }
    }
    if (prog < 1) requestAnimationFrame(ldFrame);
    else setTimeout(() => {
      if (loaderEl) loaderEl.classList.add('hidden');
      document.body.style.overflow = '';
      initEntranceAnimations();
    }, 350);
  }
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(ldFrame);

  /* ═══════════════════════════════════════
     2. THREE.JS WEBGL ENGINE
  ═══════════════════════════════════════ */
  const canvas = document.getElementById('webgl-bg');
  if (!canvas) return;

  let scene, camera, renderer, composer, particles, material, clock;
  let mouse = new THREE.Vector2(0.5, 0.5);
  let targetMouse = new THREE.Vector2(0.5, 0.5);
  let width = window.innerWidth, height = window.innerHeight;
  let rafId;

  function initWebGL() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: TIER > 0,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, TIER === 2 ? 2 : 1.5));
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.zIndex = '1';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.touchAction = 'none';

    clock = new THREE.Clock();

    const particleCount = TIER === 0 ? 900 : TIER === 1 ? 1600 : 2800;
    const positions = new Float32Array(particleCount * 3);
    const colors    = new Float32Array(particleCount * 3);
    const sizes     = new Float32Array(particleCount);

    const c1 = new THREE.Color(COLORS.primary);
    const c2 = new THREE.Color(COLORS.deep);
    const c3 = new THREE.Color(COLORS.text);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const r = (Math.random() - 0.5) * 140;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);

      positions[i3]   = r * Math.sin(phi) * Math.cos(theta);
      positions[i3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3+2] = r * Math.cos(phi);

      const t = Math.random();
      let col;
      if (t < 0.55) col = c1.clone().lerp(c2, Math.random());
      else if (t < 0.88) col = c1.clone().lerp(c3, Math.random() * 0.4);
      else col = c3;

      colors[i3]   = col.r;
      colors[i3+1] = col.g;
      colors[i3+2] = col.b;

      sizes[i] = Math.random() * 2.8 + 0.6;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
    geometry.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));

    material = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uMouse:      { value: mouse },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec3 pos = position;

          float wave = sin(pos.x * 0.015 + uTime * 0.4) * 0.6
                     + cos(pos.y * 0.015 + uTime * 0.25) * 0.6;
          pos.z += wave;

          vec2 m = (uMouse - 0.5) * 50.0;
          vec2 offset = (pos.xy - m) * 0.015;
          float dist = length(offset);
          pos.xy += offset * (1.0 / (dist + 1.0)) * 3.0;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uPixelRatio * (85.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float glow = pow(1.0 - (d * 2.0), 1.9);
          gl_FragColor = vec4(vColor, glow * 0.92);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    if (TIER > 0) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        TIER === 2 ? 1.4 : 1.0,
        0.5,
        0.85
      );
      composer.addPass(bloom);
    }

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    rafId = requestAnimationFrame(animate);
  }

  function onResize() {
    width  = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    if (composer) composer.setSize(width, height);
  }

  function onMouseMove(e) {
    targetMouse.x = e.clientX / width;
    targetMouse.y = 1.0 - (e.clientY / height);
  }

  function onTouchMove(e) {
    if (e.touches[0]) {
      targetMouse.x = e.touches[0].clientX / width;
      targetMouse.y = 1.0 - (e.touches[0].clientY / height);
    }
  }

  function animate() {
    rafId = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    mouse.x += (targetMouse.x - mouse.x) * 0.035;
    mouse.y += (targetMouse.y - mouse.y) * 0.035;

    material.uniforms.uTime.value  = time;
    material.uniforms.uMouse.value = mouse;

    particles.rotation.y = time * 0.018;
    particles.rotation.x = Math.sin(time * 0.1) * 0.02;

    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  /* Memory-safe cleanup on pagehide */
  window.addEventListener('pagehide', () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (renderer) renderer.dispose();
    if (geometry) geometry.dispose();
    if (material) material.dispose();
  });

  /* Delay init slightly for layout stability */
  setTimeout(initWebGL, 120);

  /* ═══════════════════════════════════════
     3. IMAGE MODAL
  ═══════════════════════════════════════ */
  const modal     = document.getElementById('img-modal');
  const modalImg  = document.getElementById('modal-img');
  const mClose    = document.getElementById('modal-close');
  const bannerEl  = document.getElementById('banner-wrap');
  const profileEl = document.getElementById('profile-wrap');
  let lastFocus   = null;

  function openModal(src, trig) {
    if (!modal || !modalImg) return;
    modalImg.src = '';
    requestAnimationFrame(() => { modalImg.src = src; });
    modal.classList.add('active');
    modal.setAttribute('aria-hidden','false');
    lastFocus = trig;
    document.body.style.overflow = 'hidden';
    if (mClose) setTimeout(() => mClose.focus(), 60);
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
    lastFocus = null;
  }
  const getSrc = el => el?.querySelector('img')?.src || '';

  if (bannerEl)  bannerEl.addEventListener('click', () => openModal(getSrc(bannerEl), bannerEl));
  if (profileEl) profileEl.addEventListener('click',() => openModal(getSrc(profileEl), profileEl));
  if (mClose)    mClose.addEventListener('click', closeModal);
  if (modal)     modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

  /* ═══════════════════════════════════════
     4. VISITOR COUNTER
  ═══════════════════════════════════════ */
  const countEl = document.getElementById('visit-count');
  const LS_KEY  = 'tr7_v2_visits';

  function fmt(n) { return Number(n).toLocaleString('en-US'); }

  function rollTo(target) {
    if (!countEl) return;
    const from = parseInt((countEl.textContent || '0').replace(/[^0-9]/g,'')) || 0;
    if (from === target) return;
    const diff = target - from;
    const steps = Math.min(Math.abs(diff), 45);
    const ms = Math.max(Math.floor(850 / steps), 14);
    let i = 0;
    const t = setInterval(() => {
      i++;
      countEl.textContent = fmt(Math.round(from + diff * i / steps));
      if (i >= steps) { clearInterval(t); countEl.textContent = fmt(target); }
    }, ms);
    countEl.style.transform = 'scale(1.3)';
    setTimeout(() => countEl.style.transform = 'scale(1)', 300);
  }

  function tryAPI(url, fallback) {
    const ctrl = new AbortController();
    const to   = setTimeout(() => ctrl.abort(), 4200);
    return fetch(url, { signal: ctrl.signal, cache:'no-store' })
      .then(r => { clearTimeout(to); if(!r.ok) throw 0; return r.json(); })
      .then(d => {
        const v = d.count ?? d.value ?? d.hits;
        if (v != null) { rollTo(parseInt(v)); return true; }
        throw 0;
      })
      .catch(() => { clearTimeout(to); return fallback ? fallback() : false; });
  }

  function localFallback() {
    const n = (parseInt(localStorage.getItem(LS_KEY)) || 0) + 1;
    localStorage.setItem(LS_KEY, String(n));
    rollTo(n);
  }

  setTimeout(() => {
    tryAPI('https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits/up', localFallback);
    setInterval(() => {
      const ctrl = new AbortController();
      const to   = setTimeout(() => ctrl.abort(), 3200);
      fetch('https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits', { signal: ctrl.signal, cache:'no-store' })
        .then(r => { clearTimeout(to); if(!r.ok) throw 0; return r.json(); })
        .then(d => {
          const v = d.count ?? d.value;
          if (v != null && countEl) {
            const cur = parseInt((countEl.textContent||'0').replace(/[^0-9]/g,''));
            if(parseInt(v) !== cur) rollTo(parseInt(v));
          }
        })
        .catch(() => clearTimeout(to));
    }, 30000);
  }, LDUR + 600);

  /* ═══════════════════════════════════════
     5. ENTRANCE ANIMATIONS
  ═══════════════════════════════════════ */
  function initEntranceAnimations() {
    const mainCard = document.getElementById('main-card');
    if (mainCard) {
      mainCard.style.opacity = '0';
      mainCard.style.transform = 'translateY(35px) scale(0.97)';
      mainCard.style.transition = 'opacity 1.1s var(--ez), transform 1.1s var(--ez)';
      requestAnimationFrame(() => {
        setTimeout(() => {
          mainCard.style.opacity = '1';
          mainCard.style.transform = 'translateY(0) scale(1)';
        }, 80);
      });
    }

    const cards = document.querySelectorAll('.app-card');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(18px)';
      card.style.transition = `opacity .55s ease ${i*0.07}s, transform .6s var(--ez) ${i*0.07}s`;
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 700 + i * 70);
    });
  }

  /* ═══════════════════════════════════════
     6. RENDER LINKS FROM CONFIG
  ═══════════════════════════════════════ */
  function renderLinks() {
    const grid = document.getElementById('links-grid');
    if (!grid || !window.TR7?.links) return;
    grid.innerHTML = '';
    window.TR7.links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'app-card';
      a.setAttribute('role','button');
      a.innerHTML = `
        <div class="ac-glow"></div>
        <div class="ac-sheen"></div>
        <div class="aib" style="background:${link.color || 'rgba(10,2,4,.7)'}">
          <i class="${link.icon || 'fas fa-link'}"></i>
          ${link.color ? `<div class="ihalo" style="box-shadow:0 0 20px ${link.color}80, inset 0 0 10px ${link.color}40"></div>` : ''}
        </div>
        <span class="an">${link.name}</span>
        <span class="ah">${link.handle || ''}</span>
      `;
      grid.appendChild(a);
    });
  }

  if (window.TR7) renderLinks();
  window.addEventListener('tr7-config-loaded', renderLinks);

})();
