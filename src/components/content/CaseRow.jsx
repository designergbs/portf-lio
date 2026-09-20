import React from "react";

const Arrow = () => (
  <span className="gb-arrow" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
  </span>
);

/* Linha de case em largura total: texto em 5 colunas, capa em 7.
   O item inteiro é um único link; hover/foco revelam a cor da capa e deslocam o título. */
export function CaseRow({
  index,
  category,
  title,
  summary,
  image,
  imageAlt,
  href = "#",
  ctaLabel,
  priority = false,
  onClick,
  delay = 0,
  className = ""
}) {
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const lang = ctx ? ctx.lang : "pt";
  const cta = ctaLabel || (lang === "en" ? "View project" : "Ver projeto");
  const openSuffix = lang === "en" ? " \u2014 open case" : " \u2014 abrir case";
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { el.classList.add("is-in"); obs.disconnect(); } });
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <li ref={ref} className={["gb-caserow", "gb-reveal", className].filter(Boolean).join(" ")} style={{ transitionDelay: delay + "ms" }}>
      <a className="gb-caserow__link" href={href} onClick={onClick} aria-label={title + openSuffix}>
        <div className="gb-caserow__body">
          <span className="gb-caserow__meta">{String(category || "").split("•").map((part, i, arr) => (
            <React.Fragment key={i}>{part}{i < arr.length - 1 ? <span className="gb-bullet" aria-hidden="true">•</span> : null}</React.Fragment>
          ))}</span>
          <span className="gb-caserow__rule" aria-hidden="true" />
          <h3 className="gb-caserow__title">{title}</h3>
          <p className="gb-caserow__summary">{summary}</p>
          <span className="gb-caserow__cta">{cta}<Arrow /></span>
        </div>
        <div className="gb-caserow__media">
          <img src={image} alt={imageAlt} loading={priority ? "eager" : "lazy"} decoding="async" />
        </div>
      </a>
    </li>
  );
}
