import "./react-globals.js";
import "./styles/index.css";

import "./ds-bootstrap.js";

/* Page content + composition, ported from the original export's ui_kits/portfolio/*.
   Load order matters: each of these attaches to `window` and the next one may read
   what the previous one set (i18n -> data -> case content -> page sections -> pages). */
import "./legacy/i18n.js";
import "./legacy/intro.js";
import "./legacy/cursor.js";
import "./legacy/data.js";
import "./legacy/case-trade-in.js";
import "./legacy/case-agibank.js";
import "./legacy/Hero.jsx";
import "./legacy/ProcessStackLab.jsx";
import "./legacy/HomeSections.jsx";
import "./legacy/Home.jsx";
import "./legacy/CaseStudy.jsx";
import "./legacy/CaseTradeIn.jsx";

import App from "./App.jsx";

/* Vanilla-DOM scroll behaviors (about-lead progress line, experience timeline
   scrub, tags-offset sync, reveal-on-scroll) that live outside React on purpose —
   ported verbatim from the original inline <script> tags. */
import "./legacy/dom-enhancements.js";

window.ReactDOM.createRoot(document.getElementById("root")).render(
  <window.GB_LangProvider>
    <App />
  </window.GB_LangProvider>
);
