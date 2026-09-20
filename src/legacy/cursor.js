/* Cursor global: ponto que segue o ponteiro e cresce sobre elementos interativos.
   Só é ativado em ponteiros precisos; qualquer falha deixa o cursor nativo intacto. */
(function () {
  try {
    if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var INTERACTIVE = 'a[href],button,summary,[role="button"],[role="link"],[role="tab"],[data-cursor="interactive"],input[type="submit"],input[type="button"],label[for]';
    var NATIVE = 'input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]),textarea,select,[contenteditable="true"],[data-cursor="native"]';

    var dot = document.createElement("div");
    dot.className = "gb-cursor";
    dot.setAttribute("aria-hidden", "true");
    var inner = document.createElement("span");
    inner.className = "gb-cursor__dot";
    dot.appendChild(inner);
    var ring = document.createElement("div");
    ring.className = "gb-cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    var ringInner = document.createElement("span");
    ringInner.className = "gb-cursor-ring__o";
    ring.appendChild(ringInner);
    var rx = -100, ry = -100;

    var tx = -100, ty = -100, x = -100, y = -100, raf = 0, mounted = false;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var EASE = 0.2, mountedOnce = false;

    function mount() {
      if (mounted) return;
      document.body.appendChild(ring);
      document.body.appendChild(dot);
      document.documentElement.classList.add("gb-cursor-on");
      mounted = true;
    }
    function unmount() {
      if (!mounted) return;
      dot.remove();
      ring.remove();
      document.documentElement.classList.remove("gb-cursor-on");
      mounted = false;
    }
    /* segue o ponteiro com uma interpolação curta — fluido, sem elasticidade */
    function draw() {
      var dx = tx - x, dy = ty - y;
      var snap = reduce || dot.classList.contains("is-active");
      if (snap) { x = tx; y = ty; } else { x += dx * EASE; y += dy * EASE; }
      if (reduce) { rx = tx; ry = ty; } else { rx += (tx - rx) * 0.15; ry += (ty - ry) * 0.15; }
      var still = Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1 && Math.abs(tx - rx) < 0.1 && Math.abs(ty - ry) < 0.1;
      if (still) { x = tx; y = ty; rx = tx; ry = ty; raf = 0; }
      else { raf = window.requestAnimationFrame(draw); }
      dot.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
    }
    function schedule() { if (!raf) raf = window.requestAnimationFrame(draw); }

    document.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") { unmount(); return; }
      mount();
      tx = e.clientX; ty = e.clientY;
      if (!mountedOnce) { x = tx; y = ty; rx = tx; ry = ty; mountedOnce = true; }
      schedule();
      var t = e.target;
      var native = t && t.closest && t.closest(NATIVE);
      var act = !native && !!(t && t.closest && t.closest(INTERACTIVE));
      dot.classList.toggle("is-hidden", !!native);
      ring.classList.toggle("is-hidden", !!native);
      dot.classList.toggle("is-active", act);
      ring.classList.toggle("is-active", act);
    }, { passive: true });

    document.addEventListener("pointerdown", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") { unmount(); return; }
      dot.classList.add("is-press"); ring.classList.add("is-press");
    }, { passive: true });
    document.addEventListener("pointerup", function () { dot.classList.remove("is-press"); ring.classList.remove("is-press"); }, { passive: true });

    document.addEventListener("pointerleave", function () { dot.classList.add("is-hidden"); ring.classList.add("is-hidden"); }, { passive: true });
    document.addEventListener("pointerenter", function () { dot.classList.remove("is-hidden"); ring.classList.remove("is-hidden"); }, { passive: true });
    window.addEventListener("blur", function () { dot.classList.add("is-hidden"); ring.classList.add("is-hidden"); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && raf) { window.cancelAnimationFrame(raf); raf = 0; }
    });
  } catch (err) {
    document.documentElement.classList.remove("gb-cursor-on");
  }
})();
