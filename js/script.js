/* =========================================
   SCRIPT.JS — Buku (slide halaman), Sidebar, Tema, Typing, Counter, Form
========================================= */
document.addEventListener('DOMContentLoaded', () => {

  const THEME_KEY = 'gr-portfolio-theme';
  const SIDEBAR_KEY = 'gr-portfolio-sidebar';
  const FLIP_MS = 700;

  const safeGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* abaikan */ } };

  const body = document.body;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- FOOTER YEAR ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- DARK MODE ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = themeToggle.querySelector('.theme-toggle__label');

  const syncThemeLabel = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    themeLabel.textContent = dark ? 'Mode siang' : 'Mode malam';
  };
  syncThemeLabel();

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    safeSet(THEME_KEY, next);
    syncThemeLabel();
  });

  /* ---------- SIDEBAR (buka / tutup) ---------- */
  const sidebar = document.getElementById('sidebar');
  const openBtn = document.getElementById('sidebarOpen');
  const closeBtn = document.getElementById('sidebarClose');
  const backdrop = document.getElementById('backdrop');
  const mobileMQ = window.matchMedia('(max-width: 900px)');

  const setSidebar = (open, persist = true) => {
    body.classList.toggle('sidebar-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    sidebar.toggleAttribute('inert', !open);
    sidebar.setAttribute('aria-hidden', String(!open));
    if (persist && !mobileMQ.matches) safeSet(SIDEBAR_KEY, open ? 'open' : 'closed');
  };

  const initialSidebar = () => {
    if (mobileMQ.matches) return false;
    return safeGet(SIDEBAR_KEY) !== 'closed';
  };
  setSidebar(initialSidebar(), false);

  openBtn.addEventListener('click', () => setSidebar(true));
  closeBtn.addEventListener('click', () => { setSidebar(false); openBtn.focus(); });
  backdrop.addEventListener('click', () => setSidebar(false));

  // saat ukuran layar berpindah desktop <-> mobile, atur ulang
  mobileMQ.addEventListener('change', () => setSidebar(initialSidebar(), false));

  /* ---------- HALAMAN BUKU ---------- */
  const book = document.getElementById('book');
  const pages = Array.from(document.querySelectorAll('.page'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const dotsWrap = document.getElementById('pagerDots');
  const countEl = document.getElementById('pagerCount');

  let current = -1;
  let cleanupTimer = null;

  // beri urutan muncul (stagger) pada elemen .rise di tiap halaman
  pages.forEach(page => {
    page.querySelectorAll('.rise').forEach((el, i) => el.style.setProperty('--i', i));
    page.setAttribute('inert', '');
  });

  // titik navigasi
  const dots = pages.map((page, i) => {
    const dot = document.createElement('button');
    dot.className = 'pager__dot';
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Halaman ${i + 1}: ${page.dataset.title}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
    return dot;
  });

  const updateUI = (i) => {
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${pages[i].id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === i);
      d.setAttribute('aria-selected', String(idx === i));
    });
    countEl.textContent = `Halaman ${i + 1} / ${pages.length}`;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === pages.length - 1;
  };

  function goTo(index, { animate = true, updateHash = true } = {}) {
    if (index < 0 || index >= pages.length || index === current) return;

    const incoming = pages[index];
    const outgoing = current >= 0 ? pages[current] : null;
    const direction = index > current ? 'next' : 'prev';

    // bersihkan sisa animasi sebelumnya
    clearTimeout(cleanupTimer);
    pages.forEach(p => p.classList.remove('leave-next', 'enter-next', 'leave-prev', 'enter-prev'));
    pages.forEach(p => { if (p !== incoming) p.classList.remove('is-active'); });

    incoming.removeAttribute('inert');
    incoming.scrollTop = 0;
    incoming.classList.add('is-active');

    if (outgoing) {
      outgoing.setAttribute('inert', '');
      if (animate && !reduceMotion) {
        outgoing.classList.add(`leave-${direction}`);
        incoming.classList.add(`enter-${direction}`);
        book.classList.add('is-flipping');
        cleanupTimer = setTimeout(() => {
          pages.forEach(p => p.classList.remove('leave-next', 'enter-next', 'leave-prev', 'enter-prev'));
          book.classList.remove('is-flipping');
        }, FLIP_MS + 40);
      }
    }

    current = index;
    updateUI(index);
    onPageEnter(incoming);

    if (updateHash) {
      try { history.replaceState(null, '', `#${incoming.id}`); } catch (e) { /* abaikan */ }
    }
  }

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // semua link #anchor (sidebar, tombol hero, dll) membalik halaman
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const idx = pages.findIndex(p => p.id === id);
      if (idx === -1) return;
      e.preventDefault();
      goTo(idx);
      if (mobileMQ.matches && link.closest('.sidebar')) setSidebar(false);
    });
  });

  window.addEventListener('hashchange', () => {
    const idx = pages.findIndex(p => p.id === location.hash.slice(1));
    if (idx !== -1) goTo(idx, { updateHash: false });
  });

  /* ---------- KEYBOARD ---------- */
  document.addEventListener('keydown', (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);

    if (e.key === 'Escape' && mobileMQ.matches && body.classList.contains('sidebar-open')) {
      setSidebar(false);
      return;
    }
    if (typing || e.altKey || e.ctrlKey || e.metaKey) return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') next();
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev();
  });

  /* ---------- SWIPE (sentuh) ---------- */
  const stack = document.getElementById('stack');
  let touchX = 0, touchY = 0, touchT = 0, tracking = false;

  stack.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchX = t.clientX; touchY = t.clientY; touchT = Date.now();
    tracking = !e.target.closest('input, textarea, select');
  }, { passive: true });

  stack.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchX;
    const dy = t.clientY - touchY;
    const fast = Date.now() - touchT < 700;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6 && fast) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  /* ---------- EFEK PER HALAMAN ---------- */
  // counter statistik: jalan tiap halaman About dibuka
  const runCounters = (page) => {
    page.querySelectorAll('.stat-number').forEach(el => {
      const target = parseInt(el.dataset.count, 10) || 0;
      if (reduceMotion) { el.textContent = target; return; }
      let currentVal = 0;
      el.textContent = '0';
      const step = Math.max(1, Math.ceil(target / 30));
      const tick = () => {
        currentVal += step;
        if (currentVal >= target) {
          el.textContent = target;
        } else {
          el.textContent = currentVal;
          setTimeout(tick, 45);
        }
      };
      setTimeout(tick, 500);
    });
  };

  function onPageEnter(page) {
    if (page.id === 'about') runCounters(page);
  }

  /* ---------- FOTO PROFIL (fallback inisial jika gambar tidak ada) ---------- */
  const avatarFrame = document.getElementById('avatarFrame');
  const avatarImg = document.getElementById('avatarImg');
  if (avatarFrame && avatarImg) {
    const markOk = () => avatarFrame.classList.add('has-image');
    const markFail = () => avatarFrame.classList.add('no-image');
    avatarImg.addEventListener('load', markOk);
    avatarImg.addEventListener('error', markFail);
    if (avatarImg.complete) (avatarImg.naturalWidth > 0 ? markOk : markFail)();
  }

  /* ---------- TYPING EFFECT ---------- */
  const typingText = document.getElementById('typingText');
  const phrases = [
    'Building modern digital experiences with clean code and thoughtful design.',
    'Software · Web · Mobile · Game Development.'
  ];

  if (typingText && !reduceMotion) {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const type = () => {
      const currentPhrase = phrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        typingText.textContent = currentPhrase.slice(0, charIndex);
        if (charIndex === currentPhrase.length) {
          deleting = true;
          setTimeout(type, 1800);
          return;
        }
      } else {
        charIndex--;
        typingText.textContent = currentPhrase.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      setTimeout(type, deleting ? 30 : 55);
    };
    type();
  } else if (typingText) {
    typingText.textContent = phrases[0];
  }

  /* ---------- CONTACT FORM VALIDATION & FORMSPREE ---------- */
  const form = document.getElementById('contactForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const formSuccess = document.getElementById('formSuccess');

  const setStatus = (type, text) => {
    formSuccess.className = `form-success${type ? ` is-${type}` : ''}`;
    formSuccess.textContent = text;
  };

  const showError = (input, errorEl, message) => {
    input.classList.toggle('invalid', Boolean(message));
    errorEl.textContent = message;
  };

  const validateName = () => {
    const value = nameInput.value.trim();
    const err = document.getElementById('nameError');
    if (!value) return showError(nameInput, err, 'Nama wajib diisi.'), false;
    if (value.length < 3) return showError(nameInput, err, 'Nama minimal 3 karakter.'), false;
    showError(nameInput, err, '');
    return true;
  };

  const validateEmail = () => {
    const value = emailInput.value.trim();
    const err = document.getElementById('emailError');
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return showError(emailInput, err, 'Email wajib diisi.'), false;
    if (!regex.test(value)) return showError(emailInput, err, 'Format email tidak valid.'), false;
    showError(emailInput, err, '');
    return true;
  };

  const validateMessage = () => {
    const value = messageInput.value.trim();
    const err = document.getElementById('messageError');
    if (!value) return showError(messageInput, err, 'Pesan wajib diisi.'), false;
    if (value.length < 10) return showError(messageInput, err, 'Pesan minimal 10 karakter.'), false;
    showError(messageInput, err, '');
    return true;
  };

  nameInput.addEventListener('blur', validateName);
  emailInput.addEventListener('blur', validateEmail);
  messageInput.addEventListener('blur', validateMessage);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('', '');

    const ok = [validateName(), validateEmail(), validateMessage()].every(Boolean);
    if (!ok) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    setStatus('info', 'Mengirim pesan...');

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setStatus('ok', 'Pesan berhasil dikirim! Terima kasih sudah menghubungi saya.');
        form.reset();
      } else {
        let msg = 'Gagal mengirim pesan. Silakan coba lagi.';
        try {
          const data = await response.json();
          if (data && Object.hasOwn(data, 'errors')) {
            msg = data.errors.map(err => err.message).join(', ');
          }
        } catch (_) { /* pakai pesan default */ }
        setStatus('error', msg);
      }
    } catch (error) {
      setStatus('error', 'Terjadi kesalahan koneksi internet.');
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* ---------- MULAI: buka halaman sesuai #hash (default Home) ---------- */
  const startIdx = Math.max(0, pages.findIndex(p => p.id === location.hash.slice(1)));
  goTo(startIdx, { animate: false, updateHash: false });

});