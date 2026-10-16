/* ==========================================================================
   Dagi Art — Script.js  (v2)
   Modular JavaScript powering the portfolio
   ========================================================================== */

'use strict';

/* ==========================================================================
   1. UTILITIES
   ========================================================================== */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const root = document.documentElement;
root.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

// localStorage can throw in private mode, so wrap it
const store = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }
};

/* ==========================================================================
   2. PRELOADER (with progress)
   ========================================================================== */
(function initPreloader() {
  const preloader = $('#preloader');
  if (!preloader) {
    document.dispatchEvent(new Event('dagi:ready'));
    return;
  }

  const bar = $('#preloaderBar');
  const pct = $('#preloaderPct');
  let progress = 0;
  let finished = false;

  const setProgress = (value) => {
    progress = value;
    if (bar) bar.style.transform = `scaleX(${value / 100})`;
    if (pct) pct.textContent = `${Math.round(value)}%`;
  };

  // Ease toward 90% while the page loads, then jump to 100%
  const timer = setInterval(() => {
    if (progress < 90) setProgress(progress + (90 - progress) * 0.08);
  }, 60);

  const hide = () => {
    preloader.classList.add('hidden');
    document.body.classList.remove('no-scroll');
    document.dispatchEvent(new Event('dagi:ready'));
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    clearInterval(timer);
    setProgress(100);
    setTimeout(hide, 450);
  };

  document.body.classList.add('no-scroll');

  if (document.readyState === 'complete') {
    finish();
  } else {
    window.addEventListener('load', finish);
    setTimeout(finish, 4500); // failsafe if load never fires (slow CDN)
  }
})();

/* ==========================================================================
   3. THEME + ACCENT COLOR
   ========================================================================== */
(function initTheme() {
  const toggle    = $('#themeToggle');
  const icon      = toggle ? $('i', toggle) : null;
  const metaTheme = $('meta[name="theme-color"]');

  const setTheme = (theme, save) => {
    root.setAttribute('data-theme', theme);
    if (icon) icon.className = theme === 'light' ? 'bx bx-sun' : 'bx bx-moon';
    if (metaTheme) metaTheme.setAttribute('content', theme === 'light' ? '#f2f5fa' : '#0d1117');
    if (save) store.set('dagi-theme', theme);
    document.dispatchEvent(new Event('dagi:themechange'));
  };

  setTheme(store.get('dagi-theme') === 'light' ? 'light' : 'dark', false);

  if (toggle) {
    toggle.addEventListener('click', () => {
      setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light', true);
    });
  }

  /* ----- Accent picker ----- */
  const picker   = $('#accentPicker');
  const pickBtn  = $('#accentBtn');
  const swatches = $$('.swatch');
  if (!picker || !pickBtn) return;

  const valid = swatches.map(s => s.dataset.accent);

  const setAccent = (accent, save) => {
    root.setAttribute('data-accent', accent);
    swatches.forEach(s => s.setAttribute('aria-pressed', String(s.dataset.accent === accent)));
    if (save) store.set('dagi-accent', accent);
    document.dispatchEvent(new Event('dagi:themechange'));
  };

  const saved = store.get('dagi-accent');
  setAccent(valid.includes(saved) ? saved : 'cyan', false);

  const setOpen = (open) => {
    picker.classList.toggle('open', open);
    pickBtn.setAttribute('aria-expanded', String(open));
  };

  pickBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!picker.classList.contains('open'));
  });

  swatches.forEach(s => s.addEventListener('click', () => {
    setAccent(s.dataset.accent, true);
    setOpen(false);
  }));

  document.addEventListener('click', (e) => {
    if (!picker.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
})();

/* ==========================================================================
   4. SCROLL PROGRESS BAR
   ========================================================================== */
(function initScrollProgress() {
  const bar = $('#scrollProgress');
  if (!bar) return;

  let ticking = false;

  const update = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = docHeight > 0 ? window.scrollY / docHeight : 0;
    bar.style.transform = `scaleX(${progress})`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
})();

/* ==========================================================================
   5. CUSTOM CURSOR
   ========================================================================== */
(function initCursor() {
  if (isTouch || prefersReducedMotion) return;

  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    root.classList.add('cursor-ready');
    root.classList.remove('cursor-out');
  });

  // Smooth follow for ring
  const render = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  };
  render();

  const hoverables = 'a, button, .Dagi-box, .filter-btn, input, textarea, .swatch';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverables)) ring.classList.add('hovered');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverables)) ring.classList.remove('hovered');
  });

  document.addEventListener('mouseleave', () => root.classList.add('cursor-out'));
  document.addEventListener('mouseenter', () => root.classList.remove('cursor-out'));
})();

/* ==========================================================================
   6. MOBILE MENU
   ========================================================================== */
(function initMenu() {
  const btn = $('#menu-icon');
  const nav = $('#navbar');
  if (!btn || !nav) return;

  const icon = $('i', btn);

  const setOpen = (open) => {
    nav.classList.toggle('active', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (icon) icon.className = open ? 'bx bx-x' : 'bx bx-menu';
    document.body.classList.toggle('no-scroll', open);
  };

  btn.addEventListener('click', () => setOpen(!nav.classList.contains('active')));
  $$('a', nav).forEach(link => link.addEventListener('click', () => setOpen(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('active')) setOpen(false);
  });

  window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
})();

/* ==========================================================================
   7. HEADER: STICKY, HIDE-ON-SCROLL, ACTIVE LINK
   ========================================================================== */
(function initHeader() {
  const header   = $('#header');
  const nav      = $('#navbar');
  const sections = $$('section[id]');
  const links    = $$('#navbar a');
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;

    header.classList.toggle('sticky', y > 60);

    const delta = y - lastY;
    if (Math.abs(delta) > 6) {
      const menuOpen = nav && nav.classList.contains('active');
      header.classList.toggle('header-hidden', delta > 0 && y > 480 && !menuOpen);
      lastY = y;
    }
    if (y < 120) header.classList.remove('header-hidden');

    // Active link
    let current = sections.length ? sections[0].id : null;
    sections.forEach(sec => {
      if (y + window.innerHeight * 0.35 >= sec.offsetTop) current = sec.id;
    });
    if (sections.length && window.innerHeight + y >= document.documentElement.scrollHeight - 6) {
      current = sections[sections.length - 1].id;
    }
    const link = current ? $(`#navbar a[href="#${current}"]`) : null;
    if (link) links.forEach(l => l.classList.toggle('active', l === link));

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
})();

/* ==========================================================================
   8. REVEAL ANIMATIONS
      Played with the Web Animations API so they never clash with CSS hover
      transforms or other CSS animations on the same element.
   ========================================================================== */
(function initReveals() {
  const FROM = {
    left:   { translate: '-6rem 0' },
    right:  { translate: '6rem 0' },
    top:    { translate: '0 -5rem' },
    bottom: { translate: '0 5rem' },
    zoom:   { scale: '0.86' }
  };

  // Stagger children of [data-stagger] containers
  $$('[data-stagger]').forEach(container => {
    [...container.children].forEach((child, i) => {
      child.style.setProperty('--d', `${(i % 4) * 90}ms`);
    });
  });

  const delayOf = (el) => {
    const v = el.style.getPropertyValue('--d').trim();
    if (!v) return 0;
    return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
  };

  const show = (el) => {
    if (el.classList.contains('in-view')) return;
    el.classList.add('in-view');

    if (prefersReducedMotion || el.dataset.reveal === 'none' || !el.animate) return;

    const from = Object.assign({ opacity: 0 }, FROM[el.dataset.reveal] || { translate: '0 2.6rem' });
    const to = { opacity: 1, translate: '0 0', scale: '1' };

    try {
      el.animate([from, to], {
        duration: 900,
        delay: delayOf(el),
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards'
      });
    } catch (err) { /* older browsers: element just appears */ }
  };

  const heroItems = $$('.home [data-reveal]');
  const items = $$('[data-reveal]').filter(el => !heroItems.includes(el));

  // Hero reveals once the preloader is gone
  document.addEventListener('dagi:ready', () => {
    setTimeout(() => heroItems.forEach(show), 150);
  }, { once: true });
  setTimeout(() => heroItems.forEach(show), 6000); // safety net

  if (!('IntersectionObserver' in window)) {
    items.forEach(show);
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        show(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* ==========================================================================
   9. TYPED.JS — Rotating Text
   ========================================================================== */
(function initTyped() {
  const el = $('.multiple-text');
  if (!el || typeof Typed === 'undefined') return;

  new Typed('.multiple-text', {
    strings: ['Painter', 'Illustrator', 'Sketch Artist', 'Storyteller'],
    typeSpeed: 70,
    backSpeed: 45,
    backDelay: 1400,
    startDelay: 400,
    smartBackspace: true,
    showCursor: false, // the CSS caret is used instead
    loop: true
  });
})();

/* ==========================================================================
   10. ANIMATED STAT COUNTERS
   ========================================================================== */
(function initCounters() {
  const nums = $$('.stat-num');
  if (!nums.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.target || '0');
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo
      el.textContent = Math.round(eased * target) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    nums.forEach(el => { el.textContent = el.dataset.target + (el.dataset.suffix || ''); });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(el => observer.observe(el));
})();

/* ==========================================================================
   11. GALLERY: LOADING STATES, FILTER, COUNTS
   ========================================================================== */
(function initGallery() {
  const gallery = $('#gallery');
  if (!gallery) return;

  const boxes   = $$('.Dagi-box', gallery);
  const btns    = $$('.filter-btn');
  const empty   = $('#galleryEmpty');

  // Accessibility + image load / error states
  boxes.forEach(box => {
    const img   = $('img', box);
    const title = box.dataset.title || 'Artwork';

    box.setAttribute('role', 'button');
    box.tabIndex = 0;
    box.setAttribute('aria-label', `Open ${title}`);

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        box.click();
      }
    });

    if (!img) return;
    const ok  = () => box.classList.add('loaded');
    const bad = () => box.classList.add('loaded', 'img-error');

    if (img.complete) {
      (img.naturalWidth > 0 ? ok : bad)();
    } else {
      img.addEventListener('load', ok, { once: true });
      img.addEventListener('error', bad, { once: true });
    }
  });

  // Counts on filter buttons
  btns.forEach(btn => {
    const f = btn.dataset.filter;
    const n = f === 'all' ? boxes.length : boxes.filter(b => b.dataset.category === f).length;
    const badge = $('.count', btn);
    if (badge) badge.textContent = n;
  });

  // Filtering
  const applyFilter = (filter) => {
    let shown = 0;
    boxes.forEach(box => {
      const match = filter === 'all' || box.dataset.category === filter;
      box.classList.toggle('is-hidden', !match);
      box.classList.remove('pop');

      if (match) {
        box.classList.add('in-view'); // make sure it is visible even if not yet revealed
        if (!prefersReducedMotion) {
          box.style.animationDelay = `${shown * 45}ms`;
          void box.offsetWidth; // restart the animation
          box.classList.add('pop');
        }
        shown++;
      }
    });
    if (empty) empty.hidden = shown > 0;
  };

  boxes.forEach(box => {
    box.addEventListener('animationend', (e) => {
      if (e.animationName === 'popIn') {
        box.classList.remove('pop');
        box.style.animationDelay = '';
      }
    });
  });

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });
})();

/* ==========================================================================
   12. 3D TILT + SPOTLIGHT (desktop only)
   ========================================================================== */
(function initTilt() {
  if (isTouch || prefersReducedMotion) return;

  const MAX = 7; // degrees
  $$('.Dagi-box, .about-visual, .stat-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top)  / rect.height;

      card.style.setProperty('--ry', `${(x - 0.5) * 2 * MAX}deg`);
      card.style.setProperty('--rx', `${(0.5 - y) * 2 * MAX}deg`);
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();

/* ==========================================================================
   13. LIGHTBOX (zoom, slideshow, thumbnails, fullscreen, swipe)
   ========================================================================== */
(function initLightbox() {
  const lb      = $('#lightbox');
  const gallery = $('#gallery');
  if (!lb || !gallery) return;

  const img     = $('#lbImage');
  const title   = $('#lbTitle');
  const count   = $('#lbCount');
  const btnClose = $('#lbClose');
  const prev    = $('#lbPrev');
  const next    = $('#lbNext');
  const zoomBtn = $('#lbZoom');
  const fullBtn = $('#lbFull');
  const playBtn = $('#lbPlay');
  const thumbsEl = $('#lbThumbs');
  const bar     = $('#lbBar');
  const stage   = $('.lb-stage', lb);
  const boxes   = $$('.Dagi-box', gallery);

  const DELAY = 3500;
  let list = [];
  let index = 0;
  let lastFocused = null;
  let playing = false;
  let zoomed = false;
  let timer = null;

  const visible = () => boxes.filter(b => !b.classList.contains('is-hidden'));
  const srcOf = (box) => { const i = $('img', box); return i.currentSrc || i.src; };
  const iconOf = (btn, cls) => { const i = btn.firstElementChild; if (i) i.className = cls; };

  /* ----- Zoom ----- */
  const setZoom = (value) => {
    zoomed = value;
    img.classList.toggle('zoomed', value);
    iconOf(zoomBtn, value ? 'bx bx-zoom-out' : 'bx bx-zoom-in');
    if (!value) img.style.transformOrigin = '';
  };

  const originAt = (e) => {
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top)  / r.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
  };

  img.addEventListener('click', (e) => {
    if (!zoomed) originAt(e);
    setZoom(!zoomed);
  });
  stage.addEventListener('mousemove', (e) => { if (zoomed) originAt(e); });
  zoomBtn.addEventListener('click', () => setZoom(!zoomed));

  /* ----- Slideshow ----- */
  const stopTimer = () => {
    clearTimeout(timer);
    bar.style.transition = 'none';
    bar.style.width = '0%';
  };

  const startTimer = () => {
    stopTimer();
    if (!playing) return;
    void bar.offsetWidth;
    bar.style.transition = `width ${DELAY}ms linear`;
    bar.style.width = '100%';
    timer = setTimeout(() => { show(index + 1); startTimer(); }, DELAY);
  };

  const setPlaying = (value) => {
    playing = value;
    playBtn.setAttribute('aria-pressed', String(value));
    playBtn.setAttribute('aria-label', value ? 'Pause slideshow' : 'Start slideshow');
    iconOf(playBtn, value ? 'bx bx-pause' : 'bx bx-play');
    value ? startTimer() : stopTimer();
  };

  playBtn.addEventListener('click', () => setPlaying(!playing));

  /* ----- Thumbnails ----- */
  const buildThumbs = () => {
    thumbsEl.innerHTML = '';
    list.forEach((box, i) => {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'lb-thumb';
      t.setAttribute('aria-label', `Go to image ${i + 1}`);

      const im = document.createElement('img');
      im.src = srcOf(box);
      im.alt = '';
      t.appendChild(im);

      t.addEventListener('click', () => { show(i); if (playing) startTimer(); });
      thumbsEl.appendChild(t);
    });
  };

  /* ----- Show an image ----- */
  const show = (i) => {
    if (!list.length) return;

    index = (i + list.length) % list.length;
    const box = list[index];
    const src = srcOf(box);

    setZoom(false);

    img.onload = img.onerror = () => img.classList.remove('is-loading');
    if (img.getAttribute('src') !== src) {
      img.classList.add('is-loading');
      img.src = src;
    }

    const original = $('img', box);
    img.alt = (original && original.alt) || box.dataset.title || '';
    title.textContent = box.dataset.title || '';
    count.textContent = `${index + 1} / ${list.length}`;

    const multiple = list.length > 1;
    prev.disabled = next.disabled = playBtn.disabled = !multiple;

    $$('.lb-thumb', thumbsEl).forEach((t, k) => {
      t.classList.toggle('active', k === index);
      if (k === index) {
        thumbsEl.scrollTo({
          left: t.offsetLeft - thumbsEl.clientWidth / 2 + t.clientWidth / 2,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    });
  };

  const go = (i) => { show(i); if (playing) startTimer(); };

  /* ----- Open / close ----- */
  const open = (box) => {
    list = visible();
    const i = list.indexOf(box);
    lastFocused = document.activeElement;

    buildThumbs();
    show(i < 0 ? 0 : i);

    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    btnClose.focus({ preventScroll: true });
  };

  const close = () => {
    setPlaying(false);
    setZoom(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});

    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  };

  boxes.forEach(box => box.addEventListener('click', () => open(box)));

  btnClose.addEventListener('click', close);
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));

  // Click on the dark backdrop closes
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

  /* ----- Fullscreen ----- */
  if (!lb.requestFullscreen) {
    fullBtn.hidden = true;
  } else {
    fullBtn.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else lb.requestFullscreen().catch(() => {});
    });
    document.addEventListener('fullscreenchange', () => {
      iconOf(fullBtn, document.fullscreenElement ? 'bx bx-exit-fullscreen' : 'bx bx-fullscreen');
    });
  }

  /* ----- Keyboard ----- */
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;

    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'Home')       go(0);
    if (e.key === 'End')        go(list.length - 1);

    // Keep Tab focus inside the viewer
    if (e.key === 'Tab') {
      const focusable = $$('button:not([disabled]):not([hidden])', lb).filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ----- Swipe ----- */
  let touchStartX = 0;
  lb.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lb.addEventListener('touchend', (e) => {
    if (zoomed) return;
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) < 55) return;
    go(dx > 0 ? index - 1 : index + 1);
  }, { passive: true });
})();

/* ==========================================================================
   14. BUTTONS: RIPPLE + MAGNETIC
   ========================================================================== */
(function initButtons() {
  const buttons = $$('.btn');

  if (!prefersReducedMotion) {
    buttons.forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const dot = document.createElement('span');
        dot.className = 'ripple';
        dot.style.cssText =
          `width:${size}px;height:${size}px;` +
          `left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
        btn.appendChild(dot);
        dot.addEventListener('animationend', () => dot.remove());
      });
    });
  }

  if (isTouch || prefersReducedMotion) return;

  const strength = 0.28;
  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.setProperty('--bx', `${x * strength}px`);
      btn.style.setProperty('--by', `${y * strength}px`);
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--bx', '0px');
      btn.style.setProperty('--by', '0px');
    });
  });
})();

/* ==========================================================================
   15. BACK-TO-TOP WITH PROGRESS RING
   ========================================================================== */
(function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  let ticking = false;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    btn.style.setProperty('--progress', progress.toFixed(4));
    btn.classList.toggle('visible', scrollTop > 400);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  update();
})();

/* ==========================================================================
   16. SMOOTH ANCHOR SCROLL
   ========================================================================== */
(function initSmoothAnchors() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      const header  = $('#header');
      const headerH = header ? header.offsetHeight : 76;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerH + 1);

      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
})();

/* ==========================================================================
   17. CONTACT FORM (inline validation + EmailJS)
   ========================================================================== */
(function initForm() {
  const form = $('#contact-form');
  if (!form) return;

  const f = {
    name:    $('#fullName'),
    email:   $('#email'),
    phone:   $('#phoneNumber'),
    subject: $('#subject'),
    message: $('#message'),
  };
  const trap    = $('#website');
  const sendBtn = $('#sendBtn');
  const sending = $('#sending');
  const counter = $('#msgCount');

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Each rule returns true, or an error message string
  const rules = {
    name:    v => v.length >= 2 || 'Please tell me your name.',
    email:   v => emailRe.test(v) || 'Please enter a valid email address.',
    phone:   v => !v || /^\+?[\d\s\-().]{6,20}$/.test(v) || 'That phone number looks off.',
    message: v => v.length >= 10 || 'Please write at least 10 characters.',
  };

  const setError = (key, message) => {
    const field = f[key].closest('.field');
    const out = $('.err', field);
    field.classList.toggle('invalid', Boolean(message));
    f[key].setAttribute('aria-invalid', String(Boolean(message)));
    if (out) out.textContent = message || '';
  };

  const check = (key) => {
    const result = rules[key](f[key].value.trim());
    setError(key, result === true ? '' : result);
    return result === true;
  };

  Object.keys(rules).forEach(key => {
    const field = f[key].closest('.field');
    f[key].addEventListener('blur', () => {
      if (f[key].value.trim() || field.classList.contains('invalid')) check(key);
    });
    f[key].addEventListener('input', () => {
      if (field.classList.contains('invalid')) check(key);
    });
  });

  const updateCounter = () => {
    if (counter) counter.textContent = `${f.message.value.length} / ${f.message.maxLength}`;
  };
  f.message.addEventListener('input', updateCounter);

  const notify = (opts) => {
    if (typeof Swal === 'undefined') {
      window.alert(`${opts.title} ${opts.text}`);
      return;
    }
    Swal.fire(Object.assign({
      confirmButtonText: 'OK',
      background: 'var(--second-bg-color)',
      color: 'var(--text-color)',
      confirmButtonColor: 'var(--main-color)'
    }, opts));
  };

  const setBusy = (busy) => {
    if (sending) sending.hidden = !busy;
    if (sendBtn) sendBtn.disabled = busy;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Honeypot: bots fill it, people never see it
    if (trap && trap.value) { form.reset(); return; }

    const keys    = Object.keys(rules);
    const results = keys.map(check);
    const firstBad = keys.find((k, i) => !results[i]);

    if (firstBad) {
      f[firstBad].focus();
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      return;
    }

    if (typeof emailjs === 'undefined') {
      notify({
        title: 'Error!',
        text: 'The email service could not be loaded. Please check your connection and try again.',
        icon: 'error'
      });
      return;
    }

    const params = {
      from_name:   f.name.value.trim(),
      email_id:    f.email.value.trim(),
      phoneNumber: f.phone.value.trim(),
      subject:     f.subject.value.trim() || 'New message from your portfolio',
      message:     f.message.value.trim(),
    };

    setBusy(true);

    emailjs.send('service_at5g52t', 'template_wtqxv5m', params)
      .then(() => {
        form.reset(); // only clear the form when the message really went out
        updateCounter();
        keys.forEach(k => setError(k, ''));
        notify({ title: 'Success!', text: 'Your message has been sent successfully.', icon: 'success' });
      })
      .catch((err) => {
        console.error('EmailJS error:', err);
        notify({
          title: 'Error!',
          text: 'There was an error sending your message. Please try again.',
          icon: 'error'
        });
      })
      .finally(() => setBusy(false));
  });
})();

/* ==========================================================================
   18. SUBTLE PARALLAX ON HERO IMAGE (desktop only)
   ========================================================================== */
(function initParallax() {
  if (isTouch || prefersReducedMotion) return;

  const el = $('.home-img');
  if (!el) return;

  let running = false;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  const render = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
      requestAnimationFrame(render);
    } else {
      running = false;
    }
  };

  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 20;
    targetY = (e.clientY / window.innerHeight - 0.5) * 20;
    if (!running) {
      running = true;
      requestAnimationFrame(render);
    }
  });
})();

/* ==========================================================================
   19. PARTICLE BACKGROUND (follows the accent color, reacts to the mouse)
   ========================================================================== */
(function initParticles() {
  if (prefersReducedMotion) return;

  const canvas = $('#particles');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  if (!ctx) return;

  const LINK = 130;
  let w = 0, h = 0, dpr = 1;
  let parts = [];
  let rgb = [0, 229, 255];
  let raf = null;
  const mouse = { x: -9999, y: -9999 };

  const readColor = () => {
    const c = getComputedStyle(root).getPropertyValue('--main-color').trim();
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
    if (m) rgb = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const base = Math.round((w * h) / 22000);
    const total = Math.min(Math.max(base * (w < 700 ? 0.6 : 1), 24), 90);
    parts = Array.from({ length: Math.round(total) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: 1 + Math.random() * 1.4
    }));
  };

  const step = () => {
    ctx.clearRect(0, 0, w, h);
    const [r, g, b] = rgb;

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;

      // Gently push away from the mouse
      const mx = p.x - mouse.x;
      const my = p.y - mouse.y;
      const md = mx * mx + my * my;
      if (md < 150 * 150 && md > 1) {
        const force = (1 - Math.sqrt(md) / 150) * 0.6;
        const len = Math.sqrt(md);
        p.x += (mx / len) * force;
        p.y += (my / len) * force;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.55)`;
      ctx.fill();

      for (let j = i + 1; j < parts.length; j++) {
        const q = parts[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(1 - d / LINK) * 0.2})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(step);
  };

  const start = () => { if (!raf) raf = requestAnimationFrame(step); };
  const stop  = () => { cancelAnimationFrame(raf); raf = null; };

  readColor();
  resize();
  start();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  document.addEventListener('dagi:themechange', readColor);
})();

/* ==========================================================================
   20. FOOTER YEAR + HELLO
   ========================================================================== */
(function initFooter() {
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();

console.log(
  '%c🎨 Dagi Art %c— Portfolio by Dagim Gebeyehu',
  'background:linear-gradient(90deg,#00e5ff,#ff2e88);color:#04121a;padding:6px 10px;border-radius:6px 0 0 6px;font-weight:700',
  'background:#161b24;color:#e8f0f8;padding:6px 10px;border-radius:0 6px 6px 0'
);
