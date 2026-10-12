// Nav + progress + reveal + carousel autoplay + lightbox + form
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

// Scroll progress + active nav
const prog = document.getElementById('navProgress');
const sections = ['work', 'about', 'experience', 'courses', 'skills', 'contact'];
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  if (prog) prog.style.width = pct + '%';
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && h.scrollTop >= el.offsetTop - 200) current = id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}, { passive: true });

// Reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---- Carousel with autoplay ----
const track = document.getElementById('carouselTrack');
const viewport = document.getElementById('carouselViewport');
const dotsWrap = document.getElementById('carouselDots');
const nowEl = document.getElementById('slideNow');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const autoBtn = document.getElementById('autoplayBtn');
const thumbs = document.querySelectorAll('.thumb');
const total = track ? track.children.length : 0;
let idx = 0, timer = null, playing = true;
const DELAY = 5000;

function renderDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    if (i === idx) b.classList.add('active');
    b.addEventListener('click', () => go(i, true));
    dotsWrap.appendChild(b);
  }
}
function go(i, manual = false) {
  idx = (i + total) % total;
  track.style.transform = `translateX(-${idx * 100}%)`;
  if (nowEl) nowEl.textContent = String(idx + 1).padStart(2, '0');
  renderDots();
  thumbs.forEach((t, k) => t.classList.toggle('active', k === idx));
  if (manual) restart();
}
function next(m = false) { go(idx + 1, m); }
function prev(m = false) { go(idx - 1, m); }
function start() {
  stop();
  timer = setInterval(() => next(false), DELAY);
  playing = true;
  if (autoBtn) { autoBtn.textContent = '⏸ Pause'; autoBtn.setAttribute('aria-pressed', 'true'); }
}
function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}
function restart() { if (playing) start(); }

if (track) {
  renderDots();
  start();
  if (nextBtn) nextBtn.addEventListener('click', () => next(true));
  if (prevBtn) prevBtn.addEventListener('click', () => prev(true));
  if (autoBtn) autoBtn.addEventListener('click', () => {
    if (playing) { stop(); playing = false; autoBtn.textContent = '▶ Play'; autoBtn.setAttribute('aria-pressed', 'false'); }
    else { playing = true; start(); }
  });
  // pause on hover
  const car = document.getElementById('projectCarousel');
  car.addEventListener('mouseenter', stop);
  car.addEventListener('mouseleave', () => { if (playing) start(); });
  // swipe
  let sx = 0, dx = 0, down = false;
  viewport.addEventListener('pointerdown', e => { down = true; sx = e.clientX; viewport.classList.add('dragging'); });
  window.addEventListener('pointermove', e => { if (down) dx = e.clientX - sx; });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false; viewport.classList.remove('dragging');
    if (dx < -40) next(true); else if (dx > 40) prev(true);
    dx = 0;
  });
  // thumbs + category pills
  thumbs.forEach(t => t.addEventListener('click', () => go(Number(t.dataset.goto), true)));
  document.querySelectorAll('[data-goto]').forEach(el => {
    if (el.classList.contains('thumb')) return;
    el.addEventListener('click', () => go(Number(el.dataset.goto), true));
  });
}

// ---- Lightbox ----
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCap = document.getElementById('lbCap');
document.querySelectorAll('[data-lightbox]').forEach(m => {
  m.addEventListener('click', () => {
    lbImg.src = m.dataset.lightbox;
    const card = m.closest('.slide');
    lbCap.textContent = card ? card.dataset.title : '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    stop();
  });
});
function closeLb() {
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  lbImg.src = '';
  if (playing) start();
}
document.getElementById('lbClose').addEventListener('click', closeLb);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLb();
  if (lb.classList.contains('open')) return;
  if (e.key === 'ArrowRight') next(true);
  if (e.key === 'ArrowLeft') prev(true);
});

// ---- Form ----
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(`Project inquiry from ${data.get('name') || 'portfolio'}`);
    const body = encodeURIComponent(`${data.get('message') || ''}\n\n— ${data.get('name') || ''} (${data.get('email') || ''})`);
    window.location.href = `mailto:apvarto@gmail.com?subject=${subject}&body=${body}`;
  });
}
