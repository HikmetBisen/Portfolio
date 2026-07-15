/* survey.js — full-bleed topographic hero from real ASTER GDEM contours.
   Usage: <div class="survey" data-survey="path/to/mountain.json"><canvas></canvas>
            <span class="summitlbl mono"></span></div>
   Optional: an element with id="placard" for the live probe readout.
   The JSON carries geometry, probe grid, geo constants, and labels. */
(function(){
  var wrap = document.querySelector('[data-survey]');
  if (!wrap) return;
  var cv = wrap.querySelector('canvas');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var slbl = wrap.querySelector('.summitlbl');
  var pl = document.getElementById('placard');
  var host = wrap.parentElement; // the hero section: pointer events live here

  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(pointer: coarse)').matches;

  var INK = '16,18,20', GOLD = '#B8905F';
  var D = null, bands = [], BANDN = 5;
  var cw = 0, ch = 0, dpr = 1, sc = 1, ox = 0, oy = 0;
  var px = -1, py = -1, over = false, lastMove = 0;
  var hl = -1, hlF = 0;
  var t0 = performance.now(), bootT = 0, running = false, visible = true;

  function latOf(v){
    var m = D.geo.merc_t + (D.geo.merc_b - D.geo.merc_t) * v;
    return Math.atan(Math.sinh(Math.PI * (1 - 2*m))) * 180 / Math.PI;
  }
  function lonOf(u){ return D.geo.lon_w + (D.geo.lon_e - D.geo.lon_w) * u; }
  function fmtLon(x){ return Math.abs(x).toFixed(4) + '° ' + (x < 0 ? 'W' : 'E'); }
  function fmtLat(x){ return Math.abs(x).toFixed(4) + '° ' + (x < 0 ? 'S' : 'N'); }

  function fit(){
    dpr = Math.min(devicePixelRatio || 1, 2);
    cw = wrap.clientWidth; ch = wrap.clientHeight;
    cv.width = cw * dpr; cv.height = ch * dpr;
    if (!D) return;
    sc = Math.max(cw / D.w, ch / D.h);           // cover: crop, never letterbox
    ox = (cw - D.w * sc) / 2; oy = (ch - D.h * sc) / 2;
    buildBands();
    if (slbl){
      slbl.style.left = (ox + D.summit[0]*sc) + 'px';
      slbl.style.top  = (oy + D.summit[1]*sc) + 'px';
    }
  }

  function strokeLevel(c, lv, width, style){
    c.strokeStyle = style; c.lineWidth = width; c.lineJoin = 'round'; c.lineCap = 'round';
    for (var j = 0; j < lv.p.length; j++){
      var pts = lv.p[j].pts;
      c.beginPath();
      c.moveTo(ox + pts[0][0]*sc, oy + pts[0][1]*sc);
      for (var k = 1; k < pts.length; k++) c.lineTo(ox + pts[k][0]*sc, oy + pts[k][1]*sc);
      if (lv.p[j].c) c.closePath();
      c.stroke();
    }
  }

  function buildBands(){
    bands = [];
    var per = Math.ceil(D.levels.length / BANDN);
    var majorEvery = D.ival * 5;
    for (var b = 0; b < BANDN; b++){
      var oc = document.createElement('canvas');
      oc.width = cw * dpr; oc.height = ch * dpr;
      var c = oc.getContext('2d'); c.scale(dpr, dpr);
      var alpha = 0.085 + b * 0.04;
      for (var i = b*per; i < Math.min((b+1)*per, D.levels.length); i++){
        var lv = D.levels[i];
        var major = lv.e % majorEvery === 0;
        strokeLevel(c, lv, major ? 1.2 : 0.65, 'rgba(' + INK + ',' + (alpha + (major ? 0.05 : 0)) + ')');
      }
      bands.push(oc);
    }
  }

  function elevAt(mx, my){
    var u = mx / D.w * 99, v = my / D.h * 74;
    if (u < 0 || v < 0 || u > 99 || v > 74) return null;
    var x0 = Math.floor(u), y0 = Math.floor(v),
        x1 = Math.min(x0+1, 99), y1 = Math.min(y0+1, 74),
        fx = u - x0, fy = v - y0, g = D.probe;
    return g[y0][x0]*(1-fx)*(1-fy) + g[y0][x1]*fx*(1-fy) + g[y1][x0]*(1-fx)*fy + g[y1][x1]*fx*fy;
  }

  function draw(ts){
    if (!running) return;
    requestAnimationFrame(draw);
    if (document.hidden || !visible || !D) return;
    var t = (ts - t0) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    var nx = 0, ny = 0;
    if (!rm && over && px >= 0){ nx = (px/cw)*2 - 1; ny = (py/ch)*2 - 1; }
    var boot = rm ? 1 : Math.min(1, (ts - bootT) / 900);
    for (var b = 0; b < bands.length; b++){
      var bp = rm ? 1 : Math.min(1, Math.max(0, (boot*1.35) - (b*0.07)));
      ctx.globalAlpha = bp;
      ctx.drawImage(bands[b], nx * -(b*1.5), ny * -(b*1.1) + (1-bp)*10, cw, ch);
    }
    ctx.globalAlpha = 1;

    var e = null, mx = 0, my = 0;
    if (over && px >= 0){
      mx = (px - ox) / sc; my = (py - oy) / sc;
      e = elevAt(mx, my);
      lastMove = t;
    }
    var idle = (t - lastMove > 3) || coarse || !over;
    if (idle && !rm){
      hlF += 0.012;
      hl = Math.floor(hlF) % D.levels.length;
      e = null;
    } else if (e !== null){
      var best = 0, bd = 1e9;
      for (var i = 0; i < D.levels.length; i++){
        var dd = Math.abs(D.levels[i].e - e);
        if (dd < bd){ bd = dd; best = i; }
      }
      hl = best;
    }

    if (hl >= 0 && boot > 0.99){
      if (idle && !rm){
        ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t*2);
        strokeLevel(ctx, D.levels[hl], 1.2, GOLD);
      } else if (e !== null){
        ctx.globalAlpha = 0.22;
        strokeLevel(ctx, D.levels[hl], 1.1, GOLD);
        ctx.save();
        ctx.beginPath(); ctx.arc(px, py, 150, 0, Math.PI*2); ctx.clip();
        ctx.globalAlpha = 0.95;
        strokeLevel(ctx, D.levels[hl], 1.7, GOLD);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    if (over && px >= 0 && !coarse){
      ctx.strokeStyle = 'rgba(' + INK + ',0.35)'; ctx.lineWidth = 0.75;
      ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,ch); ctx.moveTo(0,py); ctx.lineTo(cw,py); ctx.stroke();
      ctx.strokeStyle = GOLD; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI*2); ctx.stroke();
    }

    if (pl){
      var tail = ' · contours ' + D.ival + ' m · ASTER GDEM';
      if (e !== null){
        pl.textContent = 'probe ' + fmtLat(latOf(my/D.h)) + ', ' + fmtLon(lonOf(mx/D.w))
          + ' · ' + Math.round(e).toLocaleString('en-US') + ' m' + tail;
      } else if (idle && hl >= 0){
        pl.textContent = D.label + ' · ' + fmtLat(D.lat) + ', ' + fmtLon(D.lon)
          + (rm ? '' : ' · survey ' + D.levels[hl].e.toLocaleString('en-US') + ' m') + tail;
      }
    }
  }

  host.addEventListener('pointermove', function(ev){
    var r = wrap.getBoundingClientRect();
    px = ev.clientX - r.left; py = ev.clientY - r.top;
    over = px >= 0 && py >= 0 && px <= r.width && py <= r.height;
  }, {passive: true});
  host.addEventListener('pointerleave', function(){ over = false; px = py = -1; }, {passive: true});

  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }).observe(wrap);
  }
  addEventListener('resize', fit);

  fetch(wrap.getAttribute('data-survey'))
    .then(function(r){ if (!r.ok) throw 0; return r.json(); })
    .then(function(j){
      D = j;
      if (slbl) slbl.textContent = D.label + ' · ' + D.elev.toLocaleString('en-US') + ' m';
      fit();
      bootT = performance.now();
      document.documentElement.classList.add('mapready');
      if (!running){ running = true; requestAnimationFrame(draw); }
    })
    .catch(function(){ /* no map: the page stands on its own */ });
})();
