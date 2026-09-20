export {};
/* Seção "Processos": layout estático — título, 3 cards e cards de ferramentas
   são exibidos no estado final, sem fixação de scroll, trilho de progresso ou
   revelação progressiva. */
const PLAB_COLORS = ["#F4B421", "#A259FF", "#1ABCFE"];
const PLAB_CSS = `
.plab{position:relative;display:block}
.plab-stack{width:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-start;gap:24px;padding-block:0}
.plab-head > *:last-child,.plab-foot > *:last-child{margin-bottom:0}
.plab-foot{margin-top:56px}
.plab-grid{margin-top:16px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;align-items:stretch}
.plab-col{display:flex;flex-direction:column;min-width:0}
.plab-card{position:relative;flex:1 1 auto;display:flex;flex-direction:column;gap:16px;box-sizing:border-box;padding:16px;padding-bottom:56px;background:var(--bg-section);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);transition:transform .28s cubic-bezier(.16,1,.3,1),box-shadow .28s cubic-bezier(.16,1,.3,1),border-color .28s cubic-bezier(.16,1,.3,1)}
.plab-card>*{position:relative;z-index:1}
@property --plab-edge{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes plab-edge-spin{to{--plab-edge:360deg}}
.plab-card::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;background:conic-gradient(from var(--plab-edge),transparent 0deg,transparent 150deg,color-mix(in srgb,var(--card-accent) 25%,transparent) 210deg,color-mix(in srgb,var(--card-accent) 55%,transparent) 275deg,color-mix(in srgb,var(--card-accent) 85%,transparent) 320deg,var(--card-accent) 336deg,color-mix(in srgb,var(--card-accent) 55%,transparent) 350deg,transparent 360deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;opacity:0;transition:opacity .28s ease;pointer-events:none;z-index:2}
.plab-card:hover::before,.plab-card:focus-visible::before{opacity:1;animation:plab-edge-spin 5s linear infinite}
.plab-card::after{content:"";position:absolute;top:0;left:50%;transform:translateX(-50%) translateY(-50%);width:110px;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(143,143,143,0.67) 50%,transparent 100%);pointer-events:none;transition:width var(--dur-base) var(--ease-out);z-index:1}
.plab-card:hover::after,.plab-card:focus-visible::after{width:170px}
.plab-card:hover,.plab-card:focus-visible{transform:translateY(-8px);box-shadow:0 4px 8px -4px color-mix(in srgb,var(--card-accent) 35%,transparent),0 12px 24px -8px color-mix(in srgb,var(--card-accent) 30%,transparent)}
.plab-top{display:flex;align-items:center;gap:12px}
.plab-toptext{display:flex;flex-direction:column;gap:0;align-self:center;position:relative;top:2px}
.plab-toptext .plab-t{margin-top:0}
.plab-ico{display:grid;place-items:center;flex:none;box-sizing:content-box;width:24px;height:24px;padding:8px;border-radius:var(--radius-sm);background:color-mix(in srgb,var(--card-accent) 10%,var(--surface-1));color:color-mix(in srgb,var(--ico-c,var(--card-accent)) 85%,black)}
.plab-card:hover .plab-ico,.plab-card:focus-visible .plab-ico{color:var(--ico-c,var(--card-accent))}
.plab-ico svg{width:24px;height:24px;display:block}
.plab-h{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:4px;margin:0;padding-bottom:16px;border-bottom:1px solid var(--border-subtle);font-size:clamp(1rem,1.1vw,1.125rem);font-weight:var(--fw-regular);color:var(--text-primary);transition:border-color .28s ease}
.plab-card:hover .plab-h,.plab-card:focus-visible .plab-h{border-bottom-color:color-mix(in srgb,var(--card-accent) 45%,transparent)}
.plab-card:hover .plab-step,.plab-card:focus-visible .plab-step{font-weight:var(--fw-medium)}
.plab-step{font-family:var(--font-mono);font-size:0.5625rem;font-weight:var(--fw-light);letter-spacing:0.08em;text-transform:uppercase;color:color-mix(in srgb,var(--step-c,var(--text-muted)) 85%,black);position:relative;top:2px}
.plab-card:hover .plab-step,.plab-card:focus-visible .plab-step{color:var(--step-c,var(--text-muted))}
.plab-t{font-size:clamp(0.875rem,1vw,1rem)}
.plab-b{margin:0;color:var(--text-secondary);font-size:var(--type-body-sm-size);line-height:var(--type-body-sm-lh)}
.plab-card:hover .plab-b,.plab-card:focus-visible .plab-b{color:var(--text-primary)}
.plab-foot > .gb-reveal:has(.kit-subhead){text-align:center}
.plab-foot .kit-subhead{position:relative}
.kit-subhead{display:inline-block}
.kit-subhead-compare{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:16px}
.kit-subhead--editbox{position:relative;display:inline-flex;padding:var(--space-3);margin:16px 0 8px;background:var(--bg-section);border:0.5px solid var(--border-subtle)}
#ferramentas .kit-subhead--editbox .kit-subhead{margin:0}
.kit-subhead__handle{position:absolute;width:8px;height:8px;background:#000;border:0.5px solid var(--border-subtle)}
.kit-subhead__handle--tl{top:-4px;left:-4px}
.kit-subhead__handle--tr{top:-4px;right:-4px}
.kit-subhead__handle--bl{bottom:-4px;left:-4px}
.kit-subhead__handle--br{bottom:-4px;right:-4px}
@media (max-width:900px),(max-height:480px){
  .plab-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))}
}
@media (prefers-reduced-motion:reduce){
  .plab-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))}
  .plab-card{transition:box-shadow .28s ease,border-color .28s ease}
  .plab-card:hover,.plab-card:focus-visible{transform:none}
  .plab-card:hover::before,.plab-card:focus-visible::before{animation:none}
}
`;
function PlabCol({ item, i }) {
  const Icon = window.GuilhermeBernardoPortfolioDS_97bb82.Icon;
  const c = PLAB_COLORS[i];
  return (
    <div className="plab-col">
      <article className="plab-card" style={{ "--card-accent": c }}>
        <h3 className="plab-h">
          <span className="plab-top">
            <span className="plab-ico" style={{ "--ico-c": c }}><Icon name={item.icon} size={24} /></span>
            <span className="plab-toptext">
              <span className="plab-step" style={{ "--step-c": c }}>{window.gbT("process.steps")[i]}</span>
              <span className="plab-t">{item.title}</span>
            </span>
          </span>
        </h3>
        <p className="plab-b">{item.body}</p>
      </article>
    </div>
  );
}
function ProcessStackLab({ head, foot }) {
  const items = window.GB.process;
  React.useEffect(() => {
    const prev = document.getElementById("plab-css");
    if (prev) prev.remove();
    const s = document.createElement("style");
    s.id = "plab-css";
    s.textContent = PLAB_CSS;
    document.head.appendChild(s);
  }, []);
  return (
    <section className="plab">
      <div className="plab-stack">
        <div className="plab-head">{head}</div>
        <div className="plab-grid">
          {items.map((p, i) => <PlabCol item={p} i={i} key={i} />)}
        </div>
        <div className="plab-foot">{foot}</div>
      </div>
    </section>
  );
}
Object.assign(window, { ProcessStackLab });
