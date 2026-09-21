export {};
/* Conteúdo do case App Agi, agora vindo do Supabase (get_case_study('app-agi', p_locale))
   em vez do objeto estático que existia aqui antes. Mesmo padrão de
   src/legacy/case-trade-in.js — ver as notas lá. */
import { supabase } from "../lib/supabaseClient.js";
import { adaptCaseStudy } from "../lib/caseAdapter.js";

const FALLBACK = { slug: "app-agi", title: "", lead: "", ficha: [], sections: [] };

const [{ data: caseDataPt, error: errorPt }, { data: caseDataEn, error: errorEn }] = await Promise.all([
  supabase.rpc("get_case_study", { p_slug: "app-agi", p_locale: "PT" }),
  supabase.rpc("get_case_study", { p_slug: "app-agi", p_locale: "EN" }),
]);
if (errorPt) console.error("[case-agibank] get_case_study(PT) falhou:", errorPt);
if (errorEn) console.error("[case-agibank] get_case_study(EN) falhou:", errorEn);

const adaptedPt = adaptCaseStudy(caseDataPt) || FALLBACK;
const adaptedEn = adaptCaseStudy(caseDataEn) || adaptedPt;

window.GB_AGIBANK_I18N = { pt: adaptedPt, en: adaptedEn };
window.GB_AGIBANK = new Proxy({}, { get: function (_, prop) { return window.GB_AGIBANK_I18N[window.GB_LANG || "pt"][prop]; } });
