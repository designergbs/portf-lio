export {};
const { Button, AvailabilityBadge, SkillsMarquee } = window.GuilhermeBernardoPortfolioDS_97bb82;

/* Revelação do H1: cada letra entra por opacidade (uma vez); "UX/UI" tem ciclo próprio. */
function chars(word, offset, typed) {
  return word.split("").map((ch, i) => (
    <span className={["kit-h1c", typed > offset + i ? "is-in" : ""].filter(Boolean).join(" ")} key={i}>{ch}</span>
  ));
}
const H1_TOTAL = 15;

/* mesma cadência da revelação do parágrafo: caractere a caractere, com traço acompanhando */
function useTyped(total, speed, reduce, start = true) {
  const [n, setN] = React.useState(reduce ? total : 0);
  React.useEffect(() => {
    if (reduce) { setN(total); return; }
    if (!start) return;
    let raf = 0, last = 0, i = 0, wait = 0;
    const step = (ts) => {
      if (!last) last = ts;
      wait -= ts - last;
      last = ts;
      while (wait <= 0 && i < total) { i += 1; wait += speed; }
      setN(i);
      if (i < total) raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => { if (raf) window.cancelAnimationFrame(raf); };
  }, [total, speed, reduce, start]);
  return n;
}

/* a narrativa do hero só começa quando a cortina de abertura se recolhe */
function useIntroGate() {
  const [armed, setArmed] = React.useState(() => !document.documentElement.classList.contains("gb-intro-hold"));
  React.useEffect(() => {
    if (armed) return;
    let t2 = 0;
    /* espera a cortina terminar de subir (920ms) antes de iniciar a narrativa, para o texto
       não começar a digitar enquanto a página ainda está sendo revelada */
    const go = () => { t2 = window.setTimeout(() => setArmed(true), 500); };
    window.addEventListener("gb:intro-hero", go);
    const t = window.setTimeout(go, 4800);
    return () => { window.removeEventListener("gb:intro-hero", go); window.clearTimeout(t); window.clearTimeout(t2); };
  }, [armed]);
  return armed;
}
const UX_PARTS = ["U", "X", "/", "U", "I"];

/* Revelação progressiva: camada de reserva invisível segura o espaço; a camada animada
   recebe os caracteres. O texto completo fica sempre disponível para leitores de tela. */
function TextReveal({ lines, className = "", onDone, start = true }) {
  const full = lines.join(" ");
  const glyphs = React.useMemo(() => lines.map((l) => Array.from(l)), [lines]);
  const total = glyphs.reduce((n, l) => n + l.length, 0);
  const reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [shown, setShown] = React.useState(reduce ? total : 0);
  const ref = React.useRef(null);
  const doneOnceRef = React.useRef(false);
  React.useEffect(() => {
    if (reduce || doneOnceRef.current) { setShown(total); return; }
    if (!start) return;
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setShown(total); return; }
    let raf = 0, timer = 0, started = false;
    const flat = glyphs.flat();
    const run = () => {
      let last = 0, i = 0, wait = 0;
      const step = (ts) => {
        if (!last) last = ts;
        const dt = ts - last;
        last = ts;
        wait -= dt;
        while (wait <= 0 && i < total) {
          i += 1;
          const ch = flat[i - 1];
          wait += 15 + (ch === "." ? 42 : ch === "," ? 24 : 0);
        }
        setShown(i);
        if (i < total) raf = window.requestAnimationFrame(step);
      };
      raf = window.requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting || started) return;
        started = true;
        io.disconnect();
        timer = window.setTimeout(run, 200);
      });
    }, { threshold: 0.25 });
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(timer); if (raf) window.cancelAnimationFrame(raf); };
  }, [glyphs, total, reduce, start]);
  React.useEffect(() => { if (onDone && shown >= total) { onDone(); doneOnceRef.current = true; } }, [shown, total, onDone]);
  let left = shown;
  return (
    <p className={["kit-reveal", className].filter(Boolean).join(" ")} ref={ref}>
      <span className="kit-reveal__hold" aria-hidden="true">{lines.map((l, i) => (
        <React.Fragment key={i}>{i ? <br /> : null}{l}</React.Fragment>
      ))}</span>
      <span className="kit-reveal__live" aria-hidden="true">{glyphs.map((g, i) => {
        const take = Math.max(0, Math.min(g.length, left));
        left -= g.length;
        const lastLine = take > 0 && left < 0 ? true : false;
        return <React.Fragment key={i}>{i ? <br /> : null}{g.slice(0, take).join("")}{lastLine && shown < total ? <i className="kit-reveal__caret" /> : null}</React.Fragment>;
      })}</span>
      <span className="kit-sr">{full}</span>
    </p>
  );
}

/* Hero fullscreen: apenas texto sobre preto puro, com o marquee de competências na base. */
/* largura real do bloco de texto (não a max-width teórica de 560px): a imagem só deve
   encolher quando o texto de fato ocupa espaço, então mede o texto e expõe a largura
   via variável CSS para o cálculo de tamanho da imagem em telas notebook. */
function useHeroBodyWidth() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !window.ResizeObserver) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].borderBoxSize ? entries[0].borderBoxSize[0].inlineSize : el.getBoundingClientRect().width;
      el.closest(".kit-hero").style.setProperty("--hero-body-w", Math.ceil(w) + "px");
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return ref;
}

function Hero() {
  const bodyRef = useHeroBodyWidth();
  const reduceH1 = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const armed = useIntroGate();
  const typed = useTyped(H1_TOTAL, 120, reduceH1, armed);
  /* narrativa: H1 digita → UX/UI entra → parágrafo digita → pausa → UX/UI entra em ciclo */
  const h1Done = typed >= H1_TOTAL;
  const [propStart, setPropStart] = React.useState(reduceH1);
  const [uxLoop, setUxLoop] = React.useState(reduceH1);
  const [propDone, setPropDone] = React.useState(reduceH1);
  const onPropDone = React.useCallback(() => {
    setPropDone(true);
    const t = window.setTimeout(() => setUxLoop(true), 380);
    return () => window.clearTimeout(t);
  }, []);
  React.useEffect(() => {
    if (!h1Done || propStart) return;
    const t = window.setTimeout(() => setPropStart(true), 300);
    return () => window.clearTimeout(t);
  }, [h1Done, propStart]);
  const uxChars = UX_PARTS.map((ch, i) => (
    <span className={["kit-h1ux", ch === "/" ? "kit-hero__slash" : ""].filter(Boolean).join(" ")} key={i} style={{ animationDelay: i * 90 + "ms" }}>{ch}</span>
  ));
  return (
    <header className="kit-hero" id="top">
      <div className="kit-hero__inner">
        <div className="kit-hero__cols">
          <div className="kit-hero__body" ref={bodyRef}>
            <div className="kit-enter kit-enter--1 kit-hero__pills">
              <AvailabilityBadge label={window.gbT("hero.availability")} />
            </div>
            <h1 className="kit-hero__name" aria-label="Product UX/UI Designer">
              <span className="kit-hero__line" aria-hidden="true"><span className="kit-hero__word">{chars("Product", 0, typed)}{typed < 7 ? <i className="kit-reveal__caret kit-h1caret" /> : null}</span></span>
              <span className="kit-hero__line" aria-hidden="true"><em className={["kit-hero__dim", "kit-hero__ux", uxLoop ? "" : (h1Done ? "is-hold" : "is-wait")].filter(Boolean).join(" ")}>{uxChars}</em><span className="kit-hero__gap" aria-hidden="true"> </span><span className="kit-hero__word">{chars("Designer", 7, typed)}{typed >= 7 && typed < H1_TOTAL ? <i className="kit-reveal__caret kit-h1caret" /> : null}</span></span>
            </h1>
            <TextReveal className="kit-hero__prop kit-enter kit-enter--4" lines={window.gbT("hero.propLines")} onDone={onPropDone} start={propStart} />
            <div className="kit-hero__ctas" style={{ clipPath: propDone ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)", opacity: propDone ? 1 : 0, transition: "clip-path 900ms cubic-bezier(.22,.61,.36,1), opacity 420ms ease", pointerEvents: propDone ? "auto" : "none" }}>
              <Button variant="secondary" size="lg" href="#cases" icon="eye">{window.gbT("buttons.viewProjects")}</Button>
            </div>
          </div>
          <div className="kit-hero__art">
            <img src="/assets/hero-artwork-3x2.png" alt="" className="hero-artwork-image" aria-hidden="true" draggable="false" loading="eager" decoding="async" />
          </div>
        </div>

      </div>

      <div className="kit-hero__foot" id="competencias">
        <SkillsMarquee rowOne={window.GB.skillsRowOne} rowTwo={window.GB.skillsRowTwo} />
      </div>
    </header>
  );
}
window.Hero = Hero;
window.TextReveal = TextReveal;
