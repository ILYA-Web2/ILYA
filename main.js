import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ==================== 1. GALAXY BACKGROUND (FULL FEATURES) ====================
const canvas = document.getElementById('galaxy-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 3, 3);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = false;
controls.enableZoom = false;
controls.enablePan = false;

// Galaxy parameters
const parameters = {
    count: 100000,
    size: 0.012,
    radius: 2.2,
    branches: 3,
    spin: 2.5,
    randomness: 4,
    randomnessPower: 3.5,
    insideColor: '#ff6030',
    outsideColor: '#0949f0'
};
let galaxyGeometry, galaxyMaterial, galaxyPoints;

function generateGalaxy() {
    if (galaxyPoints) {
        galaxyGeometry.dispose();
        galaxyMaterial.dispose();
        scene.remove(galaxyPoints);
    }
    galaxyGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const r = Math.pow(Math.random(), 1.5) * parameters.radius;
        const spinAngle = r * parameters.spin;
        const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
        const randX = (Math.random() - 0.5) * parameters.randomness * Math.pow(Math.random(), parameters.randomnessPower);
        const randY = (Math.random() - 0.5) * parameters.randomness * 0.8;
        const randZ = (Math.random() - 0.5) * parameters.randomness * Math.pow(Math.random(), parameters.randomnessPower);
        
        const x = Math.cos(branchAngle + spinAngle) * r + randX;
        const y = randY;
        const z = Math.sin(branchAngle + spinAngle) * r + randZ;
        positions[i*3] = x;
        positions[i*3+1] = y;
        positions[i*3+2] = z;
        
        const mixedColor = colorInside.clone().lerp(colorOutside, r / parameters.radius);
        colors[i*3] = mixedColor.r;
        colors[i*3+1] = mixedColor.g;
        colors[i*3+2] = mixedColor.b;
    }
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    galaxyMaterial = new THREE.PointsMaterial({ size: parameters.size, vertexColors: true, blending: THREE.AdditiveBlending });
    galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
    scene.add(galaxyPoints);
}
generateGalaxy();

// Animation loop for galaxy rotation
let time = 0;
function animateGalaxy() {
    requestAnimationFrame(animateGalaxy);
    time += 0.002;
    camera.position.x = Math.sin(time * 0.2) * 3.5;
    camera.position.z = Math.cos(time * 0.3) * 3.5;
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

// ==================== 2. LOADING SCREEN SIMULATION ====================
let loadProgress = 0;
const loadingBar = document.getElementById('loading-bar');
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');

const interval = setInterval(() => {
    loadProgress += Math.random() * 20;
    if (loadProgress >= 100) {
        loadProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                mainContent.style.display = 'block';
                // start visitor counter after load
                initVisitorCounter();
                // init navbar movement
                initNavbar();
                // init translation
                initTranslation();
                // init social hover as file 6
                initSocialHover();
            }, 1000);
        }, 500);
    }
    loadingBar.style.width = loadProgress + '%';
}, 100);

// ==================== 3. NAVBAR ACTIVE LINE (FILE 2 STYLE) ====================
function initNavbar() {
    const nav = document.querySelector('.navbar');
    const btns = document.querySelectorAll('.navbar ul li button');
    const activeLine = document.createElement('div');
    activeLine.style.position = 'absolute';
    activeLine.style.bottom = '-2px';
    activeLine.style.height = '3px';
    activeLine.style.backgroundColor = '#ff0040';
    activeLine.style.borderRadius = '2px';
    activeLine.style.transition = '0.3s';
    nav.style.position = 'relative';
    nav.appendChild(activeLine);
    
    function updateActiveLine(activeBtn) {
        const left = activeBtn.offsetLeft;
        const width = activeBtn.offsetWidth;
        activeLine.style.left = left + 'px';
        activeLine.style.width = width + 'px';
    }
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const parentLi = btn.parentElement;
            if(parentLi.classList.contains('active')) return;
            document.querySelectorAll('.navbar ul li').forEach(li => li.classList.remove('active'));
            parentLi.classList.add('active');
            updateActiveLine(btn);
            // switch sections
            const sectionId = btn.dataset.section;
            document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active-section'));
            document.getElementById(`${sectionId}-section`).classList.add('active-section');
        });
    });
    const initialActive = document.querySelector('.navbar ul li.active button');
    if(initialActive) updateActiveLine(initialActive);
}

// ==================== 4. TRANSLATION BUTTON (EN/AR) ====================
function initTranslation() {
    const translateBtn = document.getElementById('translate-btn');
    let isArabic = true;
    const arabicBio = document.querySelector('.arabic-bio');
    const englishBio = document.querySelector('.english-bio');
    const arabicQuote = document.querySelector('.arabic-quote');
    const englishQuote = document.querySelector('.english-quote');
    translateBtn.addEventListener('click', () => {
        if(isArabic) {
            arabicBio.style.display = 'none';
            englishBio.style.display = 'block';
            arabicQuote.style.display = 'none';
            englishQuote.style.display = 'block';
            translateBtn.innerHTML = '<i class="fas fa-language"></i> عرض بالعربية';
        } else {
            arabicBio.style.display = 'block';
            englishBio.style.display = 'none';
            arabicQuote.style.display = 'block';
            englishQuote.style.display = 'none';
            translateBtn.innerHTML = '<i class="fas fa-language"></i> ترجمة / Translate';
        }
        isArabic = !isArabic;
    });
}

// ==================== 5. SOCIAL ICONS HOVER & RIPPLE (FILE 6 MOD) ====================
function initSocialHover() {
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.position = 'absolute';
            ripple.style.width = '10px';
            ripple.style.height = '10px';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = '#ff0040';
            ripple.style.transform = 'scale(0)';
            ripple.style.transition = 'transform 0.6s, opacity 0.6s';
            ripple.style.opacity = '0.8';
            ripple.style.pointerEvents = 'none';
            const rect = link.getBoundingClientRect();
            ripple.style.left = (rect.left + rect.width/2) + 'px';
            ripple.style.top = (rect.top + rect.height/2) + 'px';
            document.body.appendChild(ripple);
            setTimeout(() => { ripple.style.transform = 'scale(30)'; ripple.style.opacity = '0'; }, 10);
            setTimeout(() => { ripple.remove(); }, 700);
            setTimeout(() => { window.open(link.href, '_blank'); }, 1500);
        });
    });
}

// ==================== 6. VISITOR COUNTER (real-time, increments on each load) ====================
async function initVisitorCounter() {
    // using a simple free API: countapi.xyz for demo (real-time + persistent)
    // but to make it increment on each load, we use localStorage + fetch to a mock or real endpoint
    // For simplicity, I'll implement a robust solution: GoatCounter alternative? Actually we'll use a free counter API.
    const counterSpan = document.getElementById('visitor-count');
    const key = 'portfolio_visitor_count';
    try {
        let count = localStorage.getItem(key);
        if(count === null) {
            count = 1;
        } else {
            count = parseInt(count) + 1;
        }
        localStorage.setItem(key, count);
        counterSpan.innerText = count;
        // optional: sync with server if needed (but local works as demo)
        // To make it "real-time" across devices, one would need backend, but localStorage works per device.
        // I'll add a fetch to increment on a public API for global demo.
        const response = await fetch('https://api.countapi.xyz/update/ilya/visits/?amount=1');
        const data = await response.json();
        if(data && data.value) counterSpan.innerText = data.value;
        else counterSpan.innerText = count;
    } catch(e) {
        counterSpan.innerText = localStorage.getItem(key) || 1;
    }
}

// ==================== 7. ADDITIONAL: PROJECT CARDS FLEXIBLE ADD/REMOVE ====================
// Just a comment to show you where to add new projects inside HTML.
// In HTML, inside <div class="projects-grid">, copy the block from <!-- بداية المشروع الأول --> to <!-- نهاية المشروع الأول --> and change data-project-id, title, desc, link.
// Also ensure the image link changes.

console.log('Website fully loaded with galaxy, glass, neon red, translation, ripple delay, and visitor counter');
