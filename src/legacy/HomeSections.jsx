export {};
const { CaseRow, Timeline, ExperienceCard, CircularSectionLabel, ToolCard, Reveal, Tag, Button, TextLink, Icon } = window.GuilhermeBernardoPortfolioDS_97bb82;

function Section({ id, children, tone = "page" }) {
  return (
    <section id={id} className={"kit-section" + (tone === "alt" ? " kit-section--alt" : "")}>
      <div className="kit-container">{children}</div>
    </section>
  );
}

/* Revelação tipográfica ligada ao scroll (scrub): cada caractere avança
   texto-muted -> faixa verde-sinal (accent) -> texto-primary, na ordem de
   leitura (índice linear, independente de onde a linha quebra). */
function ScrollCharReveal({ text, className = "", stickyTailChars = 0, stickyHeadChars = 0, stickyRange = null, gateFlag = false, driveKey = "" }) {
  const gateAttr = typeof gateFlag === "string" ? gateFlag : "data-title-reveal-done";
  const wrapRef = React.useRef(null);
  const spansRef = React.useRef([]);
  spansRef.current = [];
  const lines = text.split("\n");
  const reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  React.useEffect(() => {
    const spans = spansRef.current;
    const total = spans.length;
    const inRange = (i) => !!stickyRange && i >= stickyRange[0] && i < stickyRange[1];
    if (reduce || !total) { spans.forEach((s, i) => { s.style.color = (stickyTailChars > 0 && i >= total - stickyTailChars) || inRange(i) ? "var(--green-signal-text)" : (stickyHeadChars > 0 && i < stickyHeadChars) ? "var(--text-muted)" : "var(--text-primary)"; }); return; }
    const el = wrapRef.current;
    let raf = 0;
    const apply = (p) => {
      const band = Math.max(1.2, total * 0.06);
      const feather = Math.max(0.5, total * 0.015);
      const half = band / 2, outer = half + feather;
      const charProgress = p * (total - 1 + 2 * outer) - outer;
      for (let i = 0; i < total; i++) {
        if (stickyHeadChars > 0 && i < stickyHeadChars) { spans[i].style.color = "var(--text-muted)"; continue; }
        let d = i - charProgress;
        if (stickyTailChars > 0 && i >= total - stickyTailChars) d = Math.max(d, -half);
        if (inRange(i)) d = Math.max(d, -half);
        let color;
        if (d <= -outer) color = "var(--text-primary)";
        else if (d <= -half) { const t = (d + outer) / feather; color = "color-mix(in oklch, var(--green-signal-text) " + Math.round(t * 100) + "%, var(--text-primary) " + Math.round((1 - t) * 100) + "%)"; }
        else if (d <= half) color = "var(--green-signal-text)";
        else if (d <= outer) { const t2 = (d - half) / feather; color = "color-mix(in oklch, var(--text-muted) " + Math.round(t2 * 100) + "%, var(--green-signal-text) " + Math.round((1 - t2) * 100) + "%)"; }
        else color = "var(--text-muted)";
        spans[i].style.color = color;
      }
    };
    const upd = () => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.82;
      const span = Math.max(1, r.height * 1.8 + vh * 0.12);
      const p = Math.max(0, Math.min(1, (start - r.top) / span));
      apply(p);
      if (gateFlag) document.documentElement.toggleAttribute(gateAttr, p >= 1);
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(() => { raf = 0; upd(); }); };
    if (driveKey) {
      // Progresso ditado por quem fixa a seção (linha do tempo única), em vez
      // do deslocamento próprio — que ficaria congelado enquanto fixado.
      window.__plabDrives = window.__plabDrives || {};
      window.__plabDrives[driveKey] = apply;
      apply(0);
      return () => { if (window.__plabDrives) delete window.__plabDrives[driveKey]; };
    }
    upd();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) window.cancelAnimationFrame(raf); };
  }, [reduce, stickyTailChars, stickyHeadChars, stickyRange && stickyRange[0], stickyRange && stickyRange[1], gateFlag, driveKey, text]);
  return (
    <span className={["kit-charreveal", className].filter(Boolean).join(" ")} ref={wrapRef}>
      <span aria-hidden="true">
        {lines.map((line, li) => (
          <React.Fragment key={li}>
            {li > 0 ? <br /> : null}
            {Array.from(line).map((ch, ci) => (
              <span className="rc" ref={(el) => { if (el) spansRef.current.push(el); }} key={li + "-" + ci}>{ch}</span>
            ))}
          </React.Fragment>
        ))}
      </span>
      <span className="kit-sr">{text.replace(/\n/g, " ")}</span>
    </span>
  );
}

function About() {
  const a = window.GB.about;
  const paras = Array.isArray(a.summary) ? a.summary : [a.summary];
  return (
    <Section id="sobre">
      <Reveal className="kit-caseshead">
        <CircularSectionLabel label={window.gbT("sections.aboutEyebrow")} repeat={5} href="#sobre" />
      </Reveal>
      <Reveal delay={100} className="kit-about">
        <div className="kit-about__portrait">
          <div className="kit-about__frame">
            <img src="/assets/portrait-cyber-wireframe.jpg" alt="Retrato de Guilherme Bernardo em linhas de wireframe monocromáticas" />
          </div>
        </div>
        <div className="kit-about__body">
          <div className="kit-about__titlewrap"><h2 className="gb-sechead__title kit-about__title"><ScrollCharReveal text={window.gbT("sections.aboutTitle")} stickyTailChars={4} gateFlag /></h2></div>
          <Reveal delay={200} className="kit-lead-group">{paras.map((p, i) => <p className="kit-lead" key={i}>{String(p).split("\n").map((l, k) => <React.Fragment key={k}>{k ? <br /> : null}{l}</React.Fragment>)}</p>)}</Reveal>
        </div>
        <div className="kit-about__meta">
          {a.facts.map((fact) => (
            <div className="kit-about__metaitem" key={fact.label}>
              <span className="gb-label">{fact.label}</span>
              <span className="gb-mono kit-about__metaval">{fact.value}</span>
            </div>
          ))}
          <div className="kit-about__metaitem">
            <span className="gb-label">{window.gbT("about.specialties")}</span>
            <div className="kit-factrow"><span className="gb-mono">{a.specialties.map((s,i)=><React.Fragment key={i}>{i?" | ":null}{s}</React.Fragment>)}</span></div>
          </div>
          <div className="kit-about__metaitem">
            <span className="gb-label">{window.gbT("about.industries")}</span>
            <div className="kit-factrow"><span className="gb-mono">{a.segments.map((s,i)=><React.Fragment key={i}>{i?<span className="gb-bullet" aria-hidden="true">•</span>:null}{s}</React.Fragment>)}</span></div>
          </div>
          {a.tenure ? (
            <div className="kit-about__metaitem">
              <span className="gb-label">{a.tenure.label}</span>
              <span className="gb-mono kit-about__metaval">{a.tenure.value}</span>
            </div>
          ) : null}
          {a.location ? (
            <div className="kit-about__metaitem">
              <span className="gb-label">{a.location.label}</span>
              <span className="gb-mono kit-about__metaval">{a.location.value}</span>
            </div>
          ) : null}
        </div>
      </Reveal>
    </Section>
  );
}

function Cases({ onOpenCase }) {
  return (
    <Section id="cases">
      <Reveal className="kit-caseshead">
        <CircularSectionLabel label={window.gbT("sections.projectsEyebrow")} repeat={3} href="#cases" />
        <h2 className="gb-sechead__title"><ScrollCharReveal text={window.gbT("sections.projectsTitle")} /></h2>
      </Reveal>
      <ol className="gb-caselist kit-cases">
        {window.GB.cases.map((c, i) => (
            <CaseRow
              key={c.slug}
              delay={i * 100}
              index={c.index}
              category={c.category}
              title={c.title}
              summary={c.context}
              image={c.image}
              imageAlt={c.imageAlt}
              priority={i === 0}
              href={"#case-" + c.slug}
              onClick={(e) => { e.preventDefault(); onOpenCase(c.slug); }}
            />
        ))}
      </ol>
    </Section>
  );
}

function Experience() {
  return (
    <Section id="experiencia">
      <Reveal className="kit-caseshead">
        <CircularSectionLabel label={window.gbT("sections.experienceEyebrow")} repeat={3} href="#experiencia" />
        <h2 className="gb-sechead__title"><ScrollCharReveal text={window.gbT("sections.experienceTitle")} /></h2>
      </Reveal>
      <Reveal delay={100}>
        <Timeline
          items={window.GB.experience.map((e) => ({
            period: e.period,
            place: e.place,
            current: e.current,
            content: <ExperienceCard role={e.role} company={e.company} logo={e.logo} context={e.context} contributions={e.contributions} products={e.products} tags={e.tags} />
          }))}
        />
      </Reveal>
    </Section>
  );
}

/* largura uniforme dos cards da marquee: mede o texto real (nome + estágio) de cada
   ferramenta e usa a maior largura encontrada + 16px de margem em cada lado como
   referência para todos os cards, em vez de uma largura fixa arbitrária. */
function useToolCardWidth(railRef, tools) {
  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const measure = () => {
      const nameEl = rail.querySelector(".gb-tool__name");
      const stageEl = rail.querySelector(".gb-tool__stage");
      if (!nameEl || !stageEl) return;
      const canvas = measure._canvas || (measure._canvas = document.createElement("canvas"));
      const ctx = canvas.getContext("2d");
      const nameFont = window.getComputedStyle(nameEl).font;
      const stageFont = window.getComputedStyle(stageEl).font;
      let max = 0;
      tools.forEach((t) => {
        ctx.font = nameFont;
        max = Math.max(max, ctx.measureText(t.name).width);
        ctx.font = stageFont;
        max = Math.max(max, ctx.measureText(t.stage).width);
      });
      rail.style.setProperty("--tool-card-w", Math.ceil(max) + 32 + "px");
    };
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tools]);
}

function Tools() {
  const railRef = React.useRef(null);
  useToolCardWidth(railRef, window.GB.tools);
  return (
    <Section id="ferramentas">
      <window.ProcessStackLab
        head={
          <Reveal className="kit-caseshead">
            <CircularSectionLabel label={window.gbT("sections.processEyebrow")} repeat={3} href="#ferramentas" />
            <h2 className="gb-sechead__title"><ScrollCharReveal text={window.gbT("sections.processTitle")} /></h2>
          </Reveal>
        }
        foot={
          <React.Fragment>
            <Reveal delay={120}><div className="kit-subhead-compare">
            <div className="kit-subhead--editbox">
              <i className="kit-subhead__handle kit-subhead__handle--tl"></i>
              <i className="kit-subhead__handle kit-subhead__handle--tr"></i>
              <i className="kit-subhead__handle kit-subhead__handle--bl"></i>
              <i className="kit-subhead__handle kit-subhead__handle--br"></i>
              <h3 className="kit-subhead">{window.gbT("sections.toolsSubhead")}</h3>
            </div>
            </div></Reveal>
            <div className="kit-toolsrail" ref={railRef} data-reveal-group>
              <div className="gb-marquee" data-reveal-card>
                <div className="gb-marquee__track gb-marquee__track--left" role="list" aria-label={window.gbT("sections.toolsAria")}>
                  <div className="gb-marquee__set kit-tools">
                    {window.GB.tools.map((t) => <ToolCard key={t.name} name={t.name} icon={t.icon} stage={t.stage} />)}
                  </div>
                  <div className="gb-marquee__set gb-marquee__set--clone kit-tools" aria-hidden="true">
                    {window.GB.tools.map((t) => <ToolCard key={"c-" + t.name} name={t.name} icon={t.icon} stage={t.stage} />)}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        }
      />
    </Section>
  );
}

window.ScrollCharReveal = ScrollCharReveal;
window.Sections = { Section, About, Cases, Experience, Tools };
