/* =====================================================
   CortexCloud — main.js
   Interactive behaviors, animations, scroll effects
   ===================================================== */

// --- Navbar scroll effect ---
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// --- Mobile hamburger menu ---
(function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close on link click
  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
})();

// --- Copy install command ---
(function initCopyBtn() {
  const copyBtn = document.getElementById('copy-install-btn');
  const installCmd = document.getElementById('install-cmd');
  if (!copyBtn || !installCmd) return;

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(installCmd.textContent.trim());
      const copyText = copyBtn.querySelector('.copy-text');
      if (copyText) {
        const original = copyText.textContent;
        copyText.textContent = 'Copied!';
        copyBtn.style.color = 'var(--green)';
        copyBtn.style.borderColor = 'var(--green)';
        setTimeout(() => {
          copyText.textContent = original;
          copyBtn.style.color = '';
          copyBtn.style.borderColor = '';
        }, 2000);
      }
    } catch {
      // Fallback for older browsers
      const range = document.createRange();
      range.selectNode(installCmd);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      document.execCommand('copy');
      window.getSelection()?.removeAllRanges();
    }
  });
})();

// --- Deploy tabs ---
(function initDeployTabs() {
  const tabs = document.querySelectorAll('.deploy-tab');
  const panels = document.querySelectorAll('.deploy-panel');
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');
      if (panels[i]) panels[i].classList.add('active');
    });
  });
})();

// --- Scroll-reveal for .card-reveal elements ---
(function initScrollReveal() {
  const elements = document.querySelectorAll('.card-reveal');
  if (!elements.length) return;

  // Stagger delays for grid children
  elements.forEach((el, i) => {
    const parent = el.parentElement;
    const siblings = parent ? [...parent.querySelectorAll('.card-reveal')] : [];
    const indexInParent = siblings.indexOf(el);
    el.style.transitionDelay = `${indexInParent * 80}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();

// --- Terminal typing animation ---
(function initTerminalAnimation() {
  const termBody = document.getElementById('terminal-body');
  if (!termBody) return;

  const lines = termBody.querySelectorAll('.t-line:not(.t-blink)');
  lines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      // Only animate when terminal is in view
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            line.style.opacity = '1';
          }, i * 500);
          observer.disconnect();
        }
      }, { threshold: 0.5 });
      observer.observe(termBody);
    }, 100);
  });
})();

// --- Smooth scroll for anchor links ---
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// --- Active nav link highlighting on scroll ---
(function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35, rootMargin: '-68px 0px 0px 0px' });

  sections.forEach(s => observer.observe(s));
})();

// --- Neon glow cursor trail (subtle, desktop only) ---
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;opacity:0.35;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W = window.innerWidth, H = window.innerHeight;
  let mouseX = -1000, mouseY = -1000;
  const particles = [];

  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Spawn a particle
    if (Math.random() < 0.4) {
      particles.push({
        x: mouseX + (Math.random() - 0.5) * 8,
        y: mouseY + (Math.random() - 0.5) * 8,
        r: Math.random() * 2 + 1,
        alpha: 0.6 + Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5 - 0.2,
        color: Math.random() > 0.5 ? '0,255,159' : '0,229,255',
      });
    }
  }, { passive: true });

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.018;
      p.r *= 0.97;
      if (p.alpha <= 0 || p.r < 0.2) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(${p.color},0.6)`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

// --- Stats counter animation ---
(function initCounters() {
  const counters = document.querySelectorAll('.stat-val');
  counters.forEach(counter => {
    const text = counter.textContent;
    const num = parseFloat(text.replace(/[^\d.]/g, ''));
    if (isNaN(num) || num === 0) return;

    const suffix = text.replace(/[\d.]/g, '');
    let started = false;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        let start = 0;
        const duration = 1500;
        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = start + (num - start) * eased;
          counter.textContent = (Number.isInteger(num) ? Math.round(current) : current.toFixed(1)) + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(counter);
  });
})();
