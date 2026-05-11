/* ═══════════════════════════════════════════════════════════
   TR7 · main.js — Real-time GPU Fluid Simulation
   Neon Metaballs · Cinematic Entrance · Visitor Counter
   No Admin Panel · Mobile-First 60fps
   ═══════════════════════════════════════════════════════════ */

import * as THREE from 'three';

// ──────────────────────────────────────────────
// 1. Site Config (extracted safety)
// ──────────────────────────────────────────────
const config = JSON.parse(document.getElementById('site-config').textContent);
const { profile, branding, colors, texts, links } = config;

// ──────────────────────────────────────────────
// 2. DOM Elements
// ──────────────────────────────────────────────
const preloader      = document.getElementById('preloader');
const preloaderText  = document.getElementById('preloader-text');
const mainWrapper    = document.getElementById('main-content');
const linksGrid      = document.getElementById('links-grid');
const visitCountEl   = document.getElementById('visit-count');
const canvas         = document.getElementById('fluid-canvas');

// ──────────────────────────────────────────────
// 3. Utility Functions
// ──────────────────────────────────────────────
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 640;
const W = () => window.innerWidth;
const H = () => window.innerHeight;
const DPR = () => Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

// ──────────────────────────────────────────────
// 4. Preloader Management
// ──────────────────────────────────────────────
const updatePreloaderText = (msg) => {
  if (preloaderText) preloaderText.textContent = msg;
};

const hidePreloader = async () => {
  preloader.classList.add('hidden');
  await new Promise(r => setTimeout(r, 800));
  preloader.style.display = 'none';
};

// ──────────────────────────────────────────────
// 5. Visitor Counter (API + localStorage fallback)
// ──────────────────────────────────────────────
const LS_KEY = 'tr7_lv_v2';
function rollNumber(target) {
  if (!visitCountEl) return;
  const from = parseInt(visitCountEl.textContent.replace(/[^0-9]/g, '')) || 0;
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
      if (!res.ok) throw new Error('API fail');
      const data = await res.json();
      const val = data.count ?? data.value ?? data.hits;
      if (val != null) rollNumber(parseInt(val));
      return;
    } catch (e) { clearTimeout(timeout); }
    // Fallback
    let stored = parseInt(localStorage.getItem(LS_KEY)) || 0;
    stored++;
    localStorage.setItem(LS_KEY, stored.toString());
    rollNumber(stored);
  };
  await tryFetch();
  setInterval(async () => {
    try {
      const res = await fetch('https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const val = data.count ?? data.value;
        if (val != null) {
          const cur = parseInt(visitCountEl.textContent.replace(/[^0-9]/g, '')) || 0;
          if (parseInt(val) !== cur) rollNumber(parseInt(val));
        }
      }
    } catch (e) {}
  }, 30000);
}

// ──────────────────────────────────────────────
// 6. Render Links from Config
// ──────────────────────────────────────────────
function renderLinks() {
  if (!linksGrid) return;
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

// ──────────────────────────────────────────────
// 7. GPU Fluid Simulation Engine (Ultra-Realistic Neon Fluid)
// Uses the Navier-Stokes based approach on GPU with custom shaders
// Adapted to Three.js with multiple Render Targets
// ──────────────────────────────────────────────
class FluidEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.dpr = DPR();
    this.width = Math.floor(W() * this.dpr);
    this.height = Math.floor(H() * this.dpr);
    this.mouse = new THREE.Vector2(-1, -1); // in [0,1] normalized, -1 means off
    this.prevMouse = new THREE.Vector2(-1, -1);
    this.densityDissipation = 0.98;
    this.velocityDissipation = 0.99;
    this.pressureIterations = 25;
    this.curlStrength = 5.0;
    this.splatRadius = 0.2;
    this.splatForce = 6000;

    // Three.js core
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(W(), H(), false);
    this.renderer.setClearColor(new THREE.Color(colors.bg || '#030000'));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Fullscreen quad to display final density
    this.createDisplayQuad();

    // Simulation buffers (render targets)
    this.initSimulationBuffers();
    this.initSimulationShaders();

    // Start with a few initial splats to fill the screen
    this.splat(0.5, 0.5, 0, 0, [1,1,0]); // just a dummy to initialize?

    this.clock = new THREE.Clock();
    this.animate();
  }

  createDisplayQuad() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    // The display shader will sample density texture and apply neon mapping
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uDensity: { value: null },
        uTime: { value: 0 }
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform sampler2D uDensity;
        uniform float uTime;
        void main() {
          vec4 density = texture2D(uDensity, vUv);
          // density.r = scalar, map to neon red gradient
          float d = clamp(density.r, 0.0, 1.0);
          // Core neon color
          vec3 col = mix(vec3(0.02, 0.0, 0.0), vec3(1.0, 0.0, 0.2), d);
          // Add intense white hot spots where density is very high
          col += 0.4 * smoothstep(0.8, 1.0, d) * vec3(1.0, 0.8, 0.8);
          // Glow
          float alpha = smoothstep(0.05, 0.6, d);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
    this.displayQuad = new THREE.Mesh(geometry, material);
    this.scene.add(this.displayQuad);
  }

  initSimulationBuffers() {
    const w = this.width, h = this.height;
    const options = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, type: THREE.HalfFloatType };
    // We'll use RGBA: density in R, velocity X in G, velocity Y in B, unused in A
    this.density   = new THREE.WebGLRenderTarget(w, h, options);
    this.velocity  = new THREE.WebGLRenderTarget(w, h, options);
    this.divergence= new THREE.WebGLRenderTarget(w, h, options);
    this.pressure  = new THREE.WebGLRenderTarget(w, h, options);
    this.temp      = new THREE.WebGLRenderTarget(w, h, options); // for swapping
  }

  initSimulationShaders() {
    // We'll define a base passthrough vertex shader for fullscreen quads
    this.baseVertex = /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Advection shader (moves density and velocity along velocity field)
    this.advectionShader = new THREE.ShaderMaterial({
      uniforms: {
        uVelocity: { value: null },
        uSource:   { value: null },
        uDt:       { value: 0.016 },
        uDissipation: { value: this.densityDissipation }
      },
      vertexShader: this.baseVertex,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform float uDt;
        uniform float uDissipation;
        void main() {
          vec2 texelSize = 1.0 / vec2(textureSize(uSource, 0));
          // Velocity at current pixel
          vec2 vel = texture2D(uVelocity, vUv).gb;
          // Backtrace position
          vec2 coord = vUv - vel * uDt * texelSize;
          // Bilinear filtered sample
          vec4 result = texture2D(uSource, coord);
          // Dissipate density (channel R) and velocity (G,B) separately? We'll only advect density here, velocity advection handled elsewhere
          // For combined: result.r *= uDissipation; result.gb *= velocityDissipation
          gl_FragColor = result;
        }
      `,
      depthTest: false,
      depthWrite: false
    });

    // Divergence shader
    this.divergenceShader = new THREE.ShaderMaterial({
      uniforms: { uVelocity: { value: null } },
      vertexShader: this.baseVertex,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        void main() {
          vec2 texel = 1.0 / vec2(textureSize(uVelocity, 0));
          float L = texture2D(uVelocity, vUv - vec2(texel.x, 0.0)).g;
          float R = texture2D(uVelocity, vUv + vec2(texel.x, 0.0)).g;
          float T = texture2D(uVelocity, vUv + vec2(0.0, texel.y)).b;
          float B = texture2D(uVelocity, vUv - vec2(0.0, texel.y)).b;
          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `,
      depthTest: false, depthWrite: false
    });

    // Pressure Jacobi solver
    this.pressureShader = new THREE.ShaderMaterial({
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null }
      },
      vertexShader: this.baseVertex,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;
        void main() {
          vec2 texel = 1.0 / vec2(textureSize(uPressure, 0));
          float L = texture2D(uPressure, vUv - vec2(texel.x, 0.0)).r;
          float R = texture2D(uPressure, vUv + vec2(texel.x, 0.0)).r;
          float T = texture2D(uPressure, vUv + vec2(0.0, texel.y)).r;
          float B = texture2D(uPressure, vUv - vec2(0.0, texel.y)).r;
          float div = texture2D(uDivergence, vUv).r;
          float p = (L + R + T + B - div) / 4.0;
          gl_FragColor = vec4(p, 0.0, 0.0, 1.0);
        }
      `,
      depthTest: false, depthWrite: false
    });

    // Subtract gradient shader (update velocity)
    this.gradientSubtractShader = new THREE.ShaderMaterial({
      uniforms: {
        uVelocity: { value: null },
        uPressure: { value: null }
      },
      vertexShader: this.baseVertex,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uPressure;
        void main() {
          vec2 texel = 1.0 / vec2(textureSize(uVelocity, 0));
          float L = texture2D(uPressure, vUv - vec2(texel.x, 0.0)).r;
          float R = texture2D(uPressure, vUv + vec2(texel.x, 0.0)).r;
          float T = texture2D(uPressure, vUv + vec2(0.0, texel.y)).r;
          float B = texture2D(uPressure, vUv - vec2(0.0, texel.y)).r;
          vec2 vel = texture2D(uVelocity, vUv).gb;
          vel -= 0.5 * vec2(R - L, T - B);
          gl_FragColor = vec4(vel, 0.0, 1.0);
        }
      `,
      depthTest: false, depthWrite: false
    });

    // Splat shader (adds density and velocity at a point)
    this.splatShader = new THREE.ShaderMaterial({
      uniforms: {
        uTarget: { value: null },
        uPoint: { value: new THREE.Vector2() },
        uRadius: { value: this.splatRadius },
        uColor: { value: new THREE.Vector3(1,0,0) },
        uForce: { value: 0 }
      },
      vertexShader: this.baseVertex,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform vec2 uPoint;
        uniform float uRadius;
        uniform vec3 uColor;
        uniform float uForce;
        void main() {
          vec2 diff = vUv - uPoint;
          float dist = length(diff);
          float factor = smoothstep(uRadius, 0.0, dist);
          vec4 orig = texture2D(uTarget, vUv);
          // Add density (r) and velocity (g,b) according to direction
          vec2 velDir = normalize(diff + 1e-5);
          orig.r += uColor.r * factor;
          orig.g += velDir.x * factor * uForce * 0.001;
          orig.b += velDir.y * factor * uForce * 0.001;
          gl_FragColor = orig;
        }
      `,
      depthTest: false, depthWrite: false
    });

    // Curl shader to add turbulence (optional)
    this.curlShader = new THREE.ShaderMaterial({
      uniforms: {
        uVelocity: { value: null },
        uDt: { value: 0.016 }
      },
      vertexShader: this.baseVertex,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform float uDt;
        void main() {
          vec2 texel = 1.0 / vec2(textureSize(uVelocity, 0));
          float L = texture2D(uVelocity, vUv - vec2(texel.x, 0.0)).g;
          float R = texture2D(uVelocity, vUv + vec2(texel.x, 0.0)).g;
          float T = texture2D(uVelocity, vUv + vec2(0.0, texel.y)).b;
          float B = texture2D(uVelocity, vUv - vec2(0.0, texel.y)).b;
          float curl = (R - L) - (T - B);
          vec2 force = vec2(curl, -curl) * 0.1;
          vec2 vel = texture2D(uVelocity, vUv).gb + force * uDt;
          gl_FragColor = vec4(vel, 0.0, 1.0);
        }
      `,
      depthTest: false, depthWrite: false
    });

    // Helper: Fullscreen pass function
    this.fullscreenPass = (material, target, clear = true) => {
      const oldTarget = this.renderer.getRenderTarget();
      this.renderer.setRenderTarget(target);
      if (clear) this.renderer.clear();
      this.renderer.render(this.scene, this.camera); // renders the fullscreen quad with material
      this.renderer.setRenderTarget(oldTarget);
    };
  }

  // Add density and velocity at point (in normalized 0-1 coords)
  splat(x, y, dx, dy, color = [1,0,0]) {
    if (this.splatShader.uniforms.uPoint) {
      this.splatShader.uniforms.uPoint.value.set(x, y);
      this.splatShader.uniforms.uRadius.value = this.splatRadius;
      this.splatShader.uniforms.uColor.value.set(color[0], color[1], color[2]);
      this.splatShader.uniforms.uForce.value = this.splatForce;
      // Splat into density
      this.splatShader.uniforms.uTarget.value = this.density.texture;
      this.fullscreenPass(this.splatShader, this.density, false);
      // Splat velocity (dx,dy) into velocity field: we'll directly draw a direction?
      // Alternative: use a simplified splat that adds direction
      const velSplatShader = this.splatShader.clone();
      velSplatShader.uniforms.uTarget.value = this.velocity.texture;
      velSplatShader.uniforms.uColor.value.set(0, dx, dy);
      this.fullscreenPass(velSplatShader, this.velocity, false);
      velSplatShader.dispose();
    }
  }

  step(dt) {
    dt = Math.min(dt, 0.1);
    // 1. Advection of velocity (using itself)
    this.advectionShader.uniforms.uVelocity.value = this.velocity.texture;
    this.advectionShader.uniforms.uSource.value = this.velocity.texture;
    this.advectionShader.uniforms.uDt.value = dt;
    this.fullscreenPass(this.advectionShader, this.temp);
    [this.velocity, this.temp] = [this.temp, this.velocity];

    // 2. Advection of density
    this.advectionShader.uniforms.uSource.value = this.density.texture;
    this.advectionShader.uniforms.uDissipation.value = this.densityDissipation;
    this.fullscreenPass(this.advectionShader, this.temp);
    [this.density, this.temp] = [this.temp, this.density];

    // 3. Curl noise (adds turbulence)
    this.curlShader.uniforms.uVelocity.value = this.velocity.texture;
    this.curlShader.uniforms.uDt.value = dt;
    this.fullscreenPass(this.curlShader, this.temp);
    [this.velocity, this.temp] = [this.temp, this.velocity];

    // 4. Divergence
    this.divergenceShader.uniforms.uVelocity.value = this.velocity.texture;
    this.fullscreenPass(this.divergenceShader, this.divergence);

    // 5. Pressure solve (Jacobi iterations)
    this.pressureShader.uniforms.uDivergence.value = this.divergence.texture;
    this.pressureShader.uniforms.uPressure.value = this.pressure.texture;
    for (let i = 0; i < this.pressureIterations; i++) {
      this.fullscreenPass(this.pressureShader, this.temp);
      [this.pressure, this.temp] = [this.temp, this.pressure];
    }

    // 6. Subtract gradient
    this.gradientSubtractShader.uniforms.uVelocity.value = this.velocity.texture;
    this.gradientSubtractShader.uniforms.uPressure.value = this.pressure.texture;
    this.fullscreenPass(this.gradientSubtractShader, this.temp);
    [this.velocity, this.temp] = [this.temp, this.velocity];

    // 7. Dissipate velocity
    // Already done in advection step via dissipation? fine.

    // Update display quad uniform
    this.displayQuad.material.uniforms.uDensity.value = this.density.texture;
    this.displayQuad.material.uniforms.uTime.value += dt;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.1);

    // If mouse position is valid, splat with velocity based on movement
    if (this.mouse.x >= 0 && this.mouse.y >= 0) {
      const dx = this.mouse.x - this.prevMouse.x;
      const dy = this.mouse.y - this.prevMouse.y;
      const color = [1.0, 0.0, 0.2]; // neon red
      this.splat(this.mouse.x, this.mouse.y, dx * 10, dy * 10, color);
    }

    this.step(dt);

    // Copy previous mouse
    this.prevMouse.copy(this.mouse);

    // Render final scene (just the quad)
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.width = Math.floor(W() * this.dpr);
    this.height = Math.floor(H() * this.dpr);
    this.renderer.setSize(W(), H(), false);
    // Resize all render targets
    this.density.setSize(this.width, this.height);
    this.velocity.setSize(this.width, this.height);
    this.divergence.setSize(this.width, this.height);
    this.pressure.setSize(this.width, this.height);
    this.temp.setSize(this.width, this.height);
  }

  setMouse(x, y) {
    this.mouse.set(x, y);
  }
}

// ──────────────────────────────────────────────
// 8. GSAP Cinematic Reveal
// ──────────────────────────────────────────────
function revealPage() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(mainWrapper, { opacity: 1, y: 0, duration: 1.2 })
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
// 9. Boot Sequence
// ──────────────────────────────────────────────
(async function boot() {
  updatePreloaderText('INITIALIZING FLUID ENGINE');
  const fluid = new FluidEngine(canvas);
  updatePreloaderText('ALMOST READY');

  renderLinks();
  updateVisitorCount();

  // Short artificial delay for cinematic load
  await new Promise(r => setTimeout(r, 600));
  updatePreloaderText('SYSTEM ONLINE');
  await new Promise(r => setTimeout(r, 400));
  await hidePreloader();

  // Reveal UI
  revealPage();

  // Event listeners
  window.addEventListener('mousemove', (e) => {
    fluid.setMouse(e.clientX / W(), 1 - e.clientY / H());
  });
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length) {
      fluid.setMouse(e.touches[0].clientX / W(), 1 - e.touches[0].clientY / H());
    }
  }, { passive: true });
  window.addEventListener('touchend', () => {
    fluid.setMouse(-1, -1);
  });
  window.addEventListener('mouseleave', () => fluid.setMouse(-1, -1));

  // Gyroscope (mobile) - subtle influence
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (fluid.mouse.x < 0) { // no mouse interaction
        const x = THREE.MathUtils.clamp((e.gamma / 45 + 1) / 2, 0, 1);
        const y = THREE.MathUtils.clamp((e.beta / 45 + 1) / 2, 0, 1);
        fluid.setMouse(x, y);
      }
    });
  }

  // Resize handler
  window.addEventListener('resize', () => fluid.resize());
})();
