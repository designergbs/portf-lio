import React from "react";
import { Icon } from "./Icon.jsx";

const STRINGS = {
  pt: { group: "Idioma do site", pt: "Português brasileiro", en: "English", ptFull: "Português (Brasil)", enFull: "English", trigger: "Selecionar idioma. Atual: ", listLabel: "Escolha o idioma" },
  en: { group: "Site language", pt: "Português brasileiro", en: "English", ptFull: "Português (Brasil)", enFull: "English", trigger: "Select language. Current: ", listLabel: "Choose language" }
};

function useMobile640() {
  const q = "(max-width:640px)";
  const get = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(q).matches : false);
  const [is, setIs] = React.useState(get);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia(q);
    const sync = () => setIs(mq.matches);
    sync();
    if (mq.addEventListener) mq.addEventListener("change", sync);
    else if (mq.addListener) mq.addListener(sync);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", sync);
      else if (mq.removeListener) mq.removeListener(sync);
    };
  }, []);
  return is;
}

/* Menu compacto mobile: botão com ícone de tradução + dropdown com as duas opções por extenso.
   No desktop/tablet (>640px) o comportamento original (pílula PT/EN) continua intacto. */
function LanguageMenu({ current, setLang, s }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const wrapRef = React.useRef(null);
  const btnRef = React.useRef(null);
  const menuRef = React.useRef(null);

  const close = React.useCallback((restoreFocus) => {
    setOpen(false);
    if (restoreFocus && btnRef.current) btnRef.current.focus();
  }, []);

  const place = React.useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const W = 220, M = 12;
    const vw = document.documentElement.clientWidth;
    setPos({ top: Math.round(r.bottom + 8), left: Math.round(Math.min(Math.max(M, r.right - W), Math.max(M, vw - W - M))) });
  }, []);

  React.useEffect(() => {
    if (!open) return undefined;
    place();
    document.body.setAttribute("data-menu-open", "lang");
    window.dispatchEvent(new CustomEvent("gb:panel-open", { detail: "lang" }));
    const onResize = () => place();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    const onDown = (e) => {
      const inMenu = menuRef.current && menuRef.current.contains(e.target);
      const inWrap = wrapRef.current && wrapRef.current.contains(e.target);
      if (inMenu || inWrap) return;
      close(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); close(true); } };
    document.addEventListener("keydown", onKey, true);
    const onForeignPanel = (e) => { if (e.detail !== "lang") close(false); };
    window.addEventListener("gb:panel-open", onForeignPanel);
    return () => {
      if (document.body.getAttribute("data-menu-open") === "lang") document.body.removeAttribute("data-menu-open");
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("gb:panel-open", onForeignPanel);
    };
  }, [open, place, close]);

  const pick = (v) => { setLang(v); close(true); };
  const onOptKey = (e, v, otherRef) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); otherRef.current && otherRef.current.focus(); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(v); }
  };
  const ptRef = React.useRef(null);
  const enRef = React.useRef(null);

  const menu = open ? (
    <div
      ref={menuRef}
      className="gb-langmenu"
      role="listbox"
      aria-label={s.listLabel}
      style={pos || { top: -9999, left: -9999 }}
    >
      <button ref={ptRef} type="button" role="option" aria-selected={current === "pt"} className={"gb-langmenu__opt" + (current === "pt" ? " is-active" : "")} onClick={() => pick("pt")} onKeyDown={(e) => onOptKey(e, "pt", enRef)}>
        <span>{s.ptFull}</span>
        {current === "pt" ? <Icon name="check" size={14} /> : null}
      </button>
      <button ref={enRef} type="button" role="option" aria-selected={current === "en"} className={"gb-langmenu__opt" + (current === "en" ? " is-active" : "")} onClick={() => pick("en")} onKeyDown={(e) => onOptKey(e, "en", ptRef)}>
        <span>{s.enFull}</span>
        {current === "en" ? <Icon name="check" size={14} /> : null}
      </button>
    </div>
  ) : null;

  const portal = typeof window !== "undefined" && window.ReactDOM && window.ReactDOM.createPortal ? window.ReactDOM.createPortal : null;

  return (
    <div className="gb-langmenu-wrap" ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        className="gb-iconbtn gb-langmenu__trigger"
        aria-label={s.trigger + (current === "pt" ? s.pt : s.en)}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close(true) : setOpen(true))}
      >
        <Icon name="languages" size={16} />
      </button>
      {menu ? (portal ? portal(menu, document.body) : menu) : null}
    </div>
  );
}

/* Compact PT/EN capsule. Reads/writes window.useLang() when the host page provides it
   (the portfolio's i18n.js); otherwise falls back to its own state so it still previews
   standalone in the design-system card. On mobile (<=640px) it becomes a translate-icon
   button that opens a dropdown with both language names written out in full. */
export function LanguageSwitch({ lang, onChange, className = "" }) {
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const [local, setLocal] = React.useState("pt");
  const current = lang || (ctx && ctx.lang) || local;
  const setLang = onChange || (ctx && ctx.setLang) || setLocal;
  const s = STRINGS[current] || STRINGS.pt;
  const isMobile = useMobile640();
  if (isMobile) return <LanguageMenu current={current} setLang={setLang} s={s} />;
  return (
    <div className={["gb-langswitch", className].filter(Boolean).join(" ")} role="group" aria-label={s.group}>
      <button type="button" className={"gb-langswitch__opt" + (current === "pt" ? " is-active" : "")} aria-pressed={current === "pt"} aria-label={s.pt} onClick={() => setLang("pt")}>PT</button>
      <button type="button" className={"gb-langswitch__opt" + (current === "en" ? " is-active" : "")} aria-pressed={current === "en"} aria-label={s.en} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}
