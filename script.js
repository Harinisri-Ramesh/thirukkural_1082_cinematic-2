/* Thirukkural 1082 — Cinematic Interactive Story · vanilla JS */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  /* ---------- generic scroll reveal ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el, i) => {
    // light stagger for siblings (word cards)
    if (el.classList.contains('word')) el.style.transitionDelay = (i % 5) * 90 + 'ms';
    revealIO.observe(el);
  });

  /* ---------- hero video ---------- */
  const vid = $('#heroVideo'), vbtn = $('#vidToggle');
  if (vid && vbtn) {
    vbtn.addEventListener('click', () => {
      if (vid.paused) { vid.play(); vbtn.textContent = '❚❚'; vbtn.setAttribute('aria-label', 'Pause video'); }
      else { vid.pause(); vbtn.textContent = '▶'; vbtn.setAttribute('aria-label', 'Play video'); }
    });
    // pause when off-screen to save battery
    new IntersectionObserver(([e]) => {
      if (vbtn.textContent === '▶') return;
      e.isIntersecting ? vid.play().catch(() => {}) : vid.pause();
    }, { threshold: 0.1 }).observe(vid);
  }

  /* ---------- live story frame ---------- */
  const layers = $$('.layer'), steps = $$('.step'), dots = $$('#dots i');
  const momNum = $('#momNum'), cap = $('#stageCap'), flash = $('#flash');
  const caps = ['Before the Look', 'First Glance', 'She Notices', 'She Turns', 'Eye Contact', 'The Impact', 'After the Moment'];
  let current = -1;
  function setMoment(i) {
    if (i === current) return;
    current = i;
    layers.forEach((l, k) => l.classList.toggle('active', k === i));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    steps.forEach((s, k) => s.classList.toggle('active', k === i));
    momNum.textContent = String(i + 1).padStart(2, '0');
    cap.textContent = caps[i];
    if (i === 4 || i === 5) { flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go'); }
  }
  setMoment(0);
  const stepIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setMoment(+e.target.dataset.i); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((s) => stepIO.observe(s));
  // layers lazy-load: eagerly decode the next ones once the section is near
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) layers.forEach((l) => { l.loading = 'eager'; });
  }, { rootMargin: '600px' }).observe($('#story'));

  /* ---------- eye contact interaction ---------- */
  const eyeRow = $('#eyeRow'), eyeReveal = $('#eyeReveal');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { eyeRow.classList.add('connected'); eyeReveal.classList.add('on'); }
  }, { threshold: 0.55 }).observe(eyeRow);

  /* ---------- cinematic impact ---------- */
  const impact = $('#impact');
  new IntersectionObserver(([e]) => { if (e.isIntersecting) impact.classList.add('in'); }, { threshold: 0.35 }).observe(impact);

  /* ---------- word cards ---------- */
  $$('.word').forEach((w) => {
    w.addEventListener('click', () => {
      const open = w.classList.toggle('open');
      w.setAttribute('aria-expanded', open);
    });
  });

  /* ---------- poetry lines ---------- */
  const pls = $$('.pl');
  const plIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const i = pls.indexOf(e.target);
        e.target.style.transitionDelay = i * 0.35 + 's';
        e.target.classList.add('in'); plIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  pls.forEach((p) => plIO.observe(p));

  /* ---------- timeline ---------- */
  const tl = $('.tl'), fill = $('#tlFill');
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    $$('li', tl).forEach((li, i) => { li.style.transitionDelay = i * 0.28 + 's'; });
    tl.classList.add('in');
    fill.classList.add('go'); fill.style.width = '100%';
  }, { threshold: 0.35 }).observe(tl);
  // drag-to-scroll on desktop
  const wrap = $('.tl-wrap');
  let down = false, sx = 0, sl = 0;
  wrap.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || isMobile()) return; down = true; sx = e.clientX; sl = wrap.scrollLeft; wrap.classList.add('drag'); });
  window.addEventListener('pointerup', () => { down = false; wrap.classList.remove('drag'); });
  window.addEventListener('pointermove', (e) => { if (down) wrap.scrollLeft = sl - (e.clientX - sx); });

  /* ---------- gallery + lightbox ---------- */
  const cards = $$('.g-card'), lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let li = 0, lastFocus = null;
  function showLb(i) {
    li = (i + cards.length) % cards.length;
    const im = $('img', cards[li]);
    lbImg.src = im.src; lbImg.alt = im.alt;
    lbCap.textContent = String(li + 1).padStart(2, '0') + ' / 07  ·  ' + im.alt.toUpperCase();
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    lb.hidden = false; showLb(i);
    requestAnimationFrame(() => lb.classList.add('show'));
    document.body.style.overflow = 'hidden';
    $('#lbX').focus();
  }
  function closeLb() {
    lb.classList.remove('show');
    setTimeout(() => { lb.hidden = true; }, 450);
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  cards.forEach((c, i) => {
    c.tabIndex = 0;
    c.addEventListener('click', () => openLb(i));
    c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); } });
  });
  $('#lbX').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => showLb(li - 1));
  $('#lbNext').addEventListener('click', () => showLb(li + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  window.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showLb(li - 1);
    if (e.key === 'ArrowRight') showLb(li + 1);
  });
  // swipe in lightbox
  let tx = 0;
  lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) showLb(li + (d < 0 ? 1 : -1)); }, { passive: true });

  /* ---------- tilt + cursor glow ---------- */
  const glow = $('.cursor-glow');
  let mx = 0, my = 0, gx = 0, gy = 0, gRAF = false;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY; glow.classList.add('on');
    if (!gRAF) { gRAF = true; requestAnimationFrame(moveGlow); }
  });
  function moveGlow() {
    gx += (mx - gx) * 0.14; gy += (my - gy) * 0.14;
    glow.style.transform = `translate3d(${gx}px,${gy}px,0)`;
    if (Math.abs(mx - gx) > .5 || Math.abs(my - gy) > .5) requestAnimationFrame(moveGlow); else gRAF = false;
  }
  if (!reduce) {
    $$('[data-tilt],[data-tilt-soft]').forEach((el) => {
      const k = el.hasAttribute('data-tilt') ? 9 : 4;
      el.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1000px) rotateY(${x * k}deg) rotateX(${-y * k}deg) translateZ(0)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- golden particle canvases ---------- */
  function dust(canvas, count, speed) {
    const ctx = canvas.getContext('2d');
    let w, h, parts = [], run = false, raf;
    function size() {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * d; canvas.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      parts = Array.from({ length: count }, () => ({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 2.6, s: .2 + Math.random() * speed, p: Math.random() * 6.28, a: .25 + Math.random() * .6 }));
    }
    function frame(t) {
      if (!run) return;
      ctx.clearRect(0, 0, w, h);
      for (const q of parts) {
        q.y -= q.s; q.x += Math.sin(t / 1500 + q.p) * .35;
        if (q.y < -10) { q.y = h + 10; q.x = Math.random() * w; }
        const tw = .55 + .45 * Math.sin(t / 600 + q.p);
        const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r * 4);
        g.addColorStop(0, `rgba(255,232,160,${q.a * tw})`); g.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * 4, 0, 6.283); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    size(); window.addEventListener('resize', size);
    new IntersectionObserver(([e]) => {
      run = e.isIntersecting && !reduce;
      if (run) raf = requestAnimationFrame(frame); else cancelAnimationFrame(raf);
    }).observe(canvas);
  }
  $$('canvas.fx').forEach((c) => dust(c, c.dataset.fx === 'impact' ? (isMobile() ? 45 : 90) : 60, c.dataset.fx === 'impact' ? 1 : .6));

  /* ---------- parallax (stage + gallery) ---------- */
  const stage = $('#stage'), gImgs = $$('.g-img img');
  /* ---------- progress, chapters, nav (one rAF scroll loop) ---------- */
  const pBar = $('#pBar'), pPct = $('#pPct');
  const chLis = $$('#chapters li'), chOrder = chLis.map((l) => l.dataset.ch);
  const chEls = $$('[data-chapter]');
  const navLinks = $$('.pill a'), navIds = navLinks.map((a) => $(a.getAttribute('href')));
  let ticking = false;
  function onScroll() {
    ticking = false;
    const doc = document.documentElement, vh = window.innerHeight;
    const pct = Math.max(0, Math.min(1, window.scrollY / (doc.scrollHeight - vh)));
    const sc = Math.min(1, window.scrollY / (vh * 0.9));
    doc.style.setProperty('--scrim', (0.28 + 0.30 * sc).toFixed(2));
    doc.style.setProperty('--scrim2', (0.42 + 0.30 * sc).toFixed(2));
    pBar.style.width = (pct * 100).toFixed(1) + '%'; pPct.textContent = Math.round(pct * 100) + '%';
    // chapter
    let ch = 'moment';
    for (const el of chEls) { if (el.getBoundingClientRect().top < vh * 0.5) ch = el.dataset.chapter; }
    const ci = chOrder.indexOf(ch);
    chLis.forEach((l, k) => { l.classList.toggle('on', k === ci); l.classList.toggle('done', k < ci); });
    // nav
    let ni = -1;
    navIds.forEach((s, k) => { if (s && s.getBoundingClientRect().top < vh * 0.5) ni = k; });
    navLinks.forEach((a, k) => a.classList.toggle('on', k === ni));
    if (reduce) return;
    // parallax
    if (stage) {
      const r = stage.getBoundingClientRect();
      const off = ((r.top + r.height / 2) / vh - 0.5) * -24;
      stage.style.setProperty('--py', off.toFixed(1) + 'px');
    }
    gImgs.forEach((im) => {
      const r = im.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      im.style.setProperty('--py', (((r.top + r.height / 2) / vh - 0.5) * -26).toFixed(1) + 'px');
    });
    const ib = $('.impact-bg');
    const ir = impact.getBoundingClientRect();
    if (ir.bottom > 0 && ir.top < vh) ib.style.translate = '0 ' + ((ir.top / vh) * -60).toFixed(1) + 'px';
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- smooth nav (offset for sticky header) ---------- */
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', a.getAttribute('href'));
  }));
})();
