/* =========================================
   SCRIPT.JS — Navbar, Menu, Form, Back to Top
========================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- STICKY NAVBAR ---------- */
  const navbar = document.getElementById('navbar');
  const onScrollNavbar = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScrollNavbar();
  window.addEventListener('scroll', onScrollNavbar, { passive: true });

  /* ---------- HAMBURGER MENU ---------- */
  const hamburger = document.getElementById('hamburger');
  const navbarMenu = document.getElementById('navbarMenu');

  const closeMenu = () => {
    hamburger.classList.remove('active');
    navbarMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = navbarMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ---------- ACTIVE NAVBAR ON SCROLL ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const setActiveLink = () => {
    let current = sections[0]?.id;
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };
  setActiveLink();
  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* ---------- BACK TO TOP ---------- */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- FOOTER YEAR ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- CONTACT FORM VALIDATION & INTEGRATION ---------- */
  const form = document.getElementById('contactForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const formSuccess = document.getElementById('formSuccess');

  const showError = (input, errorEl, message) => {
    input.classList.toggle('invalid', Boolean(message));
    errorEl.textContent = message;
  };

  const validateName = () => {
    const value = nameInput.value.trim();
    if (!value) return showError(nameInput, document.getElementById('nameError'), 'Nama wajib diisi.'), false;
    if (value.length < 3) return showError(nameInput, document.getElementById('nameError'), 'Nama minimal 3 karakter.'), false;
    showError(nameInput, document.getElementById('nameError'), '');
    return true;
  };

  const validateEmail = () => {
    const value = emailInput.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return showError(emailInput, document.getElementById('emailError'), 'Email wajib diisi.'), false;
    if (!regex.test(value)) return showError(emailInput, document.getElementById('emailError'), 'Format email tidak valid.'), false;
    showError(emailInput, document.getElementById('emailError'), '');
    return true;
  };

  const validateMessage = () => {
    const value = messageInput.value.trim();
    if (!value) return showError(messageInput, document.getElementById('messageError'), 'Pesan wajib diisi.'), false;
    if (value.length < 10) return showError(messageInput, document.getElementById('messageError'), 'Pesan minimal 10 karakter.'), false;
    showError(messageInput, document.getElementById('messageError'), '');
    return true;
  };

  [nameInput, emailInput, messageInput].forEach(input => {
    input.addEventListener('blur', () => {
      if (input === nameInput) validateName();
      if (input === emailInput) validateEmail();
      if (input === messageInput) validateMessage();
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formSuccess.textContent = '';

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    // Jika semua input valid, kirimkan data ke Formspree via Fetch API
    if (isNameValid && isEmailValid && isMessageValid) {
      const formData = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');

      // Tampilkan indikator loading pada tombol
      if (submitBtn) submitBtn.disabled = true;
      formSuccess.style.color = '#333';
      formSuccess.textContent = 'Mengirim pesan...';

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          formSuccess.style.color = '#4BB543';
          formSuccess.textContent = 'Pesan berhasil dikirim! Terima kasih sudah menghubungi saya.';
          form.reset();
        } else {
          const data = await response.json();
          formSuccess.style.color = '#ff3333';
          if (data && Object.hasOwn(data, 'errors')) {
            formSuccess.textContent = data.errors.map(err => err.message).join(', ');
          } else {
            formSuccess.textContent = 'Gagal mengirim pesan. Silakan coba lagi.';
          }
        }
      } catch (error) {
        formSuccess.style.color = '#ff3333';
        formSuccess.textContent = 'Terjadi kesalahan koneksi internet.';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    }
  });

  /* ---------- SMOOTH SCROLL FOR ANCHOR LINKS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});