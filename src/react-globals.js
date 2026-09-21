/* The legacy page-composition files under src/legacy/ (ported from the original
   Stitch/Claude Design export) call `React.useState`, `React.createContext`, etc. as
   bare globals — that's how they ran in the browser before this Vite conversion
   (CDN <script> tags for React + in-browser Babel). Exposing the real npm React/
   ReactDOM on window lets that code run unmodified under a real build, instead of
   forking those files into two copies (one importing React, one not).
   Must be imported before any other legacy module — see src/main.jsx. */
import React from "react";
import ReactDOM from "react-dom/client";
import { createPortal } from "react-dom";

/* react-dom/client só exporta createRoot/hydrateRoot — createPortal vive no pacote
   "react-dom" principal. Sem isso, window.ReactDOM.createPortal ficava undefined e
   todo componente que faz `portal ? portal(...) : node` (menu de idioma mobile,
   painel/modal de acessibilidade, tooltips ⓘ) caía silenciosamente no fallback sem
   portal — o que quebra qualquer um deles se estiver aninhado num ancestral com
   backdrop-filter (a navbar), já que isso cria um containing block novo pra
   position:fixed e o painel passa a se posicionar relativo à navbar, não à viewport. */
window.React = React;
window.ReactDOM = { ...ReactDOM, createPortal };
