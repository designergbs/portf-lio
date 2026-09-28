/* Abertura da home: cortina preta com monograma GB, traço de preparação e recolhimento
   para cima. Roda a cada carregamento da home (a navegação interna é por hash, então
   não repete ao abrir um case). `?intro=0` desliga. Qualquer falha libera a página. */
(function () {
  var H = document.documentElement;
  /* frases do carregamento: uma por vez, com tempo de leitura */
  var LINES = window.GB_LANG === "en"
    ? ["CONNECTING EXPERIENCES", "INITIALIZING INTERFACE", "ACCESS GRANTED!"]
    : [
      "CONECTANDO AO PORTF\u00d3LIO",
      "INICIALIZANDO INTERFACE",
      "ACESSO LIBERADO!"
    ];
  var hash = location.hash || "";
  var deep = hash && hash !== "#" && hash !== "#top";
  var off = /[?&]intro=0/.test(location.search);
  var INTRO_VARIANT = /[?&]loader=sequential(?:&|$)/.test(location.search) ? "sequential" : "scanner";
  window.GB_INTRO = { active: false, variant: INTRO_VARIANT };
  if (off || deep) { return; }

  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
  var layer = null, done = false, timers = [];
  function at(fn, ms) { timers.push(window.setTimeout(function () { try { fn(); } catch (e) { finish(); } }, ms)); }

  function pin(e) { e.preventDefault(); }
  function keep() { if (window.scrollY !== 0) window.scrollTo(0, 0); }

  var PHRASE_DURATION_MS = 2800;
  var FINAL_PHRASE_DURATION_MS = PHRASE_DURATION_MS / 2;
  var SCAN_START_SECONDS = PHRASE_DURATION_MS / 1000;
  var SCAN_DURATION_SECONDS = PHRASE_DURATION_MS / 1000;
  var MONOGRAM_END_MS = INTRO_VARIANT === "scanner"
    ? PHRASE_DURATION_MS * (LINES.length - 1) + FINAL_PHRASE_DURATION_MS
    : 4150;

  function meshMarkup() {
    var G = ["01110", "10001", "10000", "10111", "10001", "10001", "01111"];
    var B = ["11110", "10001", "10001", "11110", "10001", "10001", "11110"];
    var points = [], activation = {}, preActivation = {}, litLookup = {}, links = "", step = 5.15;
    var scanStart = SCAN_START_SECONDS, scanDuration = SCAN_DURATION_SECONDS;

    for (var row = -9; row <= 9; row++) {
      for (var col = -9; col <= 9; col++) {
        var x = col * step, y = row * step, distance = Math.hypot(x, y);
        if (Math.abs(x) > 43 || Math.abs(y) > 49 - 0.57735 * Math.abs(x)) continue;
        var bitmapRow = row + 3, lit = false;
        if (bitmapRow >= 0 && bitmapRow < G.length) {
          if (col >= -5 && col <= -1) lit = G[bitmapRow][col + 5] === "1";
          if (col >= 1 && col <= 5) lit = B[bitmapRow][col - 1] === "1";
        }
        var point = { x: 50 + x, y: 50 + y, lit: lit, row: row, col: col, distance: distance };
        points.push(point);
        if (lit) litLookup[col + "," + row] = point;
      }
    }

    var litPoints = Object.keys(litLookup).map(function (key) { return litLookup[key]; });
    var sequentialPoints = litPoints.slice().sort(function (a, b) {
      return (a.col > 0) - (b.col > 0) || a.row - b.row || a.col - b.col;
    });
    sequentialPoints.forEach(function (point, index) {
      activation[point.col + "," + point.row] = 0.55 + index * 0.055;
    });

    litPoints.forEach(function (from) {
      [[1, 0], [0, 1]].forEach(function (offset) {
        var to = litLookup[(from.col + offset[0]) + "," + (from.row + offset[1])];
        if (!to) return;
        var fromKey = from.col + "," + from.row;
        var toKey = to.col + "," + to.row;
        var dx = (to.col - from.col) * step, dy = (to.row - from.row) * step;
        var linkStart = Math.max(activation[fromKey], activation[toKey]);
        var linkScan = scanStart + (((from.y + to.y) / 2) / 100) * scanDuration;
        links += '<i class="gb-intro__link" style="left:' + from.x + "%;top:" + from.y + "%;width:" + Math.hypot(dx, dy) + "%;--gb-link-angle:" + Math.atan2(dy, dx) + "rad;--gb-link-start:" + linkStart + "s;--gb-link-fade:" + (linkStart + 0.14) + "s;--gb-link-scan:" + linkScan + 's"></i>';
      });
    });

    var preKeys = litPoints.map(function (point) { return point.col + "," + point.row; });
    for (var preIndex = preKeys.length - 1; preIndex > 0; preIndex--) {
      var randomIndex = Math.floor(Math.random() * (preIndex + 1));
      var currentKey = preKeys[preIndex];
      preKeys[preIndex] = preKeys[randomIndex];
      preKeys[randomIndex] = currentKey;
    }
    var preStep = (scanStart - 0.62) / Math.max(1, preKeys.length - 1);
    preKeys.forEach(function (key, index) {
      preActivation[key] = 0.3 + index * preStep;
    });

    var finale = Math.max.apply(null, Object.keys(activation).map(function (key) { return activation[key]; })) + 0.28;
    var scanFinale = scanStart + scanDuration + 0.24;
    var signalLock = scanFinale + 0.6;
    var dots = points.map(function (point) {
      var styles = [
        "left:" + point.x + "%",
        "top:" + point.y + "%",
        "--gb-scan-delay:" + (scanStart + (point.y / 100) * scanDuration) + "s",
        "--gb-push-x:" + ((point.x - 50) * 0.22) + "px",
        "--gb-push-y:" + ((point.y - 50) * 0.22) + "px",
        "--gb-wave:" + (finale + point.distance / 120) + "s"
      ];
      if (point.lit) {
        styles.push("--gb-delay:" + activation[point.col + "," + point.row] + "s");
        styles.push("--gb-pre-delay:" + preActivation[point.col + "," + point.row] + "s");
      }
      return '<i class="gb-intro__dot' + (point.lit ? " is-on" : "") + '" style="' + styles.join(";") + '">' + (point.lit ? "<i></i>" : "") + "</i>";
    }).join("");

    return '<span class="gb-intro__mono" role="img" aria-label="GB" style="--gb-finale:' + finale + "s;--gb-scan-start:" + scanStart + "s;--gb-scan-duration:" + scanDuration + "s;--gb-scan-finale:" + scanFinale + "s;--gb-signal-lock:" + signalLock + 's"><i class="gb-intro__halo"></i><i class="gb-intro__scanline"></i>' + links + dots + "</span>";
  }

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
    layer.className = "gb-intro-layer gb-intro--" + INTRO_VARIANT;
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML =
      '<div class="gb-intro__grid"></div>' +
      '<div class="gb-intro__stage">' +
      '<span class="gb-intro__monowrap">' + meshMarkup() + "</span>" +
      '<span class="gb-intro__feedback">' +
      '<span class="gb-intro__name">' + LINES[0] + '</span>' +
      '</span>' +
      '<span class="gb-intro__rule"><i class="gb-intro__rule-fill"></i><i class="gb-intro__rule-tip"></i></span>' +
      '<span class="gb-intro__pct">0%</span>' +
      "</div>";
    document.body.appendChild(layer);

    /* recurso essencial da primeira seção: só a arte do hero */
    var art = new Image();
    art.src = "/assets/hero-artwork-3x2.png";

    /* rede de segurança: nunca deixa a cortina presa */
    timers.push(window.setTimeout(finish, reduce ? 1200 : Math.max(6200, MONOGRAM_END_MS + 1400)));
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
    var progressDuration = Math.max(totalRead, MONOGRAM_END_MS - 300);
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
        layer.classList.add("is-lit", "is-forming");
        ruleFill.style.transitionDuration = progressDuration + "ms";
        ruleTip.style.animationDuration = progressDuration + "ms";
        at(function () { layer.classList.add("is-armed"); countPct(progressDuration); }, 100);
        /* uma frase por vez, respeitando o tempo de leitura de cada texto; a última confirma o acesso */
        var acc = 0;
        for (var i = 1; i < LINES.length; i++) {
          acc += durations[i - 1];
          var lineAt = INTRO_VARIANT === "scanner" ? PHRASE_DURATION_MS * i - 200 : acc;
          at(swap(i), lineAt);
        }
        acc += durations[LINES.length - 1];
        var exitAt = Math.max(acc + 150, MONOGRAM_END_MS);
        at(hero, exitAt);
        at(finish, exitAt + 750);
      });
    };
    if (fonts) { fonts.then(start); at(start, 420); } else { at(start, 60); }
  } catch (e) { finish(); }
})();
