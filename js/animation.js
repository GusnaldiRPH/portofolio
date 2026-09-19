/* =========================================
   ANIMATION.JS — Reveal, Typing, Mouse Glow, Ripple, Counter
========================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- SCROLL REVEAL (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- TYPING EFFECT (ringan) ---------- */
  const typingText = document.getElementById('typingText');
  const phrases = [
    'Building modern digital experiences with clean code and thoughtful design.',
    'Software · Web · Mobile · Game Development.'
  ];

  if (typingText && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

  /* ---------- MOUSE GLOW (desktop only) ---------- */
  const mouseGlow = document.getElementById('mouseGlow');
  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (mouseGlow && isDesktop) {
    document.addEventListener('mousemove', (e) => {
      mouseGlow.style.left = `${e.clientX}px`;
      mouseGlow.style.top = `${e.clientY}px`;
    });
  } else if (mouseGlow) {
    mouseGlow.style.display = 'none';
  }

  /* ---------- BUTTON RIPPLE EFFECT ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.style.position = btn.style.position || 'relative';
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* ---------- STAT COUNTER ---------- */
  const statNumbers = document.querySelectorAll('.stat-number');

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 40));

        const tick = () => {
          current += step;
          if (current >= target) {
            el.textContent = target;
          } else {
            el.textContent = current;
            requestAnimationFrame(tick);
          }
        };
        tick();
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => countObserver.observe(el));

});