import React from "react";

/* The only place green appears: a functional availability signal. */
export function AvailabilityBadge({ label = "Disponível para oportunidades", aux, available = true, className = "" }) {
  const cls = ["gb-avail", available ? "" : "gb-avail--off", className].filter(Boolean).join(" ");
  return (
    <span className={cls} role="status">
      <span className="gb-avail__dot" aria-hidden="true" />
      <span>{label}</span>
      {aux ? <span className="gb-avail__aux">· {aux}</span> : null}
    </span>
  );
}
