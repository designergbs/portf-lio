import React from "react";
import { Icon } from "../core/Icon.jsx";

/* Anel tipográfico decorativo. O heading real da seção continua em texto;
   o SVG é decorativo (aria-hidden) e para de girar sob prefers-reduced-motion.
   Os separadores são círculos SVG (mesmo dot pulsante da pílula de disponibilidade),
   posicionados nos glifos de bullet medidos no textPath. */
export function CircularSectionLabel({
  label = "Projetos",
  repeat = 3,
  size = 132,
  icon = "arrow-down-right",
  href,
  ariaLabel,
  className = ""
}) {
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const lang = ctx ? ctx.lang : "pt";
  const id = React.useMemo(() => "gb-circle-" + Math.random().toString(36).slice(2, 8), []);
  const pathRef = React.useRef(null);
  const textRef = React.useRef(null);
  const [dots, setDots] = React.useState([]);
  const BULLET = "\u2009\u2022\u2009";
  const text = Array.from({ length: repeat }).map(() => label.toUpperCase()).join(BULLET) + BULLET;
  const parts = Array.from({ length: repeat }).flatMap((_, i) => [
    React.createElement("tspan", { key: "l" + i }, label.toUpperCase()),
    React.createElement("tspan", { key: "b" + i, className: "gb-circlabel__bullet" }, BULLET)
  ]);
  React.useEffect(() => {
    const p = pathRef.current;
    const t = textRef.current;
    if (!p || !t) return;
    const len = p.getTotalLength();
    t.setAttribute("lengthAdjust", "spacing");
    t.setAttribute("textLength", String(len));
    let raf = window.requestAnimationFrame(() => {
      const pts = [];
      for (let i = 0; i < text.length; i += 1) {
        if (text[i] !== "\u2022") continue;
        try {
          const box = t.getExtentOfChar(i);
          pts.push({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
        } catch (e) { /* navegador sem medição em textPath */ }
      }
      setDots(pts);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [text, size]);
  const Tag = href ? "a" : "div";
  return (
    <Tag
      className={["gb-circlabel", className].filter(Boolean).join(" ")}
      style={{ width: size, height: size }}
      href={href}
      aria-label={href ? ariaLabel || (lang === "en" ? "Go to " : "Ir para ") + label : undefined}
    >
      <svg className="gb-circlabel__ring" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <path ref={pathRef} id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text>
          <textPath ref={textRef} href={"#" + id} startOffset="0%">{parts}</textPath>
        </text>
        <g className={dots.length ? "gb-circlabel__dots is-measured" : "gb-circlabel__dots"}>
          {dots.map((d, i) => (
            <g key={i}>
              <circle className="gb-circlabel__wave" cx={d.x} cy={d.y} r="5" />
              <circle className="gb-circlabel__dot" cx={d.x} cy={d.y} r="5" />
            </g>
          ))}
        </g>
      </svg>
      <span className="gb-circlabel__icon">
        <Icon name={icon} size={24} />
      </span>
    </Tag>
  );
}
