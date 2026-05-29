// =============================================================================
// script.js — ULTRA PREMIUM GALAXY + SMART UI | 60FPS STABLE
// =============================================================================

(function() {
    "use strict";

    // -------------------------------------------------------------
    // 1. WAIT FOR CRITICAL RESOURCES (Fonts, DOM)
    // -------------------------------------------------------------
    document.addEventListener("DOMContentLoaded", async () => {
        // Ensure fonts are fully loaded before measuring nav button dimensions
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }

        // ---------------------------------------------------------
        // 2. GLOWING ENERGY BEAM (dynamic underline for active tab)
        // ---------------------------------------------------------
        const nav = document.getElementById("master-nav");
        const navList = document.querySelector(".nav-list");
        const navItems = document.querySelectorAll("#master-nav ul li");
        const beam = document.querySelector(".nav-active-beam");

        function updateBeamPosition(activeLi) {
            if (!beam || !activeLi) return;
            const button = activeLi.querySelector("button");
            if (!button) return;
            const buttonRect = button.getBoundingClientRect();
            const navRect = nav.getBoundingClientRect();
            const leftOffset = buttonRect.left - navRect.left;
            beam.style.width = `${buttonRect.width}px`;
            beam.style.transform = `translateX(${leftOffset}px)`;
        }

        function setActiveTab(targetId) {
            // Update active class on nav items
            navItems.forEach(li => {
                const isActive = li.getAttribute("data-target") === targetId;
                if (isActive) li.classList.add("active");
                else li.classList.remove("active");
            });
            const activeLi = document.querySelector(`#master-nav ul li[data-target="${targetId}"]`);
            if (activeLi) updateBeamPosition(activeLi);
        }

        // Initialize beam after first paint + resize event
        const initialActive = document.querySelector("#master-nav ul li.active");
        if (initialActive) updateBeamPosition(initialActive);
        window.addEventListener("resize", () => {
            const currentActive = document.querySelector("#master-nav ul li.active");
            if (currentActive) updateBeamPosition(currentActive);
        });

        // ---------------------------------------------------------
        // 3. TAB SWITCHING (GSAP powered, fast & fluid)
        // ---------------------------------------------------------
        const sections = document.querySelectorAll(".tab-content");
        function switchTab(targetId) {
            sections.forEach(section => {
                if (section.id === targetId) {
                    if (section.classList.contains("hidden")) {
                        section.classList.remove("hidden");
                        gsap.fromTo(section, 
                            { opacity: 0, y: 18 }, 
                            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", clearProps: "all" }
                        );
                    }
                } else {
                    if (!section.classList.contains("hidden")) {
                        section.classList.add("hidden");
                    }
                }
            });
        }

        navItems.forEach(li => {
            li.addEventListener("click", (e) => {
                e.preventDefault();
                const targetId = li.getAttribute("data-target");
                if (!targetId) return;
                if (li.classList.contains("active")) return;
                setActiveTab(targetId);
                switchTab(targetId);
            });
        });

        // ---------------------------------------------------------
        // 4. THREE.JS GALAXY ENGINE (ULTRA OPTIMIZED, 45k particles)
        // ---------------------------------------------------------
        const canvas = document.querySelector("canvas.webgl-galaxy");
        if (canvas && typeof THREE !== "undefined") {
            // Scene setup
            const scene = new THREE.Scene();
            scene.background = null; // transparent to show body bg

            // Galaxy parameters (max 45k particles for 60FPS across devices)
            const params = {
                count: 42000,
                size: 0.014,
                radius: 3.2,
                branches: 3,
                spin: 0.8,
                randomness: 0.45,
                randomnessPower: 2.8,
                insideColor: "#ff3366",
                outsideColor: "#6a0dad"   // deep violet
            };

            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(params.count * 3);
            const colors = new Float32Array(params.count * 3);

            const colorInside = new THREE.Color(params.insideColor);
            const colorOutside = new THREE.Color(params.outsideColor);

            for (let i = 0; i < params.count; i++) {
                const i3 = i * 3;
                const radius = Math.pow(Math.random(), 1.2) * params.radius;
                const spinAngle = radius * params.spin;
                const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;

                const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
                const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius * 0.8;
                const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;

                positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
                positions[i3 + 1] = randomY;
                positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

                const mixRatio = radius / params.radius;
                const mixedColor = colorInside.clone().lerp(colorOutside, mixRatio);
                colors[i3] = mixedColor.r;
                colors[i3 + 1] = mixedColor.g;
                colors[i3 + 2] = mixedColor.b;
            }

            geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: params.size,
                sizeAttenuation: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                vertexColors: true,
                transparent: true,
                opacity: 0.95
            });

            const points = new THREE.Points(geometry, material);
            scene.add(points);

            // Camera and Renderer (no OrbitControls to avoid interaction, preserve performance)
            const sizes = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100);
            camera.position.set(2.2, 1.5, 3.5);
            camera.lookAt(0, 0, 0);
            scene.add(camera);

            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setClearColor(0x000000, 0); // fully transparent background

            // Gentle automatic rotation (smooth, low CPU)
            let time = 0;
            function animateGalaxy() {
                requestAnimationFrame(animateGalaxy);
                time += 0.008;
                points.rotation.y = time * 0.22;
                points.rotation.x = Math.sin(time * 0.1) * 0.05;
                points.rotation.z = Math.cos(time * 0.13) * 0.03;
                renderer.render(scene, camera);
            }
            animateGalaxy();

            // Handle resize
            window.addEventListener("resize", () => {
                sizes.width = window.innerWidth;
                sizes.height = window.innerHeight;
                camera.aspect = sizes.width / sizes.height;
                camera.updateProjectionMatrix();
                renderer.setSize(sizes.width, sizes.height);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            });
        }

        // ---------------------------------------------------------
        // 5. BILINGUAL TRANSLATION SYSTEM (Arabic / English)
        // ---------------------------------------------------------
        const translateBtn = document.getElementById("translate-btn");
        let currentLang = "ar"; // ar or en
        if (translateBtn) {
            translateBtn.addEventListener("click", () => {
                const arTexts = document.querySelectorAll(".text-ar");
                const enTexts = document.querySelectorAll(".text-en");
                const btnSpan = translateBtn.querySelector(".btn-lang-text");
                const htmlDir = document.documentElement;

                if (currentLang === "ar") {
                    arTexts.forEach(el => el.classList.add("hidden"));
                    enTexts.forEach(el => el.classList.remove("hidden"));
                    if (btnSpan) btnSpan.textContent = "Translate to Arabic";
                    htmlDir.setAttribute("dir", "ltr");
                    currentLang = "en";
                } else {
                    enTexts.forEach(el => el.classList.add("hidden"));
                    arTexts.forEach(el => el.classList.remove("hidden"));
                    if (btnSpan) btnSpan.textContent = "ترجم للإنجليزية";
                    htmlDir.setAttribute("dir", "rtl");
                    currentLang = "ar";
                }
                // tiny gsap feedback on button
                gsap.fromTo(translateBtn, { scale: 0.98 }, { scale: 1, duration: 0.2, ease: "back.out" });
            });
        }

        // ---------------------------------------------------------
        // 6. SECURE LINK DELAY (1.5 seconds + visual warning)
        // ---------------------------------------------------------
        const delayedLinks = document.querySelectorAll(".delayed-link");
        delayedLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const targetUrl = link.getAttribute("data-url");
                if (!targetUrl || targetUrl === "#") return;

                // Flash red border on glass panel as visual indicator
                const container = document.querySelector(".master-container");
                if (container) {
                    gsap.to(container, {
                        borderColor: "#ff0000",
                        duration: 0.2,
                        repeat: 2,
                        yoyo: true,
                        ease: "power1.inOut"
                    });
                }

                // Show small toast effect (optional: subtle)
                const originalText = link.textContent;
                link.textContent = "⏳ جاري التوجيه...";
                setTimeout(() => {
                    link.textContent = originalText;
                }, 1500);

                setTimeout(() => {
                    window.open(targetUrl, "_blank", "noopener,noreferrer");
                }, 1500);
            });
        });

        // ---------------------------------------------------------
        // 7. LIVE VISITOR COUNTER (math-simulated, increment)
        // ---------------------------------------------------------
        const counterSpan = document.getElementById("live-view-count");
        if (counterSpan) {
            let viewCount = 15820; // initial realistic value
            counterSpan.textContent = viewCount.toLocaleString();

            setInterval(() => {
                const increment = Math.floor(Math.random() * 5) + 1; // 1 to 5
                viewCount += increment;
                counterSpan.textContent = viewCount.toLocaleString();
                // subtle glint animation
                gsap.fromTo(counterSpan, { scale: 1.1, color: "#ff8888" }, { scale: 1, color: "#ffaaaa", duration: 0.3 });
            }, 4200);
        }

        // ---------------------------------------------------------
        // 8. FALLBACK: ensure beam update after any layout shift
        // ---------------------------------------------------------
        const observer = new ResizeObserver(() => {
            const activeItem = document.querySelector("#master-nav ul li.active");
            if (activeItem) updateBeamPosition(activeItem);
        });
        if (nav) observer.observe(nav);
        window.addEventListener("load", () => {
            const activeItem = document.querySelector("#master-nav ul li.active");
            if (activeItem) updateBeamPosition(activeItem);
        });
    });
})();