/**
 * =========================================================================
 * ❖ نظام إيليا البرمجي المستقبلي - النسخة المطلقة (ILYA Master OS v500.0)
 * المحرك العصبوني والمصفوفات الرياضية لإدارة الأبعاد والمجرة وشريط الطاقة
 * =========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================================================
    // 1. نظام شاشة التحميل الذكي (Intelligent Preloader & Initialization)
    // =========================================================================
    const preloader = document.getElementById("preloader-overlay");
    
    // إخفاء شاشة التحميل بعد اكتمال بناء الأكواد والكون الرقمي
    window.addEventListener("load", () => {
        setTimeout(() => {
            if(preloader) {
                preloader.style.opacity = "0";
                setTimeout(() => preloader.style.display = "none", 600);
            }
        }, 2000); // إعطاء الوقت الكافي لبناء 100,000 جزيء للمجرة
    });

    // =========================================================================
    // 2. محرك المجرة ثلاثية الأبعاد (Three.js Galaxy Engine) - من ملفك الأصلي حرفياً
    // =========================================================================
    const canvas = document.querySelector('canvas.webgl');
    if (canvas) {
        const scene = new THREE.Scene();

        // البارامترات الرياضية الدقيقة للمجرة (المطابقة لملفك مع تكييف النيون الأحمر)
        const parameters = {
            count: 100000,
            size: 0.01,
            radius: 2.15,
            branches: 3,
            spin: 3,
            randomness: 0.5, // تم ضبط التوزيع لمنع التشتت العشوائي المشوه
            randomnessPower: 4,
            insideColor: '#ff0000',  // نيون أحمر مطلق للمركز الكوني
            outsideColor: '#050505'  // اندماج مطلق مع الفراغ الأسود للموقع
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

                // حساب الأبعاد والزوايا الرياضية للأذرع المجريّة
                const radius = Math.random() * parameters.radius;
                const spinAngle = radius * parameters.spin;
                const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

                const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
                const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
                const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

                positions[i3]     = Math.cos(branchAngle + spinAngle) * radius + randomX;
                positions[i3 + 1] = randomY;
                positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

                // دمج الألوان النيونية من المركز إلى الأطراف بسلاسة مطلقة
                const mixedColor = colorInside.clone();
                mixedColor.lerp(colorOutside, radius / parameters.radius);

                colors[i3]     = mixedColor.r;
                colors[i3 + 1] = mixedColor.g;
                colors[i3 + 2] = mixedColor.b;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            // المادة البرمجية للجزيئات الكونية
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

        // إعدادات الشاشة والأبعاد الرياضية للمجرة
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
            
            // إعادة حساب تمركز عناصر النافبار عند تغيير حجم الشاشة لمنع التشوه
            updateNavbarBeam();
        });

        // الكاميرا الرقمية الفضائية
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
        camera.position.x = 3;
        camera.position.y = 2;
        camera.position.z = 3;
        scene.add(camera);

        // أدوات التحكم والمحاذاة
        const controls = new THREE.OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.enableZoom = false; // إلغاء الزووم بالماوس لمنع تداخل التصفح مع حركة الموقع

        // محرك الرندرة والبناء
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // حلقة التحديث الزمني المستمر (Tick Animation Frame)
        const clock = new THREE.Clock();

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();

            // دوران المجرة الرياضي الهادئ والعميق
            if (points) {
                points.rotation.y = elapsedTime * 0.05;
            }

            controls.update();
            renderer.render(scene,声明);
            window.requestAnimationFrame(tick);
        };

        tick();
    }

    // =========================================================================
    // 3. نظام التنقل وشعاع الطاقة (GSAP Navbar & Routing Engine) - من ملفك
    // =========================================================================
    const navElement = document.getElementById("master-nav");
    let activeButton = navElement ? navElement.querySelector("ul li.active button") : null;
    let activeElement = null;

    if (navElement) {
        // إنشاء عنصر الطاقة الديناميكي برمجياً كما في منطق ملفك الأصلي تماماً
        activeElement = document.createElement("div");
        activeElement.classList.add("active-element");
        
        // حقن شعاع الـ SVG المعقد ذو التوهج المتطور للنيون الأحمر
        activeElement.innerHTML = `
            <svg class="beam" viewBox="0 0 100 5" preserveAspectRatio="none" style="width:100%; height:6px;">
                <line x1="0" y1="2.5" x2="100" y2="2.5" stroke="#ff0000" stroke-width="4" stroke-linecap="round" />
            </svg>
            <div class="strike" style="position:absolute; width:100%; height:2px; background:#ff3131; filter:blur(4px); bottom:-2px;"></div>
        `;
        navElement.appendChild(activeElement);

        // وظيفة حساب الإزاحة والأبعاد الرياضية الدقيقة المطلقة (Prevent Distortion)
        const getOffsetLeft = (element) => {
            const elementRect = element.getBoundingClientRect();
            const navRect = navElement.getBoundingClientRect();
            return elementRect.left - navRect.left + (elementRect.width - activeElement.offsetWidth) / 2;
        };

        const updateNavbarBeam = () => {
            if (activeButton && activeElement) {
                // ملاءمة عرض شعاع الطاقة مع حجم الزر النشط تماماً
                activeElement.style.width = `${activeButton.offsetWidth}px`;
                gsap.set(activeElement, { x: getOffsetLeft(activeButton) });
            }
        };

        // تفعيل الإشعاع الأولي بعد تحميل الخطوط والملفات للتأكد من المحاذاة الصارمة
        document.fonts.ready.then(() => {
            setTimeout(() => {
                updateNavbarBeam();
                gsap.to(activeElement, { "--active-element-show": "1", duration: 0.3, opacity: 1 });
            }, 100);
        });

        // البرمجة الحركية للتنقل التفاعلي بين الأقسام (Tab Switching Engine)
        const navItems = navElement.querySelectorAll("ul li");
        const allSections = document.querySelectorAll(".tab-content");

        navItems.forEach((li) => {
            const button = li.querySelector("button");
            li.addEventListener("click", () => {
                if (li.classList.contains("active")) return;

                // تحديث الحالات النشطة
                navItems.forEach(item => item.classList.remove("active"));
                li.classList.add("active");
                activeButton = button;

                // تحريك شعاع الطاقة الخاص بـ GSAP بسلاسة رياضية فائقة للزر الجديد
                activeElement.style.width = `${button.offsetWidth}px`;
                gsap.to(activeElement, {
                    x: getOffsetLeft(button),
                    duration: 0.5,
                    ease: "power4.out"
                });

                // توجيه الراوتر الداخلي لإخفاء وإظهار الأقسام بآلية تلاشي مستقبلية بدون تشوهات
                const targetSectionId = li.getAttribute("data-target");
                
                allSections.forEach(section => {
                    if (section.id === targetSectionId) {
                        section.classList.remove("hidden");
                        // أنيميشن الدخول الفاخر للقسم
                        gsap.fromTo(section, 
                            { opacity: 0, y: 30, filter: "blur(10px)" }, 
                            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out" }
                        );
                    } else {
                        section.classList.add("hidden");
                    }
                });
            });
        });
    }

    // =========================================================================
    // 4. محرك الترجمة الفورية الثنائية المتزامنة (Localization & Translation)
    // =========================================================================
    const translateBtn = document.getElementById("translate-btn");
    let currentLang = "ar"; // اللغة الافتراضية للموقع هي العربية

    if (translateBtn) {
        translateBtn.addEventListener("click", () => {
            const arTexts = document.querySelectorAll(".text-ar");
            const enTexts = document.querySelectorAll(".text-en");
            const btnText = translateBtn.querySelector(".btn-lang-text");

            if (currentLang === "ar") {
                // التحويل الكلي الفوري إلى الإنجليزية
                arTexts.forEach(el => el.classList.add("hidden"));
                enTexts.forEach(el => el.classList.remove("hidden"));
                if (btnText) btnText.textContent = "Translate to Arabic";
                document.documentElement.setAttribute("dir", "ltr");
                currentLang = "en";
            } else {
                // العودة الفورية إلى العربية
                enTexts.forEach(el => el.classList.add("hidden"));
                arTexts.forEach(el => el.classList.remove("hidden"));
                if (btnText) btnText.textContent = "ترجم للإنجليزية";
                document.documentElement.setAttribute("dir", "rtl");
                currentLang = "ar";
            }

            // إعادة ضبط ومحاذاة شعاع الطاقة في النافبار فوراً لمطابقة الحروف الجديدة ومنع التراكم
            setTimeout(() => {
                if (activeButton && activeElement) {
                    activeElement.style.width = `${activeButton.offsetWidth}px`;
                    gsap.to(activeElement, { x: getOffsetLeft(activeButton), duration: 0.3 });
                }
            }, 50);
        });
    }

    // =========================================================================
    // 5. آلية التأخير الصارم للروابط الخارجة (1.5s Link Delay Engine)
    // =========================================================================
    const delayedLinks = document.querySelectorAll(".delayed-link");
    
    delayedLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // إيقاف الانتقال الفوري تماماً منعاً لأي قفزة بصرية عشوائية
            const targetUrl = link.getAttribute("data-url") || link.getAttribute("href");

            // إطلاق تأثير بظهور وميض كهربائي أحمر مكثف قبل الخروج
            gsap.to(".master-container", {
                borderColor: "#ff0000",
                boxShadow: "0 0 80px #ff0000, inset 0 0 50px #ff0000",
                duration: 0.4,
                yoyo: true,
                repeat: 1
            });

            // تنفيذ الانتقال الإجباري بعد انتهاء الـ 1500 مللي ثانية بالتمام والكمال
            setTimeout(() => {
                if (targetUrl && targetUrl !== "#") {
                    window.open(targetUrl, "_blank");
                }
            }, 1500);
        });
    });

    // =========================================================================
    // 6. عداد الزوار التفاعلي المتطور (Mathematical Visitor Counter Simulation)
    // =========================================================================
    const counterElement = document.getElementById("live-view-count");
    if (counterElement) {
        // توليد رقم زوار أولي ذكي يعطي طابعاً مستقبلياً تفاعلياً للـ Portfolio الخاص بك
        let currentViews = Math.floor(Math.random() * 400) + 14200;
        counterElement.textContent = currentViews.toLocaleString();

        // نظام تحديث تصاعدي تفاعلي دائم ومستمر يحاكي دخول زوار حقيقيين كل بضع ثوانٍ
        setInterval(() => {
            const newClicks = Math.floor(Math.random() * 3) + 1;
            currentViews += newClicks;
            
            // تحريك الرقم بشكل خفيف متوهج عند التحديث لجمالية بصرية متقدمة
            gsap.fromTo(counterElement, 
                { opacity: 0.4, scale: 1.1, color: "#ffffff" },
                { opacity: 1, scale: 1, color: "#ff0000", duration: 0.4, onComplete: () => {
                    counterElement.textContent = currentViews.toLocaleString();
                }}
            );
        }, 5000); // تحديث دوري رياضي مستمر كل 5 ثوانٍ
    }
});
