/* ==========================================================================
   Dagi Art — Script.js
   Modern, modular JavaScript powering the portfolio
   ========================================================================== */

'use strict';

/* ==========================================================================
   1. UTILITIES
   ========================================================================== */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

/* ==========================================================================
   2. PRELOADER
   ========================================================================== */
(function initPreloader() {
  const preloader = $('#preloader');
  if (!preloader) return;

  const hide = () => {
    preloader.classList.add('hidden');
    document.body.classList.remove('no-scroll');
    // Trigger hero reveals right after preloader
    setTimeout(() => {
      $$('.home [data-reveal]').forEach(el => el.classList.add('in-view'));
    }, 150);
  };

  document.body.classList.add('no-scroll');

  if (document.readyState === 'complete') {
    setTimeout(hide, 500);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 600));
    // Failsafe if load never fires
    setTimeout(hide, 3500);
  }
})();

/* ==========================================================================
   3. THEME TOGGLE
   ========================================================================== */
(function initTheme() {
  const root   = document.documentElement;
  const toggle = $('#themeToggle');
  if (!toggle) return;

  const icon = $('i', toggle);
  const saved = localStorage.getItem('dagi-theme');

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    icon.className = theme === 'light' ? 'bx bx-sun' : 'bx bx-moon';
  };

  applyTheme(saved || 'dark');

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('dagi-theme', next);
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
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = docHeight > 0 ? scrollTop / docHeight : 0;
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
  });

  // Smooth follow for ring
  const render = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  };
  render();

  // Grow on hover of interactive elements
  const hoverables = 'a, button, .Dagi-box, .filter-btn, .theme-toggle, input, textarea';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverables)) ring.classList.add('hovered');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverables)) ring.classList.remove('hovered');
  });

  // Hide when leaving the window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
})();

/* ==========================================================================
   6. MOBILE MENU TOGGLE
   ========================================================================== */
const menuIcon = $('#menu-icon');
const navbar   = $('#navbar');

if (menuIcon && navbar) {
  menuIcon.addEventListener('click', () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
    document.body.classList.toggle(
      'no-scroll',
      navbar.classList.contains('active')
    );
  });

  // Close menu when a link is clicked
  $$('a', navbar).forEach(link => {
    link.addEventListener('click', () => {
      menuIcon.classList.remove('bx-x');
      navbar.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  });
}

/* ==========================================================================
   7. STICKY HEADER + SCROLL ACTIVE LINK
   ========================================================================== */
(function initScrollSpy() {
  const header   = $('#header');
  const sections = $$('section[id]');
  const navLinks = $$('#navbar a');

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;

    // Sticky header
    if (header) header.classList.toggle('sticky', scrollY > 60);

    // Active link
    sections.forEach(sec => {
      const top    = sec.offsetTop - 200;
      const bottom = top + sec.offsetHeight;
      const id     = sec.getAttribute('id');

      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = $(`#navbar a[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });

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
   8. REVEAL ANIMATIONS (IntersectionObserver)
   ========================================================================== */
(function initReveals() {
  const items = $$('[data-reveal]');
  if (!items.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

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
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = Math.round(eased * target) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    nums.forEach(el => {
      el.textContent = el.dataset.target + (el.dataset.suffix || '');
    });
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
   11. GALLERY FILTER + SPOTLIGHT
   ========================================================================== */
(function initGallery() {
  const gallery = $('#gallery');
  if (!gallery) return;

  const boxes  = $$('.Dagi-box', gallery);
  const filterBtns = $$('.filter-btn');

  /* -------- Filtering -------- */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      boxes.forEach(box => {
        const match = filter === 'all' || box.dataset.category === filter;
        box.classList.toggle('is-hidden', !match);
      });

      // Re-trigger reveal animation
      boxes.forEach(box => {
        if (!box.classList.contains('is-hidden')) {
          box.style.animation = 'none';
          void box.offsetWidth;
          box.style.animation = '';
        }
      });
    });
  });

  /* -------- Spotlight follow (desktop) -------- */
  if (!isTouch && !prefersReducedMotion) {
    boxes.forEach(box => {
      box.addEventListener('mousemove', (e) => {
        const rect = box.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        box.style.setProperty('--mx', `${x}%`);
        box.style.setProperty('--my', `${y}%`);
      });
    });
  }
})();

/* ==========================================================================
   12. LIGHTBOX
   ========================================================================== */
(function initLightbox() {
  const lightbox = $('#lightbox');
  const lbImage  = $('#lbImage');
  const lbTitle  = $('#lbTitle');
  const lbCount  = $('#lbCount');
  const lbClose  = $('#lbClose');
  const lbPrev   = $('#lbPrev');
  const lbNext   = $('#lbNext');
  const boxes    = $$('.Dagi-box');

  if (!lightbox || !boxes.length) return;

  let currentIndex = 0;
  let lastFocused  = null;

  // Visible boxes only (respects filter)
  const getVisible = () => boxes.filter(b => !b.classList.contains('is-hidden'));

  const show = (index) => {
    const visible = getVisible();
    if (!visible.length) return;

    currentIndex = (index + visible.length) % visible.length;

    const box   = visible[currentIndex];
    const img   = $('img', box);
    const title = box.dataset.title || ($('h4', box)?.textContent ?? '');

    lbImage.src = img.src;
    lbImage.alt = img.alt || title;
    lbTitle.textContent = title;
    lbCount.textContent = `${currentIndex + 1} / ${visible.length}`;

    const multiple = visible.length > 1;
    lbPrev.disabled = !multiple;
    lbNext.disabled = !multiple;
  };

  const open = (box) => {
    const visible = getVisible();
    const index = visible.indexOf(box);
    lastFocused = document.activeElement;

    show(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    lbClose.focus();
  };

  const close = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocused) lastFocused.focus();
  };

  // Attach click handlers
  boxes.forEach(box => {
    box.addEventListener('click', () => open(box));
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => show(currentIndex - 1));
  lbNext.addEventListener('click', () => show(currentIndex + 1));

  // Click outside image closes
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  show(currentIndex - 1);
    if (e.key === 'ArrowRight') show(currentIndex + 1);
  });

  // Swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) < 55) return;
    if (dx > 0) show(currentIndex - 1);
    else        show(currentIndex + 1);
  }, { passive: true });
})();

/* ==========================================================================
   13. MAGNETIC BUTTONS
   ========================================================================== */
(function initMagnetic() {
  if (isTouch || prefersReducedMotion) return;

  const buttons = $$('.magnetic');
  const strength = 0.28;

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ==========================================================================
   14. BACK-TO-TOP WITH PROGRESS RING
   ========================================================================== */
(function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  const CIRCUMFERENCE = 2 * Math.PI * 20; // r = 20
  let ticking = false;

  const update = () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

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
   15. SMOOTH ANCHOR SCROLL (fallback for browsers without scroll-padding)
   ========================================================================== */
(function initSmoothAnchors() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h')
      ) || 76;

      const top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
})();

/* ==========================================================================
   16. EMAILJS — SEND MESSAGE
   ========================================================================== */
function SendMail() {
  const sending = $('#sending');
  const sendBtn = $('#sendBtn');

  const params = {
    from_name:   $('#fullName').value.trim(),
    email_id:    $('#email').value.trim(),
    phoneNumber: $('#phoneNumber').value.trim(),
    subject:     $('#subject').value.trim(),
    message:     $('#message').value.trim(),
  };

  // Show overlay
  if (sending) sending.hidden = false;
  if (sendBtn) sendBtn.disabled = true;

  emailjs
    .send('service_at5g52t', 'template_wtqxv5m', params)
    .then(() => {
      if (sending) sending.hidden = true;
      if (sendBtn) sendBtn.disabled = false;

      Swal.fire({
        title: 'Success!',
        text: 'Your message has been sent successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        background: 'var(--second-bg-color)',
        color: 'var(--text-color)',
        confirmButtonColor: 'var(--main-color)'
      });
    })
    .catch((err) => {
      console.error('EmailJS error:', err);
      if (sending) sending.hidden = true;
      if (sendBtn) sendBtn.disabled = false;

      Swal.fire({
        title: 'Error!',
        text: 'There was an error sending your message. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: 'var(--second-bg-color)',
        color: 'var(--text-color)',
        confirmButtonColor: 'var(--main-color)'
      });
    });
}

/* ==========================================================================
   17. CONTACT FORM VALIDATION + SUBMISSION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const form = $('#contact-form');
  if (!form) return;

  const fields = {
    name:    $('#fullName'),
    email:   $('#email'),
    mobile:  $('#phoneNumber'),
    subject: $('#subject'),
    message: $('#message'),
  };

  // Remove error ring on input
  Object.values(fields).forEach(field => {
    field.addEventListener('input', () => field.classList.remove('is-invalid'));
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showError = (field) => {
    field.classList.add('is-invalid');
    field.focus();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const values = {
      name:    fields.name.value.trim(),
      email:   fields.email.value.trim(),
      mobile:  fields.mobile.value.trim(),
      subject: fields.subject.value.trim(),
      message: fields.message.value.trim(),
    };

    // Required check
    const missing = Object.entries(values).find(([, v]) => !v);
    if (missing) {
      Swal.fire({
        title: 'Wait!',
        text: `Please fill in the ${missing[0]} field.`,
        icon: 'warning',
        confirmButtonText: 'OK',
        background: 'var(--second-bg-color)',
        color: 'var(--text-color)',
        confirmButtonColor: 'var(--main-color)'
      });
      showError(fields[missing[0]]);
      return;
    }

    // Email check
    if (!emailRegex.test(values.email)) {
      Swal.fire({
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
        icon: 'warning',
        confirmButtonText: 'OK',
        background: 'var(--second-bg-color)',
        color: 'var(--text-color)',
        confirmButtonColor: 'var(--main-color)'
      });
      showError(fields.email);
      return;
    }

    // Send!
    SendMail();
    form.reset();
    Object.values(fields).forEach(f => f.classList.remove('is-invalid'));
  });
});

/* ==========================================================================
   18. SUBTLE PARALLAX ON HERO IMAGE (desktop only)
   ========================================================================== */
(function initParallax() {
  if (isTouch || prefersReducedMotion) return;

  const img = $('.home-img');
  if (!img) return;

  let ticking = false;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 20;
    targetY = (e.clientY / window.innerHeight - 0.5) * 20;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  });

  const render = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    img.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
      requestAnimationFrame(render);
    } else {
      ticking = false;
    }
  };
})();

/* ==========================================================================
   19. LOG A NICE HELLO 👋
   ========================================================================== */
console.log(
  '%c🎨 Dagi Art %c— Portfolio by Dagim Gebeyehu',
  'background:linear-gradient(90deg,#00e5ff,#ff2e88);color:#04121a;padding:6px 10px;border-radius:6px 0 0 6px;font-weight:700',
  'background:#161b24;color:#e8f0f8;padding:6px 10px;border-radius:0 6px 6px 0'
);
