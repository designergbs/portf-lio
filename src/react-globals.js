/* The legacy page-composition files under src/legacy/ (ported from the original
   Stitch/Claude Design export) call `React.useState`, `React.createContext`, etc. as
   bare globals — that's how they ran in the browser before this Vite conversion
   (CDN <script> tags for React + in-browser Babel). Exposing the real npm React/
   ReactDOM on window lets that code run unmodified under a real build, instead of
   forking those files into two copies (one importing React, one not).
   Must be imported before any other legacy module — see src/main.jsx. */
import React from "react";
import ReactDOM from "react-dom/client";

window.React = React;
window.ReactDOM = ReactDOM;
