import React from "react";

/* Section entrance: fade + short vertical rise, once, with optional stagger.
   No-ops under prefers-reduced-motion (CSS keeps the resting state visible). */
export function Reveal({ children, delay = 0, as = "div", className = "", ...rest }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            obs.disconnect();
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as;
  return (
    <Tag ref={ref} className={["gb-reveal", className].filter(Boolean).join(" ")} style={{ transitionDelay: delay + "ms" }} {...rest}>
      {children}
    </Tag>
  );
}
