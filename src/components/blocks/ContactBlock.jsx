import React from "react";
import { Button } from "../core/Button.jsx";
import { AvailabilityBadge } from "../core/AvailabilityBadge.jsx";

/* Closing contact block: availability signal, statement and contact actions. */
export function ContactBlock({
  title = "Vamos bater um papo?",
  description,
  links = [],
  cta = { label: "Agendar bate papo", href: "#", icon: "calendar" },
  available = true,
  availabilityLabel = "Disponível para oportunidades",
  className = ""
}) {
  const [copied, setCopied] = React.useState(null);
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const lang = ctx ? ctx.lang : "pt";
  const copiedLabel = lang === "en" ? "Copied!" : "Copiado!";
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
    <section className={["gb-contact", className].filter(Boolean).join(" ")} id="contato" style={{ position: "relative", overflow: "hidden" }}>
      <span className="gb-beam-h" style={{ top: 0, bottom: "auto" }} aria-hidden="true" />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", alignItems: "center", textAlign: "center" }}>
        <AvailabilityBadge available={available} label={availabilityLabel} />
        <h2 className="gb-contact__title">{title}</h2>
        {description ? <p style={{ color: "var(--text-secondary)", fontSize: "var(--type-body-lg-size)", lineHeight: "var(--type-body-lg-lh)", maxWidth: "52ch" }}>{description}</p> : null}
        <div className="gb-contact__actions" style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}>
          {cta ? <Button className="gb-contact__cta" variant="primary" size="lg" href={cta.href} icon={cta.icon || "calendar"} iconPosition="left">{cta.label}</Button> : null}
        </div>
        {links.length ? (
          <div className="gb-contact__links" style={{ display: "flex", gap: "var(--space-5)", flexWrap: "wrap", justifyContent: "center", marginTop: "var(--space-10)" }}>
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
    </section>
  );
}
