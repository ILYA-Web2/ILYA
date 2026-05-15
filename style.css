/* Reset & Base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --neon-red: #ff0040;
    --neon-red-dark: #b00030;
    --neon-red-glow: 0 0 5px #ff0040, 0 0 20px #ff0040, 0 0 40px #ff0040;
    --glass-bg: rgba(255, 255, 255, 0.08);
    --glass-border: rgba(255, 255, 255, 0.2);
    --transition-smooth: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

body {
    font-family: 'Cairo', 'Inter', sans-serif;
    background-color: #000;
    color: white;
    overflow-x: hidden;
    min-height: 100vh;
}

/* Galaxy Canvas */
#galaxy-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    outline: none;
}

/* Loading Screen */
#loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: black;
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    backdrop-filter: blur(5px);
    transition: opacity 1s ease;
}
.loading-content {
    text-align: center;
}
.loading-logo {
    width: 150px;
    border-radius: 20px;
    margin-bottom: 30px;
    box-shadow: 0 0 20px var(--neon-red);
}
.loading-bar-container {
    width: 280px;
    height: 4px;
    background: #333;
    border-radius: 4px;
    overflow: hidden;
}
.loading-bar {
    width: 0%;
    height: 100%;
    background: var(--neon-red);
    box-shadow: var(--neon-red-glow);
    transition: width 0.3s linear;
}

/* Main Content */
#main-content {
    position: relative;
    z-index: 2;
    padding-top: 90px;
    padding-bottom: 80px;
}

/* Navbar (رقم 2 - أحمر نيوني) */
.navbar {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(10px);
    border-radius: 50px;
    padding: 5px 20px;
    border: 1px solid var(--neon-red);
}
.navbar ul {
    display: flex;
    gap: 40px;
    list-style: none;
}
.navbar ul li button {
    background: none;
    border: none;
    color: white;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    padding: 10px 0;
    cursor: pointer;
    transition: 0.3s;
}
.navbar ul li.active button {
    color: var(--neon-red);
    text-shadow: 0 0 8px var(--neon-red);
}
/* Active indicator line */
.navbar::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: var(--active-width, 60px);
    height: 3px;
    background: var(--neon-red);
    border-radius: 2px;
    transition: 0.3s ease;
    transform: translateX(var(--active-left, 0));
}

/* Sections */
.section {
    display: none;
    opacity: 0;
    transition: opacity 0.5s;
}
.section.active-section {
    display: block;
    opacity: 1;
}

/* Glass Liquid (رقم 5) */
.glass-liquid, .glass-liquid-projects, .glass-liquid-lead, .glass-liquid-small {
    backdrop-filter: blur(12px);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 32px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    transition: var(--transition-smooth);
}
.electric-border {
    border: 2px solid transparent;
    animation: electricPulse 2s infinite alternate;
}
@keyframes electricPulse {
    0% { border-color: rgba(255,0,64,0.3); box-shadow: 0 0 5px rgba(255,0,64,0.2);}
    100% { border-color: var(--neon-red); box-shadow: 0 0 25px var(--neon-red);}
}
.electric-border-red {
    border: 2px solid var(--neon-red);
    border-radius: 28px;
    transition: all 0.3s;
}
.electric-border-moving {
    border: 2px solid var(--neon-red);
    animation: borderMove 3s linear infinite;
}
@keyframes borderMove {
    0% { border-color: var(--neon-red); box-shadow: 0 0 5px var(--neon-red);}
    50% { border-color: #ff80a0; box-shadow: 0 0 20px #ff80a0;}
    100% { border-color: var(--neon-red); box-shadow: 0 0 5px var(--neon-red);}
}

/* Hero Section */
.hero {
    width: 85%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 20px 50px;
    position: relative;
    text-align: center;
}
.banner-wrapper {
    width: 100%;
    margin-bottom: 40px;
}
.banner-img {
    width: 100%;
    max-height: 350px;
    object-fit: cover;
    border-radius: 24px;
    display: block;
}
.profile-wrapper {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    margin: -80px auto 20px;
    background: #000;
    padding: 5px;
    transform: translateY(0);
}
.profile-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}
.fancy-name {
    font-size: 4rem;
    font-weight: 800;
    background: linear-gradient(45deg, #fff, var(--neon-red));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: 4px;
    margin: 10px 0;
}
.arabic-quote {
    font-size: 1.3rem;
    color: #ddd;
}
.english-quote {
    font-size: 1rem;
    color: #aaa;
    margin-bottom: 30px;
}

/* Glass Info with moving border */
.glass-info {
    max-width: 800px;
    margin: 30px auto;
    padding: 30px;
    border-radius: 40px;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(15px);
}
.info-text h3 {
    font-size: 2rem;
    margin-bottom: 15px;
    color: var(--neon-red);
}
.arabic-bio, .english-bio {
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 20px;
}
.glow-btn {
    background: transparent;
    border: 1px solid var(--neon-red);
    color: var(--neon-red);
    padding: 10px 20px;
    border-radius: 40px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}
.glow-btn:hover {
    background: var(--neon-red);
    color: black;
    box-shadow: 0 0 20px var(--neon-red);
}

/* Projects Grid */
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 40px;
    width: 90%;
    max-width: 1300px;
    margin: 0 auto;
    padding: 30px;
    border-radius: 48px;
}
.project-card {
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(10px);
    border-radius: 32px;
    overflow: hidden;
    padding: 20px;
    transition: transform 0.3s;
}
.project-card:hover {
    transform: translateY(-8px);
}
.project-img-wrapper {
    border-radius: 24px;
    overflow: hidden;
    margin-bottom: 15px;
}
.project-img-wrapper img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: 0.5s;
}
.project-img-wrapper img:hover {
    transform: scale(1.05);
}
.project-title {
    font-size: 1.6rem;
    margin: 15px 0 10px;
    color: var(--neon-red);
}
.project-desc {
    font-size: 0.95rem;
    opacity: 0.8;
    margin-bottom: 20px;
}
.project-link {
    color: white;
    text-decoration: none;
    border-bottom: 1px solid var(--neon-red);
    transition: 0.3s;
}
.project-link:hover {
    color: var(--neon-red);
}

/* Contact Section Grid */
.contact-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 40px;
    width: 90%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px;
    border-radius: 48px;
}
.social-links-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
}
.social-link {
    background: rgba(255,255,255,0.1);
    padding: 12px 24px;
    border-radius: 50px;
    color: white;
    text-decoration: none;
    font-weight: 600;
    transition: 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: 1px solid transparent;
}
.social-link:hover {
    border-color: var(--neon-red);
    color: var(--neon-red);
    transform: scale(1.05);
}
.contact-desc {
    text-align: center;
    max-width: 300px;
}

/* Visitor Counter */
.visitor-counter {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    padding: 8px 16px;
    border-radius: 40px;
    font-size: 0.9rem;
    font-weight: bold;
    z-index: 100;
    border-left: 3px solid var(--neon-red);
    color: #eee;
}
.visitor-counter i {
    color: var(--neon-red);
    margin-right: 6px;
}

/* Responsive */
@media (max-width: 768px) {
    .navbar ul { gap: 20px; }
    .fancy-name { font-size: 2.5rem; }
    .hero { width: 95%; padding: 20px 15px; }
    .profile-wrapper { width: 120px; height: 120px; margin-top: -60px; }
    .glass-info { padding: 20px; }
    .projects-grid { grid-template-columns: 1fr; gap: 25px; }
    .contact-grid { flex-direction: column; align-items: center; }
    .visitor-counter { bottom: 10px; right: 10px; font-size: 0.75rem; }
}
