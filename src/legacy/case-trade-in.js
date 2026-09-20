export {};
/* Conteúdo do case Trade-in, agora vindo do Supabase (get_case_study('trade-in'))
   em vez do objeto estático que existia aqui antes. window.GB_TRADEIN continua
   sendo o mesmo proxy por idioma — CaseTradeIn.jsx não precisou mudar.

   O banco guarda esse case só em português (ver data.js para a mesma nota
   sobre paridade de idioma); pt e en abaixo apontam pro mesmo objeto adaptado
   de propósito. */
import { supabase } from "../lib/supabaseClient.js";
import { adaptCaseStudy } from "../lib/caseAdapter.js";

const { data: caseData, error } = await supabase.rpc("get_case_study", { p_slug: "trade-in" });
if (error) console.error("[case-trade-in] get_case_study falhou:", error);

const adapted = adaptCaseStudy(caseData) || { slug: "trade-in", title: "", lead: "", ficha: [], sections: [] };

window.GB_TRADEIN_I18N = { pt: adapted, en: adapted };
window.GB_TRADEIN = new Proxy({}, { get: function (_, prop) { return window.GB_TRADEIN_I18N[window.GB_LANG || "pt"][prop]; } });
