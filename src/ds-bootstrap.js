/* Wires the real ES-module design-system components (src/components/**) into the
   window.GuilhermeBernardoPortfolioDS_97bb82 namespace that the page-composition
   files under src/legacy/ (ported from the original Stitch/Claude Design export)
   expect via `const { X } = window.GuilhermeBernardoPortfolioDS_97bb82`. Importing
   from real .jsx modules (instead of the bundled _ds_bundle.js) means every
   component is now built, tree-shaken and hot-reloaded by Vite like normal React. */
import { Button } from "./components/core/Button.jsx";
import { Icon } from "./components/core/Icon.jsx";
import { IconButton } from "./components/core/IconButton.jsx";
import { Tag } from "./components/core/Tag.jsx";
import { TextLink } from "./components/core/TextLink.jsx";
import { Tooltip } from "./components/core/Tooltip.jsx";
import { AvailabilityBadge } from "./components/core/AvailabilityBadge.jsx";
import { BackToTop } from "./components/core/BackToTop.jsx";
import { LanguageSwitch } from "./components/core/LanguageSwitch.jsx";
import { AccessibilityPrefs } from "./components/core/AccessibilityPrefs.jsx";

import { SectionHeader } from "./components/content/SectionHeader.jsx";
import { CaseRow } from "./components/content/CaseRow.jsx";
import { CircularSectionLabel } from "./components/content/CircularSectionLabel.jsx";
import { ExperienceCard } from "./components/content/ExperienceCard.jsx";
import { Timeline } from "./components/content/Timeline.jsx";
import { ToolCard } from "./components/content/ToolCard.jsx";

import { TopNav } from "./components/navigation/TopNav.jsx";
import { SideRail } from "./components/navigation/SideRail.jsx";

import { Reveal } from "./components/motion/Reveal.jsx";
import { SkillsMarquee } from "./components/motion/SkillsMarquee.jsx";

import { ContactBlock } from "./components/blocks/ContactBlock.jsx";
import { SiteFooter } from "./components/blocks/SiteFooter.jsx";

window.GuilhermeBernardoPortfolioDS_97bb82 = {
  Button, Icon, IconButton, Tag, TextLink, Tooltip, AvailabilityBadge, BackToTop,
  LanguageSwitch, AccessibilityPrefs,
  SectionHeader, CaseRow, CircularSectionLabel, ExperienceCard, Timeline, ToolCard,
  TopNav, SideRail,
  Reveal, SkillsMarquee,
  ContactBlock, SiteFooter,
};
