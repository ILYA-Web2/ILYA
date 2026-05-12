/* ════════════════════════════════════════════════════════
   ILYA · main.js
   Premium WebGL Geometric Scene + GSAP Cinematic Idle
   Optimized for 60fps Mobile · No Lag
   ════════════════════════════════════════════════════════ */

'use strict';

/* ─── Tiny helpers ─── */
const qs    = (s, p = document) => p.querySelector(s);
const qsa   = (s, p = document) => [...p.querySelectorAll(s)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const CFG   = window.TR7 || {}; // Fallback for config

const LOADER_MSGS = [
  'INITIALIZING ILYA SYSTEM',
  'LOADING ASSETS',
  'CALIBRATING 3D RENDERER',
  'BUILDING GEOMETRY',
  'SYSTEM ONLINE'
];

/* ════════════════════════════════════════════════════════
   VISITOR COUNTER
════════════════════════════════════════════════════════ */
function initVisitor() {
  try {
    const n = (parseInt(localStorage.getItem('ilya_vc') || '0', 10)) + 1;
    localStorage.setItem('ilya_vc', String(n));
    const el = qs('#visit-count');
    if (el) el.textContent = n.toLocaleString('en-US');
  } catch (_) {}
}

/* ════════════════════════════════════════════════════════
   BUILD LINK CARDS
════════════════════════════════════════════════════════ */
function buildLinks() {
  const grid  = qs('#links-grid');
  const links = Array.isArray(CFG.links) ? CFG.links : [];
  if (!grid || !links.length) return;

  grid.innerHTML = '';
  links.forEach(({ name = '', url = '#', icon = '', handle = '', color = '#ff0033' }) => {
    const a = document.createElement('a');
    a.className = 'app-card';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', name);
    a.innerHTML = `
      <div class="aib" style="box-shadow:0 0 20px ${color}40,0 5px 15px rgba(0,0,0,.8);">
        <i class="${icon}" style="color:${color};" aria-hidden="true"></i>
      </div>
      <span class="an">${name}</span>
    `;
    grid.appendChild(a);
  });
}

/* ════════════════════════════════════════════════════════
   LOADER
════════════════════════════════════════════════════════ */
function runLoader(onComplete) {
  const loader = qs('#loader');
  const fillEl = qs('#ldr-fill');
  const headEl = qs('#ldr-head');
  const pctEl  = qs('#ldr-pct');
  const statEl = qs('#ldr-status');
  if (!loader) { onComplete(); return; }

  let pct = 0, msgIdx = 0, raf;
  const start  = performance.now();
  const minMs  = 2500; // تحميل أسرع قليلاً

  function tick(now) {
    const natural = clamp((now - start) / minMs * 100, 0, 100);
    pct = clamp(pct + (natural - pct) * 0.08, 0, 100);
    const pi = Math.round(pct);

    if (fillEl) fillEl.style.width = pct + '%';
    if (headEl) headEl.style.right = (100 - pct) + '%';
    if (pctEl)  pctEl.textContent  = pi + '%';

    const ni = Math.min(Math.floor(pct / 25), LOADER_MSGS.length - 1);
    if (ni !== msgIdx) {
      msgIdx = ni;
      if (statEl) {
        statEl.style.opacity = '0';
        setTimeout(() => { if (statEl) { statEl.textContent = LOADER_MSGS[msgIdx]; statEl.style.opacity = '1'; } }, 150);
      }
    }

    if (pct < 99.9) {
      raf = requestAnimationFrame(tick);
    } else {
      if (pctEl) pctEl.textContent = '100%';
      setTimeout(() => {
        loader.classList.add('hidden');
        loader.addEventListener('transitionend', () => { loader.remove(); onComplete(); }, { once: true });
      }, 300);
    }
  }
  raf = requestAnimationFrame(tick);

  // Fallback in case animation gets stuck
  setTimeout(() => {
    cancelAnimationFrame(raf);
    if (loader.isConnected) {
      loader.classList.add('hidden');
      setTimeout(() => { loader.remove(); onComplete(); }, 500);
    }
  }, 6000);
}

/* ════════════════════════════════════════════════════════
   WebGL — PREMIUM GEOMETRIC SHAPES
════════════════════════════════════════════════════════ */
const PremiumScene = (() => {
  let renderer, scene, camera, shapesGroup, particles;
  let light1, light2;
  let W = window.innerWidth, H = window.innerHeight;
  const mouse      = { x: 0, y: 0 };
  const targetRot  = { x: 0, y: 0 };
  const currentRot = { x: 0, y: 0 };
  let animId;

  function init() {
    if (typeof THREE === 'undefined') return;
    const canvas = qs('#canvas-bg');
    if (!canvas) return;

    // تحديد الدقة لمنع اللاج على الجوال (نحدها بـ 1.5 أو 2 كحد أقصى)
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H);
    renderer.setClearColor(0x020000, 1); // خلفية سوداء عميقة

    scene  = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020000, 0.05);

    camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 12);

    shapesGroup = new THREE.Group();
    scene.add(shapesGroup);

    // 1. الخامات (Material): مظهر معدني/زجاجي فخم يشبه الآيفون
    const premiumMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0002,      // أسود مائل للأحمر الداكن
      metalness: 0.9,       // انعكاس عالي جداً
      roughness: 0.15,      // نعومة عالية
      flatShading: false
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0033,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });

    // 2. الأشكال الهندسية المعقدة (عالية الدقة)
    const geometries = [
      new THREE.TorusKnotGeometry(1.8, 0.6, 128, 32),
      new THREE.IcosahedronGeometry(2, 0),
      new THREE.OctahedronGeometry(2, 0)
    ];

    geometries.forEach((geo, index) => {
      const mesh = new THREE.Mesh(geo, premiumMaterial);
      const wire = new THREE.Mesh(geo, wireframeMaterial);
      
      // تكوين طبقتين (صلبة + إطار خفيف جداً) لزيادة التفاصيل
      mesh.add(wire);
      
      // توزيع الأشكال في الفراغ
      mesh.position.x = (Math.random() - 0.5) * 15;
      mesh.position.y = (Math.random() - 0.5) * 15;
      mesh.position.z = (Math.random() - 0.5) * 10 - 5;
      
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      // سرعة دوران خاصة بكل شكل
      mesh.userData = {
        rx: (Math.random() - 0.5) * 0.01,
        ry: (Math.random() - 0.5) * 0.01,
        rz: (Math.random() - 0.5) * 0.01
      };

      shapesGroup.add(mesh);
    });

    // 3. جزيئات خلفية بسيطة للعمق
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 300; // عدد قليل للحفاظ على الأداء
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i<particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 30;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xff3355,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // 4. الإضاءة السينمائية (التي تعطي اللمعان للأشكال)
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    light1 = new THREE.PointLight(0xff0033, 3, 50); // إضاءة حمراء نيون
    scene.add(light1);

    light2 = new THREE.PointLight(0xffffff, 1.5, 50); // إضاءة بيضاء ناصعة
    scene.add(light2);

    // 5. حساسات اللمس والماوس للتفاعل
    const updateMouse = (clientX, clientY) => {
      mouse.x = (clientX / W) * 2 - 1;
      mouse.y = -(clientY / H) * 2 + 1;
    };

    window.addEventListener('mousemove', e => updateMouse(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', e => {
      if (e.touches.length > 0) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    let t0 = null;
    function frame(now) {
      animId = requestAnimationFrame(frame);
      if (!t0) t0 = now;
      const t = (now - t0) * 0.001;

      // تحريك الإضاءة بشكل دائري حول الأشكال
      light1.position.x = Math.sin(t * 0.5) * 8;
      light1.position.y = Math.cos(t * 0.3) * 8;
      light1.position.z = Math.sin(t * 0.2) * 8;

      light2.position.x = Math.cos(t * 0.4) * 6;
      light2.position.y = Math.sin(t * 0.6) * 6;
      light2.position.z = Math.cos(t * 0.3) * 6;

      // دوران الأشكال ذاتياً
      shapesGroup.children.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rx;
        mesh.rotation.y += mesh.userData.ry;
        mesh.rotation.z += mesh.userData.rz;
      });

      // حركة الجزيئات ببطء
      particles.rotation.y = t * 0.02;

      // تفاعل ناعم جداً مع اللمس/الماوس (Lerp)
      targetRot.x = mouse.y * 0.5;
      targetRot.y = mouse.x * 0.5;
      
      currentRot.x += (targetRot.x - currentRot.x) * 0.05;
      currentRot.y += (targetRot.y - currentRot.y) * 0.05;

      shapesGroup.rotation.x = currentRot.x;
      shapesGroup.rotation.y = currentRot.y;

      // حركة الكاميرا الطفيفة مع التنفس
      camera.position.x = currentRot.y * 2;
      camera.position.y = -currentRot.x * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animId = requestAnimationFrame(frame);

    window.addEventListener('resize', onResize, { passive: true });
  }

  function onResize() {
    W = window.innerWidth; H = window.innerHeight;
    if (!renderer) return;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  }

  function destroy() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);
    if (renderer) renderer.dispose();
  }

  return { init, destroy };
})();

/* ════════════════════════════════════════════════════════
   GSAP CINEMATIC IDLE ANIMATIONS
════════════════════════════════════════════════════════ */
function initGSAP() {
  if (typeof gsap === 'undefined') return;

  // دخول البطاقة الزجاجية
  gsap.fromTo('#main-card',
    { opacity: 0, y: 40, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 1.8, ease: 'power3.out', delay: 0.2 }
  );

  // طفو الصورة الشخصية
  gsap.to('#profile-wrap', {
    y: -10, duration: 3.5,
    ease: 'power1.inOut', yoyo: true, repeat: -1
  });

  // طفو خفيف للبطاقة بالكامل
  gsap.to('#main-card', {
    y: '-=6', duration: 6,
    ease: 'sine.inOut', yoyo: true, repeat: -1,
    delay: 1
  });

  // دخول الروابط بشكل متتالي
  qsa('.app-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.5)', delay: 0.6 + (i * 0.1) }
    );
  });
}

/* ════════════════════════════════════════════════════════
   IMAGE MODAL
════════════════════════════════════════════════════════ */
function initModal() {
  const modal    = qs('#img-modal');
  const modalImg = qs('#modal-img');
  const closeBtn = qs('#modal-close');
  if (!modal || !modalImg || !closeBtn) return;

  function open(src) {
    if (!src) return;
    modalImg.src = src;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { modalImg.src = ''; }, 400);
  }

  const bannerWrap  = qs('#banner-wrap');
  const profileWrap = qs('#profile-wrap');
  const bannerImg   = qs('#banner-img');
  const profileImg  = qs('#profile-img');

  if (bannerWrap && bannerImg) bannerWrap.addEventListener('click', () => open(bannerImg.src));
  if (profileWrap && profileImg) profileWrap.addEventListener('click', () => open(profileImg.src));

  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
}

/* ════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════ */
function boot() {
  buildLinks();
  initVisitor();
  initModal();
  PremiumScene.init(); // تشغيل مشهد الـ 3D الجديد

  runLoader(() => {
    initGSAP();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

window.addEventListener('pagehide', () => PremiumScene.destroy(), { once: true });
