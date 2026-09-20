import React from "react";
import { Icon } from "./Icon.jsx";

/* Floating "back to top" pill: appears near the end of the page, scrolls back smoothly. */
export function BackToTop({ label, threshold = 0.8, className = "" }) {
  const ctx = typeof window !== "undefined" && window.useLang ? window.useLang() : null;
  const lang = ctx ? ctx.lang : "pt";
  const finalLabel = label || (lang === "en" ? "Back to top" : "Voltar ao topo");
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setShown(max > 400 && window.scrollY / max >= threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [threshold]);
  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <button
      type="button"
      className={["gb-totop", shown ? "is-shown" : "", className].filter(Boolean).join(" ")}
      onClick={toTop}
      aria-label={finalLabel}
      aria-hidden={shown ? undefined : "true"}
      tabIndex={shown ? 0 : -1}
    >
      <Icon name="arrow-up" size={18} />
      <span className="gb-totop__label">{finalLabel}</span>
    </button>
  );
}
