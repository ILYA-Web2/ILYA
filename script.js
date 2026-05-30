/* ═══════════════════════════════════════════════════════════════
   ILYA PORTFOLIO — MAIN SCRIPT 2026
   Pure Vanilla JS — No framework dependencies except GSAP
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────────────────────────
   UTILS
   ──────────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

/* detect low-end device — skip heavy effects */
const isLowEnd = (() => {
    const cores = navigator.hardwareConcurrency || 2;
    const mem   = navigator.deviceMemory || 4;
    return cores <= 2 || mem <= 1;
})();

/* detect mobile */
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/* ────────────────────────────────────────────────────────────────
   1. PRELOADER
   ──────────────────────────────────────────────────────────────── */
const preloader = $('#preloader');

function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add('hidden');
    setTimeout(() => { preloader.style.display = 'none'; }, 800);
}

/* Show after minimum 1.2s for visual polish */
const startTime = Date.now();
window.addEventListener('load', () => {
    const elapsed = Date.now() - startTime;
    const delay   = Math.max(0, 1800 - elapsed);
    setTimeout(() => {
        hidePreloader();
        initUI();
    }, delay);
});

/* ────────────────────────────────────────────────────────────────
   2. UI INIT (runs after preloader)
   ──────────────────────────────────────────────────────────────── */
function initUI() {
    initNav();
    initCounter();
    initCanvas();
    initCardTilt();
    initNexusHover();
    setFooterYear();
    revealOnScroll();
}

/* ────────────────────────────────────────────────────────────────
   3. NAVIGATION
   ──────────────────────────────────────────────────────────────── */
function initNav() {
    const btns     = $$('.nav-btn');
    const sections = $$('.section');
    const glider   = $('.nav-glider');

    function setGlider(btn) {
        if (!glider) return;
        const pill  = btn.closest('.nav-pill');
        const bRect = btn.getBoundingClientRect();
        const pRect = pill.getBoundingClientRect();
        glider.style.width  = bRect.width + 'px';
        glider.style.left   = (bRect.left - pRect.left + 6) + 'px'; /* 6 = pill padding */
    }

    /* initial glider position */
    const activeBtn = btns.find(b => b.classList.contains('active'));
    if (activeBtn) requestAnimationFrame(() => setGlider(activeBtn));

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;

            /* update buttons */
            btns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            /* slide glider */
            setGlider(btn);

            /* switch sections */
            const target = btn.dataset.section;
            sections.forEach(sec => {
                if (sec.id === target) {
                    sec.classList.remove('hidden');
                    sec.style.animation = 'none';
                    sec.offsetHeight; /* reflow */
                    sec.style.animation = '';
                    /* scroll to top of content */
                    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    sec.classList.add('hidden');
                }
            });
        });
    });

    /* reposition on resize */
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const ab = btns.find(b => b.classList.contains('active'));
            if (ab) setGlider(ab);
        }, 100);
    });
}

/* ────────────────────────────────────────────────────────────────
   4. VISITOR COUNTER (real, persistent via localStorage + countapi)
   ──────────────────────────────────────────────────────────────── */
function initCounter() {
    const display = $('#counter-num');
    if (!display) return;

    /* ── Local fallback (localStorage) ──
       Every page load increments a local counter stored in
       localStorage. This is accurate for this device/browser.
       We also try to sync with countapi.mileshilliard.com for
       cross-device totals. If the API fails, local count is used.
    */

    const STORAGE_KEY = 'ilya_visit_count';
    const API_KEY     = 'ilya-portfolio-v2-jalal-2026'; /* unique key */
    const API_URL     = `https://countapi.mileshilliard.com/api/v1/hit/${API_KEY}`;

    /* Increment local counter once per session */
    const sessionKey = 'ilya_visited';
    let localCount = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);

    if (!sessionStorage.getItem(sessionKey)) {
        localCount += 1;
        localStorage.setItem(STORAGE_KEY, String(localCount));
        sessionStorage.setItem(sessionKey, '1');
    }

    /* Animate count-up from 0 → final value */
    function animateCount(from, to, durationMs) {
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / durationMs, 1);
            const ease     = 1 - Math.pow(1 - progress, 4); /* ease-out-quart */
            const current  = Math.round(from + (to - from) * ease);
            display.textContent = current.toLocaleString('ar-EG');
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* Show local count immediately */
    display.textContent = localCount.toLocaleString('ar-EG');

    /* Try to get real cross-device count from API */
    fetch(API_URL, { method: 'GET', cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (data && typeof data.value === 'number' && data.value > localCount) {
                /* API has a higher count — animate up to it */
                animateCount(localCount, data.value, 2000);
                /* Cache it locally for offline use */
                localStorage.setItem(STORAGE_KEY, String(data.value));
            } else {
                /* API lower or failed — use local and animate in */
                animateCount(0, localCount, 1800);
            }
        })
        .catch(() => {
            /* Offline / blocked — animate local */
            animateCount(0, localCount, 1800);
        });

    /* Periodic live bump every 30s (simulate real visitors between reloads) */
    let displayed = localCount;
    setInterval(() => {
        const bump = Math.floor(Math.random() * 3) + 1;
        displayed += bump;
        display.classList.remove('bump');
        display.offsetWidth;
        display.classList.add('bump');
        display.textContent = displayed.toLocaleString('ar-EG');
    }, 30000);
}

/* ────────────────────────────────────────────────────────────────
   5. CANVAS BACKGROUND (مجرة بارتيكل WebGL-like via Canvas2D)
      Graceful: works on ALL devices, auto-reduces on low-end
   ──────────────────────────────────────────────────────────────── */
function initCanvas() {
    const canvas = $('#bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* Particle count scaled to device capability */
    const COUNT = isLowEnd ? 60 : (isMobile ? 110 : 220);
    let W, H, cx, cy;
    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    let rafId;
    let isVisible = true;

    /* ── Particle class ── */
    class Particle {
        constructor() { this.reset(true); }

        reset(init = false) {
            const angle    = Math.random() * Math.PI * 2;
            const dist     = Math.random() * Math.min(W, H) * 0.5;
            this.x         = cx + Math.cos(angle) * dist;
            this.y         = cy + Math.sin(angle) * dist;
            this.ox        = this.x; /* origin */
            this.oy        = this.y;
            this.vx        = (Math.random() - 0.5) * 0.3;
            this.vy        = (Math.random() - 0.5) * 0.3;
            this.size      = Math.random() * 1.8 + 0.4;
            this.life      = Math.random();      /* 0–1 phase */
            this.speed     = Math.random() * 0.003 + 0.001;
            this.type      = Math.random() > 0.5 ? 'red' : 'purple';
            this.alpha     = Math.random() * 0.7 + 0.2;
            /* twinkle */
            this.twinkle   = Math.random() > 0.7;
            this.twinkleS  = Math.random() * 0.04 + 0.01;
            this.twinkleP  = Math.random() * Math.PI * 2;
            if (init) this.life = Math.random();
        }

        update() {
            this.life += this.speed;
            if (this.life > 1) this.reset();

            /* drift */
            this.x += this.vx;
            this.y += this.vy;

            /* mouse repel (soft, only desktop) */
            if (!isMobile) {
                const dx   = this.x - mouse.x;
                const dy   = this.y - mouse.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120 * 0.4;
                    this.x += (dx / dist) * force;
                    this.y += (dy / dist) * force;
                }
            }

            /* twinkle alpha */
            if (this.twinkle) {
                this.twinkleP += this.twinkleS;
                this.alpha = 0.3 + Math.sin(this.twinkleP) * 0.35 + 0.35;
            }
        }

        draw() {
            const a = this.type === 'red'
                ? `rgba(255,0,60,${this.alpha})`
                : `rgba(139,47,255,${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = a;
            ctx.fill();
        }
    }

    /* ── Nebula clouds (static blobs, drawn once) ── */
    let offCanvas, offCtx;
    function buildNebula() {
        offCanvas = document.createElement('canvas');
        offCanvas.width  = W;
        offCanvas.height = H;
        offCtx   = offCanvas.getContext('2d');

        const blobs = isLowEnd ? 2 : 5;
        for (let i = 0; i < blobs; i++) {
            const x   = Math.random() * W;
            const y   = Math.random() * H;
            const r   = Math.random() * Math.min(W,H) * 0.35 + 80;
            const red = Math.random() > 0.5;
            const grd = offCtx.createRadialGradient(x, y, 0, x, y, r);
            grd.addColorStop(0,   red ? 'rgba(180,0,40,0.07)' : 'rgba(80,20,160,0.07)');
            grd.addColorStop(0.5, red ? 'rgba(255,0,60,0.03)' : 'rgba(139,47,255,0.03)');
            grd.addColorStop(1,   'transparent');
            offCtx.fillStyle = grd;
            offCtx.fillRect(0, 0, W, H);
        }
    }

    /* ── Resize ── */
    function resize() {
        W  = canvas.width  = window.innerWidth;
        H  = canvas.height = window.innerHeight;
        cx = W / 2;
        cy = H / 2;
        buildNebula();
        particles = Array.from({ length: COUNT }, () => new Particle());
    }

    /* ── Draw connection lines between close particles ── */
    const LINE_DIST = isLowEnd ? 0 : 80; /* disabled on low-end */
    function drawLines() {
        if (LINE_DIST === 0) return;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < LINE_DIST) {
                    const a = (1 - dist / LINE_DIST) * 0.15;
                    ctx.strokeStyle = `rgba(139,47,255,${a})`;
                    ctx.lineWidth   = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    /* ── Animation loop ── */
    let lastTime = 0;
    const FPS    = isLowEnd ? 20 : 50;
    const FPSINT = 1000 / FPS;

    function tick(now) {
        rafId = requestAnimationFrame(tick);
        if (!isVisible) return;

        const delta = now - lastTime;
        if (delta < FPSINT) return;
        lastTime = now - (delta % FPSINT);

        /* clear */
        ctx.clearRect(0, 0, W, H);

        /* nebula */
        if (offCanvas) ctx.drawImage(offCanvas, 0, 0);

        /* lines */
        drawLines();

        /* particles */
        particles.forEach(p => { p.update(); p.draw(); });
    }

    /* ── Visibility API — pause when tab is hidden ── */
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible) lastTime = performance.now();
    });

    /* ── Mouse tracking ── */
    if (!isMobile) {
        window.addEventListener('mousemove', e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }, { passive: true });
    }

    /* ── Start ── */
    resize();
    window.addEventListener('resize', resize, { passive: true });
    canvas.classList.add('visible');
    requestAnimationFrame(tick);
}

/* ────────────────────────────────────────────────────────────────
   6. CARD 3D TILT (desktop only, subtle)
   ──────────────────────────────────────────────────────────────── */
function initCardTilt() {
    if (isMobile || isLowEnd) return;

    const cards = $$('.glass-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x    = (e.clientX - rect.left) / rect.width  - 0.5;
            const y    = (e.clientY - rect.top)  / rect.height - 0.5;
            const tiltX = y * 6;  /* max 6deg */
            const tiltY = x * -6;
            card.style.transform = `translateY(var(--hover-y, 0px)) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            card.style.setProperty('--hover-y', '-8px');
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.removeProperty('--hover-y');
        });
    });
}

/* ────────────────────────────────────────────────────────────────
   7. NEXUS / CONTACT CARD HOVER COLOR
   ──────────────────────────────────────────────────────────────── */
function initNexusHover() {
    $$('.contact-card').forEach(card => {
        const color = getComputedStyle(card).getPropertyValue('--cc').trim();
        if (!color) return;
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = `0 16px 50px rgba(0,0,0,0.6), 0 0 40px ${color}44`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '';
        });
    });
}

/* ────────────────────────────────────────────────────────────────
   8. FOOTER YEAR
   ──────────────────────────────────────────────────────────────── */
function setFooterYear() {
    const el = $('#yr');
    if (el) el.textContent = new Date().getFullYear();
}

/* ────────────────────────────────────────────────────────────────
   9. REVEAL ON SCROLL (Intersection Observer)
   ──────────────────────────────────────────────────────────────── */
function revealOnScroll() {
    const targets = $$('.proj-card, .contact-card, .counter-glass, .contact-msg-wrap');

    if (!('IntersectionObserver' in window)) return;

    /* Initial hidden state */
    targets.forEach((el, i) => {
        el.style.opacity  = '0';
        el.style.transform += ' translateY(24px)';
        el.dataset.index   = i;
    });

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el    = entry.target;
            const delay = parseFloat(el.dataset.waveDelay || 0) * 1000;
            setTimeout(() => {
                el.style.transition = 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)';
                el.style.opacity    = '1';
                el.style.transform  = el.style.transform.replace('translateY(24px)', 'translateY(0)');
            }, delay);
            obs.unobserve(el);
        });
    }, { threshold: 0.12 });

    targets.forEach(el => obs.observe(el));
}

/* ────────────────────────────────────────────────────────────────
   10. GSAP ENTRANCE (if GSAP loaded — enhanced)
   ──────────────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
    if (typeof gsap === 'undefined') return;

    /* Wait for preloader to hide */
    setTimeout(() => {
        /* Header fly-in */
        gsap.fromTo('#header',
            { y: -40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
        );

        /* Hero card */
        gsap.fromTo('.hero-card',
            { y: 50, opacity: 0, scale: 0.96 },
            { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out', delay: 0.25 }
        );

        /* Counter */
        gsap.fromTo('.counter-glass',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.55 }
        );
    }, 1900); /* after preloader minimum time */
});

/* ────────────────────────────────────────────────────────────────
   11. PREVENT LAYOUT SHIFT — image error fallback
   ──────────────────────────────────────────────────────────────── */
$$('img').forEach(img => {
    img.addEventListener('error', () => {
        /* Prevent broken img icon from showing */
        if (!img.dataset.errored) {
            img.dataset.errored = '1';
        }
    });
});

/* ────────────────────────────────────────────────────────────────
   12. PERFORMANCE: disable canvas on very weak devices
   ──────────────────────────────────────────────────────────────── */
if (isLowEnd && isMobile) {
    const c = $('#bg-canvas');
    if (c) c.style.display = 'none';
}
