export {};
/* Conteúdo do case Trade-in, agora vindo do Supabase (get_case_study('trade-in', p_locale))
   em vez do objeto estático que existia aqui antes. window.GB_TRADEIN continua
   sendo o mesmo proxy por idioma — CaseTradeIn.jsx não precisou mudar.

   O banco guarda as colunas *_en (migração 009) e get_case_study(p_slug, p_locale)
   já devolve com fallback pro português quando faltar tradução (migração 010/011),
   então buscamos os dois locales em paralelo. */
import { supabase } from "../lib/supabaseClient.js";
import { adaptCaseStudy } from "../lib/caseAdapter.js";

const FALLBACK = { slug: "trade-in", title: "", lead: "", ficha: [], sections: [] };

let caseDataPt = null, caseDataEn = null;
try {
  const [{ data: dataPt, error: errorPt }, { data: dataEn, error: errorEn }] = await Promise.all([
    supabase.rpc("get_case_study", { p_slug: "trade-in", p_locale: "PT" }),
    supabase.rpc("get_case_study", { p_slug: "trade-in", p_locale: "EN" }),
  ]);
  caseDataPt = dataPt;
  caseDataEn = dataEn;
  if (errorPt) console.error("[case-trade-in] get_case_study(PT) falhou:", errorPt);
  if (errorEn) console.error("[case-trade-in] get_case_study(EN) falhou:", errorEn);
} catch (err) {
  console.error("[case-trade-in] get_case_study rejeitou:", err);
}

const adaptedPt = adaptCaseStudy(caseDataPt) || FALLBACK;
const adaptedEn = adaptCaseStudy(caseDataEn) || adaptedPt;

window.GB_TRADEIN_I18N = { pt: adaptedPt, en: adaptedEn };
window.GB_TRADEIN = new Proxy({}, { get: function (_, prop) { return window.GB_TRADEIN_I18N[window.GB_LANG || "pt"][prop]; } });
