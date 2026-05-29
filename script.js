document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================================================
    // 1. نظام شاشة التهيئة (Cyber Preloader)
    // =========================================================================
    window.addEventListener("load", () => {
        const loader = document.getElementById("cyber-loader");
        const uiLayer = document.getElementById("ui-layer");
        
        // إخفاء التحميل ببطء سينمائي
        gsap.to(loader, {
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
                loader.style.display = "none";
                
                // تحريك دخول الواجهة (Fade in & Slide up)
                gsap.fromTo(uiLayer, 
                    { opacity: 0, y: 40 }, 
                    { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
                );
                
                // تفعيل خط الطاقة أسفل زر "الرئيسية"
                const activeNav = document.querySelector("#nav-list li.active");
                if(activeNav) moveNavIndicator(activeNav);
            }
        });
    });

    // =========================================================================
    // 2. نظام التوجيه والتبويبات (Holographic Nav Engine)
    // =========================================================================
    const navItems = document.querySelectorAll("#nav-list li");
    const sections = document.querySelectorAll(".section");
    const indicator = document.querySelector(".nav-indicator");

    function moveNavIndicator(el) {
        gsap.to(indicator, {
            width: el.offsetWidth,
            x: el.offsetLeft,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out"
        });
    }

    navItems.forEach((li) => {
        li.addEventListener("click", () => {
            if (li.classList.contains("active")) return;

            // تحديث الأزرار
            navItems.forEach(item => item.classList.remove("active"));
            li.classList.add("active");
            moveNavIndicator(li);

            const targetId = li.getAttribute("data-target");

            // تحريك الأقسام (تبديل سلس)
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.remove("hidden");
                    gsap.fromTo(section, 
                        { opacity: 0, scale: 0.95, y: 20 }, 
                        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power2.out" }
                    );
                } else {
                    section.classList.add("hidden");
                }
            });
        });
    });

    window.addEventListener("resize", () => {
        const activeNav = document.querySelector("#nav-list li.active");
        if(activeNav) moveNavIndicator(activeNav);
    });

    // =========================================================================
    // 3. محرك المجرة والتوهج السينمائي (Unreal Bloom WebGL)
    // =========================================================================
    const canvas = document.getElementById('webgl-canvas');
    if (canvas && window.THREE) {
        const scene = new THREE.Scene();

        // إعداد الكاميرا
        const sizes = { width: window.innerWidth, height: window.innerHeight };
        const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100);
        camera.position.set(0, 3, 5);
        scene.add(camera);

        // إعداد الريندر (المصيّر)
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true });
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // ✦ إضافة تأثير الـ Bloom (التوهج السينمائي) ✦
        const renderScene = new THREE.RenderPass(scene, camera);
        const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0;
        bloomPass.strength = 1.8; // قوة توهج النيون
        bloomPass.radius = 0.5;

        const composer = new THREE.EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        // بناء المجرة (الجزيئات)
        const parameters = {
            count: 25000, // عدد متوازن لأداء 60fps مع التوهج
            radius: 7,
            branches: 4,
            spin: 1.2,
            randomness: 0.4,
            randomnessPower: 3.5,
            insideColor: '#ff003c',  // أحمر نيوني
            outsideColor: '#2a004a'  // بنفسجي داكن
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
                const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

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
                size: 0.02,
                sizeAttenuation: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                vertexColors: true
            });

            points = new THREE.Points(geometry, material);
            points.rotation.x = 0.2;
            scene.add(points);
        };

        generateGalaxy();

        window.addEventListener('resize', () => {
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;
            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();
            renderer.setSize(sizes.width, sizes.height);
            composer.setSize(sizes.width, sizes.height);
        });

        const clock = new THREE.Clock();
        let mouseX = 0;
        let mouseY = 0;

        // تفاعل المجرة مع حركة الماوس ببطء (Parallax)
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / sizes.width) - 0.5;
            mouseY = (event.clientY / sizes.height) - 0.5;
        });

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();

            // دوران المجرة اللانهائي
            if (points) {
                points.rotation.y = elapsedTime * 0.05;
                // إضافة حركة Parallax ناعمة جداً بناءً على الماوس
                camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
                camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
                camera.lookAt(scene.position);
            }

            // التصيير باستخدام Composer (مهم جداً لتفعيل التوهج)
            composer.render();
            window.requestAnimationFrame(tick);
        };
        tick();
    }

    // =========================================================================
    // 4. نظام تأخير الروابط الفاخر المشفر (Nexus Link Engine)
    // =========================================================================
    const delayedLinks = document.querySelectorAll(".delayed-link");
    delayedLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const url = link.getAttribute("data-url") || link.getAttribute("href");
            const linkColor = link.getAttribute("data-color") || "#ff003c";
            
            // وميض اللوحة الرئيسية باللون الخاص بالزر الموهج
            gsap.fromTo(".master-glass-panel", 
                { boxShadow: `0 30px 60px rgba(0,0,0,0.9), inset 0 0 60px ${linkColor}` }, 
                { boxShadow: "0 30px 60px rgba(0,0,0,0.9), inset 0 0 30px rgba(0, 0, 0, 0.5)", duration: 1.5, ease: "power2.out" }
            );

            // تشغيل صوت أو تأثير بصري إضافي (تحديث العداد مثلاً)
            const hudText = document.getElementById("live-counter");
            if(hudText) hudText.textContent = "SYNCING...";

            setTimeout(() => {
                if (url && url !== "#") window.open(url, "_blank");
                if(hudText) hudText.textContent = liveCount.toLocaleString(); // إعادة العداد
            }, 1500);
        });
    });

    // =========================================================================
    // 5. عداد البيانات (HUD Sync Counter)
    // =========================================================================
    const counterDisplay = document.getElementById("live-counter");
    let liveCount = 94820; // رقم مبدئي ضخم

    if (counterDisplay) {
        counterDisplay.textContent = liveCount.toLocaleString();
        setInterval(() => {
            liveCount += Math.floor(Math.random() * 7) + 1;
            counterDisplay.textContent = liveCount.toLocaleString();
            
            // نبضة بصرية خفيفة على العداد عند التحديث
            gsap.fromTo(counterDisplay, { opacity: 0.5 }, { opacity: 1, duration: 0.3 });
        }, 3000);
    }
});
