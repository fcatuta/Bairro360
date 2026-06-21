import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Encerra a sessão (logout remoto) de um morador específico.
// Só pode ser chamado por um administrador autenticado.
//
// Requer a variável de ambiente SUPABASE_SERVICE_ROLE_KEY configurada
// na Vercel (NUNCA exponha essa chave com o prefixo NEXT_PUBLIC_,
// ela precisa ficar só no servidor).
export async function POST(request) {
  const { targetUserId } = await request.json();

  if (!targetUserId) {
    return NextResponse.json({ error: "ID do usuário é obrigatório." }, { status: 400 });
  }

  // 1. Confirma que quem está chamando é um administrador de verdade
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("tipo")
    .eq("id", authData.user.id)
    .single();

  if (perfil?.tipo !== "administrador") {
    return NextResponse.json({ error: "Apenas administradores podem fazer isso." }, { status: 403 });
  }

  // 2. Usa a service role (privilegiada) para revogar as sessões do alvo
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "Configuração ausente no servidor (SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 500 }
    );
  }

  const adminClient = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);

  const { error } = await adminClient.auth.admin.signOut(targetUserId, "global");

  if (error) {
    console.error("Erro ao encerrar sessão remota:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
