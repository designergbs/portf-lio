import React from "react";
import { Button } from "../core/Button.jsx";

/* Footer: nome gigante em rolagem horizontal contínua (marquee), sem animação de
   entrada — mesmo comportamento em mobile e desktop, sem depender de scroll/observer.
   Descrição/contatos opcionais, nota de rodapé. */
export function SiteFooter({
  brand = "Guilherme Bernardo",
  description = "",
  links = [],
  note,
  className = ""
}) {
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const lang = ctx ? ctx.lang : "pt";
  const finalNote = note || (lang === "en" ? "@2026 ALL RIGHTS RESERVED • THIS SITE IS A STUDY EXPERIMENT" : "SITE CRIADO POR MIM COMO UM EXPERIMENTO DE ESTUDO • © 2026 TODOS DIREITOS RESERVADOS");
  const noteParts = String(finalNote).split(" • ");
  const copiedLabel = lang === "en" ? "Copied!" : "Copiado!";
  const [copied, setCopied] = React.useState(null);
  const copy = (text, label) => {
    const done = () => { setCopied(label); window.setTimeout(() => setCopied(null), 1200); };
    const fallback = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (e) { /* clipboard indisponível */ }
      done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  };
  return (
    <footer className={["gb-footer", "gb-footer--marquee", className].filter(Boolean).join(" ")} style={{ position: "relative", overflow: "hidden" }}>
      <span className="gb-sr-only">{brand}</span>
      <div className="gb-footer__marquee" aria-hidden="true">
        <div className="gb-footer__marquee-track">
          <span className="gb-footer__marquee-item">{brand}</span>
          <span className="gb-footer__marquee-item">{brand}</span>
        </div>
      </div>
      <div className="gb-bleed gb-footer__hairline" aria-hidden="true" />
      {description || links.length ? (
        <div className="gb-footer__content" data-reveal-group>
          {description ? <p className="gb-footer__desc" data-reveal-card>{description}</p> : null}
          {links.length ? (
            <div className="gb-footer__links" data-reveal-card>
              {links.map((l) => (
                l.copy ? (
                  <Button
                    key={l.label}
                    variant="secondary"
                    icon={copied === l.label ? "check" : (l.icon || "copy")}
                    iconPosition="left"
                    onClick={() => copy(l.copy, l.label)}
                    aria-live="polite"
                    className={copied === l.label ? "is-copied" : ""}
                  >
                    {copied === l.label ? copiedLabel : l.label}
                  </Button>
                ) : (
                  <Button key={l.label + l.href} variant="secondary" href={l.href} icon={l.icon || "arrow-up-right"} iconPosition="left">{l.label}</Button>
                )
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="gb-footer__bottom">
        <span className="gb-sr-only">{finalNote}</span>
        <div className="gb-footer__bottom-track" aria-hidden="true">
          {Array.from({ length: 40 }).map((_, i) => (
            <span className="gb-footer__bottom-item" key={i}>
              {noteParts[0]}
              <span className="gb-footer__bottom-bullet">{" • "}</span>
              {noteParts.length > 1 ? noteParts[1] : null}
              <span className="gb-footer__bottom-bullet">{" • "}</span>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
