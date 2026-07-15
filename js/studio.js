/* ============================================================
   Porcelain Studio — shared page behavior (classic script)
   Loaded by every page. Everything is guarded: missing elements,
   reduced motion, and coarse pointers are all handled.
   - ruler tick build + gold scroll-progress fill
   - load-in reveal (.rise)
   - cursor dot (fine pointers only)
   - magnetic links (.mag, fine pointers, not reduced-motion)
   ============================================================ */
(function () {
  'use strict';

  var d = document.documentElement;
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;

  /* ---------- load-in reveal ---------- */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { d.classList.add('ready'); });
  });

  /* ---------- measurement ruler ---------- */
  var ruler = document.querySelector('.ruler');
  var ticks = ruler ? ruler.querySelector('.ruler-ticks') : null;
  var fill = ruler ? ruler.querySelector('.ruler-fill') : null;

  function buildTicks() {
    if (!ticks) return;
    var w = ruler.clientWidth || innerWidth;
    var minor = 8; /* px between minor ticks; every 10th is major */
    var n = Math.floor(w / minor);
    var frag = document.createDocumentFragment();
    for (var i = 0; i <= n; i++) {
      var s = document.createElement('span');
      if (i % 10 === 0) s.className = 'mj';
      s.style.left = (i * minor) + 'px';
      frag.appendChild(s);
    }
    ticks.textContent = '';
    ticks.appendChild(frag);
  }

  function setFill() {
    if (!fill) return;
    var max = d.scrollHeight - innerHeight;
    var y = window.scrollY || d.scrollTop || 0;
    var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }

  if (ruler) {
    buildTicks();
    setFill();

    var scrollPending = false;
    addEventListener('scroll', function () {
      if (scrollPending) return;
      scrollPending = true;
      requestAnimationFrame(function () {
        scrollPending = false;
        setFill();
      });
    }, { passive: true });

    var resizeTimer = null;
    addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildTicks();
        setFill();
      }, 150);
    });
  }

  /* ---------- cursor dot (fine pointers only) ---------- */
  var dot = document.getElementById('dot');
  if (dot && fine) {
    d.classList.add('fine');

    var mx = -100, my = -100, dx = 0, dy = 0, ds = 1, dst = 1;
    var seen = false, init = false, last = 0;

    addEventListener('pointermove', function (e) {
      seen = true;
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    document.addEventListener('pointerover', function (e) {
      var hit = e.target && e.target.closest ? e.target.closest('a,button') : null;
      if (hit) {
        dst = 2.2;
        dot.classList.add('au');
      } else {
        dst = 1;
        dot.classList.remove('au');
      }
    });

    d.addEventListener('pointerleave', function () { dot.style.opacity = '0'; });
    d.addEventListener('pointerenter', function () { dot.style.opacity = '1'; });

    var dotLoop = function (ts) {
      requestAnimationFrame(dotLoop);
      if (document.hidden) { last = 0; return; }
      if (!last) { last = ts; return; }
      var dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      if (!seen) return;
      if (!init) {
        dx = mx; dy = my; init = true;
        dot.style.opacity = '1';
      }
      var kd = Math.min(1, dt * 22);
      dx += (mx - dx) * kd;
      dy += (my - dy) * kd;
      ds += (dst - ds) * Math.min(1, dt * 14);
      dot.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) +
        'px,0) translate(-50%,-50%) scale(' + ds.toFixed(3) + ')';
    };
    requestAnimationFrame(dotLoop);
  }

  /* ---------- magnetic links (≤5px pull) ---------- */
  if (fine && !rm) {
    var mags = document.querySelectorAll('.mag');
    for (var j = 0; j < mags.length; j++) {
      (function (m) {
        m.addEventListener('pointermove', function (e) {
          var r = m.getBoundingClientRect();
          var ox = Math.max(-5, Math.min(5, (e.clientX - r.left - r.width / 2) * 0.3));
          var oy = Math.max(-5, Math.min(5, (e.clientY - r.top - r.height / 2) * 0.4));
          m.style.transform = 'translate(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px)';
        });
        m.addEventListener('pointerleave', function () { m.style.transform = ''; });
      })(mags[j]);
    }
  }
})();
