import React from "react";

/* Eyebrow + hairline rule + title + optional description. Opens every section. */
export function SectionHeader({ eyebrow, index, title, description, align = "left", className = "", children }) {
  return (
    <header className={["gb-sechead", className].filter(Boolean).join(" ")} style={align === "center" ? { alignItems: "center", textAlign: "center" } : undefined}>
      {(eyebrow || index) && (
        <div className="gb-sechead__eyebrow">
          {index ? <span className="gb-sechead__index">{index}</span> : null}
          {eyebrow ? <span className="gb-sechead__index">{eyebrow}</span> : null}
          <span className="gb-sechead__rule" aria-hidden="true" />
        </div>
      )}
      {title ? <h2 className="gb-sechead__title">{title}</h2> : null}
      {description ? <p className="gb-sechead__desc">{description}</p> : null}
      {children}
    </header>
  );
}
