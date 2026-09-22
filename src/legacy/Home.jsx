export {};
const { TopNav, SideRail, ContactBlock, SiteFooter, CircularSectionLabel } = window.GuilhermeBernardoPortfolioDS_97bb82;
const BackToTop = window.GuilhermeBernardoPortfolioDS_97bb82.BackToTop || (() => null);

function Home({ onOpenCase, activeId }) {
  const S = window.Sections;
  const [current, setCurrent] = React.useState("top");
  React.useEffect(() => {
    let raf = 0;
    const pick = () => {
      raf = 0;
      const nodes = window.GB.rail.map((r) => ({ id: r.id, el: document.getElementById(r.id) })).filter((n) => n.el);
      if (!nodes.length) return;
      const line = window.innerHeight * 0.4;
      let best = nodes[0].id;
      for (const n of nodes) {
        const r = n.el.getBoundingClientRect();
        if (r.top <= line) best = n.id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) best = nodes[nodes.length - 1].id;
      setCurrent((c) => (c === best ? c : best));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick); };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return (
    <div>
      <TopNav links={window.GB.nav} ctaPrimary={{ label: window.gbT("buttons.talk"), href: "#contato", icon: "message-circle" }} brand={window.GB.brand} brandMorph heroSelector=".kit-hero" />
      <SideRail items={window.GB.rail} activeId={activeId || current} onSelect={setCurrent} />
      <window.Hero />
      <main>
        <S.Tools />
        <S.Cases onOpenCase={onOpenCase} />
        <S.Experience />
        <S.About />
        <section className="kit-section" id="contato-secao" data-rail="contato">
          <div className="kit-container">
            <ContactBlock
              availabilityLabel={window.gbT("contact.availability")}
              title={<window.ScrollCharReveal text={window.gbT("contact.title")} />}
              description={window.gbT("contact.description")}
              links={window.GB.contact.links}
              cta={{ label: window.gbT("buttons.scheduleChat"), href: "https://calendly.com/designergbs/30min", icon: "calendar" }}
            />
          </div>
        </section>
      </main>
      <SiteFooter brand={window.GB.brand} description="" />
      <BackToTop className="gb-totop--home" />
    </div>
  );
}
window.Home = Home;
