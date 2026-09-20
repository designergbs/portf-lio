import React from "react";
import { Icon } from "./Icon.jsx";

/* Mono pill for skills, categories, stacks and metadata. */
export function Tag({ children, icon, size = "sm", interactive = false, className = "", ...rest }) {
  const cls = [
    "gb-tag",
    size === "lg" ? "gb-tag--lg" : "",
    interactive ? "gb-tag--interactive" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cls} {...rest}>
      {icon ? <Icon name={icon} size={size === "lg" ? 16 : 14} /> : null}
      <span>{children}</span>
    </span>
  );
}
