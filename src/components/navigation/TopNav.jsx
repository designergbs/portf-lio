import React from "react";
import { Button } from "../core/Button.jsx";
import { AvailabilityBadge } from "../core/AvailabilityBadge.jsx";
import { LanguageSwitch } from "../core/LanguageSwitch.jsx";
import { AccessibilityPrefs } from "../core/AccessibilityPrefs.jsx";

/* faixa de scroll que resolve o wordmark completo no monograma */
const MORPH_RANGE = 260;
/* tolerância de direção, evita piscar com oscilação mínima do scroll */
const DIR_TOLERANCE = 8;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/* Sticky primary navigation: wordmark, section links, availability signal, one CTA. */
export function TopNav({
  brand = "Guilherme Bernardo",
  links = [],
  activeHref,
  cta,
  ctaPrimary,
  showAvailability = false,
  brandMorph = false,
  heroSelector = ".kit-hero",
  onLinkClick,
  onBrandClick,
  className = ""
}) {
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const lang = ctx ? ctx.lang : "pt";
  const [hidden, setHidden] = React.useState(false);
  const navRef = React.useRef(null);
  const brandRef = React.useRef(null);
  const gRef = React.useRef(null);
  const bRef = React.useRef(null);
  const bIniRef = React.useRef(null);
  const tail1Ref = React.useRef(null);
  const monoGRef = React.useRef(null);
  const monoBRef = React.useRef(null);

  const words = typeof brand === "string" ? brand.trim().split(/\s+/) : null;
  const morph = brandMorph && words && words.length >= 2;
  const [isCompact, setIsCompact] = React.useState(() => typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(max-width:640px)").matches : false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(max-width:640px)");
    const sync = () => setIsCompact(mq.matches);
    sync();
    if (mq.addEventListener) mq.addEventListener("change", sync);
    else if (mq.addListener) mq.addListener(sync);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", sync);
      else if (mq.removeListener) mq.removeListener(sync);
    };
  }, []);

  /* distância real entre o fim do "G" e o início do "B" — medida por offset, imune a transform */
  React.useEffect(() => {
    if (!morph) return;
    const measure = () => {
      const g = gRef.current, b = bRef.current, bi = bIniRef.current, t1 = tail1Ref.current, host = brandRef.current;
      const mg = monoGRef.current, mb = monoBRef.current;
      if (!g || !b || !bi || !t1 || !host || !mg || !mb) return;
      /* trajeto do B em Armstrong: parte de onde o "B" original ficava, chega colado no G em Armstrong */
      host.style.setProperty("--gb-wm-mb0", (g.offsetWidth + t1.offsetWidth).toFixed(1) + "px");
      host.style.setProperty("--gb-wm-mb1", (mg.offsetWidth + 1).toFixed(1) + "px");
    };
    measure();
    const t = window.setTimeout(measure, 400);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => { window.clearTimeout(t); window.removeEventListener("resize", measure); };
  }, [morph, brand]);

  /* progresso do monograma + visibilidade por direção, num único loop de scroll */
  React.useEffect(() => {
    const reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
    let last = window.scrollY;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const y = window.scrollY;
      const host = brandRef.current;
      if (morph && host) {
        const p = clamp01(y / MORPH_RANGE);
        host.style.setProperty("--gb-wm-p", p.toFixed(4));
        /* fase 1: fonte troca e letras somem em rastro (stagger) desde o início do scroll; fase 2: o B desliza até colar no G */
        const FONT_END = 0.42, FADE_END = 0.75;
        const pFade = clamp01(p / FADE_END);
        const qProg = clamp01((p - FADE_END) / (1 - FADE_END));
        host.style.setProperty("--gb-wm-f", reduce ? (p > 0.5 ? 1 : 0) : easeOut(clamp01(p / FONT_END)).toFixed(4));
        host.style.setProperty("--gb-wm-pb", pFade.toFixed(4));
        host.style.setProperty("--gb-wm-q", easeOut(qProg).toFixed(4));
      }
      const nav = navRef.current;
      const hero = heroSelector ? document.querySelector(heroSelector) : null;
      const menuOpen = document.body.hasAttribute("data-menu-open");
      const navH = nav ? nav.offsetHeight : 0;
      const delta = y - last;
      if (menuOpen) { setHidden(false); last = y; return; }
      if (hero) {
        /* fim da hero pela posição real do elemento, descontando a navbar */
        const heroEnd = hero.getBoundingClientRect().bottom + y - navH;
        if (y < heroEnd) { setHidden(false); last = y; return; }
        if (delta > DIR_TOLERANCE) { setHidden(true); last = y; }
        else if (delta < -DIR_TOLERANCE) { setHidden(false); last = y; }
        return;
      }
      if (Math.abs(delta) > DIR_TOLERANCE) { setHidden(delta > 0 && y > 120); last = y; }
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [morph, heroSelector]);

  /* navbar oculta não recebe foco de teclado */
  React.useEffect(() => { if (navRef.current) navRef.current.inert = hidden; }, [hidden]);

  /* CTA primário ("Vamos conversar?"): mantém o texto sempre que houver espaço e só
     vira ícone quando o cluster da direita estiver prestes a encostar na marca — em
     vez de um breakpoint fixo de viewport, que colapsava cedo demais em páginas com
     marca mais estreita (ex.: o botão "voltar" dos cases). Usa ResizeObserver (não só
     "resize" da window) porque o tamanho de fonte das preferências de acessibilidade
     (data-a11y-text, ver a11y-prefs.css) muda o layout sem redimensionar a viewport —
     um listener de "resize" sozinho não pegaria isso. Por isso também remedimos a
     largura "cheia" do botão a cada passagem não-compacta, em vez de cachear uma vez
     só: com o texto maior, essa largura cresce e o valor antigo ficaria errado. */
  const navRightRef = React.useRef(null);
  const ctaFullWidthRef = React.useRef(null);
  const [ctaCompact, setCtaCompact] = React.useState(false);
  React.useLayoutEffect(() => {
    if (!ctaPrimary) return undefined;
    const COLLAPSED_W = 44;
    const SAFE_GAP = 12;
    const measure = () => {
      const brandEl = brandRef.current;
      const clusterEl = navRightRef.current;
      const btn = clusterEl && clusterEl.querySelector(".gb-btn--primary");
      if (!brandEl || !clusterEl || !btn) return;
      setCtaCompact((compact) => {
        if (!compact) ctaFullWidthRef.current = btn.getBoundingClientRect().width;
        const fullW = ctaFullWidthRef.current;
        const brandRight = brandEl.getBoundingClientRect().right;
        const clusterLeft = clusterEl.getBoundingClientRect().left;
        const slack = clusterLeft - brandRight;
        if (!compact && slack < SAFE_GAP) return true;
        if (compact && fullW != null && slack - (fullW - COLLAPSED_W) >= SAFE_GAP) return false;
        return compact;
      });
    };
    measure();
    const raf = () => window.requestAnimationFrame(measure);
    window.addEventListener("resize", raf);
    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(raf);
      if (brandRef.current) ro.observe(brandRef.current);
      if (navRightRef.current) ro.observe(navRightRef.current);
    }
    return () => {
      window.removeEventListener("resize", raf);
      if (ro) ro.disconnect();
    };
  }, [ctaPrimary, lang]);

  const buildBrandContent = (withRefs) => {
    if (!morph) return brand;
    const tail = (s) => s.split("").map((ch, i) => (
      <i key={i} style={{ "--i": s.length - 1 - i }}>{ch === " " ? "\u00a0" : ch}</i>
    ));
    const rest = words.slice(1).join(" ");
    return (
      <React.Fragment>
        <span className="gb-wm__ghost" aria-hidden="true">{brand}</span>
        <span className="gb-wm" aria-hidden="true">
          <span className="gb-wm__type">
            <span className="gb-wm__ini" ref={withRefs ? gRef : null}>{words[0].charAt(0)}</span>
            <span className="gb-wm__tail" ref={withRefs ? tail1Ref : null}>{tail(words[0].slice(1) + " ")}</span>
            <span className="gb-wm__b" ref={withRefs ? bRef : null}>
              <span className="gb-wm__ini" ref={withRefs ? bIniRef : null}>{rest.charAt(0)}</span>
              <span className="gb-wm__tail">{tail(rest.slice(1))}</span>
            </span>
          </span>
          <span className="gb-wm__badge" aria-hidden="true"></span>
          <span className="gb-wm__mono-g" ref={withRefs ? monoGRef : null}>{words[0].charAt(0)}</span>
          <span className="gb-wm__mono-b" ref={withRefs ? monoBRef : null}>{rest.charAt(0)}</span>
        </span>
      </React.Fragment>
    );
  };

  return (
    <nav ref={navRef} className={["gb-nav", hidden ? "gb-nav--hidden" : "", className].filter(Boolean).join(" ")} aria-label={lang === "en" ? "Main navigation" : "Navegação principal"}>
      <a
        ref={brandRef}
        href="#top"
        className={["gb-nav__brand", morph && !isCompact ? "gb-nav__brand--morph" : ""].filter(Boolean).join(" ")}
        onClick={onBrandClick}
        aria-label={typeof brand === "string" ? brand + (lang === "en" ? " \u2014 home" : " \u2014 início") : undefined}
      >
        {typeof brand === "string" ? (
          morph && isCompact ? (
            <span className="gb-nav__brand-compact" aria-hidden="true">{words[0].charAt(0)}{words[1] ? words[1].charAt(0) : ""}</span>
          ) : (
            <span className="gb-wm-mask">
              <span className="gb-wm-track">
                <span className="gb-wm-row" aria-hidden="true">{buildBrandContent(true)}</span>
                <span className="gb-wm-row" aria-hidden="true">{buildBrandContent(false)}</span>
              </span>
            </span>
          )
        ) : brand}
      </a>
      <div className="gb-nav__links">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="gb-nav__link" onClick={onLinkClick ? (e) => onLinkClick(e, l.href) : undefined} aria-current={activeHref === l.href ? "true" : undefined}>
            {l.label}
          </a>
        ))}
      </div>
      <div className="gb-nav__right" ref={navRightRef}>
        {showAvailability ? <AvailabilityBadge label={lang === "en" ? "Available" : "Disponível"} /> : null}
        {cta ? <Button variant="secondary" size="sm" href={cta.href} icon={cta.icon} iconPosition="left">{cta.label}</Button> : null}
        {ctaPrimary ? <Button variant="primary" size="sm" href={ctaPrimary.href} icon={ctaPrimary.icon} className={ctaCompact ? "is-compact" : ""}>{ctaPrimary.label}</Button> : null}
        <LanguageSwitch />
        <AccessibilityPrefs />
      </div>
    </nav>
  );
}
