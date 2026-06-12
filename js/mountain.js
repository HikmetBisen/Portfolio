/* ================================================================
   HIKMET BISEN — PORTFOLIO
   The Mountain: interactive wireframe-topo K2 hero world.
   Three.js (ES module via importmap). Progressive enhancement:
   if WebGL/modules are unavailable the original SVG hero stays.
   ================================================================ */
import * as THREE from 'three';

(function () {
  'use strict';

  var canvas = document.getElementById('mtn-canvas');
  var hero = document.querySelector('.hero');
  if (!canvas || !hero) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var small = window.matchMedia('(max-width: 900px)').matches;

  /* ── Projects: significance = altitude (0..1 of peak height) ── */
  var PROJECTS = [
    { id: 'forge', n: '07', name: 'FORGE — AI Engineering Platform', peak: 'Everest · 8,849 m', tag: 'AI / Software',
      blurb: 'Multi-modal AI workspace for mechanical engineers — upload sketches, CAD, or PDFs and get structured analysis with shown calculations. React, FastAPI, RAG, LiteLLM.',
      img: 'assets/images/cards/everest-800.jpg', href: 'Project/project-forge-ai.html', alt: 0.95, ang: 0.45 },
    { id: 'earbud', n: '02', name: 'Medical Earbud @ WPI', peak: 'Mount Sinai · 2,285 m', tag: 'R&D',
      blurb: 'Wearable vital-sign tracker designed at Worcester Polytechnic Institute — medical device with a patent filing in progress.',
      img: 'assets/images/cards/mount-sinai-800.jpg', href: 'Project/project-medical-earbud.html', alt: 0.80, ang: 2.0 },
    { id: 'bmw', n: '01', name: '1983 BMW E30 Restoration', peak: 'Mount Whitney · 4,421 m', tag: 'Mechanical',
      blurb: 'Full mechanical restoration of a 1983 BMW 3 Series E30 — chassis reinforcement, rust removal, and precision reassembly of key automotive systems.',
      img: 'assets/images/cards/mount-whitney-800.jpg', href: 'Project/project-bmw-e30.html', alt: 0.72, ang: 5.4 },
    { id: 'obsidian', n: '08', name: 'Obsidian — AI Memory Graph', peak: 'Lhotse · 8,516 m', tag: 'Tools / Systems',
      blurb: 'Personal knowledge graph that gives Claude persistent memory across every conversation — wiki-linked vault with a visual graph view.',
      img: 'assets/images/cards/lhotse-800.jpg', href: 'Project/project-obsidian-graph.html', alt: 0.58, ang: 1.25 },
    { id: 'dashboard', n: '09', name: 'Claude Usage Dashboard', peak: 'Denali · 6,190 m', tag: 'Analytics',
      blurb: 'Local analytics dashboard for Claude Code — token usage, cost estimates, model breakdowns, live incremental rescan. Python stdlib + Chart.js.',
      img: 'assets/images/cards/denali-800.jpg', href: 'Project/project-claude-dashboard.html', alt: 0.50, ang: 3.6 },
    { id: 'banking', n: '06', name: 'Banking System — Elite 102', peak: 'Annapurna · 8,091 m', tag: 'Software',
      blurb: 'Python + SQLite terminal banking app with 40 automated tests — accounts, transfers, transaction history. Shipped to GitHub.',
      img: 'assets/images/cards/annapurna-800.jpg', href: 'Project/project-banking-system.html', alt: 0.42, ang: 4.6 },
    { id: 'coaster', n: '03', name: 'Roller Coaster Design — LESC', peak: 'Matterhorn · 4,478 m', tag: 'Structural',
      blurb: 'Civil and mechanical design study — load paths, g-force limits, and track geometry for functional model roller coasters.',
      img: 'assets/images/cards/matterhorn-800.jpg', href: 'Project/project-roller-coaster.html', alt: 0.33, ang: 0.0 },
    { id: 'c2c', n: '04', name: 'Code2College', peak: 'Kilimanjaro · 5,895 m', tag: 'Software',
      blurb: 'Selective project-based software program — foundational and intermediate Python, shipped technical projects.',
      img: 'assets/images/cards/kilimanjaro-800.jpg', href: 'Project/project-code2college.html', alt: 0.26, ang: 2.75 },
    { id: 'dv3x2', n: '05', name: 'DV3x2 — AIA Architecture Research', peak: 'Mont Blanc · 4,806 m', tag: 'Research',
      blurb: 'Architecture and engineering research with the American Institute of Architects — independent analysis of UT Austin’s financial structure.',
      img: 'assets/images/cards/mont-blanc-800.jpg', href: 'Project/project-dv3x2-aia.html', alt: 0.20, ang: 5.95 },
  ];

  /* ── Renderer ── */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) { return; /* fallback SVG hero stays */ }
  renderer.setClearColor(0x000000, 0);
  hero.classList.add('mtn-live'); /* hides the static SVG fallback */

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x070c14, 150, 320);
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 600);

  /* ── Terrain: K2-shaped ridged peak ── */
  var H = 46;                 /* summit height */
  var R = 72;                 /* mountain radius */
  function ridgeNoise(x, z) {
    return (
      Math.sin(x * 0.16 + Math.sin(z * 0.11) * 2.0) * 1.6 +
      Math.sin(z * 0.21 + Math.sin(x * 0.13) * 1.7) * 1.3 +
      Math.sin((x + z) * 0.31) * 0.7 +
      Math.sin((x - z) * 0.47) * 0.4
    );
  }
  function heightAt(x, z) {
    var theta = Math.atan2(z, x);
    /* angular ridge modulation gives K2 its faceted pyramid faces */
    var ridge = 1.0 + 0.16 * Math.sin(theta * 3.0 + 0.7) + 0.09 * Math.sin(theta * 7.0 - 1.2);
    var r = Math.sqrt(x * x + z * z) * ridge;
    var t = Math.max(0, 1 - r / R);
    var peak = H * Math.pow(t, 1.45);
    /* secondary shoulder (the SE ridge) */
    var sx = x - 34, sz = z + 18;
    var r2 = Math.sqrt(sx * sx + sz * sz);
    var shoulder = 14 * Math.pow(Math.max(0, 1 - r2 / 38), 1.6);
    var detail = ridgeNoise(x, z) * Math.min(1, t * 2.2 + 0.15);
    return Math.max(peak, shoulder) + detail;
  }

  var SEGS = (small || coarse) ? 72 : 128;
  var SIZE = 220;
  var geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGS, SEGS);
  geo.rotateX(-Math.PI / 2);
  var pos = geo.attributes.position;
  for (var i = 0; i < pos.count; i++) {
    var x = pos.getX(i), z = pos.getZ(i);
    pos.setY(i, heightAt(x, z));
  }
  /* non-indexed -> per-face normals -> crisp faceted alpenglow shading */
  geo = geo.toNonIndexed();
  geo.computeVertexNormals();

  /* faceted night-mountain shader: warm alpenglow key light, cool steel
     fill, snowcap above the snowline, faint topo lines as an accent */
  var mat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uSteel: { value: new THREE.Color(0x2e7ab0) },
      uGold: { value: new THREE.Color(0xd9a843) },
      uSnow: { value: new THREE.Color(0xcfdded) },
      uBase: { value: new THREE.Color(0x0b1424) },
      uMaxH: { value: H },
      uRadius: { value: SIZE * 0.5 },
    },
    vertexShader: [
      'varying float vH;',
      'varying float vR;',
      'varying vec3 vN;',
      'varying vec3 vW;',
      'void main() {',
      '  vH = position.y;',
      '  vR = length(position.xz);',
      '  vN = normal;',
      '  vW = position;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}',
    ].join('\n'),
    fragmentShader: [
      'varying float vH;',
      'varying float vR;',
      'varying vec3 vN;',
      'varying vec3 vW;',
      'uniform vec3 uSteel; uniform vec3 uGold; uniform vec3 uSnow; uniform vec3 uBase;',
      'uniform float uMaxH; uniform float uRadius;',
      'void main() {',
      '  float hn = clamp(vH / uMaxH, 0.0, 1.0);',
      '  vec3 n = normalize(vN);',
      '  /* alpenglow key (warm, low, from the east) + steel fill (cool, opposite) */',
      '  vec3 Lg = normalize(vec3(0.62, 0.30, -0.45));',
      '  vec3 Ls = normalize(vec3(-0.55, 0.42, 0.55));',
      '  float dg = pow(max(dot(n, Lg), 0.0), 1.25);',
      '  float ds = max(dot(n, Ls), 0.0);',
      '  /* base mass lifts slightly with altitude */',
      '  vec3 col = mix(uBase, uBase * 1.8, hn * 0.45);',
      '  col += uGold * dg * (0.30 + 0.34 * hn);',
      '  col += uSteel * ds * 0.26;',
      '  /* snowcap: noisy snowline so it never reads as a flat band */',
      '  float wob = (sin(vW.x * 0.55) + sin(vW.z * 0.62) + sin((vW.x + vW.z) * 0.21)) * 0.022;',
      '  float snowMask = smoothstep(0.55, 0.70, hn + wob);',
      '  vec3 snowCol = uSnow * (0.30 + 0.62 * dg + 0.30 * ds);',
      '  col = mix(col, snowCol, snowMask * 0.92);',
      '  /* rim glow against the night sky */',
      '  vec3 V = normalize(cameraPosition - vW);',
      '  float rim = pow(1.0 - max(dot(n, V), 0.0), 3.2);',
      '  col += uSteel * rim * 0.22 + uGold * rim * 0.10 * hn;',
      '  /* faint topo accent lines keep the engineering identity */',
      '  float bands = vH / uMaxH * 22.0;',
      '  float d = fwidth(bands);',
      '  float line = 1.0 - smoothstep(0.0, d * 1.8, abs(fract(bands) - 0.5) - (0.5 - d * 1.8));',
      '  col += mix(uSteel, uSnow, hn) * line * 0.085;',
      '  float edge = 1.0 - smoothstep(uRadius * 0.55, uRadius * 0.98, vR);',
      '  gl_FragColor = vec4(col, 0.96 * edge);',
      '}',
    ].join('\n'),
  });
  mat.extensions = { derivatives: true };

  var world = new THREE.Group();
  var terrain = new THREE.Mesh(geo, mat);
  world.add(terrain);
  scene.add(world);

  /* ── Markers ── */
  var coreTex = (function () {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(32, 32, 1, 32, 32, 22);
    g.addColorStop(0, 'rgba(255,240,200,1)');
    g.addColorStop(0.35, 'rgba(201,168,76,0.95)');
    g.addColorStop(0.7, 'rgba(201,168,76,0.25)');
    g.addColorStop(1, 'rgba(201,168,76,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  var ringTex = (function () {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var ctx = c.getContext('2d');
    ctx.strokeStyle = 'rgba(201,168,76,0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(32, 32, 26, 0, Math.PI * 2);
    ctx.stroke();
    return new THREE.CanvasTexture(c);
  })();

  /* invert the peak profile to find the radius for a target altitude */
  function radiusForAlt(altN) {
    return R * (1 - Math.pow(altN, 1 / 1.45)) / 1.0;
  }
  var markers = new THREE.Group();
  PROJECTS.forEach(function (p) {
    var r = radiusForAlt(p.alt);
    var x = Math.cos(p.ang) * r;
    var z = Math.sin(p.ang) * r;
    var y = heightAt(x, z) + 2.2;
    var core = new THREE.Sprite(new THREE.SpriteMaterial({ map: coreTex, depthTest: false, transparent: true }));
    core.scale.set(3.0, 3.0, 1);
    core.position.set(x, y, z);
    core.userData.project = p;
    core.renderOrder = 3;
    var ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, depthTest: false, transparent: true, opacity: 0.8 }));
    ring.scale.set(3.0, 3.0, 1);
    ring.position.set(x, y, z);
    ring.renderOrder = 2;
    core.userData.ring = ring;
    markers.add(core);
    markers.add(ring);
  });
  world.add(markers);
  var hitTargets = markers.children.filter(function (m) { return m.userData.project; });

  /* ── Atmosphere: a few drifting particles ── */
  var pGeo = new THREE.BufferGeometry();
  var pCount = 140;
  var pArr = new Float32Array(pCount * 3);
  for (var j = 0; j < pCount; j++) {
    pArr[j * 3] = (Math.random() - 0.5) * 260;
    pArr[j * 3 + 1] = Math.random() * 90 + 4;
    pArr[j * 3 + 2] = (Math.random() - 0.5) * 260;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
  var snow = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xc5dff0, size: 0.8, transparent: true, opacity: 0.35, depthWrite: false,
  }));
  world.add(snow);

  /* ── Camera rig: auto-orbit + mouse drift; view offset pins peak right ── */
  var baseAngle = 0.9;
  var mouse = { x: 0, y: 0 }, sm = { x: 0, y: 0 };
  var orbitSpeed = reduced ? 0 : (coarse ? 0.025 : 0.04);
  var panelOpen = false;

  function placeCamera(t) {
    var a = baseAngle + (reduced ? 0 : t * orbitSpeed) + sm.x * 0.35;
    var rad = small ? 165 : 155;
    var elev = 50 + sm.y * 8;
    camera.position.set(Math.cos(a) * rad, elev, Math.sin(a) * rad);
    camera.lookAt(0, 15, 0);
  }

  document.addEventListener('pointermove', function (e) {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ── Resize ── */
  function resize() {
    small = window.matchMedia('(max-width: 900px)').matches;
    var w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, (small || coarse) ? 1.5 : 2));
    camera.aspect = w / h;
    /* negative x offset shifts the rendered scene to the right of the frame */
    if (small) camera.setViewOffset(w, h, 0, -h * 0.08, w, h);
    else camera.setViewOffset(w, h, -w * 0.18, -h * 0.03, w, h);
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  /* ── Tooltip + preview panel ── */
  var tooltip = document.getElementById('mtn-tooltip');
  var panel = document.getElementById('mtn-panel');
  var raycaster = new THREE.Raycaster();
  var pointer = new THREE.Vector2();
  var hovered = null;

  function screenPos(obj) {
    var v = obj.position.clone().add(world.position).project(camera);
    return {
      x: (v.x * 0.5 + 0.5) * hero.clientWidth,
      y: (-v.y * 0.5 + 0.5) * hero.clientHeight,
    };
  }

  function setHover(obj) {
    if (hovered === obj) return;
    hovered = obj;
    if (obj) {
      var p = obj.userData.project;
      tooltip.innerHTML = '<b>' + p.n + '</b> ' + p.name;
      tooltip.classList.add('show');
      canvas.style.cursor = 'pointer';
    } else {
      tooltip.classList.remove('show');
      canvas.style.cursor = 'grab';
    }
  }

  function pick(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    var hits = raycaster.intersectObjects(hitTargets, false);
    return hits.length ? hits[0].object : null;
  }

  canvas.addEventListener('pointermove', function (e) {
    if (coarse) return;
    setHover(pick(e.clientX, e.clientY));
  }, { passive: true });

  function openPanel(p) {
    panelOpen = true;
    panel.innerHTML =
      '<button class="mtn-panel-close" aria-label="Close">&times;</button>' +
      '<div class="mtn-panel-img"><img src="' + p.img + '" alt="' + p.peak + '"></div>' +
      '<span class="mtn-panel-peak">' + p.peak + ' &middot; ' + p.n + ' / 09 &middot; ' + p.tag + '</span>' +
      '<h3>' + p.name + '</h3>' +
      '<p>' + p.blurb + '</p>' +
      '<a class="btn btn-primary" href="' + p.href + '">Open Project <span>&rarr;</span></a>';
    panel.classList.add('open');
    panel.querySelector('.mtn-panel-close').addEventListener('click', closePanel);
  }
  function closePanel() {
    panelOpen = false;
    panel.classList.remove('open');
  }
  canvas.addEventListener('click', function (e) {
    var hit = pick(e.clientX, e.clientY);
    if (hit) openPanel(hit.userData.project);
    else if (panelOpen) closePanel();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panelOpen) closePanel();
  });

  /* test/debug hook: screen positions of all markers */
  window.__mtnMarkers = function () {
    return hitTargets.map(function (m) {
      var s = screenPos(m);
      return { id: m.userData.project.id, x: s.x, y: s.y };
    });
  };

  /* ── Render loop: pause offscreen / hidden tab ── */
  var visible = true, clockT = 0, last = performance.now(), rafId = null;
  var io = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (visible && rafId === null) { last = performance.now(); rafId = requestAnimationFrame(tick); }
  }, { threshold: 0.02 });
  io.observe(hero);

  function tick(now) {
    rafId = null;
    if (!visible || document.hidden) { rafId = requestAnimationFrame(tick); return; }
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clockT += dt * (panelOpen ? 0.25 : 1);

    sm.x += (mouse.x - sm.x) * 0.04;
    sm.y += (mouse.y - sm.y) * 0.04;
    placeCamera(clockT);

    /* marker pulse */
    hitTargets.forEach(function (m, idx) {
      var ring = m.userData.ring;
      var ph = 1 + Math.sin(clockT * 2.4 + idx * 0.7) * 0.45;
      ring.scale.set(3.0 * ph, 3.0 * ph, 1);
      ring.material.opacity = Math.max(0, 0.9 - (ph - 1) * 1.4);
      if (m === hovered) m.scale.set(4.2, 4.2, 1); else m.scale.set(3.0, 3.0, 1);
    });

    /* snow drift */
    var sp = snow.geometry.attributes.position;
    for (var k = 0; k < pCount; k++) {
      var yy = sp.getY(k) - dt * 1.6;
      if (yy < 0) yy = 90;
      sp.setY(k, yy);
    }
    sp.needsUpdate = true;

    /* keep tooltip glued to hovered marker */
    if (hovered) {
      var spos = screenPos(hovered);
      tooltip.style.left = spos.x + 'px';
      tooltip.style.top = (spos.y - 18) + 'px';
    }

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
})();
