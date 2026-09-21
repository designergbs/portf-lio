export {};
const { TopNav, Button, SiteFooter, Reveal, Icon, ContactBlock } = window.GuilhermeBernardoPortfolioDS_97bb82;
const BackToTop = window.GuilhermeBernardoPortfolioDS_97bb82.BackToTop || (() => null);

const IMG_BASE_DEFAULT = "/assets/cases/trade-in/";
let IMG_BASE = IMG_BASE_DEFAULT;
let CUR = null;

/* Slot de imagem: quando o arquivo ainda não existe, mantém a área reservada com um placeholder. */
function Shot({ src, alt, style, className }) {
  if (!src) return <span className={["kit-imgph", className].filter(Boolean).join(" ")} style={style}><span className="gb-label">{window.gbT("caseCommon.imagePlaceholder")}</span></span>;
  return <img className={className} src={IMG_BASE + src} alt={alt} loading="lazy" decoding="async" style={style} />;
}

function CaseFigure({ item, className = "" }) {
  const src = item.src ? IMG_BASE + item.src : null;
  return (
    <figure className={["kit-cfig", item.narrow ? "kit-cfig--narrow" : "", className].filter(Boolean).join(" ")}>
      {src
        ? <img src={src} alt={item.alt} loading="lazy" decoding="async" style={{ aspectRatio: item.ratio }} />
        : <span className="kit-cfig__wait gb-label">{window.gbT("caseCommon.imagePendingPrefix")}{item.file}]</span>}
    </figure>
  );
}

/* Contagem das métricas: o valor real já está no DOM; a animação só o substitui ao entrar em tela. */
function CountUp({ value, suffix = "" }) {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(null);
  React.useEffect(() => {
    const el = ref.current;
    const target = parseInt(value, 10);
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || isNaN(target) || reduce || !("IntersectionObserver" in window)) return;
    let raf = 0, t0 = 0;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(el);
        const step = (ts) => {
          if (!t0) t0 = ts;
          const p = Math.min(1, (ts - t0) / 900);
          setShown(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = window.requestAnimationFrame(step);
        };
        raf = window.requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); if (raf) window.cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref} className="kit-hstat__n" aria-hidden="true">{shown === null ? value : shown}{suffix}</span>;
}

function BAScroll({ pairs, legacy, noTag, title }) {
  const single = pairs.length < 2;
  const wrapRef = React.useRef(null);
  const [isMobile, setIsMobile] = React.useState(() => window.matchMedia("(max-width:640px)").matches);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width:640px)");
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  /* mobile: uma imagem por vez (antes E depois viram slides separados), com setas + contador
     no estilo do carrossel de "Principais melhorias" — no desktop/tablet o par continua junto */
  const mobileShots = !legacy && !noTag ? pairs.flatMap((p, i) => {
    const arr = [{ src: p.a, tag: "before", pi: i }];
    if (p.b) arr.push({ src: p.b, tag: "after", pi: i });
    return arr;
  }) : null;
  const mobileMode = isMobile && mobileShots;
  const items = mobileMode ? mobileShots : pairs;
  const mTweenRef = React.useRef(0);
  const mTargetRef = React.useRef(0);
  const mGoTo = React.useCallback((i) => {
    const vp = vpRef.current, track = trackRef.current;
    if (!vp || !track) return;
    const n = Math.max(0, Math.min(items.length - 1, i));
    mTargetRef.current = n;
    const slide = track.children[n];
    if (!slide) return;
    const to = slide.offsetLeft;
    if (prefersReduced()) { vp.scrollLeft = to; return; }
    /* scrollTo suave não inicia com scroll-snap mandatory: anima o scrollLeft quadro a quadro */
    const from = vp.scrollLeft;
    if (Math.abs(to - from) < 1) return;
    vp.style.scrollSnapType = "none";
    window.cancelAnimationFrame(mTweenRef.current);
    const dur = 420, t0 = performance.now();
    const tick = (ts) => {
      const p = Math.min(1, (ts - t0) / dur);
      vp.scrollLeft = from + (to - from) * (1 - Math.pow(1 - p, 3));
      if (p < 1) { mTweenRef.current = window.requestAnimationFrame(tick); }
      else { vp.scrollLeft = to; window.setTimeout(() => { vp.style.scrollSnapType = ""; }, 120); }
    };
    mTweenRef.current = window.requestAnimationFrame(tick);
  }, [items.length]);
  React.useEffect(() => {
    if (!mobileMode) return;
    const vp = vpRef.current, track = trackRef.current;
    if (!vp || !track) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const mid = vp.scrollLeft + vp.clientWidth / 2;
      let best = 0, bd = Infinity;
      Array.prototype.forEach.call(track.children, (el, i) => {
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
        if (d < bd) { bd = d; best = i; }
      });
      mTargetRef.current = best;
      setIdx((p) => (p === best ? p : best));
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(read); };
    vp.addEventListener("scroll", onScroll, { passive: true });
    read();
    return () => vp.removeEventListener("scroll", onScroll);
  }, [mobileMode, items.length]);
  const stageRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const vpRef = React.useRef(null);
  const [idx, setIdx] = React.useState(0);
  /* Pin: o palco fica preso na viewport e o trilho anda horizontalmente conforme a página
     rola. Sem captura de roda e sem scroll interno — o movimento acompanha 1:1 o scroll,
     então funciona igual com roda, trackpad, teclado ou barra de rolagem. */
  React.useEffect(() => {
    const wrap = wrapRef.current, stage = stageRef.current, track = trackRef.current, vp = vpRef.current;
    if (!wrap || !stage || !track || !vp) return;
    if (single) { wrap.style.height = ""; track.style.transform = ""; return; }
    let raf = 0, total = 0, stick = 0;
    const desktop = () => window.matchMedia("(min-width:861px)").matches;
    if (!desktop()) { wrap.style.height = ""; track.style.transform = ""; return; }
    const apply = () => {
      raf = 0;
      if (total <= 0) return;
      const r = wrap.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (stick - r.top) / total));
      track.style.transform = "translate3d(" + (-p * total).toFixed(2) + "px,0,0)";
      const n = track.children.length;
      const best = Math.max(0, Math.min(n - 1, Math.round(p * (n - 1))));
      setIdx((x) => (x === best ? x : best));
    };
    const measure = () => {
      if (!desktop()) {
        wrap.style.height = "";
        track.style.transform = "";
        total = 0;
        setIdx(0);
        return;
      }
      /* o título fica dentro do mesmo bloco sticky do palco: sobem juntos ao soltar o pin */
      const pin = wrap.querySelector(".kit-cbax__pin");
      const h2 = wrap.querySelector(".kit-cbax__title");
      if (h2) wrap.style.setProperty("--cbax-title", h2.offsetHeight + "px");
      total = Math.max(0, track.scrollWidth - vp.clientWidth);
      stick = (pin ? parseFloat(getComputedStyle(pin).top) : 0) || 0;
      wrap.style.height = ((pin ? pin.offsetHeight : stage.offsetHeight) + total) + "px";
      apply();
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(apply); };
    measure();
    const t = window.setTimeout(measure, 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t);
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [pairs.length, noTag, single]);
  return (
    <div className={["kit-cbax", legacy ? "kit-cbax--legacy" : "", noTag ? "kit-cbax--solo" : "", single ? "kit-cbax--single" : ""].filter(Boolean).join(" ")} ref={wrapRef}>
      <div className="kit-cbax__pin">
      {title ? <h2 className="kit-csec__h2 kit-cbax__title">{title.split(/(\sx\s)/i).map((part, i) => /^\sx\s$/i.test(part) ? <React.Fragment key={i}>&nbsp;<span className="kit-cbax__x">x</span>&nbsp;</React.Fragment> : part)}</h2> : null}
      <div className="kit-cbax__stage" ref={stageRef}>
        {legacy && !noTag ? <span className="gb-label kit-cba__m kit-cbax__tag"><span className="kit-cba__dot kit-cba__dot--off" aria-hidden="true"></span>{window.gbT("caseCommon.before")}</span> : null}
        <div className="kit-cbax__viewport" ref={vpRef}>
        <div className="kit-cbax__track" ref={trackRef}>
          {items.map((p, i) => (
            <div key={i} className={["kit-cbax__slide", i === idx ? "is-active" : ""].filter(Boolean).join(" ")}>
              {mobileMode ? (
                <figure className="kit-cba__item">
                  <span className={["gb-label", "kit-cba__m", p.tag === "after" ? "kit-cba__k" : ""].filter(Boolean).join(" ")}>
                    <span className={["kit-cba__dot", p.tag === "before" ? "kit-cba__dot--off" : ""].filter(Boolean).join(" ")} aria-hidden="true"></span>
                    {p.tag === "before" ? window.gbT("caseCommon.before") : window.gbT("caseCommon.after")}
                  </span>
                  <Shot src={p.src} alt={(p.tag === "before" ? window.gbT("caseCommon.altPrevFlow") : window.gbT("caseCommon.altNewFlow")) + (p.pi + 1)} />
                </figure>
              ) : noTag ? (
                <Shot src={p.a} alt={window.gbT("caseCommon.altScreen") + (i + 1)} />
              ) : legacy ? (
                <figure className="kit-cba__item kit-cbax__pair">
                  <Shot src={p.a} alt={window.gbT("caseCommon.altScreen") + (i * 2 + 1)} />
                  {p.b ? <Shot src={p.b} alt={window.gbT("caseCommon.altScreen") + (i * 2 + 2)} /> : null}
                </figure>
              ) : (
                <React.Fragment>
                  <figure className="kit-cba__item">
                    <span className="gb-label kit-cba__m"><span className="kit-cba__dot kit-cba__dot--off" aria-hidden="true"></span>{window.gbT("caseCommon.before")}</span>
                    <Shot src={p.a} alt={window.gbT("caseCommon.altPrevFlow") + (i + 1)} />
                  </figure>
                  <figure className="kit-cba__item">
                    <span className="gb-label kit-cba__m kit-cba__k"><span className="kit-cba__dot" aria-hidden="true"></span>{window.gbT("caseCommon.after")}</span>
                    <Shot src={p.b} alt={window.gbT("caseCommon.altNewFlow") + (i + 1)} />
                  </figure>
                </React.Fragment>
              )}
            </div>
          ))}
        </div>
        </div>
        {single ? null : mobileMode ? (
        <div className="kit-cbax__nav">
          <button type="button" className="kit-imp__arrow" aria-label={window.gbT("buttons.prevImprovement")} onClick={() => mGoTo(mTargetRef.current - 1)} disabled={idx === 0}><Icon name="arrow-left" size={18} /></button>
          <p className="gb-mono kit-imp__count" aria-live="polite"><span className="kit-imp__count-n">{String(idx + 1).padStart(2, "0")}</span> / {String(items.length).padStart(2, "0")}</p>
          <button type="button" className="kit-imp__arrow" aria-label={window.gbT("buttons.nextImprovement")} onClick={() => mGoTo(mTargetRef.current + 1)} disabled={idx === items.length - 1}><Icon name="arrow-right" size={18} /></button>
        </div>
        ) : (
        <div className="kit-cbax__dots" aria-hidden="true">
          {items.map((p, i) => <span key={i} className={["kit-cbax__dot", i === idx ? "is-active" : ""].filter(Boolean).join(" ")}></span>)}
        </div>
        )}
      </div>
      </div>
    </div>
  );
}

/* Principais melhorias: acordeão à esquerda e galeria com scroll-snap à direita, sincronizados
   nos dois sentidos. Um "lock" temporal evita que o scroll programático reabra outro item. */
function Improvements({ items, title }) {
  const uid = React.useId().replace(/:/g, "");
  const bid = (i) => "imp-b-" + uid + "-" + i;
  const pid = (i) => "imp-p-" + uid + "-" + i;
  const [active, setActive] = React.useState(0);
  const scRef = React.useRef(null);
  const lockRef = React.useRef(0);
  const tweenRef = React.useRef(0);
  const goTo = React.useCallback((i, smooth) => {
    const n = Math.max(0, Math.min(items.length - 1, i));
    setActive(n);
    const sc = scRef.current;
    const slide = sc && sc.children[n];
    if (!slide) return;
    const behavior = smooth === false || prefersReduced() ? "auto" : "smooth";
    lockRef.current = Date.now() + 900;
    /* o reorder do mobile refaz o layout; o scroll só vale depois do reflow */
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const s = sc.children[n];
      if (!s) return;
      /* mesma conta que o snap do navegador faz: centro do slide no espaço de layout do scroller */
      const sr = s.getBoundingClientRect(), cr = sc.getBoundingClientRect();
      const left = sc.scrollLeft + (sr.left - cr.left) - (sc.clientWidth - sr.width) / 2;
      const to = Math.max(0, Math.min(sc.scrollWidth - sc.clientWidth, Math.round(left)));
      /* scrollTo suave não inicia com scroll-snap mandatory: anima o scrollLeft quadro a quadro */
      if (behavior !== "smooth") { sc.scrollLeft = to; lockRef.current = Date.now() + 120; return; }
      const from = sc.scrollLeft;
      if (Math.abs(to - from) < 1) return;
      const dur = 560;
      sc.style.scrollSnapType = "none";
      window.cancelAnimationFrame(tweenRef.current);
      const t0 = performance.now();
      const tick = (ts) => {
        const p = Math.min(1, (ts - t0) / dur);
        sc.scrollLeft = from + (to - from) * (1 - Math.pow(1 - p, 3));
        lockRef.current = Date.now() + 260;
        if (p < 1) { tweenRef.current = window.requestAnimationFrame(tick); }
        else { sc.scrollLeft = to; window.setTimeout(() => { sc.style.scrollSnapType = ""; }, 120); }
      };
      tweenRef.current = window.requestAnimationFrame(tick);
    }));
  }, [items.length]);
  React.useEffect(() => {
    const sc = scRef.current;
    if (!sc) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      if (Date.now() < lockRef.current) return;
      const mid = sc.scrollLeft + sc.clientWidth / 2;
      let best = 0, bd = Infinity;
      Array.prototype.forEach.call(sc.children, (el, i) => {
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
        if (d < bd) { bd = d; best = i; }
      });
      setActive((p) => (p === best ? p : best));
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(read); };
    /* roda do mouse sobre a galeria vira scroll horizontal; nas extremidades a página volta a rolar */
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = sc.scrollWidth - sc.clientWidth;
      if (max <= 1) return;
      if ((e.deltaY > 0 && sc.scrollLeft >= max - 1) || (e.deltaY < 0 && sc.scrollLeft <= 1)) return;
      e.preventDefault();
      lockRef.current = 0;
      sc.scrollLeft += e.deltaY;
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    sc.addEventListener("wheel", onWheel, { passive: false });
    const center = () => goTo(0, false);
    const t = window.setTimeout(center, 60);
    window.addEventListener("resize", center);
    return () => {
      sc.removeEventListener("scroll", onScroll);
      sc.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", center);
      window.clearTimeout(t);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [goTo]);
  const onKey = (e, i) => {
    const map = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const n = Math.max(0, Math.min(items.length - 1, map[e.key]));
    goTo(n);
    const btn = document.getElementById(bid(n));
    if (btn) btn.focus({ preventScroll: true });
  };
  return (
    <React.Fragment>
      {title ? <h2 className="kit-csec__h kit-imp__title">{title}</h2> : null}
      <div className="kit-imp">
      <div className="kit-imp__col">
      <ol className="kit-imp__list" role="list">
        {items.map((it, i) => {
          const on = i === active;
          return (
            <li key={i} className={["kit-imp__item", on ? "is-active" : ""].filter(Boolean).join(" ")} style={{ order: i * 10 }}>
              <h3 className="kit-imp__h">
                <button type="button" className="kit-imp__btn" id={bid(i)} aria-expanded={on} aria-controls={pid(i)} onClick={() => goTo(i)} onKeyDown={(e) => onKey(e, i)}>
                  <span className="kit-imp__n gb-mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="kit-imp__t">{it.h}</span>
                </button>
              </h3>
              <div className="kit-imp__panel" id={pid(i)} role="region" aria-labelledby={bid(i)}>
                <p className="kit-imp__d">{it.v}</p>
              </div>
            </li>
          );
        })}
      </ol>
      </div>
      <div className="kit-imp__media" style={{ order: active * 10 + 5 }}>
        <div className="kit-imp__scroller" ref={scRef}>
          {items.map((it, i) => (
            <figure key={i} className={["kit-imp__slide", i === active ? "is-active" : ""].filter(Boolean).join(" ")}>
              {it.s ? <img src={IMG_BASE + it.s} alt={it.alt} loading="eager" decoding="async" fetchPriority={i === 0 ? "high" : "low"} /> : <span className="kit-imgph"><span className="gb-label">{window.gbT("caseCommon.imagePlaceholder")} {String(i + 1).padStart(2, "0")}</span></span>}
            </figure>
          ))}
        </div>
        <div className="kit-imp__nav">
          <button type="button" className="kit-imp__arrow" aria-label={window.gbT("buttons.prevImprovement")} onClick={() => goTo(active - 1)}><Icon name="arrow-left" size={18} /></button>
          <p className="gb-mono kit-imp__count" aria-live="polite"><span className="kit-imp__count-n">{String(active + 1).padStart(2, "0")}</span> / {String(items.length).padStart(2, "0")}</p>
          <button type="button" className="kit-imp__arrow" aria-label={window.gbT("buttons.nextImprovement")} onClick={() => goTo(active + 1)}><Icon name="arrow-right" size={18} /></button>
        </div>
      </div>
    </div>
    </React.Fragment>
  );
}

function CaseBlock({ b }) {
  if (b.t === "p") return <p className="kit-cbody__p">{String(b.v).split("\n").map((l, i) => (
    <React.Fragment key={i}>{i ? <br /> : null}{l}</React.Fragment>
  ))}</p>;
  if (b.t === "label") return <p className="kit-cbody__intro">{b.v}</p>;
  if (b.t === "proto") return (
    <div className="kit-cproto">
      <div className="kit-cproto__row">
        {b.panel ? (
          <article className="kit-cpanel">
            <h4 className="kit-proc__h kit-cpanel__h">{b.panel.h}</h4>
            <div className="kit-cpanel__stats"><StatsInView stats={PANEL_STATS_DEFAULT()} /></div>
            <div className="kit-cpanel__notes">
              <ul className="kit-clist kit-cproc__list">{b.panel.notes.map((li) => { const i = li.indexOf(":"); return i < 0 ? <li key={li}>{li}</li> : <li key={li}><strong className="kit-cpanel__lead">{li.slice(0, i + 1)}</strong>{li.slice(i + 1)}</li>; })}</ul>
            </div>
          </article>
        ) : (
        <div className="kit-cproto__cards">{(b.cards || []).map((col, i) => (
          <article key={col.h} className="kit-proc">
            <h4 className="kit-proc__h kit-proc__h--row"><Icon name={b.icons[i]} size={19} />{col.h}</h4>
            <ul className="kit-clist kit-cproc__list">{col.items.map((li) => <li key={li}>{li}</li>)}</ul>
          </article>
        ))}</div>
        )}
        <figure className="kit-cproto__media">
          <Shot src={b.media.src} alt={b.media.alt} style={{ aspectRatio: b.media.ratio }} />
        </figure>
        <div className="kit-cbody__action kit-cproto__cta"><Button variant="ghost" href={b.cta.href} icon="arrow-up-right" target="_blank" rel="noreferrer noopener">{b.cta.v}</Button></div>
      </div>
    </div>
  );
  if (b.t === "sub") return b.k ? <div className="kit-cbody__subwrap"><p className="gb-mono kit-cbody__kicker">{b.k}</p><h2 className="kit-csec__h2 kit-cbody__sub kit-cbody__sub--kicked">{b.v}</h2></div> : <h2 className="kit-csec__h2 kit-cbody__sub">{b.v}</h2>;
  if (b.t === "img") return <CaseFigure item={b} className={b.narrow ? "" : "kit-cfig--wide"} />;
  if (b.t === "link") return <div className="kit-cbody__action"><Button variant="secondary" href={b.href} icon="arrow-up-right" target="_blank" rel="noreferrer noopener">{b.v}</Button></div>;
  if (b.t === "list") return <ul className="kit-clist">{b.v.map((li) => <li key={li}>{li}</li>)}</ul>;
  if (b.t === "steps") return (
    <ol className="kit-csteps">{b.v.map((li, i) => (
      <li key={li} className="kit-cstep">
        <span className="gb-label kit-csteps__n">{String(i + 1).padStart(2, "0")}</span>
        <span>{li}</span>
      </li>
    ))}</ol>
  );
  if (b.t === "cards") {
    if (b.numbered) return (
      <div className="kit-process kit-cproc kit-cproc--num">{b.v.map((c, i) => (
        <article key={c.h} className="kit-proc">
          <h4 className="kit-proc__h"><span className="kit-proc__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{c.h}</h4>
          <p className="kit-proc__b">{c.v}</p>
        </article>
      ))}</div>
    );
    if (b.v.some((c) => c.icon)) return (
      <div className={["kit-process", "kit-cproc", b.v.length > 3 ? "kit-cproc--full" : ""].filter(Boolean).join(" ")}>{b.v.map((c) => (
        <article key={c.h} className="kit-proc">
          <h4 className="kit-proc__h">{c.icon ? <Icon name={c.icon} size={19} /> : null}{c.h}</h4>
          <p className="kit-proc__b">{c.v}</p>
        </article>
      ))}</div>
    );
    return (
      <div className="kit-ccards">{b.v.map((c) => (
        <div key={c.h} className="kit-ccard"><h4 className="kit-ccard__h">{c.h}</h4><p>{c.v}</p></div>
      ))}</div>
    );
  }
  if (b.t === "compare" && b.icons) return (
    <div className="kit-process kit-cproc kit-cproc--pair">{b.v.map((col, i) => (
      <article key={col.h} className="kit-proc">
        <h4 className="kit-proc__h"><Icon name={b.icons[i]} size={19} />{col.h}</h4>
        <ul className="kit-clist kit-cproc__list">{col.items.map((li) => <li key={li}>{li}</li>)}</ul>
      </article>
    ))}</div>
  );
  if (b.t === "compare") return (
    <div className="kit-ccompare">{b.v.map((col) => (
      <div key={col.h} className="kit-ccompare__col">
        {b.h3
          ? <h3 className="kit-ccompare__h">{col.h}</h3>
          : <span className="kit-ccompare__h">{col.h}</span>}
        <ul className="kit-clist">{col.items.map((li) => <li key={li}>{li}</li>)}</ul>
      </div>
    ))}</div>
  );
  if (b.t === "rail") return (
    <figure className="kit-cba__item kit-clegacy">
      <span className="gb-label kit-cba__m"><span className="kit-cba__dot kit-cba__dot--off" aria-hidden="true"></span>{window.gbT("caseCommon.before")}</span>
      <div className="kit-clegacy__grid">
        {b.v.map((it, i) => (
          <img key={it.s} src={IMG_BASE + it.s} alt={window.gbT("caseCommon.altPrevFlow") + (i + 1)} loading="lazy" decoding="async" />
        ))}
      </div>
    </figure>
  );
  if (b.t === "improvements") return <Improvements items={b.v} title={b.h} />;
  if (b.t === "demos") return (
    <div className="kit-demoswrap">
      {b.k ? <p className="gb-mono kit-cbody__kicker">{b.k}</p> : null}
      {b.h ? <h3 className="kit-demos__h">{b.h}</h3> : null}
      {b.d ? <p className="kit-demos__lead">{b.d}</p> : null}
      <div className="kit-demos">
      {b.v.map((d, i) => (
        <article key={i} className="kit-demo">
          <div className="kit-demo__head">
            <span className="gb-label kit-cba__m kit-cba__k kit-demo__tag"><span className="kit-cba__dot" aria-hidden="true"></span>{window.gbT("caseCommon.inAction")}</span>
          </div>
          <div className="kit-demo__media"><img src={IMG_BASE + d.s} alt={d.alt} loading="lazy" decoding="async" /></div>
          <h3 className="kit-demo__h">{d.h}</h3>
          <p className="kit-demo__d">{d.v}</p>
        </article>
      ))}
      </div>
    </div>
  );
  if (b.t === "gallery") return <BAScroll pairs={b.v.map((s) => ({ a: s }))} legacy noTag />;
  if (b.t === "ba") return <BAScroll pairs={b.v} title={b.title} />;
  if (b.t === "kicker") return <p className="gb-mono kit-cbody__kicker kit-csec__prekicker">{b.v}</p>;
  if (b.t === "flow") return (
    <ol className="kit-cflow">{b.v.map((c, i) => (
      <li key={c.h} className="kit-cflow__item">
        <article className="kit-cflow__card">
          <header className="kit-cflow__head"><span className="kit-cflow__n gb-mono">{String(i + 1).padStart(2, "0")}</span><h4 className="kit-cflow__h">{c.h}</h4></header>
          <p className="kit-cflow__b">{c.v}</p>
        </article>
      </li>
    ))}</ol>
  );
  if (b.t === "chips") return (
    <ul className="kit-cchips">{b.v.map((c) => (
      <li key={c} className="kit-cchip"><span className="kit-cchip__dot" aria-hidden="true"></span>{c}</li>
    ))}</ul>
  );
  if (b.t === "stats") return <StatsInView />;
  if (b.t === "thanks") return (
    <p className="kit-cthanks"><span className="kit-cthanks__dot" aria-hidden="true"></span>{b.v}<span className="kit-cthanks__dot" aria-hidden="true"></span></p>
  );
  return null;
}

/* Rótulo lateral: número da seção + o termo antes do "|" do título, quando existir. */
function splitTitle(title) {
  const i = title.indexOf("|");
  if (i === -1) return { kicker: null, heading: title };
  return { kicker: title.slice(0, i).trim(), heading: title.slice(i + 1).trim() };
}

/* Rótulos laterais: quando o título da seção já é um rótulo curto, ele vai para a coluna lateral
   e o heading permanece no DOM apenas para a hierarquia. */
const RAIL_LABEL = {};

function CaseSection({ s, num }) {
  const H = s.level === 1 ? "h2" : "h3";
  const split = splitTitle(s.title);
  const railOnly = s.railOnly ? split.kicker : RAIL_LABEL[s.id];
  const kicker = railOnly || split.kicker;
  const heading = split.heading;
  const body = (
    <React.Fragment>
      {(s.preBlocks || []).map((b, i) => <Reveal key={"pre" + i}><CaseBlock b={b} /></Reveal>)}
      <Reveal as={H} className={[s.level === 1 ? "kit-csec__h" : "kit-csec__h2", kicker || s.wide ? "" : "kit-csec__h--slash", railOnly ? "kit-csec__h--hidden" : ""].filter(Boolean).join(" ")}>{s.wide ? heading.split(/(\sx\s)/i).map((part, i) => /^\sx\s$/i.test(part) ? <span key={i} style={{color:"var(--green-signal-text)"}}>{part}</span> : part) : heading}</Reveal>
      {s.layout === "split" ? (
        <div className="kit-csplit">
          <CaseFigure item={s.media} />
          <div className="kit-cbody">
            {s.blocks.map((b, i) => <Reveal key={i} delay={i * 40}><CaseBlock b={b} /></Reveal>)}
          </div>
        </div>
      ) : (
        <div className="kit-cbody">
          {s.blocks.map((b, i) => <Reveal key={i} delay={i * 40}><CaseBlock b={b} /></Reveal>)}
        </div>
      )}
    </React.Fragment>
  );
  return (
    <section id={s.id} className={["kit-csec", s.highlight ? "kit-csec--highlight" : "", s.level === 2 ? "kit-csec--sub" : "", s.wide ? "kit-csec--wide" : ""].filter(Boolean).join(" ")}>
      {s.highlight ? <span className="kit-beam kit-beam--top" aria-hidden="true"></span> : null}
      {s.highlight ? <span className="kit-beam kit-beam--bottom" aria-hidden="true"></span> : null}
      <div className="kit-container">
        <div className="kit-csec__grid">
          <div className="kit-csec__rail">
            {s.wide ? null : s.level === 1
              ? (kicker ? <p className="kit-csec__kicker">{kicker.split(/(\sx\s)/i).map((part, i) => /^\sx\s$/i.test(part) ? <span key={i} style={{color:"var(--green-signal-text)"}}>{part}</span> : part)}</p> : null)
              : <span className="kit-csec__mark" aria-hidden="true"></span>}
          </div>
          <div className="kit-csec__main">{body}</div>
        </div>
      </div>
    </section>
  );
}

function CaseProgress() {
  const [pct, setPct] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0);
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { if (raf) window.cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return <div className="kit-cprogress" aria-hidden="true"><span style={{ width: pct + "%" }} /></div>;
}

/* Quebras de linha do hero (apresentação — os textos são os mesmos do conteúdo). */
const HERO_BREAK_AFTER = ["a uma experiência"];
const LEAD_BREAK_AFTER = ["base whitelabel,", "13 pontos"];
function breakLines(text, marks) {
  let rest = text, out = [];
  marks.forEach((mark) => {
    const i = rest.indexOf(mark);
    if (i === -1) return;
    /* mantém o espaço à esquerda do trecho seguinte: quando o <br> é escondido em telas
       menores (ver case.css), esse espaço é o único separador entre as palavras */
    out.push(rest.slice(0, i + mark.length));
    rest = rest.slice(i + mark.length);
  });
  out.push(rest);
  return out.filter((s) => s.trim());
}
function Lines({ text, marks, className }) {
  return <React.Fragment>{breakLines(text, marks).map((l, i) => (
    <React.Fragment key={l}>{i ? <br /> : null}{l}</React.Fragment>
  ))}</React.Fragment>;
}

/* Big numbers do hero: timeline automática no carregamento (sem scroll/IO). */
function HERO_STATS_DEFAULT() { return window.gbT("caseTradeIn.heroStats"); }

function prefersReduced() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

function useHeroSequence() {
  const reduce = prefersReduced();
  const [step, setStep] = React.useState(reduce ? 9 : 0);
  React.useEffect(() => {
    if (reduce) return;
    const delays = [40, 170, 320, 470, 620, 800];
    const ids = delays.map((d, i) => window.setTimeout(() => setStep((s) => (s > i + 1 ? s : i + 1)), d));
    const safety = window.setTimeout(() => setStep(9), 3600);
    return () => { ids.forEach(window.clearTimeout); window.clearTimeout(safety); };
  }, [reduce]);
  return step;
}

function HeroCount({ run, prefix, value, suffix }) {
  const reduce = prefersReduced();
  const [n, setN] = React.useState(reduce ? value : 0);
  React.useEffect(() => {
    if (!run) return;
    if (reduce) { setN(value); return; }
    let raf = 0, t0 = 0;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min(1, (ts - t0) / 1600);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => { if (raf) window.cancelAnimationFrame(raf); };
  }, [run, value, reduce]);
  return <span className="kit-hstat__n" aria-hidden="true">{prefix}{n}{suffix}</span>;
}

function HeroSteps({ run, parts }) {
  const reduce = prefersReduced();
  const nums = parts.map((p) => parseInt(String(p).replace(/\D/g, ""), 10));
  const from = Number.isFinite(nums[0]) ? nums[0] : 0;
  const to = Number.isFinite(nums[nums.length - 1]) ? nums[nums.length - 1] : 0;
  const [a, setA] = React.useState(reduce ? from : 0);
  const [b, setB] = React.useState(reduce ? to : 0);
  const [sep, setSep] = React.useState(reduce);
  React.useEffect(() => {
    if (!run) return;
    if (reduce) { setA(from); setB(to); setSep(true); return; }
    let raf = 0, t0 = 0;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min(1, (ts - t0) / 1600);
      const e = 1 - Math.pow(1 - p, 3);
      setA(Math.round(from * Math.min(1, e / 0.55)));
      if (e >= 0.5) setSep(true);
      setB(e < 0.55 ? from : Math.round(from + (to - from) * ((e - 0.55) / 0.45)));
      if (p < 1) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => { if (raf) window.cancelAnimationFrame(raf); };
  }, [run, reduce, from, to]);
  return (
    <span className="kit-hstat__n" aria-hidden="true">
      <span className="kit-hstat__part is-in">{a}</span>
      <span className={["kit-hstat__part", "kit-hstat__sep", sep ? "is-in" : ""].filter(Boolean).join(" ")}>{parts[1]}</span>
      <span className={["kit-hstat__part", sep ? "is-in" : ""].filter(Boolean).join(" ")}>{b}</span>
    </span>
  );
}

function HeroStats({ step, stats }) {
  return (
    <div className="kit-hstats">
      {(stats || HERO_STATS_DEFAULT()).map((s, i) => (
        <div key={s.label} className={["kit-hstat", "kit-in", step >= i + 3 ? "is-in" : ""].filter(Boolean).join(" ")}>
          {s.kind === "count"
            ? <HeroCount run={step >= i + 3} prefix={s.prefix} value={s.value} suffix={s.suffix} />
            : <HeroSteps run={step >= i + 3} parts={s.parts} />}
          <span className="kit-sr">{s.final}</span>
          <span className="kit-hstat__l">{s.label}</span>
          <span className="kit-hstat__d">{s.desc}</span>
        </div>
      ))}
    </div>
  );
}

/* Mesmos big numbers do hero, disparados ao entrar em tela. */
function PANEL_STATS_DEFAULT() { return window.gbT("caseTradeIn.panelStats"); }

function StatsInView({ stats }) {
  const ref = React.useRef(null);
  const [run, setRun] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es, obs) => {
      es.forEach((e) => { if (e.isIntersecting) { setRun(true); obs.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const list = stats || (CUR && CUR.stats) || HERO_STATS_DEFAULT();
  return (
    <div ref={ref} className="kit-hstats kit-hstats--three">
      {list.map((s) => (
        <div key={s.label} className={["kit-hstat", "kit-in", run ? "is-in" : ""].filter(Boolean).join(" ")}>
          {s.kind === "count"
            ? <HeroCount run={run} prefix={s.prefix} value={s.value} suffix={s.suffix} />
            : <HeroSteps run={run} parts={s.parts} />}
          <span className="kit-sr">{s.final}</span>
          <span className="kit-hstat__l">{s.label}</span>
          <span className="kit-hstat__d">{s.desc}</span>
        </div>
      ))}
    </div>
  );
}

/* Índice lateral do case: ocupa a mesma coluna dos rótulos de seção, fica sticky dentro do
   artigo e acompanha a leitura via IntersectionObserver. */
function navOffset() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) || 96;
}

function CaseIndex({ items }) {
  const [active, setActive] = React.useState(items.length ? items[0].id : null);
  const lock = React.useRef(0);
  const ref = React.useRef(null);
  /* o topo da coluna acompanha o título da primeira seção, qualquer que seja a escala do h2 */
  React.useEffect(() => {
    const col = ref.current;
    if (!col || !items.length) return;
    const art = col.parentElement;
    const align = () => {
      const first = document.getElementById(items[0].id);
      const h = first && first.querySelector(".kit-csec__h");
      if (!h || !art) return;
      /* offsetTop ignora os transforms de entrada (gb-reveal), que falseiam o rect */
      const off = (el) => { let y = 0, n = el; while (n) { y += n.offsetTop; n = n.offsetParent; } return y; };
      art.style.setProperty("--cindex-top", Math.max(0, Math.round(off(h) - off(art) - 2)) + "px");
      /* preso, o índice para na mesma linha em que um título de seção para ao ser navegado.
         a referência é uma seção comum — a primeira tem padding-top próprio, colada no hero. */
      const ref2 = document.getElementById((items[1] || items[0]).id);
      const h2 = ref2 && ref2.querySelector(".kit-csec__h");
      if (ref2 && h2) {
        const dh = Math.max(0, off(h2) - off(ref2));
        art.style.setProperty("--cindex-stick", "calc(var(--nav-height) + " + (24 + dh) + "px)");
      }
    };
    align();
    const t = window.setTimeout(align, 600);
    window.addEventListener("resize", align);
    return () => { window.clearTimeout(t); window.removeEventListener("resize", align); };
  }, [items]);
  React.useEffect(() => {
    const els = items.map((it) => document.getElementById(it.id)).filter(Boolean);
    if (!els.length) return;
    let raf = 0;
    /* posição estática do elemento no documento: imune aos transforms que o pin do
       Antes x Depois aplica no título da seção */
    const docTop = (el) => {
      let y = 0, n = el;
      while (n) { y += n.offsetTop; n = n.offsetParent; }
      return y;
    };
    /* alvo de cada seção: o título, quando ele existe e está renderizado */
    let marks = [];
    const measure = () => {
      marks = els.map((el) => {
        const h = el.querySelector(".kit-csec__h");
        /* o menor entre topo da seção e topo do título: seções com conteúdo antes do
           título (ex.: o carrossel Antes x Depois) já contam como a seção atual */
        const y = h && h.offsetHeight ? Math.min(docTop(el), docTop(h)) : docTop(el);
        return { id: el.id, y: y };
      });
    };
    /* a troca acontece quando o título da seção seguinte cruza a base do índice */
    const read = () => {
      raf = 0;
      if (Date.now() < lock.current) return;
      measure();
      const inner = ref.current && ref.current.firstElementChild;
      const line = (inner && inner.offsetHeight ? inner.getBoundingClientRect().bottom : navOffset() + 120) + window.scrollY;
      let id = items[0].id;
      marks.forEach((m) => { if (m.y <= line) id = m.id; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) id = els[els.length - 1].id;
      setActive((p) => (p === id ? p : id));
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(read); };
    const relayout = () => { measure(); onScroll(); };
    relayout();
    const t = window.setTimeout(relayout, 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", relayout);
    /* o observer redimensiona a régua quando uma seção entra ou sai da viewport */
    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(relayout, { threshold: 0 });
      els.forEach((el) => io.observe(el));
    }
    return () => { if (raf) window.cancelAnimationFrame(raf); window.clearTimeout(t); if (io) io.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", relayout); };
  }, [items]);
  const go = React.useCallback((e, id) => {
    e.preventDefault();
    const t = document.getElementById(id);
    if (!t) return;
    const reduce = prefersReduced();
    setActive(id);
    lock.current = Date.now() + (reduce ? 0 : 900);
    window.scrollTo({ top: Math.max(t.getBoundingClientRect().top + window.scrollY - navOffset() - 24, 0), behavior: reduce ? "auto" : "smooth" });
    if (window.history && window.history.replaceState) window.history.replaceState(null, "", "#" + id);
  }, []);
  if (items.length < 2) return null;
  return (
    <aside className="kit-cindex" ref={ref}>
      <nav className="kit-cindex__inner" aria-label={window.gbT("caseCommon.projectSectionsAria")}>
        {items.map((it) => (
          <a key={it.id} className="kit-cindex__lnk" href={"#" + it.id} aria-current={active === it.id ? "location" : undefined} onClick={(e) => go(e, it.id)}>{it.label}</a>
        ))}
      </nav>
    </aside>
  );
}

function CaseTradeIn({ onBack, onOpenCase, nextCase, data }) {
  const c = data || window.GB_TRADEIN;
  CUR = c;
  const [zoom, setZoom] = React.useState(null);
  const onImgClick = React.useCallback((e) => {
    const img = e.target.closest("img");
    if (!img || img.closest("a,button")) return;
    setZoom({ src: img.currentSrc || img.src, alt: img.alt || "" });
  }, []);
  IMG_BASE = c.imgBase || IMG_BASE_DEFAULT;
  const langCtx = window.useLang();
  const step = useHeroSequence();
  const navItems = React.useMemo(() => c.sections.filter((s) => s.level === 1 && !s.noIndex).map((s) => ({ id: s.id, label: s.navLabel || splitTitle(s.title).kicker || splitTitle(s.title).heading })), [c, langCtx.lang]);
  let n = 0;
  return (
    <div className={["kit-case", "kit-case--index", c.slug ? "kit-case--" + c.slug : ""].filter(Boolean).join(" ")}>
      <TopNav
        links={[]}
        cta={{ label: window.gbT("buttons.resume"), href: "https://drive.google.com/file/d/1KZAIMkrN0fugIKCg0N4O7XuoWm1s1ZDV/view?usp=sharing" }}
        ctaPrimary={{ label: window.gbT("buttons.talk"), href: "#contato-secao", icon: "message-circle" }}
        brand={<React.Fragment><Icon name="arrow-left" /><span className="kit-case-backlabel">{window.gbT("caseCommon.backLabel")}</span></React.Fragment>}
        onBrandClick={(e) => { e.preventDefault(); onBack("cases"); }}
      />
      <CaseProgress />
      <article onClick={onImgClick}>
        <header className={c.hideHeroStats ? "kit-chero kit-chero--nostats" : "kit-chero"}>
          <div className="kit-chero__stage">
            <div className="kit-chero__sticky">
              <div className="kit-container kit-chero__text">
                <h1 className={["kit-chero__title", "kit-in", step >= 1 ? "is-in" : ""].filter(Boolean).join(" ")}><Lines text={c.title} marks={c.heroBreakAfter || HERO_BREAK_AFTER} /></h1>
                <p className={["kit-chero__lead", "kit-in", step >= 2 ? "is-in" : ""].filter(Boolean).join(" ")}><Lines text={c.lead} marks={c.leadBreakAfter || LEAD_BREAK_AFTER} /></p>
                {c.hideHeroStats ? null : <HeroStats step={step} stats={c.stats} />}
              </div>
            </div>
            <div className={["kit-chero__reveal", "kit-in", step >= 6 ? "is-in" : ""].filter(Boolean).join(" ")}>
              <div className="kit-container">
                <figure className="kit-chero__shot">
                  {c.heroImage === "" ? <span className="kit-imgph" style={{ aspectRatio: "3098 / 1750" }}><span className="gb-label">{window.gbT("caseCommon.openingImage")}</span></span> : <img src={IMG_BASE + (c.heroImage || "hero-screens.png")} alt={(c.opening && c.opening.alt) || c.title} decoding="async" fetchPriority="high" style={{ aspectRatio: c.heroRatio || "3098 / 1750", maxWidth: c.heroMaxWidth || undefined, margin: c.heroMaxWidth ? "0 auto" : undefined }} />}
                </figure>
                {c.heroImage2 ? (
                  <figure className="kit-chero__shot kit-chero__shot--second">
                    <img src={IMG_BASE + c.heroImage2} alt={(c.opening && c.opening.alt) || c.title} width="3098" height="1750" decoding="async" style={{ aspectRatio: "3098 / 1750" }} />
                  </figure>
                ) : null}
              </div>
            </div>
          </div>
          <div className="kit-container">
            <dl className="kit-cficha">
              {c.ficha.map((f) => (
                <div key={f.k} className="kit-cficha__item">
                  <dt className="gb-label">{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>
        <div className="kit-carticle">
          <CaseIndex items={navItems} />
          {c.sections.map((s) => {
            if (s.level === 1) n += 1;
            return <CaseSection key={s.id} s={s} num={String(n).padStart(2, "0")} />;
          })}
        </div>
        <section className="kit-csec">
          <div className="kit-container kit-cend">
            <button type="button" className="kit-cnext" onClick={() => onOpenCase(nextCase.slug)}>
              <span>
                <span className="gb-label">{window.gbT("caseCommon.nextCaseWord")}</span>
                <span className="kit-cnext__title">{nextCase.title}</span>
              </span>
              <span className="kit-cnext__go gb-label">
                {window.gbT("caseCommon.openCaseWord")}
                <span className="kit-cnext__circle" aria-hidden="true"><Icon name="arrow-up-right" /></span>
              </span>
            </button>
          </div>
        </section>
        <section className="kit-csec" id="contato-secao">
          <div className="kit-container">
            <ContactBlock
              availabilityLabel={window.gbT("contact.availability")}
              title={window.gbT("contact.title")}
              description={window.gbT("contact.description")}
              links={window.GB.contact.links}
              cta={{ label: window.gbT("buttons.scheduleChat"), href: "https://calendly.com/designergbs/30min", icon: "calendar" }}
            />
          </div>
        </section>
      </article>
      {zoom ? (
        <div className="kit-lightbox" role="dialog" aria-modal="true" aria-label={window.gbT("caseCommon.enlargeImage")} onClick={() => setZoom(null)}>
          <button type="button" className="kit-lightbox__close" aria-label={window.gbT("caseCommon.closeImage")} onClick={() => setZoom(null)}><Icon name="x" size={22} /></button>
          <img src={zoom.src} alt={zoom.alt} onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}
      <SiteFooter brand={window.GB.brand} description="" />
      <BackToTop />
    </div>
  );
}
window.CaseTradeIn = CaseTradeIn;
