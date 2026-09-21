export {};
/* Conteúdo do portfólio, agora vindo do Supabase (get_home_bootstrap) em vez do
   objeto estático que existia aqui antes. window.GB continua sendo o mesmo
   proxy que resolve para o idioma ativo, então Home.jsx/HomeSections.jsx/Hero.jsx
   não precisaram mudar uma linha — só a origem do dado mudou.

   O banco guarda esse conteúdo (sobre, experiência, cases...) nas colunas
   *_en (migração 009) e get_home_bootstrap(p_locale) já devolve os valores em
   inglês com fallback pro português quando faltar tradução (migração 010).
   Por isso buscamos os dois locales em paralelo aqui. */
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
const PROCESS_STEPS_PT = [
  { title: "Imersão e estratégia", icon: "search", body: "Investigo o contexto do produto, necessidades dos usuários e objetivos do negócio. Transformo pesquisas, dados e conversas com stakeholders em problemas claros, prioridades e critérios de sucesso para orientar a solução." },
  { title: "Interface e prototipação", icon: "layout", body: "Estruturo jornadas, fluxos e interfaces a partir dos aprendizados da pesquisa. Exploro soluções em protótipos, testo hipóteses e avalio usabilidade e acessibilidade. Refino a experiência com base em evidências e feedbacks dos usuários." },
  { title: "Implementação e otimização", icon: "line-chart", body: "Trabalho em parceria com desenvolvimento, detalhando comportamentos e componentes. Acompanho a implementação para garantir consistência na experiência. Após o lançamento, analiso dados e feedbacks para orientar melhorias contínuas." }
];
const PROCESS_STEPS_EN = [
  { title: "Immersion and strategy", icon: "search", body: "I investigate the product's context, user needs and business goals. I turn research, data and stakeholder conversations into clear problems, priorities and success criteria to guide the solution." },
  { title: "Interface and prototyping", icon: "layout", body: "I structure journeys, flows and interfaces based on research findings. I explore solutions through prototypes, test hypotheses and assess usability and accessibility. I refine the experience based on evidence and user feedback." },
  { title: "Implementation and optimization", icon: "line-chart", body: "I work in partnership with development, detailing behaviors and components. I follow implementation to ensure consistency in the experience. After launch, I analyze data and feedback to guide continuous improvements." }
];

const [{ data: bootstrapPt, error: errorPt }, { data: bootstrapEn, error: errorEn }] = await Promise.all([
  supabase.rpc("get_home_bootstrap", { p_locale: "PT" }),
  supabase.rpc("get_home_bootstrap", { p_locale: "EN" }),
]);
if (errorPt) console.error("[data] get_home_bootstrap(PT) falhou:", errorPt);
if (errorEn) console.error("[data] get_home_bootstrap(EN) falhou:", errorEn);

function shape(b, processSteps) {
  b = b || {};
  return {
    brand: b.brand || "Guilherme Bernardo",
    nav: b.nav || [],
    rail: b.rail || [],
    about: b.about || {},
    experience: b.experience || [],
    cases: b.cases || [],
    skillsRowOne: SKILLS_ROW_ONE,
    skillsRowTwo: SKILLS_ROW_TWO,
    process: processSteps,
    tools: b.tools || [],
    contact: { links: ((b.contact && b.contact.links) || []).map((l) => (
      typeof l.href === "string" && l.href.startsWith("mailto:")
        ? { label: l.label, icon: l.icon, copy: l.href.slice("mailto:".length).split("?")[0] }
        : l
    )) },
  };
}

window.GB_DATA = {
  pt: shape(bootstrapPt, PROCESS_STEPS_PT),
  en: shape(bootstrapEn || bootstrapPt, PROCESS_STEPS_EN),
};
window.GB = new Proxy({}, { get: function (_, prop) { return window.GB_DATA[window.GB_LANG || "pt"][prop]; } });
