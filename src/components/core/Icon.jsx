import React from "react";

/* Lucide glyph. Renders <i data-lucide> and asks the Lucide runtime to swap it for an SVG.
   Load Lucide once per page: <script src="https://unpkg.com/lucide@latest"></script> */
export function Icon({ name, size = 16, strokeWidth = 1.5, className = "", style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons({ attrs: { "stroke-width": strokeWidth } });
    }
  }, [name, strokeWidth]);
  return (
    <i
      ref={ref}
      data-lucide={name}
      aria-hidden="true"
      className={className}
      style={{ display: "inline-flex", width: size, height: size, ...style }}
    />
  );
}
