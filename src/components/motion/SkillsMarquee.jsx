import React from "react";
import { Tag } from "../core/Tag.jsx";

function Row({ items, direction, ariaLabel }) {
  const set = (clone) => (
    <div className={"gb-marquee__set" + (clone ? " gb-marquee__set--clone" : "")} aria-hidden={clone ? "true" : undefined}>
      {items.map((item) => (
        <Tag key={(clone ? "c-" : "") + item.label} size="lg" icon={item.icon} interactive>
          {item.label}
        </Tag>
      ))}
    </div>
  );
  return (
    <div className="gb-marquee">
      <div className={"gb-marquee__track gb-marquee__track--" + direction} role="list" aria-label={ariaLabel}>
        {set(false)}
        {set(true)}
      </div>
    </div>
  );
}

/* Bidirectional infinite marquee of competência chips.
   Row one drifts left, row two drifts right, both pause on hover/focus.
   Duplicated sets are hidden from assistive tech; reduced motion falls back to a static list. */
export function SkillsMarquee({ rowOne = [], rowTwo = [], className = "" }) {
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const lang = ctx ? ctx.lang : "pt";
  return (
    <div className={["gb-marquee-group", className].filter(Boolean).join(" ")} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <Row items={rowOne} direction="left" ariaLabel={lang === "en" ? "Skills, group 1" : "Competências, grupo 1"} />
      <Row items={rowTwo} direction="right" ariaLabel={lang === "en" ? "Skills, group 2" : "Competências, grupo 2"} />
    </div>
  );
}
