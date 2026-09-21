import React from "react";
import { Button } from "../core/Button.jsx";

/* Footer: nome gigante com revelação por máscara (palavra a palavra) — repete a cada entrada
   na viewport via IntersectionObserver dedicado (gated por html.has-reveal-js: se o JS não
   rodar, o nome fica visível por padrão). Descrição/contatos opcionais, nota de rodapé. */
export function SiteFooter({
  brand = "Guilherme Bernardo",
  description = "",
  links = [],
  note,
  className = ""
}) {
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const lang = ctx ? ctx.lang : "pt";
  const finalNote = note || (lang === "en" ? "@2026 ALL RIGHTS RESERVED • THIS SITE IS A STUDY EXPERIMENT" : "@2026 TODOS DIREITOS RESERVADOS • ESSE SITE É UM EXPERIMENTO DE ESTUDO");
  const noteParts = String(finalNote).split(" • ");
  const copiedLabel = lang === "en" ? "Copied!" : "Copiado!";
  const nameRef = React.useRef(null);
  /* depois que "GUILHERME BERNARDO" termina de revelar (palavra a palavra), passa a
     rolar horizontalmente em loop — mesmo comportamento que já existia só no mobile,
     agora também no desktop. O atraso cobre a transição de 900ms + o maior
     transitionDelay entre as palavras (120ms por índice), com uma folga. */
  const [marqueeOn, setMarqueeOn] = React.useState(false);
  React.useEffect(() => {
    const el = nameRef.current;
    if (!el || !("IntersectionObserver" in window)) { setMarqueeOn(true); return undefined; }
    /* o rodapé fica bem na borda do fim da página — com o rootMargin negativo aqui
       embaixo, isIntersecting oscila (sub-pixel/layout jitter de outros elementos)
       mesmo parado, sem novo scroll. Por isso essa transição é só de ida: uma vez que
       o timer completa uma janela contínua de "dentro da viewport", liga o marquee e
       nunca desliga de novo (o pedido é "depois de aparecer, deixa rolando" — não um
       alternador que volta ao nome estático a cada oscilação). */
    let timer = 0;
    let latched = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          el.classList.toggle("is-in", e.isIntersecting || latched);
          if (latched) return;
          if (e.isIntersecting) {
            if (!timer) timer = window.setTimeout(() => { latched = true; setMarqueeOn(true); io.disconnect(); }, 1100);
          } else {
            window.clearTimeout(timer);
            timer = 0;
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(timer); };
  }, []);
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
  const words = typeof brand === "string" ? brand.trim().split(/\s+/) : [brand];
  return (
    <footer className={["gb-footer", marqueeOn ? "gb-footer--marquee" : "", className].filter(Boolean).join(" ")} style={{ position: "relative", overflow: "hidden" }}>
      <p className="gb-footer__name" ref={nameRef} aria-label={brand}>
        {words.map((w, i) => (
          <span className="gb-footer__name-mask" key={w + i}>
            <span className="gb-footer__name-word" aria-hidden="true" style={{ transitionDelay: i * 120 + "ms" }}>{w}</span>
          </span>
        ))}
      </p>
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
        <span>{noteParts[0]}{noteParts.length > 1 ? <React.Fragment> <span className="gb-footer__bottom-bullet" aria-hidden="true">•</span> <span className="gb-footer__bottom-tail">{noteParts[1]}</span></React.Fragment> : null}</span>
      </div>
    </footer>
  );
}
