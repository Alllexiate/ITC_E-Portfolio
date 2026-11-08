// 1. Target Element Selection (HTML -> JS)
const yearSpan = document.getElementById('year');
const themeBtn = document.getElementById('theme-btn');
const contactBtn = document.getElementById('contact-btn');
const toast = document.getElementById('toast');

// 2. Dynamic Content Injection (JS -> HTML)
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// 3. Event Handling and Class Toggling (JS -> HTML/CSS)
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    // Toggles .dark-mode defined in style.css on the <body> tag
    // (the page starts in dark mode, so the first click switches to light)
    const isDark = document.body.classList.toggle('dark-mode');
    themeBtn.setAttribute('aria-pressed', String(isDark));
  });
}

// 4. Interactive Feedback
if (contactBtn) {
  contactBtn.addEventListener('click', () => {
    alert('Thank you for reaching out! Contact form coming soon.');
    document.getElementById('contact').scrollIntoView();
  });
}

// 4b. Nav bar stays hidden until the visitor scrolls past the name
const topNav = document.getElementById('top-nav');
const heroName = document.querySelector('#hero h1');
function updateNav() {
  topNav.classList.toggle('visible', heroName.getBoundingClientRect().bottom < 0);
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// Small helper: show the "Copied to clipboard!" popup
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

// 5. Skills filter (show or hide cards by category)
document.querySelectorAll('.filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.skill').forEach((card) => {
      card.classList.toggle('hide', f !== 'all' && card.dataset.cat !== f);
    });
  });
});

// 6. Click a contact card to copy its text
document.querySelectorAll('.copy').forEach((card) => {
  card.addEventListener('click', () => {
    const text = card.dataset.copy;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'),
        () => showToast('Press Ctrl+C to copy: ' + text));
    } else {
      showToast('Press Ctrl+C to copy: ' + text);
    }
  });
});

// // 7. Message form (front-end only for now)
// const form = document.getElementById('msg-form');
// if (form) {
//   form.addEventListener('submit', (e) => {
//     e.preventDefault();
//     form.reset();
//     showToast('Message sent! (demo only)');
//   });
// }

// 8. Decoration: floating stars, only inside the area below the break line.
// The stars are always fully visible (no fading in or out); they just drift and spin.
(function () {
  const zone = document.getElementById('stars-zone');
  const canvas = document.getElementById('stars');
  if (!zone || !canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0, stars = [];

  function makeStar() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.3 + 0.08),
      size: Math.random() * 7 + 5,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.012
    };
  }

  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.max(18, Math.min(60, Math.round((w * h) / 24000)));
    while (stars.length < target) stars.push(makeStar());
    stars.length = Math.min(stars.length, target);
  }

  // Draw a 5-point star centered at (0, 0)
  function starPath(r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = (Math.PI / 5) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.45;
      ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
    }
    ctx.closePath();
  }

  function draw() {
    // Dark mode: light stars on a dark green area. Light mode: dark green stars on a light green area.
    const dark = document.body.classList.contains('dark-mode');
    ctx.fillStyle = dark ? 'rgba(201, 245, 212, 0.7)' : 'rgba(20, 117, 63, 0.6)';
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      starPath(s.size);
      ctx.fill();
      ctx.restore();
      if (!reduceMotion) {
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.spin;
        if (s.y < -20) { s.y = h + 20; s.x = Math.random() * w; }
        if (s.x < -20) s.x = w + 20;
        if (s.x > w + 20) s.x = -20;
      }
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', () => { resize(); if (reduceMotion) draw(); });
  if (reduceMotion && themeBtn) themeBtn.addEventListener('click', draw);
})();

// 9. Decoration: constellations in the profile and name area.
// Each one is a fixed pattern of stars joined by thin lines. They stay fully visible and just sway gently.
(function () {
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('constellations');
  if (!hero || !canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;

  // ax, ay = where the pattern starts (fraction of the area), k = its size (fraction of the width)
  // pts = star positions inside the pattern, edges = which stars are joined by a line
  const sky = [
    { name: 'Big Dipper', ax: 0.46, ay: 0.07, k: 0.26, phase: 0,
      pts: [[0, 0.1], [0.2, 0.05], [0.4, 0.07], [0.55, 0.2], [0.78, 0.22], [0.75, 0.45], [0.52, 0.42]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] },
    { name: 'Cassiopeia', ax: 0.04, ay: 0.1, k: 0.2, phase: 2,
      pts: [[0, 0.1], [0.12, 0.4], [0.3, 0.2], [0.45, 0.45], [0.6, 0.12]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
    { name: 'Orion', ax: 0.74, ay: 0.6, k: 0.2, phase: 4,
      pts: [[0, 0], [0.4, 0.05], [0.12, 0.3], [0.2, 0.31], [0.28, 0.32], [0.02, 0.65], [0.38, 0.62]],
      edges: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]] },
    { name: 'Lyra', ax: 0.08, ay: 0.78, k: 0.12, phase: 6,
      pts: [[0, 0], [0.12, 0.05], [0.08, 0.2], [0.2, 0.22]],
      edges: [[0, 1], [1, 3], [3, 2], [2, 0]] }
  ];

  function resize() {
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Draw a 5-point star centered at (x, y)
  function star(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = (Math.PI / 5) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.45;
      ctx.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
    }
    ctx.closePath();
    ctx.fill();
  }

  function draw(t) {
    const dark = document.body.classList.contains('dark-mode');
    const rgb = dark ? '201, 245, 212' : '20, 117, 63';
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = `rgba(${rgb}, 0.4)`;
    ctx.fillStyle = `rgba(${rgb}, 0.85)`;
    for (const c of sky) {
      const S = Math.min(w * c.k, h * 0.5);
      const sway = reduceMotion ? 0 : Math.sin((t || 0) / 3500 + c.phase) * 6;
      const sway2 = reduceMotion ? 0 : Math.cos((t || 0) / 4200 + c.phase) * 5;
      const p = c.pts.map((q) => [c.ax * w + q[0] * S + sway, c.ay * h + q[1] * S + sway2]);
      ctx.beginPath();
      for (const e of c.edges) {
        ctx.moveTo(p[e[0]][0], p[e[0]][1]);
        ctx.lineTo(p[e[1]][0], p[e[1]][1]);
      }
      ctx.stroke();
      p.forEach((q, i) => star(q[0], q[1], i % 3 === 0 ? 6 : 4.5));
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  requestAnimationFrame(draw);
  window.addEventListener('resize', () => { resize(); if (reduceMotion) draw(0); });
  if (reduceMotion && themeBtn) themeBtn.addEventListener('click', () => draw(0));
})();
