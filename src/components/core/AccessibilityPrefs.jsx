import React from "react";
import { Icon } from "./Icon.jsx";

/* Preferências de acessibilidade: gatilho na navbar + painel (popover no desktop,
   diálogo modal no mobile). O estado vive neste módulo, então todas as navbars da
   página compartilham a mesma fonte, e é aplicado em atributos data-a11y-* no <html>
   assim que o bundle carrega — antes da primeira pintura, sem flash.
   O modo de movimento também é exposto via matchMedia("prefers-reduced-motion"),
   que é o canal que a home, os cases e a abertura já consultam. */

const KEY = "gb-a11y";
const SIZES = ["100", "125", "150"];
const MOTIONS = ["system", "reduce"];
const DEFAULTS = { text: "100", motion: "system", contrast: false, reading: false };

const nativeMM =
  typeof window !== "undefined" && window.matchMedia ? window.matchMedia.bind(window) : null;

function sysReduce() {
  try {
    return !!(nativeMM && nativeMM("(prefers-reduced-motion:reduce)").matches);
  } catch (e) {
    return false;
  }
}

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const v = JSON.parse(raw) || {};
    return {
      text: SIZES.indexOf(String(v.text)) > -1 ? String(v.text) : DEFAULTS.text,
      motion: MOTIONS.indexOf(v.motion) > -1 ? v.motion : DEFAULTS.motion,
      contrast: v.contrast === true,
      reading: v.reading === true
    };
  } catch (e) {
    return { ...DEFAULTS };
  }
}

let prefs = typeof window !== "undefined" ? load() : { ...DEFAULTS };
const subs = new Set();
let mqls = null;

function effMotion() {
  return prefs.motion === "system" ? (sysReduce() ? "reduce" : "full") : prefs.motion;
}

function applyDoc() {
  if (typeof document === "undefined") return;
  const r = document.documentElement;
  r.setAttribute("data-a11y-text", prefs.text);
  r.setAttribute("data-a11y-motion", effMotion());
  r.setAttribute("data-a11y-contrast", prefs.contrast ? "on" : "off");
  r.setAttribute("data-a11y-reading", prefs.reading ? "on" : "off");
  /* aviso explícito pra quem precisa remedir layout quando o tamanho do texto muda
     (ex.: TopNav recalculando se o CTA "Vamos conversar?" ainda cabe ao lado da marca) —
     mudar data-a11y-text não redimensiona a viewport, então um listener de "resize"
     sozinho não pega essa mudança. */
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("gb:a11y-change"));
}

function notifyMotion() {
  if (!mqls) return;
  mqls.forEach((m) => m.__dispatch());
}

function save() {
  try {
    if (
      prefs.text === DEFAULTS.text &&
      prefs.motion === DEFAULTS.motion &&
      !prefs.contrast &&
      !prefs.reading
    ) {
      window.localStorage.removeItem(KEY);
      return;
    }
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch (e) { /* storage indisponível: preferência vale só nesta sessão */ }
}

function setPrefs(patch) {
  const before = effMotion();
  prefs = { ...prefs, ...patch };
  save();
  applyDoc();
  if (effMotion() !== before) notifyMotion();
  subs.forEach((fn) => { try { fn(prefs); } catch (e) { /* assinante desmontado */ } });
}

/* matchMedia passa a responder a preferência efetiva do visitante para consultas de
   movimento. Preserva addEventListener/addListener para quem observa mudanças. */
function patchMatchMedia() {
  if (!nativeMM || window.__gbA11yPatched) return;
  mqls = new Set();
  window.matchMedia = function (q) {
    const query = String(q);
    if (!/prefers-reduced-motion/i.test(query)) return nativeMM(query);
    const wantsReduce = /reduce/i.test(query);
    const listeners = new Set();
    const mql = {
      media: query,
      onchange: null,
      get matches() {
        const red = effMotion() === "reduce";
        return wantsReduce ? red : !red;
      },
      addEventListener(t, fn) { if (t === "change" && fn) listeners.add(fn); },
      removeEventListener(t, fn) { listeners.delete(fn); },
      addListener(fn) { if (fn) listeners.add(fn); },
      removeListener(fn) { listeners.delete(fn); },
      dispatchEvent() { return true; },
      __dispatch() {
        const ev = { matches: mql.matches, media: query, target: mql, type: "change" };
        listeners.forEach((fn) => {
          try { typeof fn === "function" ? fn(ev) : fn.handleEvent && fn.handleEvent(ev); } catch (e) { /* listener quebrado */ }
        });
        if (typeof mql.onchange === "function") { try { mql.onchange(ev); } catch (e) { /* idem */ } }
      }
    };
    mqls.add(mql);
    return mql;
  };
  window.__gbA11yPatched = true;
  try {
    const sys = nativeMM("(prefers-reduced-motion:reduce)");
    const onSys = () => { if (prefs.motion === "system") { applyDoc(); notifyMotion(); } };
    if (sys.addEventListener) sys.addEventListener("change", onSys);
    else if (sys.addListener) sys.addListener(onSys);
  } catch (e) { /* navegador sem listener de media query */ }
}

if (typeof window !== "undefined") {
  patchMatchMedia();
  applyDoc();
  window.GB_A11Y = {
    get: () => ({ ...prefs }),
    set: setPrefs,
    reset: () => setPrefs({ ...DEFAULTS })
  };
}

const STRINGS = {
  pt: {
    open: "Preferências de acessibilidade",
    title: "Acessibilidade",
    close: "Fechar preferências de acessibilidade",
    textSize: "Tamanho do texto",
    textTip: "Aumenta o tamanho dos textos.",
    textAbout: "Sobre tamanho do texto",
    motion: "Animações",
    motionTip: "Reduz movimentos decorativos.",
    motionAbout: "Sobre animações",
    motionOpts: { system: "Padrão", reduce: "Reduzidas" },
    contrast: "Melhorar legibilidade",
    contrastTip: "Reforça o contraste dos textos.",
    contrastAbout: "Sobre melhorar legibilidade",
    reset: "Restaurar preferências",
    on: "ativado",
    off: "desativado"
  },
  en: {
    open: "Accessibility preferences",
    title: "Accessibility",
    close: "Close accessibility preferences",
    textSize: "Text size",
    textTip: "Increases text size.",
    textAbout: "About text size",
    motion: "Animations",
    motionTip: "Reduces decorative motion.",
    motionAbout: "About animations",
    motionOpts: { system: "Default", reduce: "Reduced" },
    contrast: "Improve readability",
    contrastTip: "Strengthens text contrast.",
    contrastAbout: "About improve readability",
    reset: "Reset preferences",
    on: "on",
    off: "off"
  }
};

function usePrefs() {
  const [, bump] = React.useReducer((n) => n + 1, 0);
  React.useEffect(() => {
    subs.add(bump);
    return () => { subs.delete(bump); };
  }, []);
  return prefs;
}

function useMobile() {
  const q = "(max-width:768px)";
  const probe = () => {
    try {
      if (nativeMM && nativeMM(q).matches) return true;
    } catch (e) { /* sem matchMedia */ }
    const w = typeof document !== "undefined" && document.documentElement
      ? document.documentElement.clientWidth
      : (typeof window !== "undefined" ? window.innerWidth : 1024);
    return w <= 768;
  };
  const [is, setIs] = React.useState(probe);
  const recheck = React.useCallback(() => setIs(probe()), []);
  React.useEffect(() => {
    const sync = () => setIs(probe());
    sync();
    let mq = null;
    try { mq = nativeMM ? nativeMM(q) : null; } catch (e) { mq = null; }
    if (mq) {
      if (mq.addEventListener) mq.addEventListener("change", sync);
      else if (mq.addListener) mq.addListener(sync);
    }
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    let ro = null;
    if (typeof ResizeObserver !== "undefined" && document.documentElement) {
      ro = new ResizeObserver(sync);
      ro.observe(document.documentElement);
    }
    return () => {
      if (mq) {
        if (mq.removeEventListener) mq.removeEventListener("change", sync);
        else if (mq.removeListener) mq.removeListener(sync);
      }
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      if (ro) ro.disconnect();
    };
  }, []);
  return [is, recheck];
}

/* ⓘ independente do controle: consultar a explicação nunca altera a preferência.
   A bolha vai para o body com coordenadas fixas — o painel rola e tem backdrop-filter,
   então uma bolha ancorada dentro dele seria cortada. */
function InfoTip({ id, label, text, open, onOpen, onClose }) {
  const closeTimer = React.useRef(0);
  const btnRef = React.useRef(null);
  const tipRef = React.useRef(null);
  const [pos, setPos] = React.useState(null);
  const cancel = () => { if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = 0; } };
  React.useEffect(() => cancel, []);

  const place = React.useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const W = (tipRef.current && tipRef.current.offsetWidth) || 220, M = 16;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const left = Math.min(Math.max(M, r.left + r.width / 2 - W / 2), Math.max(M, vw - W - M));
    const below = r.bottom + 6;
    const flip = below + 150 > vh && r.top - 6 > 150;
    setPos(flip ? { left, bottom: Math.round(vh - r.top + 6) } : { left, top: Math.round(below) });
  }, []);

  React.useEffect(() => {
    if (!open) { setPos(null); return undefined; }
    place();
    const raf = window.requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  const bubble = open && pos ? (
    <span
      ref={tipRef}
      id={id}
      role="tooltip"
      className="gb-a11y__tip"
      style={pos}
      onPointerEnter={cancel}
      onPointerLeave={() => { cancel(); closeTimer.current = window.setTimeout(onClose, 120); }}
    >{text}</span>
  ) : null;

  return (
    <span
      className="gb-a11y__info"
      onPointerEnter={() => { cancel(); onOpen(); }}
      onPointerLeave={() => { cancel(); closeTimer.current = window.setTimeout(onClose, 120); }}
    >
      <button
        ref={btnRef}
        type="button"
        className="gb-a11y__infobtn"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onFocus={onOpen}
        onBlur={onClose}
        onClick={(e) => { e.preventDefault(); open ? onClose() : onOpen(); }}
      >
        <Icon name="info" size={14} />
      </button>
      {bubble && typeof window !== "undefined" && window.ReactDOM && window.ReactDOM.createPortal
        ? window.ReactDOM.createPortal(bubble, document.body)
        : bubble}
    </span>
  );
}

export function AccessibilityPrefs({ className = "" }) {
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const lang = ctx && ctx.lang === "en" ? "en" : "pt";
  const s = STRINGS[lang];
  const p = usePrefs();
  const [isMobile, recheckMobile] = useMobile();
  const [open, setOpen] = React.useState(false);
  const [tip, setTip] = React.useState(null);
  const wrapRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const btnRef = React.useRef(null);
  const uid = React.useRef("gb-a11y-" + Math.random().toString(36).slice(2, 8)).current;

  const close = React.useCallback((restoreFocus) => {
    setOpen(false);
    setTip(null);
    if (restoreFocus && btnRef.current) btnRef.current.focus();
  }, []);

  /* navbar permanece visível enquanto o painel estiver aberto (gancho já usado pela nav) */
  React.useEffect(() => {
    if (!open) return undefined;
    document.body.setAttribute("data-menu-open", "a11y");
    window.dispatchEvent(new CustomEvent("gb:panel-open", { detail: "a11y" }));
    return () => {
      if (document.body.getAttribute("data-menu-open") === "a11y") document.body.removeAttribute("data-menu-open");
    };
  }, [open]);

  /* fecha se outro painel (ex.: o seletor de idioma mobile) abrir, para nunca sobrepor */
  React.useEffect(() => {
    if (!open) return undefined;
    const onForeign = (e) => { if (e.detail !== "a11y") close(false); };
    window.addEventListener("gb:panel-open", onForeign);
    return () => window.removeEventListener("gb:panel-open", onForeign);
  }, [open, close]);

  /* Escape: fecha primeiro o tooltip aberto, depois o painel */
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      if (tip) { setTip(null); return; }
      close(true);
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, tip, close]);

  /* clique externo: no desktop fecha sem roubar o foco do elemento clicado */
  React.useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      const inPanel = panelRef.current && panelRef.current.contains(e.target);
      const inWrap = wrapRef.current && wrapRef.current.contains(e.target);
      if (inPanel || inWrap) return;
      close(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open, close]);

  /* mobile: diálogo modal — fundo inerte, foco contido, foco inicial no painel */
  React.useEffect(() => {
    if (!open || !isMobile) return undefined;
    const root = document.getElementById("root");
    const panel = panelRef.current;
    if (root) { root.inert = true; root.setAttribute("aria-hidden", "true"); }
    if (panel) {
      const first = panel.querySelector("button,[href],input");
      if (first) first.focus();
    }
    const onKey = (e) => {
      if (e.key !== "Tab" || !panel) return;
      const nodes = Array.from(panel.querySelectorAll('button,[href],input:not([type="hidden"])')).filter(
        (n) => !n.disabled && n.offsetParent !== null
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (root) { root.inert = false; root.removeAttribute("aria-hidden"); }
    };
  }, [open, isMobile]);

  const tipFor = (key, label, text) => (
    <InfoTip
      id={uid + "-" + key}
      label={label}
      text={text}
      open={tip === key}
      onOpen={() => setTip(key)}
      onClose={() => setTip((cur) => (cur === key ? null : cur))}
    />
  );

  const segment = (name, value, options, onPick, labelId) => (
    <div className="gb-a11y__seg" role="radiogroup" aria-labelledby={labelId}>
      {options.map((o) => (
        <label key={o.value} className={"gb-a11y__opt" + (value === o.value ? " is-active" : "")}>
          <input
            type="radio"
            name={uid + "-" + name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onPick(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );

  const toggle = (key, labelId, label, checked) => (
    <button
      type="button"
      role="switch"
      className="gb-a11y__sw"
      aria-checked={checked}
      aria-labelledby={labelId}
      onClick={() => setPrefs({ [key]: !checked })}
    >
      <span className="gb-a11y__knob" aria-hidden="true"></span>
      <span className="gb-a11y__sr" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>
        {label + ": " + (checked ? s.on : s.off)}
      </span>
    </button>
  );

  /* ancoragem do popover: o painel é montado no body (a navbar tem backdrop-filter e
     cria um backdrop root, o que anularia o desfoque de um filho) */
  const [anchor, setAnchor] = React.useState(null);
  const place = React.useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const W = 328, M = 16;
    const vw = document.documentElement.clientWidth;
    setAnchor({
      top: Math.round(r.bottom + 12),
      left: Math.round(Math.min(Math.max(M, r.right - W), Math.max(M, vw - W - M)))
    });
  }, []);
  React.useLayoutEffect(() => {
    if (!open || isMobile) return undefined;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, isMobile, place]);

  const panel = (
    <div
      ref={panelRef}
      className={"gb-a11y__panel" + (isMobile ? " gb-a11y__panel--modal" : " gb-a11y__panel--fixed")}
      style={!isMobile && anchor ? anchor : undefined}
      role={isMobile ? "dialog" : "group"}
      aria-modal={isMobile ? "true" : undefined}
      aria-labelledby={uid + "-title"}
    >
      <div className="gb-a11y__top">
        <h2 className="gb-a11y__title" id={uid + "-title"}>{s.title}</h2>
        <button type="button" className="gb-a11y__close" aria-label={s.close} onClick={() => close(true)}>
          <Icon name="x" size={16} />
        </button>
      </div>
      <hr className="gb-a11y__rule" />

      <div className="gb-a11y__row">
        <div className="gb-a11y__head">
          <span className="gb-a11y__label" id={uid + "-text"}>{s.textSize}</span>
          {tipFor("text", s.textAbout, s.textTip)}
        </div>
        {segment("text", p.text, SIZES.map((v) => ({ value: v, label: v + "%" })), (v) => setPrefs({ text: v }), uid + "-text")}
      </div>

      <div className="gb-a11y__row">
        <div className="gb-a11y__head">
          <span className="gb-a11y__label" id={uid + "-contrast"}>{s.contrast}</span>
          {tipFor("contrast", s.contrastAbout, s.contrastTip)}
          {toggle("contrast", uid + "-contrast", s.contrast, p.contrast)}
        </div>
      </div>

      <div className="gb-a11y__row">
        <div className="gb-a11y__head">
          <span className="gb-a11y__label" id={uid + "-motion"}>{s.motion}</span>
          {tipFor("motion", s.motionAbout, s.motionTip)}
        </div>
        {segment(
          "motion",
          p.motion,
          MOTIONS.map((v) => ({ value: v, label: s.motionOpts[v] })),
          (v) => setPrefs({ motion: v }),
          uid + "-motion"
        )}
      </div>

      <hr className="gb-a11y__rule" />
      <div className="gb-a11y__foot">
        <button type="button" className="gb-a11y__reset" onClick={() => setPrefs({ ...DEFAULTS })}>
          <Icon name="rotate-ccw" size={14} />
          {s.reset}
        </button>
      </div>
    </div>
  );

  const portal =
    typeof window !== "undefined" && window.ReactDOM && window.ReactDOM.createPortal
      ? window.ReactDOM.createPortal
      : null;

  const modal =
    isMobile && open && portal
      ? portal(
        <div className="gb-a11y__scrim" onPointerDown={(e) => { if (e.target === e.currentTarget) close(true); }}>{panel}</div>,
        document.body
      )
      : null;

  const popover = open && !isMobile ? (portal ? portal(panel, document.body) : panel) : null;

  return (
    <div className={["gb-a11y", className].filter(Boolean).join(" ")} ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        className="gb-a11y__btn"
        aria-label={s.open}
        aria-expanded={open}
        aria-haspopup={isMobile ? "dialog" : "true"}
        onClick={() => (open ? close(true) : (recheckMobile(), setOpen(true)))}
      >
        <Icon name="sliders-horizontal" size={16} />
      </button>
      {popover}
      {modal}
      {isMobile && open && !modal ? panel : null}
    </div>
  );
}
