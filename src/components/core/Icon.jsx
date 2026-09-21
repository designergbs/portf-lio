import React from "react";
import * as lucideIcons from "lucide-react";

/* Lucide glyph, rendered as a real React component (lucide-react) instead of
   an <i data-lucide> swapped for an <svg> by window.lucide.createIcons().
   That imperative swap mutated the DOM outside React's control: whenever a
   surrounding element re-rendered (e.g. the side rail highlighting the active
   section on scroll), React could reconcile that spot before/without lucide's
   swap ever landing, leaving a permanently empty <i> — invisible icon, but
   the pill/active-state styling (pure CSS) still showed. Rendering the SVG
   through React removes that race entirely.
   Uses the full module namespace (not lucide-react's `icons` map) because a
   few names still used across this project — "home", "line-chart" — are
   older aliases ("House", "ChartLine" today) that are exported directly but
   left out of that map. */
const toPascalCase = (name) =>
  name.replace(/(\w)(\w*)(_|-|\s*)/g, (_match, first, rest) => first.toUpperCase() + rest.toLowerCase());

export function Icon({ name, size = 16, strokeWidth = 1.5, className = "", style }) {
  const LucideIcon = name ? lucideIcons[toPascalCase(name)] : null;
  if (!LucideIcon) {
    if (import.meta.env.DEV && name) {
      console.warn(`[Icon] "${name}" (${toPascalCase(name)}) not found in lucide-react.`);
    }
    return (
      <span aria-hidden="true" className={className} style={{ display: "inline-flex", width: size, height: size, ...style }} />
    );
  }
  return (
    <LucideIcon
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      style={{ display: "inline-flex", flex: "none", ...style }}
    />
  );
}
