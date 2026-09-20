export {};
/* Conteúdo do portfólio, agora vindo do Supabase (get_home_bootstrap) em vez do
   objeto estático que existia aqui antes. window.GB continua sendo o mesmo
   proxy que resolve para o idioma ativo, então Home.jsx/HomeSections.jsx/Hero.jsx
   não precisaram mudar uma linha — só a origem do dado mudou.

   O banco hoje guarda esse conteúdo (sobre, experiência, cases...) só em
   português — troque get_home_bootstrap('EN'...) e adicione uma coluna de
   locale nas tabelas de conteúdo se quiser paridade total em inglês; por ora
   trocar de idioma continua trocando os textos de UI (window.gbT, i18n.js),
   só este bloco de "conteúdo de negócio" fica igual nas duas línguas. */
import { supabase } from "../lib/supabaseClient.js";

/* Marquee de competências e os 3 passos do processo nunca entraram no schema
   pedido (SiteSettings/AboutInfo/Experience/ToolItem/CaseStudy/Translation) —
   são só apresentação, então continuam estáticos aqui, copiados do conteúdo
   original. */
const SKILLS_ROW_ONE = [
  { label: "Product Design", icon: "layout" }, { label: "Visual Design", icon: "monitor-smartphone" },
  { label: "Information Architecture", icon: "folder-tree" }, { label: "User Flows & Wireframes", icon: "git-branch" },
  { label: "Prototyping", icon: "mouse-pointer-click" }, { label: "UX Research", icon: "search" },
  { label: "Product Discovery", icon: "compass" }, { label: "Journey Mapping", icon: "route" },
  { label: "Experience Metrics", icon: "line-chart" }
];
const SKILLS_ROW_TWO = [
  { label: "UX/UI Design", icon: "pen-tool" }, { label: "Visual Design", icon: "palette" },
  { label: "Design System", icon: "component" }, { label: "Usability Testing", icon: "target" },
  { label: "UX Writing", icon: "type" }, { label: "Handoff", icon: "share-2" },
  { label: "Design Systems", icon: "boxes" }, { label: "Accessibility", icon: "accessibility" },
  { label: "Discovery & Delivery", icon: "workflow" }, { label: "Artificial Intelligence", icon: "sparkles" }
];
const PROCESS_STEPS = [
  { title: "Imersão e estratégia", icon: "search", body: "Investigo o contexto do produto, necessidades dos usuários e objetivos do negócio. Transformo pesquisas, dados e conversas com stakeholders em problemas claros, prioridades e critérios de sucesso para orientar a solução." },
  { title: "Interface e prototipação", icon: "layout", body: "Estruturo jornadas, fluxos e interfaces a partir dos aprendizados da pesquisa. Exploro soluções em protótipos, testo hipóteses e avalio usabilidade e acessibilidade. Refino a experiência com base em evidências e feedbacks dos usuários." },
  { title: "Implementação e otimização", icon: "line-chart", body: "Trabalho em parceria com desenvolvimento, detalhando comportamentos e componentes. Acompanho a implementação para garantir consistência na experiência. Após o lançamento, analiso dados e feedbacks para orientar melhorias contínuas." }
];

const { data: bootstrap, error } = await supabase.rpc("get_home_bootstrap", { p_locale: "PT" });
if (error) console.error("[data] get_home_bootstrap falhou:", error);
const b = bootstrap || {};

const shaped = {
  brand: b.brand || "Guilherme Bernardo",
  nav: b.nav || [],
  rail: b.rail || [],
  about: b.about || {},
  experience: b.experience || [],
  cases: b.cases || [],
  skillsRowOne: SKILLS_ROW_ONE,
  skillsRowTwo: SKILLS_ROW_TWO,
  process: PROCESS_STEPS,
  tools: b.tools || [],
  contact: { links: (b.contact && b.contact.links) || [] },
};

window.GB_DATA = { pt: shaped, en: shaped };
window.GB = new Proxy({}, { get: function (_, prop) { return window.GB_DATA[window.GB_LANG || "pt"][prop]; } });
