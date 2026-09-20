export {};
/* Conteúdo do case App Agi, agora vindo do Supabase (get_case_study('app-agi'))
   em vez do objeto estático que existia aqui antes. Mesmo padrão de
   src/legacy/case-trade-in.js — ver as notas lá. */
import { supabase } from "../lib/supabaseClient.js";
import { adaptCaseStudy } from "../lib/caseAdapter.js";

const { data: caseData, error } = await supabase.rpc("get_case_study", { p_slug: "app-agi" });
if (error) console.error("[case-agibank] get_case_study falhou:", error);

const adapted = adaptCaseStudy(caseData) || { slug: "app-agi", title: "", lead: "", ficha: [], sections: [] };

window.GB_AGIBANK_I18N = { pt: adapted, en: adapted };
window.GB_AGIBANK = new Proxy({}, { get: function (_, prop) { return window.GB_AGIBANK_I18N[window.GB_LANG || "pt"][prop]; } });
