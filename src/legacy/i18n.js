/* Internacionalização central do portfólio. Define window.GB_LANG (idioma ativo),
   window.gbT (lookup de strings de interface) e o provider/hook React usados pelas
   páginas para reagir a troca de idioma sem perder scroll, formulários ou animação
   de abertura. Roda antes de qualquer outro script para não piscar o idioma errado. */
(function () {
  var STORAGE_KEY = "gb-lang";
  function detect() {
    var m = /(?:^|[?&])lang=(pt|en)(?:&|$)/.exec(location.search);
    if (m) return m[1];
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      if (s === "pt" || s === "en") return s;
    } catch (e) { /* storage indisponível */ }
    return "pt";
  }
  window.GB_LANG = detect();
  document.documentElement.lang = window.GB_LANG === "en" ? "en" : "pt-BR";

  var UI = {
    pt: {
      nav: { aria: "Navegação principal", brandHomeSuffix: " \u2014 início" },
      buttons: {
        resume: "Currículo", talk: "Vamos conversar?", viewProjects: "Conhecer projetos",
        scheduleChat: "Agendar bate-papo", backHome: "Voltar para o início", openNextCase: "Abrir próximo case",
        viewProject: "Ver projeto", viewResponsibilities: "Ver atribuições",
        prevImprovement: "Melhoria anterior", nextImprovement: "Próxima melhoria", openPrototype: "Acessar protótipo"
      },
      hero: {
        availability: "Disponível para oportunidades",
        propLines: ["Há mais de 7 anos, conecto pessoas, negócios e tecnologia por", "meio de experiências digitais."]
      },
      about: { specialties: "Especialidades" },
      sections: {
        projectsEyebrow: "Projetos", projectsTitle: "Projetos em que trabalhei",
        experienceEyebrow: "Experiência", experienceTitle: "Minha jornada até aqui",
        processEyebrow: "Processos", processTitle: "Como transformo problemas em soluções",
        toolsSubhead: "FERRAMENTAS", toolsAria: "Ferramentas do dia a dia",
        aboutEyebrow: "Sobre", aboutTitle: "Guilherme aqui, mas pode chamar de Gui.",
        aboutPortraitAlt: "Retrato de Guilherme Bernardo"
      },
      process: { steps: ["DESCOBRIR E DEFINIR", "DESENVOLVER E VALIDAR", "ENTREGAR E EVOLUIR"] },
      contact: {
        availability: "Disponível para novos desafios", title: "Vamos bater um papo?",
        description: "Tem uma oportunidade em mente ou quer conhecer meu trabalho? Escolha um horário na agenda e vamos conversar.",
        cta: "Agendar bate-papo"
      },
      footer: { note: "@2026 TODOS DIREITOS RESERVADOS \u2022 ESSE SITE É UM EXPERIMENTO DE ESTUDO", copied: "Copiado!", backToTop: "Voltar ao topo" },
      railAria: "Atalhos de seção",
      marqueeAria: { group1: "Competências, grupo 1", group2: "Competências, grupo 2" },
      circularGoTo: "Ir para ",
      caseRowOpenSuffix: " \u2014 abrir case",
      caseCommon: {
        crumbsAria: "Você está aqui", home: "Início", projects: "Projetos",
        metaLabels: ["Empresa", "Período", "Papel", "Time", "Plataformas"],
        teamPlaceholder: "[placeholder: composição do time]", platformsPlaceholder: "[placeholder: plataformas]",
        bodyHeadings: [
          ["Contexto", "[placeholder: qual era a situação do produto, o problema de negócio e as restrições.]"],
          ["Meu papel", "[placeholder: o que estava sob minha responsabilidade e como o time se organizou.]"],
          ["Processo", "[placeholder: discovery, pesquisa, fluxos, protótipos, testes e handoff.]"],
          ["Decisões de design", "[placeholder: as duas ou três decisões que definiram a solução.]"],
          ["Resultado", "[placeholder: resultado observado — inserir apenas métricas confirmadas.]"]
        ],
        figurePlaceholder: "[placeholder: imagem do processo — fluxo, wireframe ou tela]",
        nextCaseEyebrow: "Próximo case", before: "Antes", after: "Depois", beforeAfter: "Antes x Depois",
        inAction: "Em ação", imagePlaceholder: "imagem", imagePendingPrefix: "[imagem pendente: ",
        backLabel: "Voltar", nextCaseWord: "Próximo case", openCaseWord: "Abrir case",
        projectSectionsAria: "Seções do projeto",
        altScreen: "Tela da jornada \u2014 ", altPrevFlow: "Fluxo anterior \u2014 tela ", altNewFlow: "Jornada modernizada \u2014 tela ", openingImage: "imagem de abertura", closeImage: "Fechar imagem ampliada", enlargeImage: "Ampliar imagem"
      },
      caseTradeIn: {
        heroStats: [
          { kind: "count", prefix: "+", value: 13, suffix: " p.p.", final: "+13 p.p.", label: "Taxa de conclusão", desc: "Aumento de 13 pontos percentuais na taxa de conclusão." },
          { kind: "count", prefix: "\u2212", value: 34, suffix: "%", final: "\u221234%", label: "Abandono na pré-avaliação", desc: "Redução de 34% no abandono durante a pré-avaliação." },
          { kind: "steps", parts: ["8", "\u2192", "4"], final: "8 \u2192 4", label: "Simplificação da pré-avaliação", desc: "Redução da pré-avaliação de 8 etapas para 4 blocos." }
        ],
        panelStats: [
          { kind: "count", prefix: "+", value: 13, suffix: " p.p.", final: "+13 p.p.", label: "Mais conclusão", desc: "Taxa elevada de conclusão da jornada" },
          { kind: "count", prefix: "\u2212", value: 34, suffix: "%", final: "\u221234%", label: "Menos abandono", desc: "Queda durante\npré-avaliação" },
          { kind: "steps", parts: ["8", "\u2192", "4"], final: "8 \u2192 4", label: "Fluxo simplificado", desc: "Etapas agrupadas em quatro blocos" }
        ],
        heroBreakAfter: ["a uma experiência"], leadBreakAfter: ["base whitelabel,", "13 pontos"]
      }
    },
    en: {
      nav: { aria: "Main navigation", brandHomeSuffix: " \u2014 home" },
      buttons: {
        resume: "Resume", talk: "Let's talk?", viewProjects: "View projects",
        scheduleChat: "Schedule a chat", backHome: "Back to home", openNextCase: "Open next case",
        viewProject: "View project", viewResponsibilities: "View responsibilities",
        prevImprovement: "Previous improvement", nextImprovement: "Next improvement", openPrototype: "Open prototype"
      },
      hero: {
        availability: "Open to opportunities",
        propLines: ["For over 7 years, I've connected people, businesses and technology", "through digital experiences."]
      },
      about: { specialties: "Specialties" },
      sections: {
        projectsEyebrow: "Projects", projectsTitle: "Projects I've worked on",
        experienceEyebrow: "Experience", experienceTitle: "My journey so far",
        processEyebrow: "Process", processTitle: "How I turn problems into solutions",
        toolsSubhead: "TOOLS", toolsAria: "Everyday tools",
        aboutEyebrow: "About", aboutTitle: "Guilherme here, but call me Gui.",
        aboutPortraitAlt: "Portrait of Guilherme Bernardo"
      },
      process: { steps: ["DISCOVER & DEFINE", "DEVELOP & VALIDATE", "DELIVER & EVOLVE"] },
      contact: {
        availability: "Open to new challenges", title: "Want to grab a chat?",
        description: "Want to talk about an opportunity or learn more about\nmy work? Just pick the best time on the calendar ;)",
        cta: "Schedule a chat"
      },
      footer: { note: "@2026 ALL RIGHTS RESERVED \u2022 THIS SITE IS A STUDY EXPERIMENT", copied: "Copied!", backToTop: "Back to top" },
      railAria: "Section shortcuts",
      marqueeAria: { group1: "Skills, group 1", group2: "Skills, group 2" },
      circularGoTo: "Go to ",
      caseRowOpenSuffix: " \u2014 open case",
      caseCommon: {
        crumbsAria: "You are here", home: "Home", projects: "Projects",
        metaLabels: ["Company", "Period", "Role", "Team", "Platforms"],
        teamPlaceholder: "[placeholder: team composition]", platformsPlaceholder: "[placeholder: platforms]",
        bodyHeadings: [
          ["Context", "[placeholder: the product's situation, the business problem and the constraints.]"],
          ["My role", "[placeholder: what was under my responsibility and how the team was organized.]"],
          ["Process", "[placeholder: discovery, research, flows, prototypes, testing and handoff.]"],
          ["Design decisions", "[placeholder: the two or three decisions that defined the solution.]"],
          ["Result", "[placeholder: observed result — insert only confirmed metrics.]"]
        ],
        figurePlaceholder: "[placeholder: process image — flow, wireframe or screen]",
        nextCaseEyebrow: "Next case", before: "Before", after: "After", beforeAfter: "Before x After",
        inAction: "In action", imagePlaceholder: "image", imagePendingPrefix: "[image pending: ",
        backLabel: "Back", nextCaseWord: "Next case", openCaseWord: "Open case",
        projectSectionsAria: "Project sections",
        altScreen: "Journey screen \u2014 ", altPrevFlow: "Previous flow \u2014 screen ", altNewFlow: "Modernized journey \u2014 screen ", openingImage: "opening image", closeImage: "Close enlarged image", enlargeImage: "Enlarge image"
      },
      caseTradeIn: {
        heroStats: [
          { kind: "count", prefix: "+", value: 13, suffix: " p.p.", final: "+13 p.p.", label: "Completion rate", desc: "13 percentage point increase in the completion rate." },
          { kind: "count", prefix: "\u2212", value: 34, suffix: "%", final: "\u221234%", label: "Pre-assessment drop-off", desc: "34% reduction in drop-off during pre-assessment." },
          { kind: "steps", parts: ["8", "\u2192", "4"], final: "8 \u2192 4", label: "Simplified pre-assessment", desc: "Pre-assessment reduced from 8 steps to 4 blocks." }
        ],
        panelStats: [
          { kind: "count", prefix: "+", value: 13, suffix: " p.p.", final: "+13 p.p.", label: "More completions", desc: "Higher journey completion rate" },
          { kind: "count", prefix: "\u2212", value: 34, suffix: "%", final: "\u221234%", label: "Less drop-off", desc: "Drop during\npre-assessment" },
          { kind: "steps", parts: ["8", "\u2192", "4"], final: "8 \u2192 4", label: "Simplified flow", desc: "Steps grouped into four blocks" }
        ],
        heroBreakAfter: ["a modernized"], leadBreakAfter: ["whitelabel base,", "13 percentage"]
      }
    }
  };
  window.GB_UI = UI;
  window.gbT = function (path) {
    var node = UI[window.GB_LANG] || UI.pt;
    var parts = path.split(".");
    for (var i = 0; i < parts.length; i++) { node = node && node[parts[i]]; }
    if (node == null) { console.warn("[i18n] missing key", path); return path; }
    return node;
  };

  var listeners = [];
  window.GB_onLangChange = function (fn) {
    listeners.push(fn);
    return function () { listeners = listeners.filter(function (f) { return f !== fn; }); };
  };
  window.GB_setLang = function (next) {
    if (next !== "en" && next !== "pt") return;
    if (next === window.GB_LANG) return;
    window.GB_LANG = next;
    document.documentElement.lang = next === "en" ? "en" : "pt-BR";
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* storage indisponível */ }
    try {
      var url = new URL(location.href);
      url.searchParams.set("lang", next);
      history.replaceState(history.state, "", url.toString());
    } catch (e) { /* URL indisponível */ }
    listeners.forEach(function (fn) { fn(next); });
  };

  window.GB_LangContext = React.createContext({ lang: window.GB_LANG, setLang: window.GB_setLang, t: window.gbT });
  window.GB_LangProvider = function (props) {
    var state = React.useState(window.GB_LANG);
    var val = state[0], setVal = state[1];
    React.useEffect(function () { return window.GB_onLangChange(setVal); }, []);
    return React.createElement(window.GB_LangContext.Provider, { value: { lang: val, setLang: window.GB_setLang, t: window.gbT } }, props.children);
  };
  window.useLang = function () { return React.useContext(window.GB_LangContext); };
})();
