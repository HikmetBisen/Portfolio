/* ============================================================
   Porcelain Studio — shared page behavior (classic script)
   Loaded by every page. Everything is guarded: missing elements,
   reduced motion, and coarse pointers are all handled.
   - ruler tick build + gold scroll-progress fill
   - load-in reveal (.rise)
   - sticky-nav wash + scroll-spy (same-page anchors only)
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

  /* ---------- discipline filters (index only) ---------- */
  var filters = document.querySelector('.filters');
  if (filters) {
    var items = document.querySelectorAll('[data-tags]');
    var count = filters.querySelector('.filter-count');
    var btns = filters.querySelectorAll('.filter-btn');

    filters.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.filter-btn');
      if (!btn) return;
      var tag = btn.getAttribute('data-filter');
      var shown = 0;

      for (var i = 0; i < items.length; i++) {
        var tags = ' ' + (items[i].getAttribute('data-tags') || '') + ' ';
        var hit = tag === 'all' || tags.indexOf(' ' + tag + ' ') > -1;
        items[i].hidden = !hit;
        if (hit) shown++;
      }
      /* collapse a group whose rows all filtered out — an empty bordered box
         reads as a rendering bug, not as "no matches here" */
      var boxes = [document.querySelector('.rows'), document.querySelector('.minor')];
      for (var k = 0; k < boxes.length; k++) {
        if (!boxes[k]) continue;
        var kids = boxes[k].querySelectorAll('[data-tags]'), any = false;
        for (var q = 0; q < kids.length; q++) if (!kids[q].hidden) any = true;
        boxes[k].hidden = !any;
      }

      for (var j = 0; j < btns.length; j++) {
        btns[j].setAttribute('aria-pressed', btns[j] === btn ? 'true' : 'false');
      }
      /* role="status" on the count announces the result — otherwise a screen
         reader gets no feedback that the list under it just changed */
      if (count) count.textContent = shown + ' of ' + items.length;
    });
  }

  /* ---------- sticky-nav wash + scroll-spy ----------
     The bar is fixed, so it needs a background once content scrolls under it.
     Scroll-spy only binds same-page anchors, which means it is a no-op on the
     project pages (their nav points back at ../index.html#…). */
  var bar = document.querySelector('.topbar');
  if (bar) {
    var washPending = false;
    var setWash = function () {
      d.classList.toggle('scrolled', (window.scrollY || d.scrollTop || 0) > 24);
    };
    setWash();
    addEventListener('scroll', function () {
      if (washPending) return;
      washPending = true;
      requestAnimationFrame(function () { washPending = false; setWash(); });
    }, { passive: true });

    var spy = [];
    var links = bar.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < links.length; i++) {
      var target = document.getElementById(links[i].getAttribute('href').slice(1));
      if (target) spy.push({ a: links[i], el: target, on: false });
    }

    if (spy.length && 'IntersectionObserver' in window) {
      var current = null;
      var io = new IntersectionObserver(function (entries) {
        for (var k = 0; k < entries.length; k++) {
          for (var m = 0; m < spy.length; m++) {
            if (spy[m].el === entries[k].target) spy[m].on = entries[k].isIntersecting;
          }
        }
        /* last match in document order wins when two sections overlap the band */
        var active = null;
        for (var n = 0; n < spy.length; n++) if (spy[n].on) active = spy[n];
        if (active === current) return;
        current = active;
        for (var q = 0; q < spy.length; q++) {
          if (spy[q] === active) spy[q].a.setAttribute('aria-current', 'location');
          else spy[q].a.removeAttribute('aria-current');
        }
      }, { rootMargin: '-45% 0px -50% 0px' });
      for (var p = 0; p < spy.length; p++) io.observe(spy[p].el);
    }
  }

  /* ---------- cursor dot (fine pointers only) ---------- */
  var dot = document.getElementById('dot');
  if (dot && fine && !rm) {
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
