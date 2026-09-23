import { useEffect } from "react";

/* Hero: inclinação + lupa em cima da imagem — sem vidro/reflexo/borda. Dois modos de
   entrada, nunca os dois ao mesmo tempo:
   - mouse fino (desktop): exatamente como antes — pointermove em window, deriva
     automática em repouso, "placa pressionada" no hover. Nada neste modo foi alterado.
   - ponteiro grosso (touch): sem deriva automática nenhuma (idle fica zerado); o mesmo
     efeito (inclinação + lupa + reflexos) só aparece enquanto o dedo está sobre a
     imagem, entra/sai suavemente pela mesma suavização de "h"/"amount" já existente, e
     solta a interação assim que a página rola (nunca preventDefault, então scroll/pinch
     continuam livres).
   Sem "reduzir movimento" nem um ponteiro fino OU grosso, a imagem fica estática (a
   própria .hero-art-scene cai para transform:none via CSS). */
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const COARSE_POINTER = "(pointer: coarse)";
const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

/* Moldura de vidro da frente já desenhada em hero-artwork-3x2.png, em fração das
   dimensões da PRÓPRIA IMAGEM (não da caixa .kit-hero__art — largura/altura da caixa têm
   clamps independentes por breakpoint, então nem sempre é exatamente 3:2 como a imagem;
   sob object-fit:contain isso sobra como letterbox e desloca onde a moldura realmente
   aparece). Os reflexos ficam restritos a essa mesma área. */
const GLASS_INSET_X = 0.14;
const GLASS_INSET_Y = 0.03;
/* quanto os reflexos crescem para fora da moldura, igual nos 4 lados. */
const REFL_EXPAND_PX = 16;

/* object-fit:contain (ver .hero-artwork-image) com object-position:100% 50%: a imagem
   ocupa fitX/fitY da caixa e é empurrada para a direita (folga toda à esquerda) e
   centralizada verticalmente (folga dividida em cima/embaixo) — replica o que o
   navegador faz, então left/top/right/bottom (em px, relativos à caixa) caem exatamente
   sobre a moldura desenhada na imagem, já com REFL_EXPAND_PX subtraído (cresce para fora). */
function computeFrameRect(boxW, boxH, imgNaturalW, imgNaturalH) {
  const imgAr = imgNaturalW && imgNaturalH ? imgNaturalW / imgNaturalH : 1.5;
  const boxAr = boxW / boxH;
  const fitX = boxAr > imgAr ? imgAr / boxAr : 1;
  const fitY = boxAr > imgAr ? 1 : boxAr / imgAr;
  const imageW = boxW * fitX, imageH = boxH * fitY;
  const offsetX = boxW - imageW;
  const offsetY = (boxH - imageH) / 2;
  return {
    leftPx: offsetX + imageW * GLASS_INSET_X - REFL_EXPAND_PX,
    rightPx: imageW * GLASS_INSET_X - REFL_EXPAND_PX,
    topPx: offsetY + imageH * GLASS_INSET_Y - REFL_EXPAND_PX,
    bottomPx: offsetY + imageH * GLASS_INSET_Y - REFL_EXPAND_PX,
  };
}

const VERTEX_SRC = "attribute vec2 a; varying vec2 uv; void main(){uv=vec2((a.x+1.0)*.5,(1.0-a.y)*.5);gl_Position=vec4(a,0,1);}";

/* Zoom central 1.45x, dobra invertida perto da borda (distorção "invertida") e
   iluminação de borda esmeralda/menta. `fit` reproduz object-fit:contain (a imagem 3:2
   pode ficar em caixas com outra proporção, já que largura/altura da .kit-hero__art têm
   clamps independentes): fora da área realmente ocupada pela imagem a amostra retorna
   alfa 0 (sem esticar). */
const FRAGMENT_SRC = `
precision highp float;
varying vec2 uv;
uniform sampler2D tex;
uniform vec2 size;
uniform vec2 fit;
uniform vec2 center;
uniform float radius;
uniform float power;
uniform float angle;

vec4 sampleImg(vec2 p){
  vec2 t = (p - 0.5) / fit + 0.5;
  if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) return vec4(0.0);
  return vec4(texture2D(tex, t).rgb, 1.0);
}

void main(){
  vec4 baseS = sampleImg(uv);

  vec2 delta = (uv - center) * size;
  float ca = cos(angle), sa = sin(angle);
  vec2 q = vec2(ca*delta.x + sa*delta.y, -sa*delta.x + ca*delta.y) / max(radius, 1.0);
  float theta = atan(q.y, q.x);
  float r = length(q);
  float lens = 1.0 - smoothstep(0.955, 1.0, r);

  float rim = exp(-pow((r-.78)/.21, 2.0));
  float scale = mix(1.0/1.45, 1.0, smoothstep(.60, 1.0, r)) - .22*rim;
  vec2 bent = center + (uv-center)*scale;

  float folded = exp(-pow((r-.84)/.12, 2.0));
  vec2 reversed = center - (uv-center)*(.72 + .18*r);

  vec4 bentS = sampleImg(bent);
  vec4 revS = sampleImg(reversed);
  vec3 refracted = mix(bentS.rgb, revS.rgb, folded*.78);
  float refractedA = mix(bentS.a, max(bentS.a, revS.a), folded*.78);

  float edge = exp(-pow((r-.965)/.026, 2.0));
  float sheen = pow(max(0.0, dot(normalize(q+vec2(0.001)), normalize(vec2(-.6,-.8)))), 12.0);
  float spectral = exp(-pow((r-.9)/.072, 2.0));
  vec3 tint = vec3(.015,.24,.075) * (.65 + .35*cos(theta*2.0 + r*3.0));
  refracted += spectral*tint*.18;
  refracted *= 1.0 - .16*exp(-pow((r-.73)/.085, 2.0));
  refracted += edge*(vec3(.01,.15,.035) + sheen*vec3(.28,.55,.32));

  vec3 finalColor = mix(baseS.rgb, refracted, lens*power);
  float finalAlpha = mix(baseS.a, refractedA, lens*power);
  gl_FragColor = vec4(finalColor, finalAlpha);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(info || "shader compile error");
  }
  return s;
}

export function useHeroArtLens({ artRef, sceneRef, imgRef, canvasRef }) {
  useEffect(() => {
    const art = artRef.current, scene = sceneRef.current, img = imgRef.current, canvas = canvasRef.current;
    if (!art || !scene || !img || !canvas) return undefined;

    const fineMq = window.matchMedia(FINE_POINTER);
    const coarseMq = window.matchMedia(COARSE_POINTER);
    const reduceMq = window.matchMedia(REDUCE_MOTION);
    if (reduceMq.matches || (!fineMq.matches && !coarseMq.matches)) return undefined;
    /* decidido uma vez, no mount — o mouse fino sempre vence se por acaso os dois
       baterem (ex.: notebook com tela sensível ao toque). */
    const isFine = fineMq.matches;

    let destroyed = false;
    let raf = 0, last = 0, phase = Math.random() * 6, tabVisible = true, inViewport = true;
    let proximityTarget = 0, h = 0, px = 0.5, py = 0.5, pxS = 0.5, pyS = 0.5;
    let amount = 0, cx = 0, cy = 0, smCx = 0, smCy = 0, seenPointer = false, angle = 0;
    let touchActive = false, touchId = null, touchStartScrollX = 0, touchStartScrollY = 0;

    const ns = "http://www.w3.org/2000/svg";
    const lens = document.createElementNS(ns, "svg");
    lens.classList.add("hero-lens-cursor");
    lens.setAttribute("viewBox", "-55 -55 110 110");
    lens.setAttribute("aria-hidden", "true");
    lens.innerHTML = '<circle class="hero-lens-cursor__ring"/><circle class="hero-lens-cursor__dot" r="1.6"/>';
    document.body.appendChild(lens);
    const ring = lens.querySelector(".hero-lens-cursor__ring");

    /* reflexos naturais: poucos brilhos difusos e translúcidos espalhados pela imagem,
       presos à inclinação (não a um "vidro" separado) — criados aqui para não mexer no
       JSX do Hero por causa de um detalhe puramente visual. */
    const reflection = document.createElement("div");
    reflection.className = "hero-art-reflection";
    reflection.setAttribute("aria-hidden", "true");
    const reflSheen = document.createElement("div");
    reflSheen.className = "hero-art-reflection__sheen";
    reflSheen.setAttribute("aria-hidden", "true");
    reflection.appendChild(reflSheen);
    scene.appendChild(reflection);

    /* Marcadores nos 4 cantos da cena (herdam a mesma transform 3D do tilt): permitem
       mapear a posição real do mouse na tela para a coordenada local da imagem mesmo
       com a inclinação aplicada — uma divisão linear pelo retângulo (AABB) erra
       justamente quando a cena está rotacionada. */
    const corners = [[0, 0], [100, 0], [100, 100], [0, 100]].map(([lx, ly]) => {
      const el = document.createElement("i");
      el.style.cssText = "position:absolute;left:" + lx + "%;top:" + ly + "%;width:0;height:0;pointer-events:none";
      el.setAttribute("aria-hidden", "true");
      scene.appendChild(el);
      return el;
    });
    function localPoint(x, y) {
      const p = corners.map((el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y }; });
      const dx1 = p[1].x - p[2].x, dx2 = p[3].x - p[2].x, dy1 = p[1].y - p[2].y, dy2 = p[3].y - p[2].y;
      const sx = p[0].x - p[1].x + p[2].x - p[3].x, sy = p[0].y - p[1].y + p[2].y - p[3].y, d = dx1 * dy2 - dx2 * dy1;
      if (Math.abs(d) < 0.0001) return { x: -1, y: -1 };
      const g = (sx * dy2 - dx2 * sy) / d, h2 = (dx1 * sy - sx * dy1) / d;
      const a = p[1].x - p[0].x + g * p[1].x, b = p[3].x - p[0].x + h2 * p[3].x, c = p[0].x;
      const e2 = p[1].y - p[0].y + g * p[1].y, f = p[3].y - p[0].y + h2 * p[3].y, k = p[0].y;
      const A = a - x * g, B = b - x * h2, C = x - c, D = e2 - y * g, E = f - y * h2, F = y - k, det = A * E - B * D;
      if (Math.abs(det) < 0.0001) return { x: -1, y: -1 };
      return { x: (C * E - B * F) / det, y: (A * F - C * D) / det };
    }
    function computeFit(rectW, rectH) {
      const imgAr = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.5;
      const boxAr = rectW / rectH;
      return boxAr > imgAr ? [imgAr / boxAr, 1] : [1, boxAr / imgAr];
    }

    let gl = null, program = null, uniforms = {}, glReady = false;
    try {
      gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      gl = null;
    }

    function setupGL() {
      if (destroyed || !gl || !img.naturalWidth) return;
      try {
        const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC);
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
        program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "link error");
        gl.useProgram(program);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, "a");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        ["size", "fit", "center", "radius", "power", "angle"].forEach((n) => { uniforms[n] = gl.getUniformLocation(program, n); });
        glReady = true;
        canvas.style.visibility = "visible";
        img.style.visibility = "hidden";
      } catch {
        glReady = false;
        canvas.style.visibility = "hidden";
        img.style.visibility = "visible";
      }
    }
    if (img.complete) setupGL(); else img.addEventListener("load", setupGL, { once: true });

    function onContextLost(e) {
      e.preventDefault();
      glReady = false;
      canvas.style.visibility = "hidden";
      img.style.visibility = "visible";
    }
    canvas.addEventListener("webglcontextlost", onContextLost, false);

    function ensureRAF() {
      if (!raf && tabVisible && inViewport) raf = window.requestAnimationFrame(tick);
    }

    function onPointerMove(e) {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const rect = art.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      px = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      py = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      const dx0 = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy0 = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const dist = Math.hypot(dx0, dy0);
      const p = Math.max(0, 1 - dist / 260);
      proximityTarget = p * p * (3 - 2 * p);
      if (!seenPointer) { smCx = e.clientX; smCy = e.clientY; }
      cx = e.clientX; cy = e.clientY; seenPointer = true;
      ensureRAF();
    }
    function onLeaveDoc() { proximityTarget = 0; seenPointer = false; touchActive = false; touchId = null; }

    /* toque: só "engata" se o dedo começa dentro da imagem (posição, não e.target — a
       .kit-hero__art tem pointer-events:none de propósito, igual ao pointermove acima
       que também não depende de target). Nunca preventDefault, então rolagem/pinch-zoom
       do navegador nunca são bloqueados; se a página rolar entre um touchmove e outro, a
       interação solta sozinha e o dedo passa a só rolar. */
    function inArtBounds(x, y) {
      const rect = art.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }
    function updateTouchXY(x, y) {
      const rect = art.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      px = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
      py = Math.max(0, Math.min(1, (y - rect.top) / rect.height));
      cx = x; cy = y; seenPointer = true;
    }
    function endTouch() {
      if (!touchActive) return;
      touchActive = false; touchId = null;
      proximityTarget = 0; seenPointer = false;
      ensureRAF();
    }
    function onTouchStart(e) {
      if (touchActive || e.touches.length !== 1) return;
      const t = e.touches[0];
      if (!inArtBounds(t.clientX, t.clientY)) return;
      touchId = t.identifier;
      touchStartScrollX = window.scrollX; touchStartScrollY = window.scrollY;
      smCx = t.clientX; smCy = t.clientY; // sem inércia no primeiro toque (não tinha posição anterior)
      touchActive = true;
      proximityTarget = 1;
      updateTouchXY(t.clientX, t.clientY);
      ensureRAF();
    }
    function onTouchMove(e) {
      if (!touchActive) return;
      if (e.touches.length !== 1) { endTouch(); return; } // segundo dedo entrou (pinch) — solta e deixa o navegador cuidar
      let t = null;
      for (let i = 0; i < e.touches.length; i++) { if (e.touches[i].identifier === touchId) { t = e.touches[i]; break; } }
      if (!t) { endTouch(); return; }
      if (window.scrollX !== touchStartScrollX || window.scrollY !== touchStartScrollY) { endTouch(); return; } // a página rolou: solta e não interfere mais
      updateTouchXY(t.clientX, t.clientY);
      ensureRAF();
    }
    function onTouchEnd() { endTouch(); }
    function onTouchCancel() { endTouch(); }

    if (isFine) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeaveDoc);
      window.addEventListener("blur", onLeaveDoc);
    } else {
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("touchcancel", onTouchCancel, { passive: true });
      window.addEventListener("blur", onLeaveDoc);
    }

    const io = new IntersectionObserver((entries) => {
      inViewport = entries[0].isIntersecting;
      if (inViewport) ensureRAF(); else if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0 });
    io.observe(art);

    function onVisibilityChange() {
      tabVisible = !document.hidden;
      if (!tabVisible && raf) { window.cancelAnimationFrame(raf); raf = 0; }
      else ensureRAF();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    function tick(t) {
      raf = 0;
      if (destroyed) return;
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 1 / 60;
      last = t;
      phase += dt * 1.5;

      h += (proximityTarget - h) * (1 - Math.exp(-dt * 6));
      pxS += (px - pxS) * (1 - Math.exp(-dt * 11));
      pyS += (py - pyS) * (1 - Math.exp(-dt * 11));

      /* mesma inclinação em qualquer dispositivo: deriva circular orgânica em repouso
         (um único ângulo alimenta X e Y) + "placa pressionada" no mouse/dedo (canto
         perto recua, oposto avança), centro sempre fixo durante a interação. isFine só
         decide QUEM alimenta px/py/proximityTarget (mouse vs. toque) — a deriva
         automática roda igual nos dois. */
      const wanderAngle = phase * 0.31 + Math.sin(phase * 0.071) * 1.6 + Math.cos(phase * 0.053) * 0.9;
      const wanderAmp = 1 + Math.sin(phase * 0.093) * 0.12 + Math.sin(phase * 0.037) * 0.08;
      const idleRX = Math.sin(wanderAngle) * 7 * wanderAmp;
      const idleRY = Math.cos(wanderAngle) * 8 * wanderAmp;
      const cornerBoost = 1 + 0.2 * Math.abs(pxS - 0.5) * 2 * Math.abs(pyS - 0.5) * 2;
      const hoverRX = -(pyS - 0.5) * 13 * cornerBoost;
      const hoverRY = (pxS - 0.5) * 15 * cornerBoost;
      const rx = idleRX * (1 - h) + hoverRX * h;
      const ry = idleRY * (1 - h) + hoverRY * h;
      const dx = Math.cos(phase * 0.4) * 3 * (1 - h);
      const dy = Math.sin(phase * 0.5) * 2.4 * (1 - h);

      scene.style.setProperty("--rx", rx.toFixed(3) + "deg");
      scene.style.setProperty("--ry", ry.toFixed(3) + "deg");
      scene.style.setProperty("--dx", dx.toFixed(2) + "px");
      scene.style.setProperty("--dy", dy.toFixed(2) + "px");

      const boxRect = art.getBoundingClientRect();
      const boxW = boxRect.width, boxH = boxRect.height;
      const hasBox = boxW > 0 && boxH > 0;
      if (hasBox) {
        const frame = computeFrameRect(boxW, boxH, img.naturalWidth, img.naturalHeight);
        scene.style.setProperty("--refl-top", frame.topPx.toFixed(1) + "px");
        scene.style.setProperty("--refl-right", frame.rightPx.toFixed(1) + "px");
        scene.style.setProperty("--refl-bottom", frame.bottomPx.toFixed(1) + "px");
        scene.style.setProperty("--refl-left", frame.leftPx.toFixed(1) + "px");
      }

      const easeCursor = 1 - Math.exp(-dt * 9);
      const smoothCx = smCx + (cx - smCx) * easeCursor;
      const smoothCy = smCy + (cy - smCy) * easeCursor;
      const vx = smoothCx - smCx, vy = smoothCy - smCy, speed = Math.hypot(vx, vy);
      if (speed > 0.12) {
        const targetAngle = Math.atan2(vy, vx);
        angle += Math.atan2(Math.sin(targetAngle - angle), Math.cos(targetAngle - angle)) * (1 - Math.exp(-dt * 9));
      }
      smCx = smoothCx; smCy = smoothCy;

      /* "inside" usa a posição real (não suavizada) do mouse, mapeada pelos cantos da
         cena (acompanha o tilt) e corrigida pelo fit de contain — só ativa a lupa
         quando o cursor está de fato sobre a imagem, mesmo inclinada. */
      const fit = hasBox ? computeFit(boxW, boxH) : [1, 1];
      const rawLoc = seenPointer ? localPoint(cx, cy) : { x: -1, y: -1 };
      const rawImg = { x: (rawLoc.x - 0.5) / fit[0] + 0.5, y: (rawLoc.y - 0.5) / fit[1] + 0.5 };
      const insideImage = seenPointer && rawImg.x >= 0 && rawImg.x <= 1 && rawImg.y >= 0 && rawImg.y <= 1;
      const targetAmount = insideImage ? 1 : 0;
      amount += (targetAmount - amount) * (1 - Math.exp(-dt * 10));

      /* ponto central da lupa: mesma projeção pelos cantos, mas a partir da posição
         suavizada (inércia), então continua acompanhando a posição real do mouse na
         imagem inclinada — só que com o mesmo atraso curto do círculo do cursor. */
      const centerLoc = localPoint(smoothCx, smoothCy);

      /* reflexos naturais: luz ambiente que segue a inclinação em repouso, encolhendo
         suavemente para a posição real do cursor quando a lupa está ativa — poucos
         brilhos difusos e translúcidos (baixa opacidade, quase neutros, leve tom verde),
         nunca uma mancha uniforme nem uma camada opaca por cima da imagem. */
      const lightX = (0.5 + ry / 10 * 0.4) * (1 - h) + pxS * h;
      const lightY = (0.5 - rx / 9 * 0.3) * (1 - h) + pyS * h;
      const finalX = lightX * (1 - amount) + centerLoc.x * amount;
      const finalY = lightY * (1 - amount) + centerLoc.y * amount;
      scene.style.setProperty("--rmx", (Math.max(0, Math.min(1, finalX)) * 100).toFixed(2) + "%");
      scene.style.setProperty("--rmy", (Math.max(0, Math.min(1, finalY)) * 100).toFixed(2) + "%");

      const reflect = Math.min(0.55, 0.12 + Math.hypot(rx, ry) * 0.032 + h * 0.16);
      scene.style.setProperty("--reflect", reflect.toFixed(3));

      const ambientRX = hasBox ? boxW * 0.4 : 220, ambientRY = hasBox ? boxH * 0.4 : 170;
      const focusRX = hasBox ? boxW * 0.26 : 150, focusRY = hasBox ? boxH * 0.26 : 120;
      scene.style.setProperty("--sheen-rx", (ambientRX + (focusRX - ambientRX) * amount).toFixed(1) + "px");
      scene.style.setProperty("--sheen-ry", (ambientRY + (focusRY - ambientRY) * amount).toFixed(1) + "px");

      const showLens = amount > 0.01;
      lens.style.opacity = showLens ? String(Math.min(1, amount * 1.4)) : "0";
      document.documentElement.classList.toggle("gb-hero-lens-active", showLens);
      /* raio = o quadrado-alvo (bracket) ao redor dos olhos/nariz já desenhado na arte —
         menor que a tentativa anterior (essa ficou grande demais); ~7.5% da largura da
         imagem de raio, o mesmo tamanho do quadrado de referência indicado. */
      const maxR = boxW > 0 ? Math.min(46, boxW * 0.075) : 46;
      const minR = maxR * 0.55;
      const r = minR + (maxR - minR) * amount;
      if (ring) ring.setAttribute("r", Math.max(0, r).toFixed(2));
      lens.style.transform = "translate3d(" + (smoothCx - 55).toFixed(1) + "px," + (smoothCy - 55).toFixed(1) + "px,0)";

      if (glReady && boxW > 0 && boxH > 0) {
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const bw = Math.round(boxW * dpr), bh = Math.round(boxH * dpr);
        if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; gl.viewport(0, 0, bw, bh); }
        const active = amount > 0.001;
        gl.useProgram(program);
        gl.uniform2f(uniforms.size, boxW, boxH);
        gl.uniform2f(uniforms.fit, fit[0], fit[1]);
        gl.uniform2f(uniforms.center, active ? centerLoc.x : -1, active ? centerLoc.y : -1);
        gl.uniform1f(uniforms.radius, active ? r : 1);
        gl.uniform1f(uniforms.power, active ? amount : 0);
        gl.uniform1f(uniforms.angle, angle);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      ensureRAF();
    }
    ensureRAF();

    function onCapabilityChange() {
      /* só limpa se "reduzir movimento" ligou, ou se nem ponteiro fino nem grosso
         sobrou — não quando só o outro dos dois muda (ex.: mouse conectado num
         touchscreen continua tablet: coarseMq segue true, então nada muda aqui). */
      if (reduceMq.matches || (!fineMq.matches && !coarseMq.matches)) cleanup();
    }
    fineMq.addEventListener("change", onCapabilityChange);
    coarseMq.addEventListener("change", onCapabilityChange);
    reduceMq.addEventListener("change", onCapabilityChange);

    function cleanup() {
      if (destroyed) return;
      destroyed = true;
      if (raf) window.cancelAnimationFrame(raf);
      if (isFine) {
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener("pointerleave", onLeaveDoc);
      } else {
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("touchcancel", onTouchCancel);
      }
      window.removeEventListener("blur", onLeaveDoc);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      fineMq.removeEventListener("change", onCapabilityChange);
      coarseMq.removeEventListener("change", onCapabilityChange);
      reduceMq.removeEventListener("change", onCapabilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      img.removeEventListener("load", setupGL);
      io.disconnect();
      document.documentElement.classList.remove("gb-hero-lens-active");
      lens.remove();
      reflection.remove();
      corners.forEach((el) => el.remove());
      scene.style.removeProperty("--rx"); scene.style.removeProperty("--ry");
      scene.style.removeProperty("--dx"); scene.style.removeProperty("--dy");
      scene.style.removeProperty("--rmx"); scene.style.removeProperty("--rmy");
      scene.style.removeProperty("--refl-top"); scene.style.removeProperty("--refl-right");
      scene.style.removeProperty("--refl-bottom"); scene.style.removeProperty("--refl-left");
      scene.style.removeProperty("--reflect");
      scene.style.removeProperty("--sheen-rx"); scene.style.removeProperty("--sheen-ry");
      canvas.style.visibility = "";
      img.style.visibility = "";
      if (gl) {
        const ext = gl.getExtension("WEBGL_lose_context");
        if (ext) ext.loseContext();
      }
      gl = null; program = null; uniforms = {};
    }

    return cleanup;
  }, [artRef, sceneRef, imgRef, canvasRef]);
}
