/* =========================================
   HIKMET BISEN — PORTFOLIO
   Main JavaScript
   ========================================= */

// ── Navbar: transparent → dark on scroll ──
const navbar = document.getElementById('navbar');
if (navbar && !navbar.classList.contains('scrolled')) {
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Intersection Observer: fade-in on scroll ──
const fadeEls = document.querySelectorAll(
  '.about-grid, .skills-strip, .featured-projects, .project-card, .project-card-full, .resume-entry, .award-item, .stat-num'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ── Stagger project cards ──
document.querySelectorAll('.project-card, .project-card-full').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});

// ── Counter animation for stats ──
function animateCount(el, target, suffix = '') {
  const duration = 1200;
  const start = performance.now();
  const isDecimal = String(target).includes('.');

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = isDecimal
      ? (eased * target).toFixed(2)
      : Math.floor(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const raw = el.textContent.trim();
      if (raw === '4.56') animateCount(el, 4.56);
      else if (raw === '5+') { animateCount(el, 5); el.addEventListener('transitionend', () => { el.textContent = '5+'; }); }
      else if (raw === '2027') animateCount(el, 2027);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));

// ── Contact form: basic submit handler ──
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-submit');
  const original = btn.innerHTML;
  btn.innerHTML = 'Sent! ✓';
  btn.style.background = 'var(--steel)';
  btn.style.color = 'white';
  btn.disabled = true;

  // Mailto fallback: compose mailto with form data
  const fname = document.getElementById('fname').value;
  const lname = document.getElementById('lname').value;
  const email = document.getElementById('email').value;
  const subject = document.getElementById('subject').value || 'Portfolio Inquiry';
  const message = document.getElementById('message').value;

  const body = encodeURIComponent(
    `From: ${fname} ${lname} (${email})\n\n${message}`
  );
  window.location.href = `mailto:hikmetbisen@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = '';
    btn.style.color = '';
    btn.disabled = false;
    e.target.reset();
  }, 4000);
}

// ── Cursor: subtle gold dot on desktop ──
if (window.matchMedia('(pointer: fine)').matches) {
  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed;
    width: 6px; height: 6px;
    background: var(--gold);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s, transform 0.15s;
    transform: translate(-50%, -50%);
  `;
  document.body.appendChild(dot);

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.opacity = '0.7';
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  // Enlarge on project cards
  document.querySelectorAll('.project-card, .project-card-full, .btn, a').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform = 'translate(-50%, -50%) scale(3)';
      dot.style.opacity = '0.35';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
      dot.style.opacity = '0.7';
    });
  });
}
