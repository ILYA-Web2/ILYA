/* ═══════════════════════════════════════════════════════════
   TR7 · style.css — Ultra-Premium Dark Mode
   Cinematic · Fluid · Mobile-First · No Legacy Artifacts
   ═══════════════════════════════════════════════════════════ */

/* ─── Reset & Variables ─── */
*,*::before,*::after{
  margin:0;padding:0;box-sizing:border-box;
  -webkit-tap-highlight-color:transparent;
}

:root{
  /* Core palette */
  --bg:        #030000;
  --bg-elevated: rgba(8,2,3,0.92);
  --pri:       #ff0033;
  --pri-dim:   #cc001a;
  --pri-dark:  #8b0000;
  --accent:    #ff1744;
  --white:     #ffffff;
  --white-80:  rgba(255,255,255,0.8);
  --white-60:  rgba(255,255,255,0.6);
  --white-40:  rgba(255,255,255,0.4);
  --glass:     rgba(5,1,2,0.55);
  --glass-border: rgba(255,0,51,0.18);
  --font-ar:   'Tajawal','Cairo',sans-serif;
  --font-en:   'Space Grotesk','Tajawal',sans-serif;
  --font-mono: 'JetBrains Mono',monospace;
  --ez:        cubic-bezier(0.16,1,0.3,1);
  --spring:    cubic-bezier(0.34,1.56,0.64,1);

  /* Dynamic sizes (Mobile-first defaults) */
  --banner-h:     180px;
  --avatar-size:  96px;
  --name-size:    clamp(2.6rem, 10vw, 4.4rem);
  --title-size:   clamp(0.7rem, 2.4vw, 0.9rem);
  --bio-size:     clamp(0.9rem, 2.8vw, 1.05rem);
  --icon-size:    clamp(48px, 14vw, 62px);
  --footer-size:  clamp(0.65rem, 1.8vw, 0.8rem);
  --card-radius:  26px;
}

/* ─── Base ─── */
html,body{
  min-height:100dvh;
  background:var(--bg);
  color:var(--white);
  font-family:var(--font-ar);
  overflow-x:hidden;
  scroll-behavior:smooth;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  line-height:1.5;
  transition: background 0.6s ease;
}
body{
  display:flex;
  flex-direction:column;
}

/* WebGL Canvas */
#webgl-canvas{
  position:fixed;
  inset:0;
  z-index:0;
  pointer-events:none;
  display:block;
}

/* ─── Preloader ─── */
#preloader{
  position:fixed;
  inset:0;
  z-index:9999;
  background:var(--bg);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:1.8rem;
  transition: opacity 0.8s var(--ez), visibility 0.8s;
  cursor:wait;
}
#preloader.hidden{
  opacity:0;
  visibility:hidden;
  pointer-events:none;
}
.preloader-core{
  position:relative;
  width:80px;
  height:80px;
}
.preloader-ring{
  position:absolute;
  inset:0;
  border-radius:50%;
  border:2px solid transparent;
  border-top-color:var(--pri);
  animation:preSpin 1.2s var(--ez) infinite;
}
.preloader-ring:nth-child(2){
  inset:10px;
  border-top-color:rgba(255,255,255,0.4);
  animation-duration:1.8s;
  animation-direction:reverse;
}
.preloader-ring:nth-child(3){
  inset:22px;
  border-top-color:rgba(255,0,51,0.35);
  animation-duration:2.4s;
}
@keyframes preSpin{
  to{transform:rotate(360deg)}
}
.preloader-label{
  font-family:var(--font-mono);
  font-size:0.7rem;
  letter-spacing:4px;
  text-transform:uppercase;
  color:rgba(255,255,255,0.5);
  animation:prePulse 2s ease-in-out infinite;
}
@keyframes prePulse{
  0%,100%{opacity:0.4}
  50%{opacity:1}
}

/* ─── Main wrapper ─── */
.main-wrapper{
  position:relative;
  z-index:10;
  width:100%;
  max-width:720px;
  margin:0 auto;
  padding:clamp(1rem,3vw,2.5rem) clamp(0.8rem,2.5vw,1.5rem) clamp(2rem,4vw,4rem);
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:clamp(2rem,5vw,4rem);
  will-change:transform,opacity;
  /* Hidden initially, revealed by GSAP */
  opacity:0;
  transform:translateY(28px);
}

/* ─── Hero Section ─── */
.hero-section{
  width:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
}
.hero-inner{
  width:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:clamp(1.2rem,3.5vw,2.2rem);
}

/* Banner */
.hero-banner-frame{
  position:relative;
  width:100%;
  height:var(--banner-h);
  border-radius:var(--card-radius) var(--card-radius) 0 0;
  overflow:hidden;
  cursor:pointer;
  isolation:isolate;
  box-shadow:0 0 0 1px rgba(255,0,51,0.15);
  transition:box-shadow 0.5s var(--ez),transform 0.5s var(--ez);
}
.hero-banner-frame:hover,
.hero-banner-frame:focus-visible{
  box-shadow:0 0 0 1px rgba(255,0,51,0.45), 0 0 30px rgba(255,0,51,0.25);
  transform:scale(1.01);
}
.hero-banner-glow{
  position:absolute;
  inset:0;
  background:radial-gradient(ellipse at 50% 50%, rgba(255,0,51,0.15) 0%, transparent 70%);
  opacity:0;
  transition:opacity 0.5s;
  z-index:2;
  pointer-events:none;
}
.hero-banner-frame:hover .hero-banner-glow{
  opacity:1;
}
.hero-banner-img{
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center 30%;
  filter:brightness(0.75) contrast(1.1) saturate(1.2);
  transition:filter 0.7s ease;
  will-change:transform;
  animation:kenBurns 24s ease-in-out infinite alternate;
}
.hero-banner-frame:hover .hero-banner-img{
  filter:brightness(0.9) contrast(1.05) saturate(1.3);
}
@keyframes kenBurns{
  0%{transform:scale(1) translate(0,0)}
  100%{transform:scale(1.06) translate(-1%,-1%)}
}
.hero-banner-vignette{
  position:absolute;
  inset:0;
  background:radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.7) 100%);
  pointer-events:none;
  z-index:1;
}
.hero-banner-scanline{
  position:absolute;
  inset:0;
  background:repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 6px);
  pointer-events:none;
  z-index:3;
}

/* Avatar */
.hero-avatar-anchor{
  margin-top:clamp(-48px, -8vw, -58px);
  z-index:20;
  position:relative;
}
.hero-avatar-frame{
  position:relative;
  width:var(--avatar-size);
  height:var(--avatar-size);
  cursor:pointer;
}
.hero-avatar-orbit{
  position:absolute;
  inset:-18px;
  pointer-events:none;
}
.orbit-svg{
  width:100%;
  height:100%;
  overflow:visible;
}
.orbit-svg circle{
  animation:spinOrbit 3.5s linear infinite;
  transform-origin:100px 100px;
}
@keyframes spinOrbit{
  to{transform:rotate(360deg)}
}
.hero-avatar-aura{
  position:absolute;
  inset:-22px;
  border-radius:50%;
  background:radial-gradient(circle, rgba(255,0,51,0.2) 0%, transparent 68%);
  filter:blur(14px);
  animation:auraPulse 4s ease-in-out infinite alternate;
  z-index:0;
}
@keyframes auraPulse{
  0%{opacity:0.4;transform:scale(0.9)}
  100%{opacity:1;transform:scale(1.15)}
}
.hero-avatar-img{
  width:100%;
  height:100%;
  border-radius:50%;
  object-fit:cover;
  object-position:center top;
  border:2px solid rgba(255,0,51,0.35);
  box-shadow:0 0 0 3px rgba(3,0,0,0.9), 0 0 20px rgba(255,0,51,0.35), 0 15px 35px rgba(0,0,0,0.85);
  position:relative;
  z-index:2;
  transition:box-shadow 0.5s var(--ez), transform 0.3s;
  will-change:transform;
  animation:avatarFloat 6s ease-in-out infinite;
}
@keyframes avatarFloat{
  0%,100%{transform:translateY(0)}
  50%{transform:translateY(-8px)}
}
.hero-avatar-frame:hover .hero-avatar-img{
  box-shadow:0 0 0 3px rgba(3,0,0,0.9), 0 0 40px rgba(255,23,68,0.7), 0 0 70px rgba(255,0,51,0.25);
  animation-play-state:paused;
}

/* Identity */
.hero-identity{
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0.5rem;
}
.hero-name{
  font-family:var(--font-ar);
  font-size:var(--name-size);
  font-weight:900;
  line-height:1.1;
  position:relative;
  display:inline-block;
}
.hero-name-text{
  background:linear-gradient(140deg, #ff1744 0%, #ff6677 30%, #fff 52%, #ff4466 74%, #cc001a 100%);
  background-size:300% 300%;
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
  animation:nameGrad 5s ease-in-out infinite;
  display:inline-block;
}
@keyframes nameGrad{
  0%,100%{background-position:0% 50%}
  50%{background-position:100% 50%}
}
.hero-name-underline{
  display:block;
  height:2px;
  width:60%;
  margin:8px auto 0;
  background:linear-gradient(90deg, transparent, var(--pri), var(--accent), transparent);
  animation:lineSwipe 4s ease-in-out infinite;
  will-change:transform;
}
@keyframes lineSwipe{
  0%,100%{transform:scaleX(0.1);opacity:0}
  30%,70%{transform:scaleX(1);opacity:1}
}
.hero-title{
  font-family:var(--font-en);
  font-size:var(--title-size);
  font-weight:600;
  text-transform:uppercase;
  letter-spacing:2.5px;
  color:rgba(255,255,255,0.6);
  display:flex;
  align-items:center;
  gap:7px;
}
.hero-title-bracket{
  color:var(--accent);
  font-weight:900;
  font-size:1.4em;
  display:inline-block;
  animation:bracketOpen 4s var(--ez) infinite;
}
.hero-title-bracket:last-child{
  animation-name:bracketClose;
}
@keyframes bracketOpen{
  0%,8%{transform:translateX(0);opacity:0.5}
  30%,50%{transform:translateX(-10px);opacity:1;text-shadow:0 0 12px var(--pri)}
  58%,100%{transform:translateX(0);opacity:0.5}
}
@keyframes bracketClose{
  0%,8%{transform:translateX(0);opacity:0.5}
  30%,50%{transform:translateX(10px);opacity:1;text-shadow:0 0 12px var(--pri)}
  58%,100%{transform:translateX(0);opacity:0.5}
}
.hero-title-words{
  display:inline-block;
  animation:wordFade 4s ease-in-out infinite;
}
@keyframes wordFade{
  0%,8%{opacity:0.25}
  25%,55%{opacity:1}
  62%,100%{opacity:0.25}
}

/* Bio Card */
.hero-bio-card{
  width:100%;
  max-width:600px;
  background:rgba(3,0,0,0.65);
  backdrop-filter:blur(24px) saturate(160%);
  -webkit-backdrop-filter:blur(24px) saturate(160%);
  border-radius:22px;
  border:1px solid rgba(255,0,51,0.12);
  padding:clamp(1rem,2.5vw,1.5rem) clamp(1rem,3vw,1.8rem);
  position:relative;
  overflow:hidden;
  box-shadow:0 15px 40px rgba(0,0,0,0.8), inset 0 0 0 0.5px rgba(255,0,51,0.08);
}
.bio-card-border{
  position:absolute;
  inset:0;
  border-radius:inherit;
  pointer-events:none;
  z-index:2;
  border:1px solid transparent;
  background:linear-gradient(120deg, rgba(255,0,51,0.22), transparent 50%, rgba(255,0,51,0.1)) border-box;
  -webkit-mask:linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask:linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite:destination-out;
  mask-composite:exclude;
}
.bio-card-grain{
  position:absolute;
  inset:0;
  opacity:0.35;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-size:200px 200px;
  pointer-events:none;
  z-index:0;
  animation:grain 8s steps(1) infinite;
}
@keyframes grain{
  0%{transform:translate(0,0)}
  20%{transform:translate(40px,100px)}
  40%{transform:translate(-60px,20px)}
  60%{transform:translate(100px,-40px)}
  80%{transform:translate(-20px,70px)}
  100%{transform:translate(0,0)}
}
.hero-bio-text{
  position:relative;
  z-index:1;
  font-size:var(--bio-size);
  line-height:1.95;
  color:rgba(255,255,255,0.82);
  text-align:justify;
  font-weight:400;
}

/* ─── Links Section ─── */
.links-section{
  width:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:1.8rem;
}
.links-header{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:clamp(0.5rem,2vw,1.2rem);
}
.links-header-line{
  flex:1;
  height:1px;
  max-width:65px;
  background:linear-gradient(90deg, transparent, rgba(255,0,51,0.45));
}
.links-header-line:last-child{
  background:linear-gradient(270deg, transparent, rgba(255,0,51,0.45));
}
.links-header-title{
  font-family:var(--font-ar);
  font-size:clamp(1.8rem, 6vw, 2.6rem);
  font-weight:800;
  color:var(--white);
  animation:titleGlow 4s ease-in-out infinite;
}
@keyframes titleGlow{
  0%,100%{opacity:0.85;text-shadow:0 0 10px rgba(255,0,51,0.35)}
  50%{opacity:1;text-shadow:0 0 25px rgba(255,0,51,0.7), 0 0 45px rgba(255,0,51,0.3)}
}
.links-grid{
  width:100%;
  display:grid;
  grid-template-columns:repeat(auto-fit, minmax(110px, 1fr));
  gap:clamp(0.6rem,1.8vw,1rem);
  justify-items:center;
}

/* Individual Link Card */
.link-card{
  position:relative;
  width:100%;
  max-width:150px;
  background:rgba(6,1,2,0.7);
  backdrop-filter:blur(24px) saturate(160%);
  -webkit-backdrop-filter:blur(24px) saturate(160%);
  border-radius:22px;
  border:1px solid rgba(255,0,51,0.12);
  padding:clamp(1rem,2.5vw,1.3rem) 0.5rem clamp(0.9rem,2.2vw,1.1rem);
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0.5rem;
  cursor:pointer;
  overflow:hidden;
  text-decoration:none;
  color:inherit;
  transition:transform 0.4s var(--spring), box-shadow 0.4s var(--ez), background 0.4s;
  will-change:transform;
  animation:cardFloat 9s ease-in-out infinite;
}
@keyframes cardFloat{
  0%,100%{transform:translateY(0)}
  50%{transform:translateY(-8px)}
}
.link-card:hover,
.link-card:focus-visible{
  transform:translateY(-14px) scale(1.05)!important;
  animation-play-state:paused;
  background:rgba(15,3,5,0.9);
  border-color:rgba(255,0,51,0.5);
  box-shadow:0 22px 45px rgba(255,0,51,0.22), 0 0 50px rgba(255,0,51,0.08);
}
.card-glow{
  position:absolute;
  inset:0;
  border-radius:inherit;
  background:radial-gradient(circle at 50% 50%, rgba(255,0,51,0.1) 0%, transparent 70%);
  opacity:0;
  transition:opacity 0.4s;
  pointer-events:none;
}
.link-card:hover .card-glow{
  opacity:1;
}
.card-sheen{
  position:absolute;
  inset:0;
  border-radius:inherit;
  background:linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 55%);
  pointer-events:none;
}
.link-icon-wrap{
  position:relative;
  z-index:1;
  width:var(--icon-size);
  height:var(--icon-size);
  border-radius:18px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:clamp(1.5rem, 4.5vw, 2rem);
  background:rgba(10,2,4,0.7);
  animation:iconFloat 5s ease-in-out infinite;
  transition:transform 0.3s, filter 0.3s;
}
.link-card:hover .link-icon-wrap{
  animation-play-state:paused;
  transform:translateY(-3px) scale(1.1);
  filter:brightness(1.3) saturate(1.5);
}
@keyframes iconFloat{
  0%,100%{transform:translateY(0)}
  40%{transform:translateY(-6px)}
  70%{transform:translateY(2px)}
}
.link-name{
  position:relative;
  z-index:1;
  font-family:var(--font-en);
  font-size:clamp(0.65rem, 2vw, 0.8rem);
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:0.5px;
  color:var(--white);
}
.link-handle{
  position:relative;
  z-index:1;
  font-family:var(--font-mono);
  font-size:clamp(0.5rem, 1.4vw, 0.65rem);
  color:rgba(255,255,255,0.6);
  background:rgba(0,0,0,0.5);
  padding:0.15rem 0.7rem;
  border-radius:99px;
  border:1px solid rgba(255,0,51,0.15);
}

/* ─── Footer ─── */
.site-footer{
  width:100%;
  display:flex;
  flex-direction:column;
  gap:1rem;
}
.footer-divider{
  display:flex;
  align-items:center;
  gap:0.8rem;
  width:100%;
}
.footer-divider-line{
  flex:1;
  height:1px;
  background:linear-gradient(90deg, transparent, rgba(255,0,51,0.3));
}
.footer-divider-line:last-child{
  background:linear-gradient(270deg, transparent, rgba(255,0,51,0.3));
}
.footer-divider-gem{
  color:var(--pri);
  font-size:0.7rem;
  animation:gemGlow 3s ease-in-out infinite;
}
@keyframes gemGlow{
  0%,100%{opacity:0.3}
  50%{opacity:0.85}
}
.footer-content{
  display:flex;
  justify-content:space-between;
  align-items:center;
  flex-wrap:wrap;
  gap:0.8rem;
}
.footer-left{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:0.8rem;
}
.footer-copy{
  font-family:var(--font-ar);
  font-size:var(--footer-size);
  color:rgba(255,255,255,0.5);
}
.footer-visitor-badge{
  display:inline-flex;
  align-items:center;
  gap:5px;
  background:rgba(5,1,1,0.85);
  border:1px solid rgba(255,0,51,0.25);
  border-radius:99px;
  padding:0.3rem 0.9rem;
  font-family:var(--font-en);
  font-weight:700;
  font-size:0.75rem;
  color:var(--white);
  backdrop-filter:blur(8px);
  box-shadow:0 0 12px rgba(255,0,51,0.12);
  transition:box-shadow 0.4s;
}
.footer-visitor-badge:hover{
  box-shadow:0 0 20px rgba(255,0,51,0.3);
}
.visit-count{
  transition:transform 0.25s var(--spring);
  display:inline-block;
}
.visit-label{
  font-size:0.6em;
  color:rgba(255,0,51,0.65);
  letter-spacing:1px;
}
.footer-url{
  display:flex;
  align-items:center;
  gap:0.35rem;
  color:rgba(255,255,255,0.5);
  text-decoration:none;
  font-family:var(--font-mono);
  font-size:var(--footer-size);
  padding:0.35rem 1rem;
  border-radius:99px;
  background:rgba(0,0,0,0.45);
  border:1px solid rgba(255,0,51,0.18);
  backdrop-filter:blur(8px);
  transition:all 0.35s var(--ez);
}
.footer-url:hover{
  background:rgba(255,0,51,0.08);
  border-color:rgba(255,0,51,0.45);
  box-shadow:0 0 18px rgba(255,0,51,0.25);
  color:var(--white);
}
.footer-url-arrow{
  color:var(--accent);
  font-size:0.9em;
}

/* ─── Responsive: Tablet & Desktop ─── */
@media (min-width: 640px){
  :root{
    --banner-h: 240px;
    --avatar-size: 115px;
    --card-radius: 36px;
  }
  .hero-bio-card{
    border-radius:28px;
  }
  .links-grid{
    grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));
  }
}
@media (min-width: 860px){
  .main-wrapper{
    padding:2.8rem 1.8rem 5rem;
  }
  :root{
    --banner-h: 260px;
    --avatar-size: 120px;
  }
}

/* ─── Mobile fine-tune (< 380px) ─── */
@media (max-width: 380px){
  .links-grid{
    grid-template-columns:repeat(3, 1fr);
    gap:0.5rem;
  }
  .link-card{
    max-width:100%;
    border-radius:16px;
  }
  .hero-bio-card{
    padding:0.9rem 1rem;
  }
  .footer-content{
    flex-direction:column;
    align-items:center;
    text-align:center;
  }
  .footer-left{
    flex-direction:column;
    align-items:center;
    gap:0.5rem;
  }
}

/* Utility: reduced motion */
@media (prefers-reduced-motion: reduce){
  *,
  *::before,
  *::after{
    animation-duration:0.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:0.01ms!important;
  }
}

/* Focus styles */
:focus-visible{
  outline:2px solid var(--pri);
  outline-offset:3px;
  border-radius:4px;
}
