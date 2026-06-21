import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase usado em componentes do navegador (telas, formulários, etc.)
// As duas variáveis abaixo vêm do arquivo .env.local — veja .env.local.example
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
