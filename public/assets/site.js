/* ===== Scatigno — interações compartilhadas ===== */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Revelar ao rolar
  var rvs = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    rvs.forEach(function (el) { io.observe(el); });
  } else { rvs.forEach(function (el) { el.classList.add('in'); }); }

  // Contadores
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var to = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from || 0), dur = 1600, t0 = null;
    if (reduce) { el.textContent = to; return; }
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); var v = from + (to - from) * (1 - Math.pow(1 - p, 3)); el.textContent = Math.round(v); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var ioc = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); ioc.unobserve(e.target); } }); }, { threshold: 0.5 });
    counters.forEach(function (c) { ioc.observe(c); });
  } else { counters.forEach(runCount); }

  // Palavra rotativa
  document.querySelectorAll('.rot').forEach(function (r) {
    var items = r.querySelectorAll('span'), i = 0;
    if (!items.length) return;
    items[0].classList.add('on');
    if (reduce) return;
    setInterval(function () {
      var cur = items[i]; cur.classList.remove('on'); cur.classList.add('out');
      setTimeout(function () { cur.classList.remove('out'); }, 600);
      i = (i + 1) % items.length; items[i].classList.add('on');
    }, 2400);
  });

  // Vídeos de prévia: tocar só quando visíveis
  var vids = document.querySelectorAll('video[data-autoplay]');
  if ('IntersectionObserver' in window) {
    var iov = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var v = e.target; if (e.isIntersecting && !reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); } });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { iov.observe(v); });
  }

  // Som do vídeo do hero
  document.querySelectorAll('[data-sound]').forEach(function (b) {
    var v = document.getElementById(b.dataset.sound);
    b.addEventListener('click', function () {
      v.muted = !v.muted; if (!v.muted) { v.currentTime = 0; v.play(); }
      b.querySelector('span').textContent = v.muted ? 'Ouvir o vídeo' : 'Silenciar';
      b.setAttribute('aria-pressed', !v.muted);
    });
  });

  // Modal de vídeo
  var modal = document.getElementById('vmodal');
  if (modal) {
    var mv = modal.querySelector('video'), last = null;
    function close() { modal.classList.remove('open'); mv.pause(); mv.removeAttribute('src'); mv.load(); if (last) last.focus(); }
    document.querySelectorAll('[data-video]').forEach(function (b) {
      b.addEventListener('click', function () {
        last = b; mv.src = b.dataset.video; mv.poster = b.dataset.poster || '';
        modal.classList.add('open'); var p = mv.play(); if (p && p.catch) p.catch(function () {});
        modal.querySelector('.close').focus();
      });
    });
    modal.querySelector('.close').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  }

  // Botão flutuante do WhatsApp + barra de progresso
  var fab = document.querySelector('.wa-fab'), prog = document.querySelector('.progress');
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    if (fab) fab.classList.toggle('show', y > 500);
    if (prog) prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Parallax leve
  var px = document.querySelectorAll('[data-parallax]');
  if (px.length && !reduce) {
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        px.forEach(function (el) {
          var r = el.getBoundingClientRect(), k = parseFloat(el.dataset.parallax);
          var c = r.top + r.height / 2 - window.innerHeight / 2;
          el.style.transform = 'translateY(' + (c * k).toFixed(1) + 'px)';
        });
        tick = false;
      });
    }, { passive: true });
  }
})();
