/* Abertura da home: cortina preta com monograma GB, traço de preparação e recolhimento
   para cima. Roda a cada carregamento da home (a navegação interna é por hash, então
   não repete ao abrir um case). `?intro=0` desliga. Qualquer falha libera a página. */
(function () {
  var H = document.documentElement;
  /* frases do carregamento: uma por vez, com tempo de leitura */
  var LINES = window.GB_LANG === "en"
    ? ["CONNECTING EXPERIENCES", "INITIALIZING INTERFACE", "ACCESS GRANTED!"]
    : [
      "CONECTANDO EXPERI\u00caNCIAS",
      "INICIALIZANDO INTERFACE",
      "ACESSO LIBERADO!"
    ];
  var hash = location.hash || "";
  var deep = hash && hash !== "#" && hash !== "#top";
  var off = /[?&]intro=0/.test(location.search);
  window.GB_INTRO = { active: false };
  if (off || deep) { return; }

  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
  var layer = null, done = false, timers = [];
  function at(fn, ms) { timers.push(window.setTimeout(function () { try { fn(); } catch (e) { finish(); } }, ms)); }

  function pin(e) { e.preventDefault(); }
  function keep() { if (window.scrollY !== 0) window.scrollTo(0, 0); }

  function release() {
    window.removeEventListener("scroll", keep);
    document.removeEventListener("wheel", pin, { passive: false });
    document.removeEventListener("touchmove", pin, { passive: false });
    document.removeEventListener("keydown", skip);
    document.removeEventListener("pointerdown", skip);
  }

  function hero() {
    if (H.classList.contains("gb-intro-rise")) return;
    H.classList.remove("gb-intro-hold");
    H.classList.add("gb-intro-rise");
    window.GB_INTRO.active = false;
    try { window.dispatchEvent(new Event("gb:intro-hero")); } catch (e) {}
  }

  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    hero();
    release();
    H.classList.remove("gb-intro", "gb-intro-hold", "gb-intro-reduce");
    window.setTimeout(function () { H.classList.remove("gb-intro-rise"); }, 40);
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
  }

  function skip() { if (!done) { hero(); at(finish, 720); } }

  try {
    H.classList.add("gb-intro", "gb-intro-hold");
    window.GB_INTRO.active = true;
    window.scrollTo(0, 0);
    window.addEventListener("scroll", keep, { passive: true });
    document.addEventListener("wheel", pin, { passive: false });
    document.addEventListener("touchmove", pin, { passive: false });

    layer = document.createElement("div");
    layer.className = "gb-intro-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML =
      '<div class="gb-intro__grid"></div>' +
      '<div class="gb-intro__stage">' +
      '<span class="gb-intro__monowrap"><span class="gb-intro__halo"></span><span class="gb-intro__ring"></span><span class="gb-intro__disc"></span><span class="gb-intro__mono">GB</span></span>' +
      '<span class="gb-intro__name">' + LINES[0] + '</span>' +
      '<span class="gb-intro__rule"><i class="gb-intro__rule-fill"></i><i class="gb-intro__rule-tip"></i></span>' +
      '<span class="gb-intro__pct">0%</span>' +
      "</div>";
    document.body.appendChild(layer);

    /* recurso essencial da primeira seção: só a arte do hero */
    var art = new Image();
    art.src = "/assets/hero-artwork-3x2.png";

    /* rede de segurança: nunca deixa a cortina presa */
    timers.push(window.setTimeout(finish, reduce ? 1200 : 6200));
    document.addEventListener("keydown", skip);
    document.addEventListener("pointerdown", skip);

    var line = layer.querySelector(".gb-intro__name");
    var pct = layer.querySelector(".gb-intro__pct");
    var ruleFill = layer.querySelector(".gb-intro__rule-fill");
    var ruleTip = layer.querySelector(".gb-intro__rule-tip");
    /* tempo de leitura por frase: base + custo por caractere; a confirmação final ganha uma folga extra */
    function readTime(s, isLast) {
      var d = 420 + s.length * 24;
      return isLast ? d + 500 : d;
    }
    var durations = LINES.map(function (s, i) { return readTime(s, i === LINES.length - 1); });
    var totalRead = durations.reduce(function (a, b) { return a + b; }, 0);
    function countPct(dur) {
      var t0 = performance.now();
      function step(now) {
        if (done) return;
        var p = Math.min(1, (now - t0) / dur);
        pct.textContent = Math.round(p * 100) + "%";
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var swap = function (i) {
      return function () {
        line.classList.add("is-out");
        at(function () {
          line.textContent = LINES[i];
          if (i === LINES.length - 1) line.classList.add("is-done");
          line.classList.remove("is-out", "is-in");
          void line.offsetWidth;
          line.classList.add("is-in");
        }, 200);
      };
    };

    if (reduce) {
      layer.classList.add("is-instant", "is-lit", "is-armed");
      pct.textContent = "100%";
      line.textContent = LINES[LINES.length - 1];
      line.classList.add("is-done");
      at(function () { H.classList.add("gb-intro-reduce"); hero(); }, 180);
      at(finish, 440);
      return;
    }

    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : null;
    var started = false;
    var start = function () {
      if (started || done) return;
      started = true;
      requestAnimationFrame(function () {
        layer.classList.add("is-lit");
        ruleFill.style.transitionDuration = totalRead + "ms";
        ruleTip.style.animationDuration = totalRead + "ms";
        at(function () { layer.classList.add("is-armed"); countPct(totalRead); }, 100);
        /* uma frase por vez, respeitando o tempo de leitura de cada texto; a última confirma o acesso */
        var acc = 0;
        for (var i = 1; i < LINES.length; i++) { acc += durations[i - 1]; at(swap(i), acc); }
        acc += durations[LINES.length - 1];
        at(hero, acc + 150);
        at(finish, acc + 900);
      });
    };
    if (fonts) { fonts.then(start); at(start, 420); } else { at(start, 60); }
  } catch (e) { finish(); }
})();
