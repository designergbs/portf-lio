import React from "react";
import { IconButton } from "../core/IconButton.jsx";
import { Tooltip } from "../core/Tooltip.jsx";

/* Fixed vertical rail of section shortcuts. Desktop only; the top nav covers smaller widths. */
export function SideRail({ items = [], activeId, onSelect, className = "" }) {
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const lang = ctx ? ctx.lang : "pt";
  return (
    <aside className={["gb-rail", className].filter(Boolean).join(" ")} aria-label={lang === "en" ? "Section shortcuts" : "Atalhos de seção"}>
      {items.map((item) => (
        <Tooltip key={item.id} label={item.label} placement="right">
          <IconButton
            icon={item.icon}
            label={item.label}
            href={"#" + item.id}
            active={activeId === item.id}
            onClick={onSelect ? () => onSelect(item.id) : undefined}
          />
        </Tooltip>
      ))}
    </aside>
  );
}
