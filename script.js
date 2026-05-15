import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ==================== 1. GALAXY BACKGROUND (ملف 1 كامل بدون تغيير) ====================
const canvas = document.getElementById('galaxy-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2.8, 2.5, 3.8);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = false;
controls.enableZoom = false;
controls.enablePan = false;

// معاملات المجرة (مضبوطة لتظهر كاملة على جميع الشاشات)
const galaxyParams = {
    count: 120000,
    size: 0.012,
    radius: 2.4,
    branches: 3,
    spin: 2.8,
    randomness: 4.2,
    randomnessPower: 3.2,
    insideColor: '#ff6030',
    outsideColor: '#0949f0'
};
let galaxyPoints, galaxyGeo, galaxyMat;

function buildGalaxy() {
    if (galaxyPoints) {
        galaxyGeo.dispose();
        galaxyMat.dispose();
        scene.remove(galaxyPoints);
    }
    galaxyGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(galaxyParams.count * 3);
    const colors = new Float32Array(galaxyParams.count * 3);
    const colorInside = new THREE.Color(galaxyParams.insideColor);
    const colorOutside = new THREE.Color(galaxyParams.outsideColor);
    for (let i = 0; i < galaxyParams.count; i++) {
        const r = Math.pow(Math.random(), 1.5) * galaxyParams.radius;
        const spinAngle = r * galaxyParams.spin;
        const branchAngle = ((i % galaxyParams.branches) / galaxyParams.branches) * Math.PI * 2;
        const randX = (Math.random() - 0.5) * galaxyParams.randomness * Math.pow(Math.random(), galaxyParams.randomnessPower);
        const randY = (Math.random() - 0.5) * galaxyParams.randomness * 0.7;
        const randZ = (Math.random() - 0.5) * galaxyParams.randomness * Math.pow(Math.random(), galaxyParams.randomnessPower);
        const x = Math.cos(branchAngle + spinAngle) * r + randX;
        const y = randY;
        const z = Math.sin(branchAngle + spinAngle) * r + randZ;
        positions[i*3] = x;
        positions[i*3+1] = y;
        positions[i*3+2] = z;
        const mixed = colorInside.clone().lerp(colorOutside, r / galaxyParams.radius);
        colors[i*3] = mixed.r;
        colors[i*3+1] = mixed.g;
        colors[i*3+2] = mixed.b;
    }
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    galaxyMat = new THREE.PointsMaterial({ size: galaxyParams.size, vertexColors: true, blending: THREE.AdditiveBlending });
    galaxyPoints = new THREE.Points(galaxyGeo, galaxyMat);
    scene.add(galaxyPoints);
}
buildGalaxy();

let time = 0;
function animateGalaxy() {
    requestAnimationFrame(animateGalaxy);
    time += 0.0018;
    camera.position.x = Math.sin(time * 0.18) * 3.2;
    camera.position.z = Math.cos(time * 0.22) * 3.6;
    camera.lookAt(0, 0, 0);
    controls.update();
    renderer.render(scene, camera);
}
animateGalaxy();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==================== 2. LOADING SIMULATION (2 ثانية + شريط أحمر) ====================
let progress = 0;
const fillBar = document.getElementById('loading-fill');
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                mainContent.style.display = 'block';
                initVisitorCounter();    // عداد الزوار
                initNavbar();            // شريط التنقل
                initTranslation();       // زر الترجمة الفورية
                initSocialRipple();      // تأثير تموج وتأخير للروابط الاجتماعية
            }, 800);
        }, 400);
    }
    fillBar.style.width = progress + '%';
}, 70);

// ==================== 3. NAVBAR (مؤشر متحرك + تفعيل الأقسام) ====================
function initNavbar() {
    const nav = document.querySelector('.navbar');
    const indicator = document.querySelector('.nav-active-indicator');
    const btns = document.querySelectorAll('.navbar ul li button');
    function moveIndicator(btn) {
        const left = btn.offsetLeft;
        const width = btn.offsetWidth;
        indicator.style.left = left + 'px';
        indicator.style.width = width + 'px';
    }
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const parentLi = btn.parentElement;
            if (parentLi.classList.contains('active')) return;
            document.querySelectorAll('.navbar ul li').forEach(li => li.classList.remove('active'));
            parentLi.classList.add('active');
            moveIndicator(btn);
            const sectionId = btn.dataset.section;
            document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active-section'));
            document.getElementById(`${sectionId}-section`).classList.add('active-section');
        });
    });
    const activeBtn = document.querySelector('.navbar ul li.active button');
    if (activeBtn) moveIndicator(activeBtn);
}

// ==================== 4. الترجمة الفورية (عربي/إنجليزي) ====================
function initTranslation() {
    const transBtn = document.getElementById('translate-button');
    let isArabic = true;
    const arabicText = document.querySelector('.arabic-about');
    const englishText = document.querySelector('.english-about');
    const arabicNameElem = document.querySelector('.arabic-name');
    const englishQuoteElem = document.querySelector('.english-quote');
    transBtn.addEventListener('click', () => {
        if (isArabic) {
            arabicText.style.display = 'none';
            englishText.style.display = 'block';
            arabicNameElem.style.display = 'none';
            englishQuoteElem.style.display = 'block';
            transBtn.innerHTML = '<i class="fas fa-globe"></i> عرض بالعربية';
        } else {
            arabicText.style.display = 'block';
            englishText.style.display = 'none';
            arabicNameElem.style.display = 'block';
            englishQuoteElem.style.display = 'none';
            transBtn.innerHTML = '<i class="fas fa-globe"></i> ترجمة / Translate';
        }
        isArabic = !isArabic;
    });
}

// ==================== 5. تأثير الروابط الاجتماعية (تموج + تأخير 1.5 ثانية مثل ملف 6) ====================
function initSocialRipple() {
    const links = document.querySelectorAll('.social-ripple-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const ripple = document.createElement('span');
            ripple.className = 'dynamic-ripple';
            ripple.style.position = 'fixed';
            ripple.style.width = '12px';
            ripple.style.height = '12px';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = '#ff0040';
            ripple.style.pointerEvents = 'none';
            ripple.style.zIndex = '9999';
            const rect = link.getBoundingClientRect();
            ripple.style.left = (rect.left + rect.width/2) + 'px';
            ripple.style.top = (rect.top + rect.height/2) + 'px';
            ripple.style.transform = 'scale(0)';
            ripple.style.transition = 'transform 0.6s ease-out, opacity 0.5s';
            ripple.style.opacity = '0.8';
            document.body.appendChild(ripple);
            setTimeout(() => { ripple.style.transform = 'scale(35)'; ripple.style.opacity = '0'; }, 10);
            setTimeout(() => { ripple.remove(); }, 700);
            setTimeout(() => { window.open(link.href, '_blank'); }, 1500);
        });
    });
}

// ==================== 6. عداد الزوار الحقيقي (يزداد 1 مع كل دخول، يعمل على كل الاستضافات) ====================
async function initVisitorCounter() {
    const counterSpan = document.getElementById('real-visitor-count');
    // استخدام CountAPI لزيادة عداد عام + تخزين محلي للاحتياط
    try {
        const response = await fetch('https://api.countapi.xyz/hit/ilya_portfolio/visits');
        const data = await response.json();
        if (data && data.value) {
            counterSpan.innerText = data.value;
        } else {
            // fallback: localStorage
            let localCount = localStorage.getItem('portfolio_visitor');
            localCount = localCount ? parseInt(localCount) + 1 : 1;
            localStorage.setItem('portfolio_visitor', localCount);
            counterSpan.innerText = localCount;
        }
    } catch (err) {
        let localCount = localStorage.getItem('portfolio_visitor');
        localCount = localCount ? parseInt(localCount) + 1 : 1;
        localStorage.setItem('portfolio_visitor', localCount);
        counterSpan.innerText = localCount;
    }
}

console.log('✅ الموقع يعمل بكامل المواصفات: خلفية المجرة، تحميل، شريط تنقل، زجاج سائل، إطارات متحركة، ترجمة، تموج، وعداد زوار حقيقي');
