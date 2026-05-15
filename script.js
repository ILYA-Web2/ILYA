import * as THREE from "https://cdn.skypack.dev/three@0.132.2";

// =========================================
// 1. إعدادات خلفية المجرة (3D Galaxy)
// =========================================
const canvas = document.querySelector('#galaxy-canvas');
const scene = new THREE.Scene();

const parameters = {
    count: 100000,
    size: 0.015,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030', // البرتقالي الأصلي
    outsideColor: '#0949f0' // الأزرق الأصلي
};

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
    if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
};

generateGalaxy();

const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(3, 3, 3);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

const clock = new THREE.Clock();
const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    points.rotation.y = elapsedTime * 0.05; // حركة المجرة
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
};
animate();

// =========================================
// 2. نظام التحميل والترجمة والتنقل
// =========================================

// شاشة التحميل
window.addEventListener('load', () => {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 500);
    }, 2000); // ثانيتين كما طلبت
});

// نظام الترجمة
const translateBtn = document.getElementById('translate-btn');
let currentLang = 'ar';

translateBtn.addEventListener('click', () => {
    const arElems = document.querySelectorAll('.ar');
    const enElems = document.querySelectorAll('.en');

    if (currentLang === 'ar') {
        arElems.forEach(el => el.classList.add('hidden'));
        enElems.forEach(el => el.classList.remove('hidden'));
        translateBtn.querySelector('.btn-text').innerText = 'عربي';
        document.documentElement.dir = 'ltr';
        currentLang = 'en';
    } else {
        arElems.forEach(el => el.classList.remove('hidden'));
        enElems.forEach(el => el.classList.add('hidden'));
        translateBtn.querySelector('.btn-text').innerText = 'English';
        document.documentElement.dir = 'rtl';
        currentLang = 'ar';
    }
});

// التنقل بين الصفحات
const navItems = document.querySelectorAll('.neon-nav li');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        sections.forEach(sec => {
            sec.classList.add('hidden');
            if (sec.id === target) sec.classList.remove('hidden');
        });
    });
});

// =========================================
// 3. تأخير الروابط وتأثير التموج (ملف 6)
// =========================================
document.querySelectorAll('.delayed-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const url = this.href;
        const parent = this.parentElement;

        // إنشاء تأثير التموج
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        parent.appendChild(ripple);

        // الانتظار 1.5 ثانية قبل الفتح
        setTimeout(() => {
            window.open(url, '_blank');
            ripple.remove();
        }, 1500);
    });
});

// =========================================
// 4. عداد الزوار (GitHub Friendly)
// =========================================
function updateCounter() {
    // نستخدم خدمة countapi.xyz المجانية (تأكد من استبدال 'ilya-site' باسم فريد)
    fetch('https://api.countapi.xyz/hit/ilya-portfolio-2024/visits')
        .then(res => res.json())
        .then(data => {
            document.getElementById('view-count').innerText = data.value;
        })
        .catch(() => {
            // في حال تعطل الخدمة، نستخدم عداد محلي وهمي
            let count = localStorage.getItem('visitor_count') || 100;
            count++;
            localStorage.setItem('visitor_count', count);
            document.getElementById('view-count').innerText = count;
        });
}
updateCounter();
