import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* createClient lança de forma síncrona quando faltam credenciais (ex.: env vars não
   configuradas para o ambiente de Preview na Vercel). Como main.jsx importa este
   módulo no topo da cadeia estática, essa exceção derrubava a avaliação de todo o
   bundle antes do React montar — a intro terminava sozinha (não depende de React) e
   revelava uma página em branco. Por isso nunca deixamos createClient lançar: sem
   credenciais válidas, exportamos um stub cujo .rpc() resolve com {data:null,error},
   o mesmo formato que data.js/case-*.js já tratam com fallback. */
if (!url || !anonKey) {
  console.error(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes — confira o .env (veja .env.example)."
  );
}

function createSafeClient() {
  try {
    return createClient(url, anonKey);
  } catch (err) {
    console.error("[supabase] Falha ao criar o client — usando stub sem dados:", err);
    const stubError = { message: "supabase client indisponível (credenciais ausentes ou inválidas)" };
    return { rpc: () => Promise.resolve({ data: null, error: stubError }) };
  }
}

export const supabase = createSafeClient();
