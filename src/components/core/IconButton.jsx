import React from "react";
import { Icon } from "./Icon.jsx";

/* Square icon-only control. Used in the side rail and compact toolbars. */
export function IconButton({
  icon,
  label,
  variant = "plain",
  size = "md",
  href,
  active = false,
  disabled = false,
  onClick,
  className = "",
  ...rest
}) {
  const cls = [
    "gb-iconbtn",
    variant === "outline" ? "gb-iconbtn--outline" : "",
    size === "sm" ? "gb-iconbtn--sm" : "",
    active ? "is-active" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");
  const inner = <Icon name={icon} size={size === "sm" ? 14 : 16} />;
  if (href && !disabled) {
    const external = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        className={cls}
        aria-label={label}
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer noopener" : undefined}
        {...rest}
      >
        {inner}
      </a>
    );
  }
  return (
    <button type="button" className={cls} aria-label={label} onClick={onClick} disabled={disabled} {...rest}>
      {inner}
    </button>
  );
}
