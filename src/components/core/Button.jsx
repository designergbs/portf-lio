import React from "react";
import { Icon } from "./Icon.jsx";

/* Primary / secondary / ghost pill button. Renders an <a> when href is set. */
export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  icon,
  iconPosition = "right",
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ...rest
}) {
  const cls = ["gb-btn", "gb-btn--" + variant, "gb-btn--" + size, fullWidth ? "gb-btn--full" : "", className]
    .filter(Boolean)
    .join(" ");
  const glyph = icon ? <span className="gb-btn__icon" key={icon}><Icon name={icon} size={16} /></span> : null;
  const content = (
    <>
      {loading ? <span className="gb-btn__spinner" /> : iconPosition === "left" ? glyph : null}
      <span className="gb-btn__label">{children}</span>
      {!loading && iconPosition === "right" ? glyph : null}
    </>
  );
  if (href && !disabled) {
    return (
      <a href={href} className={cls} onClick={onClick} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading ? "true" : undefined}
      aria-busy={loading ? "true" : undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
