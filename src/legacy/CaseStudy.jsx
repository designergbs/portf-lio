export {};
const { TopNav, Button, Tag, SectionHeader, TextLink, SiteFooter, Reveal } = window.GuilhermeBernardoPortfolioDS_97bb82;

/* Case page template: hero de capa, resumo em ficha, contexto/papel/processo, resultado, próximo case. */
function CaseStudy({ slug, onBack, onOpenCase }) {
  const list = window.GB.cases;
  const item = list.find((c) => c.slug === slug) || list[0];
  const next = list[(list.indexOf(item) + 1) % list.length];
  return (
    <div>
      <TopNav
        links={window.GB.nav}
        cta={{ label: window.gbT("buttons.resume"), href: "https://drive.google.com/file/d/1KZAIMkrN0fugIKCg0N4O7XuoWm1s1ZDV/view?usp=sharing" }}
        ctaPrimary={{ label: window.gbT("buttons.talk"), href: "https://calendly.com/designergbs/30min", icon: "message-circle" }}
        brand={window.GB.brand}
        onBrandClick={(e) => { e.preventDefault(); onBack(); }}
        onLinkClick={(e, href) => { e.preventDefault(); onBack(href.replace("#", "")); }}
      />
      <article>
        <header className="kit-casehero">
          <div className="kit-container kit-casehero__inner">
            <nav className="kit-crumbs" aria-label={window.gbT("caseCommon.crumbsAria")}>
              <button type="button" className="kit-crumbs__link" onClick={() => onBack()}>{window.gbT("caseCommon.home")}</button>
              <span className="kit-crumbs__sep" aria-hidden="true">/</span>
              <button type="button" className="kit-crumbs__link" onClick={() => onBack("cases")}>{window.gbT("caseCommon.projects")}</button>
              <span className="kit-crumbs__sep" aria-hidden="true">/</span>
              <span className="kit-crumbs__current" aria-current="page">{item.company}</span>
            </nav>
            <span className="gb-label">{item.company} · {item.year}</span>
            <h1 className="kit-casehero__title">{item.title}</h1>
            <p className="kit-lead">{item.context}</p>
            <div className="kit-tagrow">
              <Tag icon="user">{item.role}</Tag>
              {item.facts.map((fa) => <Tag key={fa}>{fa}</Tag>)}
            </div>
          </div>
          <div className="kit-container">
            <div className="kit-casehero__cover">
              <img src={item.image} alt={item.imageAlt} />
            </div>
          </div>
        </header>
        <section className="kit-section">
          <div className="kit-container kit-case-grid">
            <aside className="kit-case-meta">
              {[[window.gbT("caseCommon.metaLabels")[0], item.company], [window.gbT("caseCommon.metaLabels")[1], item.year], [window.gbT("caseCommon.metaLabels")[2], item.role], [window.gbT("caseCommon.metaLabels")[3], window.gbT("caseCommon.teamPlaceholder")], [window.gbT("caseCommon.metaLabels")[4], window.gbT("caseCommon.platformsPlaceholder")]].map(([k, v]) => (
                <div key={k}>
                  <span className="gb-label">{k}</span>
                  <span className="gb-mono kit-case-meta__v">{v}</span>
                </div>
              ))}
            </aside>
            <div className="kit-case-body">
              {window.gbT("caseCommon.bodyHeadings").map(([h, p]) => (
                <Reveal key={h} className="kit-case-block">
                  <h2 className="kit-case-block__h">{h}</h2>
                  <p>{p}</p>
                </Reveal>
              ))}
              <div className="kit-case-figure">
                <span className="gb-label">{window.gbT("caseCommon.figurePlaceholder")}</span>
              </div>
            </div>
          </div>
        </section>
        <section className="kit-section kit-section--alt">
          <div className="kit-container">
            <SectionHeader eyebrow={window.gbT("caseCommon.nextCaseEyebrow")} title={next.title} />
            <div className="kit-caseend__actions" style={{ marginTop: "var(--space-6)" }}>
              <Button variant="ghost" icon="arrow-left" iconPosition="left" onClick={() => onBack()}>{window.gbT("buttons.backHome")}</Button>
              <Button variant="primary" onClick={() => onOpenCase(next.slug)}>{window.gbT("buttons.openNextCase")}</Button>
            </div>
          </div>
        </section>
      </article>
      <SiteFooter brand={window.GB.brand} description="" />
    </div>
  );
}
window.CaseStudy = CaseStudy;
