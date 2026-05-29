document.addEventListener("DOMContentLoaded", () => {

    // =========================================================================
    // 1. نظام تحويل التبويبات والأقسام (Tab Switcher Engine) - مستجيب فوري
    // =========================================================================
    const navItems = document.querySelectorAll("#master-nav ul li");
    const sections = document.querySelectorAll(".tab-content");

    navItems.forEach((li) => {
        li.addEventListener("click", () => {
            if (li.classList.contains("active")) return;

            // إزالة الحالة النشطة من الأزرار الأخرى
            navItems.forEach(item => item.classList.remove("active"));
            li.classList.add("active");

            const targetId = li.getAttribute("data-target");

            // إخفاء الأقسام وإظهار القسم المطلوب مع تأثير تلاشي خفيف سريع عالي الأداء
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.remove("hidden");
                    gsap.fromTo(section, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
                } else {
                    section.classList.add("hidden");
                }
            });
        });
    });

    // =========================================================================
    // 2. محرك المجرة ثلاثي الأبعاد المصلح والمحسّن أداءً (Three.js Galaxy Engine)
    // =========================================================================
    const canvas = document.querySelector('canvas.webgl');
    if (canvas) {
        const scene = new THREE.Scene();

        // تم تقليل الجزيئات لـ 40,000 لضمان أداء خارق 60FPS على الجوالات والكمبيوتر بالتساوي
        const parameters = {
            count: 40000,
            size: 0.012,
            radius: 2.5,
            branches: 3,
            spin: 1,
            randomness: 0.4,
            randomnessPower: 3,
            insideColor: '#ff0000',
            outsideColor: '#000000'
        };

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(parameters.count * 3);
        const colors = new Float32Array(parameters.count * 3);

        const colorInside = new THREE.Color(parameters.insideColor);
        const colorOutside = new THREE.Color(parameters.outsideColor);

        for (let i = 0; i < parameters.count; i++) {
            const i3 = i * 3;
            const radius = Math.random() * parameters.radius;
            const spinAngle = radius * parameters.spin;
            const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

            const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

            positions[i3]     = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / parameters.radius);
            colors[i3]     = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: parameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        const sizes = { width: window.innerWidth, height: window.innerHeight };

        window.addEventListener('resize', () => {
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;
            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });

        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
        camera.position.set(2, 2, 2);
        scene.add(camera);

        const controls = new THREE.OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.enableZoom = false; // معطل لمنع قفز التصفح

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const clock = new THREE.Clock();
        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            points.rotation.y = elapsedTime * 0.03; // دوران هادئ ومستقر
            controls.update();
            renderer.render(scene, camera);
            window.requestAnimationFrame(tick);
        };
        tick();
    }

    // =========================================================================
    // 3. نظام الترجمة (Localization)
    // =========================================================================
    const translateBtn = document.getElementById("translate-btn");
    let currentLang = "ar";

    if (translateBtn) {
        translateBtn.addEventListener("click", () => {
            const arTexts = document.querySelectorAll(".text-ar");
            const enTexts = document.querySelectorAll(".text-en");
            const btnText = translateBtn.querySelector(".btn-lang-text");

            if (currentLang === "ar") {
                arTexts.forEach(el => el.classList.add("hidden"));
                enTexts.forEach(el => el.classList.remove("hidden"));
                if (btnText) btnText.textContent = "Translate to Arabic";
                document.documentElement.setAttribute("dir", "ltr");
                currentLang = "en";
            } else {
                enTexts.forEach(el => el.classList.add("hidden"));
                arTexts.forEach(el => el.classList.remove("hidden"));
                if (btnText) btnText.textContent = "ترجم للإنجليزية";
                document.documentElement.setAttribute("dir", "rtl");
                currentLang = "ar";
            }
        });
    }

    // =========================================================================
    // 4. نظام تأخير الروابط الصارم الآمن (1.5s Link Delay Engine)
    // =========================================================================
    const delayedLinks = document.querySelectorAll(".delayed-link");
    delayedLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const url = link.getAttribute("data-url");
            
            // وميض أحمر خفيف كإشعار بصري بدلاً من تشويه الصفحة
            gsap.fromTo(".master-container", { borderColor: "#ff0000" }, { borderColor: "rgba(255,0,0,0.2)", duration: 0.5 });

            setTimeout(() => {
                if (url && url !== "#") window.open(url, "_blank");
            }, 1500);
        });
    });

    // =========================================================================
    // 5. عداد الزوار المستقر
    // =========================================================================
    const counter = document.getElementById("live-view-count");
    if (counter) {
        let count = 14250;
        counter.textContent = count.toLocaleString();
        setInterval(() => {
            count += Math.floor(Math.random() * 3) + 1;
            counter.textContent = count.toLocaleString();
        }, 4000);
    }
});
