/* get_case_study(slug) já devolve `sections[].blocks[].t` no mesmo token que
   CaseTradeIn.jsx espera (ver migração 007b) — a única transformação que falta
   fazer no client é desfazer o prefixo de pasta que o seed gravou nas imagens
   (a tabela guarda o caminho público completo, ex. "/assets/cases/trade-in/x.png",
   enquanto CaseTradeIn.jsx monta esse mesmo caminho sozinho via `IMG_BASE + it.s`).
   Sem isso o caminho sairia duplicado. */
const IMAGE_KEYS = ["s", "a", "b", "src", "file"];

function stripPrefix(value, prefix) {
  return typeof value === "string" && value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

function stripImgBaseDeep(node, prefix) {
  if (Array.isArray(node)) return node.map((n) => stripImgBaseDeep(n, prefix));
  if (node && typeof node === "object") {
    const out = {};
    for (const k of Object.keys(node)) {
      out[k] = IMAGE_KEYS.includes(k) ? stripPrefix(node[k], prefix) : stripImgBaseDeep(node[k], prefix);
    }
    return out;
  }
  return node;
}

/* `case` aqui é o jsonb cru devolvido por get_case_study — devolve o mesmo
   shape que o antigo case-trade-in.js/case-agibank.js estático produzia. */
export function adaptCaseStudy(caseData) {
  if (!caseData) return null;
  const prefix = caseData.imgBase || "";
  return {
    ...stripImgBaseDeep(caseData, prefix),
    heroImage: stripPrefix(caseData.heroImage, prefix),
    heroImage2: stripPrefix(caseData.heroImage2, prefix),
  };
}
