/* ═══════════════════════════════════════════════════════════
   TR7 · main.js — Interactive Neon Fluid Background
   Three.js + GSAP + Cinematic Entrance + Visitor Counter
   ═══════════════════════════════════════════════════════════ */

import * as THREE from 'three';

// ──────────────────────────────────────────────
// 1. DOM References & Config
// ──────────────────────────────────────────────
const preloader       = document.getElementById('preloader');
const preloaderText   = document.getElementById('preloader-text');
const mainWrapper     = document.getElementById('main-content');
const linksGrid       = document.getElementById('links-grid');
const visitCountEl    = document.getElementById('visit-count');
const canvas          = document.getElementById('webgl-canvas');

let config;
try {
  config = JSON.parse(document.getElementById('site-config').textContent);
} catch (e) {
  console.error('Invalid site config');
  config = { profile:{}, branding:{}, colors:{}, texts:{}, links:[] };
}

// ──────────────────────────────────────────────
// 2. Utility Functions
// ──────────────────────────────────────────────
const W = () => window.innerWidth;
const H = () => window.innerHeight;
const DPR = () => Math.min(window.devicePixelRatio, 2); // cap for performance

// ──────────────────────────────────────────────
// 3. Preloader Management
// ──────────────────────────────────────────────
const hidePreloader = () => {
  preloader.classList.add('hidden');
  setTimeout(() => {
    preloader.style.display = 'none';
  }, 800);
};

// Update preloader text to show progress (fake stages)
const updatePreloaderText = (msg) => {
  if (preloaderText) preloaderText.textContent = msg;
};

// ──────────────────────────────────────────────
// 4. Three.js Scene Setup
// ──────────────────────────────────────────────
let scene, camera, renderer;
let fluidParticles; // our interactive particle system
let mouse = new THREE.Vector2(0.5, 0.5);          // normalized screen coords
let targetMouse = new THREE.Vector2(0.5, 0.5);
let mouseInfluence = false;
let clock = new THREE.Clock();

// Particle system parameters
const PARTICLE_COUNT  = mobileCheck() ? 160 : 280;
const GRID_COLS       = mobileCheck() ? 16 : 20;
const GRID_ROWS       = Math.ceil(PARTICLE_COUNT / GRID_COLS);
const SPACING         = 1.0; // base spacing in world units (will be scaled)
const RESTITUTION     = 0.08; // return to original position strength
const REPULSION       = 1.5; // mouse repulsion strength
const MAX_FORCE       = 0.4;
const DAMPING         = 0.92;

// Original grid positions (rest positions)
let originalPositions = new Float32Array(PARTICLE_COUNT * 3);
// Current positions & velocities
let positions = new Float32Array(PARTICLE_COUNT * 3);
let velocities = new Float32Array(PARTICLE_COUNT * 3);

// Sprite texture for glowing point
let glowTexture;

function mobileCheck() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 640;
}

function initThree() {
  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    canvas,
    alpha: false,
    antialias: false,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(DPR());
  renderer.setSize(W(), H());
  renderer.setClearColor(new THREE.Color(config.colors.bg || '#030000'));

  // Scene & Camera (orthographic)
  scene = new THREE.Scene();
  const aspect = W() / H();
  const viewSize = 10; // world units height
  camera = new THREE.OrthographicCamera(-viewSize * aspect, viewSize * aspect, viewSize, -viewSize, 0.1, 100);
  camera.position.z = 5;

  // Generate glow texture via canvas
  glowTexture = createGlowTexture();

  // Create particle system
  createParticleSystem();

  // Add ambient neon ring (decorative)
  addNeonRing();

  // Start render loop
  animate();
}

function createGlowTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, 'rgba(255, 50, 80, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 0, 51, 0.9)');
  gradient.addColorStop(0.5, 'rgba(200, 0, 30, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createParticleSystem() {
  // Populate original grid positions
  const cols = GRID_COLS;
  const rows = GRID_ROWS;
  const spacing = SPACING;
  const offsetX = (cols - 1) * spacing * 0.5;
  const offsetY = (rows - 1) * spacing * 0.5;
  
  let idx = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (idx >= PARTICLE_COUNT) break;
      const x = j * spacing - offsetX;
      const y = i * spacing - offsetY;
      originalPositions[idx * 3]     = x;
      originalPositions[idx * 3 + 1] = y;
      originalPositions[idx * 3 + 2] = 0;
      positions[idx * 3]     = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = 0;
      velocities[idx * 3]     = 0;
      velocities[idx * 3 + 1] = 0;
      velocities[idx * 3 + 2] = 0;
      idx++;
    }
  }

  // Geometry & Material
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  // Custom sizes for each particle (based on distance to mouse? we'll update in loop)
  geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT), 1));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT), 1));
  
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: glowTexture },
      uTime:    { value: 0 }
    },
    vertexShader: /* glsl */ `
      attribute float size;
      attribute float alpha;
      varying float vAlpha;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z); // adjust for perspective? ortho so constant factor
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = alpha;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      uniform sampler2D uTexture;
      void main() {
        vec4 texColor = texture2D(uTexture, gl_PointCoord);
        gl_FragColor = vec4(texColor.rgb, texColor.a * vAlpha);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    transparent: true
  });

  fluidParticles = new THREE.Points(geometry, material);
  scene.add(fluidParticles);

  // Initial alpha/size
  updateParticleAttributes();
}

// Add a subtle rotating neon ring behind particles
function addNeonRing() {
  const ringGeo = new THREE.TorusGeometry(4.5, 0.02, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(config.colors.primary || '#ff0033'),
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.z = -1;
  scene.add(ring);
  // Rotate slowly
  ring.userData = { speed: 0.1 };
  // We'll update rotation in loop
  fluidParticles.userData = { ring };
}

// ──────────────────────────────────────────────
// 5. Animation Loop & Particle Physics
// ──────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.1); // cap dt
  // Smooth mouse movement
  mouse.lerp(targetMouse, 0.1);
  
  // Update particle positions based on mouse influence
  updateParticles(dt, mouse);

  // Update ring rotation
  if (fluidParticles.userData.ring) {
    fluidParticles.userData.ring.rotation.z += fluidParticles.userData.ring.userData.speed * dt;
  }

  // Update shader time uniform (optional)
  if (fluidParticles.material.uniforms) {
    fluidParticles.material.uniforms.uTime.value += dt;
  }

  renderer.render(scene, camera);
}

function updateParticles(dt, currentMouse) {
  const cols = GRID_COLS;
  const rows = GRID_ROWS;
  const spacing = SPACING;
  const offsetX = (cols - 1) * spacing * 0.5;
  const offsetY = (rows - 1) * spacing * 0.5;
  
  // Convert mouse to world coordinates (mapping [0,1] to world range)
  // Ortho camera: left = -viewSize*aspect, right = +viewSize*aspect, top = viewSize, bottom = -viewSize
  const viewAspect = W() / H();
  const worldWidth = 10 * viewAspect;
  const worldHeight = 10;
  const mx = (currentMouse.x - 0.5) * worldWidth;
  const my = (0.5 - currentMouse.y) * worldHeight; // flip Y

  const sizes = new Float32Array(PARTICLE_COUNT);
  const alphas = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const ox = originalPositions[i3];
    const oy = originalPositions[i3 + 1];
    let px = positions[i3];
    let py = positions[i3 + 1];
    let vx = velocities[i3];
    let vy = velocities[i3 + 1];

    // Force towards original position (elastic)
    const dxOrigin = ox - px;
    const dyOrigin = oy - py;
    vx += dxOrigin * RESTITUTION;
    vy += dyOrigin * RESTITUTION;

    // Mouse repulsion (if mouseInfluence)
    if (mouseInfluence) {
      const dxMouse = px - mx;
      const dyMouse = py - my;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse) + 0.01;
      const forceMag = REPULSION / (distMouse * distMouse + 0.8);
      const forceX = (dxMouse / distMouse) * forceMag;
      const forceY = (dyMouse / distMouse) * forceMag;
      vx += forceX;
      vy += forceY;
    }

    // Clamp force
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > MAX_FORCE) {
      vx = (vx / speed) * MAX_FORCE;
      vy = (vy / speed) * MAX_FORCE;
    }

    // Damping
    vx *= DAMPING;
    vy *= DAMPING;

    // Update position
    px += vx * dt * 2.5; // speed factor
    py += vy * dt * 2.5;

    // Store back
    positions[i3]     = px;
    positions[i3 + 1] = py;
    velocities[i3]    = vx;
    velocities[i3 + 1] = vy;

    // Compute size & alpha based on velocity / distance from origin
    const distOrigin = Math.sqrt(dxOrigin * dxOrigin + dyOrigin * dyOrigin);
    const vel = Math.sqrt(vx * vx + vy * vy);
    const size = 0.08 + vel * 2.5;
    const alpha = 0.4 + vel * 4.0;
    sizes[i] = size;
    alphas[i] = Math.min(alpha, 1.0);
  }

  // Update geometry attributes
  fluidParticles.geometry.attributes.position.needsUpdate = true;
  fluidParticles.geometry.attributes.size.array.set(sizes);
  fluidParticles.geometry.attributes.size.needsUpdate = true;
  fluidParticles.geometry.attributes.alpha.array.set(alphas);
  fluidParticles.geometry.attributes.alpha.needsUpdate = true;
}

// ──────────────────────────────────────────────
// 6. Event Handlers (Mouse, Touch, Gyro, Resize)
// ──────────────────────────────────────────────
function onMouseMove(e) {
  targetMouse.x = e.clientX / W();
  targetMouse.y = e.clientY / H();
  mouseInfluence = true;
}
function onMouseLeave() {
  mouseInfluence = false;
  targetMouse.set(0.5, 0.5);
}
function onTouchMove(e) {
  if (e.touches.length) {
    targetMouse.x = e.touches[0].clientX / W();
    targetMouse.y = e.touches[0].clientY / H();
    mouseInfluence = true;
  }
}
function onTouchEnd() {
  mouseInfluence = false;
  targetMouse.set(0.5, 0.5);
}

// Gyroscope parallax (mobile)
let gyroEnabled = false;
function enableGyro() {
  if (window.DeviceOrientationEvent && !gyroEnabled) {
    window.addEventListener('deviceorientation', (e) => {
      if (!mouseInfluence) { // only if not touching
        const x = e.gamma / 45; // -1 to 1
        const y = e.beta  / 45;
        targetMouse.x = THREE.MathUtils.clamp((x + 1) / 2, 0, 1);
        targetMouse.y = THREE.MathUtils.clamp((y + 1) / 2, 0, 1);
      }
    }, true);
    gyroEnabled = true;
  }
}

function onResize() {
  renderer.setSize(W(), H());
  const aspect = W() / H();
  camera.left = -5 * aspect;
  camera.right = 5 * aspect;
  camera.top = 5;
  camera.bottom = -5;
  camera.updateProjectionMatrix();
}

// ──────────────────────────────────────────────
// 7. Visitor Counter (API + localStorage fallback)
// ──────────────────────────────────────────────
const LS_KEY = 'tr7_lv_v2';

async function updateVisitorCount() {
  async function tryFetch() {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 4000);
    try {
      const res = await fetch('https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits/up', {
        signal: ctrl.signal,
        cache: 'no-store'
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error('API fail');
      const data = await res.json();
      const val = data.count ?? data.value ?? data.hits;
      if (val != null) {
        rollNumber(parseInt(val));
        return;
      }
    } catch (e) {
      clearTimeout(timeout);
    }
    // Fallback to localStorage
    let stored = parseInt(localStorage.getItem(LS_KEY)) || 0;
    stored++;
    localStorage.setItem(LS_KEY, stored.toString());
    rollNumber(stored);
  }

  tryFetch();

  // Refresh every 30 seconds silently
  setInterval(async () => {
    try {
      const res = await fetch('https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const val = data.count ?? data.value;
        if (val != null) {
          const current = parseInt(visitCountEl.textContent?.replace(/[^0-9]/g, '') || '0');
          if (parseInt(val) !== current) rollNumber(parseInt(val));
        }
      }
    } catch (e) {}
  }, 30000);
}

function rollNumber(target) {
  if (!visitCountEl) return;
  const from = parseInt(visitCountEl.textContent?.replace(/[^0-9]/g, '') || '0');
  if (from === target) return;
  const diff = target - from;
  const steps = Math.min(Math.abs(diff), 60);
  const interval = Math.max(16, Math.floor(700 / steps));
  let i = 0;
  const timer = setInterval(() => {
    i++;
    visitCountEl.textContent = Math.round(from + diff * i / steps).toLocaleString('en-US');
    visitCountEl.style.transform = 'scale(1.25)';
    setTimeout(() => visitCountEl.style.transform = 'scale(1)', 120);
    if (i >= steps) {
      clearInterval(timer);
      visitCountEl.textContent = target.toLocaleString('en-US');
    }
  }, interval);
}

// ──────────────────────────────────────────────
// 8. GSAP Cinematic Entrance & Link Rendering
// ──────────────────────────────────────────────
function renderLinks() {
  if (!linksGrid) return;
  const links = config.links || [];
  linksGrid.innerHTML = links.map(link => `
    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-card" data-id="${link.id}">
      <div class="card-glow"></div>
      <div class="card-sheen"></div>
      <div class="link-icon-wrap">
        <i class="${link.icon}" aria-hidden="true"></i>
      </div>
      <span class="link-name">${link.name}</span>
      <span class="link-handle">${link.handle || ''}</span>
    </a>
  `).join('');
}

function revealPage() {
  // Stagger animation for each major section
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(mainWrapper, {
    opacity: 1,
    y: 0,
    duration: 1.2,
  })
  .from('.hero-banner-frame', { scale: 0.96, y: 20, duration: 0.9 }, '-=0.8')
  .from('.hero-avatar-anchor', { scale: 0.8, y: 30, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.6')
  .from('.hero-identity', { opacity: 0, y: 25, duration: 0.7 }, '-=0.5')
  .from('.hero-bio-card', { opacity: 0, y: 30, scale: 0.98, duration: 0.8 }, '-=0.5')
  .from('.links-header', { opacity: 0, y: 15, duration: 0.6 }, '-=0.4')
  .from('.link-card', {
    opacity: 0,
    y: 40,
    scale: 0.9,
    stagger: { each: 0.08, from: 'start' },
    duration: 0.7,
    ease: 'back.out(1.2)'
  }, '-=0.3')
  .from('.site-footer', { opacity: 0, y: 20, duration: 0.7 }, '-=0.4');
}

// ──────────────────────────────────────────────
// 9. Initialization Sequence
// ──────────────────────────────────────────────
async function boot() {
  updatePreloaderText('INITIALIZING RENDERER');
  
  // Initialize Three.js
  initThree();
  
  updatePreloaderText('ASSETS LOADED');

  // Render links
  renderLinks();
  
  // Start visitor counter
  updateVisitorCount();

  // Simulate a brief loading (for cinematic effect) then hide preloader
  await new Promise(resolve => setTimeout(resolve, 800));
  updatePreloaderText('SYSTEM READY');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  hidePreloader();

  // Reveal page with GSAP
  revealPage();

  // Enable gyroscope after page revealed & if mobile
  if (mobileCheck()) {
    // Request permission for iOS 13+ DeviceOrientation
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // We'll trigger on first touch (already done or we can add a button)
      document.addEventListener('click', async () => {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') enableGyro();
        } catch (e) {}
      }, { once: true });
    } else {
      enableGyro();
    }
  }

  // Event Listeners
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', onTouchEnd);
  window.addEventListener('resize', onResize);
  
  // Reduce motion fallback
  const mqReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mqReducedMotion.matches) {
    // Disable particle physics: just stop animating? We'll skip particle updates.
    // Override animate to only render static scene.
  }
}

// Start everything when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
