import React from "react";
import { Icon } from "./Icon.jsx";

/* Inline link with an underline rule and optional trailing glyph. */
export function TextLink({ children, href, icon = "arrow-right", quiet = false, external = false, className = "", ...rest }) {
  const cls = ["gb-link", quiet ? "gb-link--quiet" : "", className].filter(Boolean).join(" ");
  return (
    <a
      href={href}
      className={cls}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      {...rest}
    >
      <span>{children}</span>
      {icon ? <Icon name={icon} size={14} /> : null}
    </a>
  );
}
