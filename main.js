/* ═══════════════════════════════════════════════════════════
   إيليا · main.js — Autonomous Quantum Galaxy · GSAP Idle
   No Admin · Mobile 60fps · GitHub Pages Ready
   ═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── DOM Elements ───────────────────────────
  const preloader   = document.getElementById('preloader');
  const mainWrapper = document.getElementById('main-content');
  const linksGrid   = document.getElementById('links-grid');
  const visitCount  = document.getElementById('visit-count');
  const canvas      = document.getElementById('webgl-canvas');

  // ─── Config (from embedded JSON) ────────────
  const config = JSON.parse(document.getElementById('site-config').textContent);
  const { profile, branding, colors, links } = config;

  // ─── Render Links ───────────────────────────
  if (linksGrid) {
    linksGrid.innerHTML = links.map(link => `
      <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-card" data-id="${link.id}">
        <div class="link-icon"><i class="${link.icon}"></i></div>
        <span class="link-name">${link.name}</span>
        <span class="link-handle">${link.handle || ''}</span>
      </a>
    `).join('');
  }

  // ─── Visitor Counter (API + localStorage) ───
  const LS_KEY = 'ilya_lv_v2';

  function rollNumber(target) {
    if (!visitCount) return;
    const from = parseInt(visitCount.textContent.replace(/[^0-9]/g, '')) || 0;
    if (from === target) return;
    const diff = target - from;
    const steps = Math.min(Math.abs(diff), 60);
    const interval = Math.max(16, Math.floor(700 / steps));
    let i = 0;
    const timer = setInterval(() => {
      i++;
      visitCount.textContent = Math.round(from + diff * i / steps).toLocaleString('en-US');
      visitCount.style.transform = 'scale(1.25)';
      setTimeout(() => visitCount.style.transform = 'scale(1)', 120);
      if (i >= steps) {
        clearInterval(timer);
        visitCount.textContent = target.toLocaleString('en-US');
      }
    }, interval);
  }

  async function updateVisitorCount() {
    const tryFetch = async () => {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 4000);
      try {
        const res = await fetch('https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits/up', {
          signal: ctrl.signal,
          cache: 'no-store'
        });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('fail');
        const data = await res.json();
        const val = data.count ?? data.value ?? data.hits;
        if (val != null) rollNumber(parseInt(val));
        return;
      } catch (e) { clearTimeout(timeout); }
      // Fallback to localStorage
      let stored = parseInt(localStorage.getItem(LS_KEY)) || 0;
      stored++;
      localStorage.setItem(LS_KEY, stored.toString());
      rollNumber(stored);
    };
    tryFetch();
    // Refresh every 30s
    setInterval(async () => {
      try {
        const res = await fetch('https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const val = data.count ?? data.value;
          if (val != null) {
            const cur = parseInt(visitCount.textContent.replace(/[^0-9]/g, '')) || 0;
            if (parseInt(val) !== cur) rollNumber(parseInt(val));
          }
        }
      } catch (e) {}
    }, 30000);
  }

  // ─── WebGL Galaxy Engine ────────────────────
  let scene, camera, renderer, particles;
  let particleCount = Math.min(1200, window.innerWidth * window.innerHeight / 2000); // adaptive

  function initWebGL() {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(new THREE.Color(colors.bg || '#030000'));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 100);
    camera.position.z = 25;

    // Create glow texture
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 32;
    const gctx = glowCanvas.getContext('2d');
    const gradient = gctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,50,80,1)');
    gradient.addColorStop(0.25, 'rgba(255,0,51,0.8)');
    gradient.addColorStop(0.6, 'rgba(200,0,30,0.1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    gctx.fillStyle = gradient;
    gctx.fillRect(0, 0, 32, 32);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);

    // Geometry
    const positions = new Float32Array(particleCount * 3);
    const colorsArr = new Float32Array(particleCount * 3);
    const randomData = new Float32Array(particleCount * 3); // store custom params for animation

    for (let i = 0; i < particleCount; i++) {
      // Spherical distribution for galaxy shape
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 12;
      const height = (Math.random() - 0.5) * 8;

      positions[i*3]     = Math.cos(angle) * radius;
      positions[i*3 + 1] = height;
      positions[i*3 + 2] = Math.sin(angle) * radius;

      // Random animation data: phase, speed, amplitude, etc.
      randomData[i*3]     = Math.random() * Math.PI * 2;   // phase
      randomData[i*3 + 1] = 0.2 + Math.random() * 0.8;    // speed
      randomData[i*3 + 2] = 0.3 + Math.random() * 1.5;    // vertical amplitude

      // Color leaning towards neon red/pink, with some variation
      const r = 0.9 + Math.random() * 0.1;
      const g = 0.05 + Math.random() * 0.15;
      const b = 0.1 + Math.random() * 0.2;
      colorsArr[i*3]     = r;
      colorsArr[i*3 + 1] = g;
      colorsArr[i*3 + 2] = b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));
    geometry.userData = { randomData }; // store for animation

    const material = new THREE.PointsMaterial({
      size: 0.25,
      map: glowTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Subtle ambient stars (smaller background points)
    const starsGeo = new THREE.BufferGeometry();
    const starsPos = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      starsPos[i*3]     = (Math.random() - 0.5) * 50;
      starsPos[i*3 + 1] = (Math.random() - 0.5) * 30;
      starsPos[i*3 + 2] = (Math.random() - 0.5) * 40;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      opacity: 0.5,
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);
    scene.userData = { stars }; // to rotate slowly
  }

  // ─── Animation Loop ─────────────────────────
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    if (particles) {
      const positions = particles.geometry.attributes.position.array;
      const randomData = particles.geometry.userData.randomData;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const x0 = positions[idx];
        const y0 = positions[idx + 1];
        const z0 = positions[idx + 2];
        const phase = randomData[idx];
        const speed = randomData[idx + 1];
        const amp   = randomData[idx + 2];

        // Autonomous motion: swirl around Y axis + vertical oscillation
        const angle = Math.atan2(z0, x0) + time * 0.4 * speed;
        const radius = Math.sqrt(x0*x0 + z0*z0);
        const newX = Math.cos(angle) * radius;
        const newZ = Math.sin(angle) * radius;
        const newY = y0 + Math.sin(time * 1.5 * speed + phase) * amp * 0.3;

        positions[idx] = newX;
        positions[idx + 1] = newY;
        positions[idx + 2] = newZ;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      // rotate entire galaxy slightly for extra dynamism
      particles.rotation.y += 0.0003;
      particles.rotation.x += 0.0001;
    }

    // Rotate background stars
    if (scene.userData.stars) {
      scene.userData.stars.rotation.y -= 0.0002;
      scene.userData.stars.rotation.x += 0.0001;
    }

    renderer.render(scene, camera);
  }

  // ─── GSAP Idle Animations ─────────────────
  function addIdleAnimations() {
    // Link cards floating randomness
    const cards = document.querySelectorAll('.link-card');
    cards.forEach((card, i) => {
      gsap.to(card, {
        y: '+=8',
        duration: 3 + i * 0.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3
      });
    });

    // Icon bounce (already in CSS but add GSAP for more organic)
    const icons = document.querySelectorAll('.link-icon');
    icons.forEach((icon, i) => {
      gsap.to(icon, {
        y: -5,
        duration: 2 + i * 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: i * 0.2
      });
    });

    // Avatar breathing scale
    gsap.to('.avatar-frame', {
      scale: 1.03,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Bio card subtle pulse (already CSS but enhance)
    gsap.to('.bio-card', {
      boxShadow: '0 25px 60px rgba(255,0,51,0.15)',
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // ─── Page Reveal with GSAP ─────────────────
  function revealPage() {
    gsap.to(mainWrapper, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' });
    gsap.from('.banner-frame', { scale: 0.96, y: 20, duration: 1, delay: 0.4 });
    gsap.from('.avatar-anchor', { scale: 0.8, y: 30, duration: 1, delay: 0.6, ease: 'back.out(1.4)' });
    gsap.from('.identity', { opacity: 0, y: 20, duration: 0.8, delay: 0.8 });
    gsap.from('.bio-card', { opacity: 0, y: 30, duration: 0.9, delay: 1 });
    gsap.from('.section-title', { opacity: 0, y: 15, duration: 0.7, delay: 1.2 });
    gsap.from('.link-card', {
      opacity: 0, y: 40, scale: 0.9, stagger: { each: 0.08 }, duration: 0.7, delay: 1.4, ease: 'back.out(1.2)'
    });
    gsap.from('.site-footer', { opacity: 0, y: 20, duration: 0.7, delay: 1.6 });
  }

  // ─── Boot Sequence ─────────────────────────
  function boot() {
    initWebGL();
    animate();
    updateVisitorCount();

    // Short artificial delay
    setTimeout(() => {
      preloader.classList.add('hidden');
      setTimeout(() => { revealPage(); addIdleAnimations(); }, 500);
    }, 700);
  }

  // ─── Resize Handler ────────────────────────
  window.addEventListener('resize', () => {
    if (renderer) {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
  });

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
