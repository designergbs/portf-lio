import React from "react";

/* Hover/focus tooltip. Wraps the trigger; shows on hover and on keyboard focus. */
export function Tooltip({ children, label, placement = "right", className = "" }) {
  return (
    <span className={["gb-tooltip", className].filter(Boolean).join(" ")}>
      {children}
      <span className={"gb-tooltip__bubble gb-tooltip__bubble--" + placement} role="tooltip">
        {label}
      </span>
    </span>
  );
}
