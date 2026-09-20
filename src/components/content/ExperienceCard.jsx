import React from "react";
import { Tag } from "../core/Tag.jsx";

/* One role: logo, cargo, empresa, contexto, contribuições, competências. */
export function ExperienceCard({ role, company, logo, context, contributions = [], products = [], tags = [], className = "" }) {
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const lang = ctx ? ctx.lang : "pt";
  const viewLabel = lang === "en" ? "View responsibilities" : "Ver atribuições";
  return (
    <article className={["gb-exp", className].filter(Boolean).join(" ")}>
      <div className="gb-exp__top">
        {logo ? (
          <div className="gb-exp__logo">
            <img src={logo} alt={company} />
          </div>
        ) : null}
        <div>
          <h3 className="gb-exp__role">{role}</h3>
          <div className="gb-exp__company">{company}</div>
        </div>
      </div>
      {context ? <p className="gb-exp__context">{context}</p> : null}
      {contributions.length ? (
        <details className="gb-exp__disc">
          <summary className="gb-exp__disc-sum">{viewLabel}</summary>
          <ul className="gb-exp__list">
            {contributions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </details>
      ) : null}
      {products.map((p) => (
        <div className="gb-exp__prod" key={p.label}>
          <div className="gb-exp__prod-head">
            <p className="gb-exp__context">{p.label}</p>
            {p.period ? <span className="gb-exp__prod-period">{p.period}</span> : null}
          </div>
          {p.contributions && p.contributions.length ? (
            <details className="gb-exp__disc">
              <summary className="gb-exp__disc-sum">{viewLabel}</summary>
              <ul className="gb-exp__list">
                {p.contributions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ))}
      {tags.length ? (
        <div className="gb-exp__tags">
          {tags.map((t, i) => (
            <Tag key={i}>{t}</Tag>
          ))}
        </div>
      ) : null}
    </article>
  );
}
