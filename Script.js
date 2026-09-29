/* ===== Gallery data: edit titles / categories here ===== */
const drawings = [
  { file: 'Dagi1.jpg',  title: 'Dagi',  cat: 'portrait' },
  { file: 'Dagi2.jpg',  title: 'Leul',  cat: 'portrait' },
  { file: 'Dagi3.jpg',  title: 'Taju',  cat: 'portrait' },
  { file: 'Dagi4.jpg',  title: 'Dagi',  cat: 'other' },
  { file: 'Dagi5.jpg',  title: 'Dagi',  cat: 'other' },
  { file: 'Dagi6.jpg',  title: 'Dagi',  cat: 'other' },
  { file: 'Dagi7.jpg',  title: 'Dagi',  cat: 'other' },
  { file: 'Dagi8.jpg',  title: 'Dagi',  cat: 'other' },
  { file: 'Dagi9.jpg',  title: 'Dagi',  cat: 'other' },
  { file: 'Dagi10.jpg', title: 'Dagi',  cat: 'other' },
  { file: 'Dagi11.jpg', title: 'Dagi',  cat: 'other' },
  { file: 'Dagi12.jpg', title: 'Dagi',  cat: 'other' },
  { file: 'Dagi13.jpg', title: 'Dagi',  cat: 'other' },
  { file: 'Dagi14.jpg', title: 'Dagi',  cat: 'other' },
  { file: 'Dagi15.jpg', title: 'Dagi',  cat: 'other' }
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ===== Theme (remembered) ===== */
const root = document.documentElement;
const themeBtn = $('#theme-toggle');
function setTheme(t) {
  root.dataset.theme = t;
  themeBtn.innerHTML = `<i class="bx bx-${t === 'dark' ? 'sun' : 'moon'}"></i>`;
  try { localStorage.setItem('theme', t); } catch (e) {}
}
let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
setTheme(saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
themeBtn.onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');

/* ===== Mobile menu ===== */
const menuBtn = $('#menu-icon');
const navbar = $('#navbar');
function closeMenu() {
  navbar.classList.remove('active');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.innerHTML = '<i class="bx bx-menu"></i>';
}
menuBtn.onclick = () => {
  const open = navbar.classList.toggle('active');
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.innerHTML = `<i class="bx bx-${open ? 'x' : 'menu'}"></i>`;
};
$$('.navbar a').forEach(a => a.addEventListener('click', closeMenu));

/* ===== Scroll: active link, sticky header, progress bar, back-to-top ===== */
const sections = $$('section[id]');
const navLinks = $$('.navbar a');
const header = $('.header');
const progress = $('#progress');
const toTop = $('#to-top');
addEventListener('scroll', () => {
  const y = scrollY;
  sections.forEach(sec => {
    if (y >= sec.offsetTop - 150 && y < sec.offsetTop - 150 + sec.offsetHeight) {
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + sec.id));
    }
  });
  header.classList.toggle('sticky', y > 100);
  toTop.classList.toggle('show', y > 500);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
}, { passive: true });

/* ===== Build gallery ===== */
const gallery = $('#gallery');
gallery.innerHTML = drawings.map((d, i) => `
  <button class="Dagi-box" data-cat="${d.cat}" data-i="${i}" aria-label="View ${d.title}, drawing ${i + 1}">
    <img src="Images/${d.file}" alt="Drawing: ${d.title}" loading="lazy">
    <span class="Dagi-layer"><h4>${d.title}</h4><i class="bx bx-fullscreen"></i></span>
  </button>`).join('');

/* ===== Filters ===== */
$('#filters').addEventListener('click', e => {
  const btn = e.target.closest('.filter');
  if (!btn) return;
  $$('.filter').forEach(b => b.classList.toggle('active', b === btn));
  const f = btn.dataset.filter;
  $$('.Dagi-box').forEach(b => b.classList.toggle('hide', f !== 'all' && b.dataset.cat !== f));
});

/* ===== Lightbox with keyboard + swipe ===== */
const lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
let current = 0, lastFocus = null;
const visible = () => $$('.Dagi-box:not(.hide)').map(b => +b.dataset.i);
function show(i) {
  current = i;
  lbImg.src = 'Images/' + drawings[i].file;
  lbImg.alt = 'Drawing: ' + drawings[i].title;
  lbCap.textContent = drawings[i].title;
}
function openLb(i) {
  lastFocus = document.activeElement;
  show(i);
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#lb-close').focus();
}
function closeLb() {
  lb.hidden = true;
  document.body.style.overflow = '';
  lastFocus && lastFocus.focus();
}
function step(dir) {
  const list = visible();
  const pos = list.indexOf(current);
  show(list[(pos + dir + list.length) % list.length]);
}
gallery.addEventListener('click', e => {
  const box = e.target.closest('.Dagi-box');
  if (box) openLb(+box.dataset.i);
});
$('#lb-close').onclick = closeLb;
$('#lb-prev').onclick = () => step(-1);
$('#lb-next').onclick = () => step(1);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});
let touchX = 0;
lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
});

/* ===== Animated stat counters ===== */
const counters = $$('[data-count]');
const counterObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, end = +el.dataset.count;
    let n = 0;
    const timer = setInterval(() => {
      n += Math.max(1, Math.ceil(end / 40));
      if (n >= end) { n = end; clearInterval(timer); }
      el.textContent = n + '+';
    }, 40);
    obs.unobserve(el);
  });
}, { threshold: .6 });
counters.forEach(c => counterObs.observe(c));

/* ===== Scroll reveal & typed text ===== */
ScrollReveal({ distance: '80px', duration: 1600, delay: 150 });
ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .about-wrap, .filters, .Contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1', { origin: 'left' });
ScrollReveal().reveal('.home-content p', { origin: 'right' });
new Typed('.multiple-text', {
  strings: ['Painter', 'Portrait Artist', 'Storyteller'],
  typeSpeed: 100, backSpeed: 60, backDelay: 1200, loop: true
});

/* ===== Footer year ===== */
$('#year').textContent = new Date().getFullYear();

/* ===== Contact form ===== */
const form = $('#contact-form');
const spinner = $('#spinner');
const sendBtn = $('#send-btn');
const msg = $('#message');
msg.addEventListener('input', () => { $('#count').textContent = msg.value.length; });

const fire = (icon, title, text) => Swal.fire({ icon, title, text, confirmButtonText: 'OK' });
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

form.addEventListener('submit', e => {
  e.preventDefault();
  const fields = ['fullName', 'email', 'phoneNumber', 'subject', 'message'].map(id => $('#' + id));
  fields.forEach(f => f.classList.remove('invalid'));

  const empty = fields.filter(f => !f.value.trim());
  empty.forEach(f => f.classList.add('invalid'));
  if (empty.length) return fire('error', 'Missing details', 'Fill in all fields, then send again.');

  if (!emailOk($('#email').value.trim())) {
    $('#email').classList.add('invalid');
    return fire('error', 'Check your email', 'Enter an address like name@example.com.');
  }

  const [name, email, phone, subject, message] = fields.map(f => f.value.trim());
  spinner.style.display = 'block';
  sendBtn.disabled = true;

  emailjs.send('service_at5g52t', 'template_wtqxv5m', {
    from_name: name, email_id: email, phoneNumber: phone, subject, message
  }).then(() => {
    fire('success', 'Message sent', 'Thanks! I will reply soon.');
    form.reset();
    $('#count').textContent = 0;
  }).catch(() => {
    fire('error', 'Message not sent', 'Check your connection and try again.');
  }).finally(() => {
    spinner.style.display = 'none';
    sendBtn.disabled = false;
  });
});
