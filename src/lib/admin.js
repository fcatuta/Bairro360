import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Usado no topo de toda página dentro de /admin.
// Garante duas coisas: que a pessoa está logada, e que é administrador.
// Quem não é administrador é mandado de volta para o feed normal.
export async function exigirAdmin() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("tipo, nome_completo")
    .eq("id", authData.user.id)
    .single();

  if (perfil?.tipo !== "administrador") {
    redirect("/");
  }

  return { supabase, userId: authData.user.id, perfil };
}
