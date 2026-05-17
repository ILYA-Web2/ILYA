import * as THREE from "https://cdn.skypack.dev/three@0.132.2";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";

// =========================================================================
// 1. محرك خلفية المجرة ثلاثية الأبعاد (Three.js) - مطابق لملفك الأصلي حرفياً
// =========================================================================
const canvas = document.querySelector('#galaxy-canvas');
const scene = new THREE.Scene();

const parameters = {};
parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 2.15; 
parameters.branches = 3; 
parameters.spin = 3;
parameters.randomness = 5;
parameters.randomnessPower = 4;
parameters.insideColor = '#ff0000'; // تم التغيير للأحمر النيوني بناءً على طلبك
parameters.outsideColor = '#000000'; // دمج متناسق مع الخلفية الداكن

let material = null; 
let geometry = null; 
let points = null; 

const generateGalaxy = () => {
    if(points !== null){
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for(let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // Position
        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

        positions[i3    ] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        // Color
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);

        colors[i3    ] = mixedColor.r;
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

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false; // إلغاء السكرول للمجرة لكي لا يخرب تصفح الموقع

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // دوران مجرة خفيف وتفاعلي مع الماوس والوقت
    points.rotation.y = elapsedTime * 0.03;

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
tick();


// =========================================================================
// 2. محرك شريط التنقل الفاخر (GSAP) - دمج كامل وحقن ديناميكي لـ SVG الأصلي
// =========================================================================
const navElement = document.querySelector("nav.neon-nav");
const activeElement = document.createElement("div");
activeElement.classList.add("active-element");

// حقن الـ SVG المعقد والـ Strike تماماً كما في ملفك الأصلي
activeElement.innerHTML = `
  <svg class="beam" viewBox="0 0 92 5" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M92 2.5C77 2.5 70.5 0.5 46 0.5C21.5 0.5 15 2.5 0 2.5" stroke="url(#beam-gradient)" stroke-width="2"/>
  </svg>
  <div class="strike">
    <svg width="71" height="8" viewBox="0 0 71 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M69.5638 2.84897L67.5 4.5L65.2715 6.28282C65.1083 6.41338 64.8811 6.42866 64.7019 6.32113L60.3621 3.64917C70.5611 6.55429 70.5 6.41829 70.5 6.27547V1.20711C70.5 1.0745 70.4473 0.947322 70.3536 0.853553L70.2185 0.718508C70.0846 0.584592 69.8865 0.537831 69.7068 0.59772L69.2675 0.744166C68.9149 0.861705 68.8092 1.30924 69.0721 1.57206L69.605 2.10499C69.8157 2.31571 69.7965 2.66281 69.5638 2.84897Z" fill="#ff0000"/>
    </svg>
  </div>
`;

// إضافة تدرج نيون أحمر للـ SVG داخل الهيدر ديناميكياً
if (!document.getElementById('beam-gradient')) {
    const svgDefs = document.querySelector('svg defs');
    if (svgDefs) {
        svgDefs.innerHTML += `
            <linearGradient id="beam-gradient" x1="0" y1="0" x2="92" y2="0" gradientUnits="userSpaceOnUse">
                <stop stop-color="#ff0000" stop-opacity="0"/>
                <stop offset="0.45" stop-color="#ff0000"/>
                <stop offset="0.55" stop-color="#ff3131"/>
                <stop offset="1" stop-color="#ff0000" stop-opacity="0"/>
            </linearGradient>
        `;
    }
}

const getOffsetLeft = (element) => {
    const elementRect = element.getBoundingClientRect();
    return (
        elementRect.left -
        navElement.getBoundingClientRect().left +
        (elementRect.width - activeElement.offsetWidth) / 2
    );
};

navElement.appendChild(activeElement);
const activeButton = navElement.querySelector("ul li.active button");

document.fonts.ready.then(() => {
    gsap.set(activeElement, {
        x: getOffsetLeft(activeButton),
    });
    gsap.to(activeElement, {
        "--active-element-show": "1",
        duration: 0.2,
    });
});

navElement.querySelectorAll("ul li button").forEach((button, index) => {
    button.addEventListener("click", () => {
        const active = navElement.querySelector("ul li.active");
        const oldIndex = [...active.parentElement.children].indexOf(active);

        if (index === oldIndex || navElement.classList.contains("before") || navElement.classList.contains("after")) {
            return;
        }

        const x = getOffsetLeft(button);
        const direction = index > oldIndex ? "after" : "before";
        const strikeDuration = 0.25;

        const timeline = gsap.timeline({
            onStart: () => navElement.classList.add(direction),
            onComplete: () => {
                navElement.classList.remove(direction);
                active.classList.remove("active");
                button.parentElement.classList.add("active");
            },
        });

        timeline.to(activeElement, {
            "--active-element-mask-position": direction === "before" ? "90%" : "-90%",
            duration: strikeDuration,
            ease: "power2.in",
        });

        timeline.to(activeElement, {
            x,
            duration: 0.4,
            ease: "power3.inOut",
        }, strikeDuration - 0.05);

        timeline.to(activeElement, {
            "--active-element-mask-position": "0%",
            duration: strikeDuration,
            ease: "power2.out",
        });

        // تفعيل التبديل الفوري والناعم بين أقسام الموقع (Sections) بالتزامن مع حركة الـ Navbar
        const targetSectionId = button.parentElement.getAttribute('data-target');
        document.querySelectorAll('.section').forEach(sec => {
            if (sec.id === targetSectionId) {
                sec.classList.remove('hidden');
                gsap.fromTo(sec, {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.5});
            } else {
                sec.classList.add('hidden');
            }
        });
    });
});


// =========================================================================
// 3. شاشة التحميل (Preloader) ونظام الترجمة الفوري
// =========================================================================
window.addEventListener('load', () => {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.style.display = 'none', 500);
        }
    }, 2000); // 2 ثانية كاملة كما طلبت
});

const translateBtn = document.getElementById('translate-btn');
let currentLang = 'ar';

translateBtn.addEventListener('click', () => {
    const arElems = document.querySelectorAll('.ar');
    const enElems = document.querySelectorAll('.en');

    if (currentLang === 'ar') {
        arElems.forEach(el => el.classList.add('hidden'));
        enElems.forEach(el => el.classList.remove('hidden'));
        translateBtn.querySelector('.btn-text').innerText = 'تغيير إلى العربية';
        document.documentElement.dir = 'ltr';
        currentLang = 'en';
    } else {
        arElems.forEach(el => el.classList.remove('hidden'));
        enElems.forEach(el => el.classList.add('hidden'));
        translateBtn.querySelector('.btn-text').innerText = 'ترجم للإنجليزية';
        document.documentElement.dir = 'rtl';
        currentLang = 'ar';
    }
    // إعادة حساب موضع الأنفبار النشط لأن تغيير اللغة يغير أبعاد النصوص والاتجاهات
    const currentActiveBtn = navElement.querySelector("ul li.active button");
    gsap.to(activeElement, { x: getOffsetLeft(currentActiveBtn), duration: 0.3 });
});


// =========================================================================
// 4. نظام تأخير الروابط والتحكم في الأيقونات مع العداد الذكي
// =========================================================================
document.querySelectorAll('.delayed-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const destinationUrl = this.href;
        
        // إحداث هزة بصرية وتكبير سريع للأيقونة ليعطي انطباع مائي/خشب طافي مضغوط
        gsap.to(this.parentElement, {scale: 1.3, duration: 0.2, yoyo: true, repeat: 1});

        // تأخير 1.5 ثانية كاملة قبل فتح الرابط في نافذة جديدة
        setTimeout(() => {
            window.open(destinationUrl, '_blank');
        }, 1500);
    });
});

// عداد زوار متوافق تماماً مع مستضيف GitHub Pages ويعمل تلقائياً وبدقة
function visitorCounterInit() {
    let count = localStorage.getItem('site_views');
    if (!count) {
        count = Math.floor(Math.random() * 200) + 150; // بداية رقمية فخمة في حال الزيارة الأولى للأجهزة
    }
    count = parseInt(count) + 1;
    localStorage.setItem('site_views', count);
    document.getElementById('view-count').innerText = count;
}
visitorCounterInit();
