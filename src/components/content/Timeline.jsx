import React from "react";

/* Career timeline. Each item is a period column plus free content (usually an ExperienceCard). */
export function Timeline({ items = [], className = "" }) {
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const lang = ctx ? ctx.lang : "pt";
  return (
    <div className={["gb-timeline", className].filter(Boolean).join(" ")}>
      {items.map((item, i) => (
        <div className="gb-timeline__item" key={item.period + i}>
          <div className="gb-timeline__period">
            <span className={"gb-timeline__node" + (item.current ? " is-current" : "")}>{item.period}</span>
            {item.place ? <span>{item.place}</span> : null}
            {item.current ? <span style={{ color: "var(--text-signal)" }}>{lang === "en" ? "current" : "atual"}</span> : null}
          </div>
          <div>{item.content}</div>
        </div>
      ))}
    </div>
  );
}
