import React from "react";
import { Icon } from "../core/Icon.jsx";

/* A tool plus what it is actually used for — never a bare logo wall. */
export function ToolCard({ name, icon = "square", use, stage, className = "" }) {
  return (
    <div className={["gb-tool", className].filter(Boolean).join(" ")}>
      <span className="gb-tool__glyph"><Icon name={icon} size={24} /></span>
      <div>
        <div className="gb-tool__name">{name}</div>
        {use ? <p className="gb-tool__use">{use}</p> : null}
        {stage ? <span className="gb-tool__stage">{stage}</span> : null}
      </div>
    </div>
  );
}
