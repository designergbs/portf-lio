/* Icon.jsx (src/components/core/Icon.jsx) renders <i data-lucide="name"> and asks the
   Lucide runtime to swap it for an SVG via window.lucide.createIcons() — the same
   DOM-mutation approach the original export used with the Lucide CDN script. Using the
   npm "lucide" package instead of the CDN keeps that mechanism but makes it a real,
   versioned build dependency. */
import { createIcons, icons } from "lucide";

window.lucide = {
  createIcons: (opts) => createIcons({ icons, ...opts }),
};
