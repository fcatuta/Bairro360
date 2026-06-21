import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import TabBar from "@/components/TabBar";
import OcorrenciaCard from "@/components/OcorrenciaCard";
import NovoBotaoFlutuante from "@/components/NovoBotaoFlutuante";

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("bairro_id, tipo, bairros(nome)")
    .eq("id", authData.user.id)
    .single();

  if (!perfil?.bairro_id) {
    redirect("/escolher-bairro");
  }

  const bairroId = perfil.bairro_id;

  const { data: ocorrencias } = await supabase
    .from("ocorrencias")
    .select(
      `
      id, categoria, titulo, descricao, status, criado_em,
      perfis ( nome_completo ),
      ocorrencia_confirmacoes ( id ),
      ocorrencia_comentarios ( id )
    `
    )
    .eq("bairro_id", bairroId)
    .order("criado_em", { ascending: false })
    .limit(30);

  const lista = (ocorrencias || []).map((o) => ({
    ...o,
    total_confirmacoes: o.ocorrencia_confirmacoes?.length || 0,
    total_comentarios: o.ocorrencia_comentarios?.length || 0,
  }));

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", position: "relative" }}>
      <TopBar bairroNome={perfil?.bairros?.nome} />

      {perfil?.tipo === "administrador" && (
        <div style={{ padding: "10px 20px 0" }}>
          <a
            href="/admin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 700,
              color: "var(--cor-texto-fraco)",
              textDecoration: "none",
              border: "1px solid var(--cor-borda)",
              padding: "5px 12px",
              borderRadius: 20,
            }}
          >
            ⚙ Painel administrativo
          </a>
        </div>
      )}

      <div style={{ padding: "16px 20px 100px" }}>
        {lista.length === 0 ? (
          <EstadoVazio />
        ) : (
          lista.map((item) => <OcorrenciaCard key={item.id} item={item} />)
        )}
      </div>

      <NovoBotaoFlutuante />
      <TabBar />
    </div>
  );
}

function EstadoVazio() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--cor-texto-fraco)" }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--cor-texto)", marginBottom: 6 }}>
        Nenhuma ocorrência ainda
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.5 }}>
        Quando algo acontecer no seu bairro, será o primeiro a aparecer aqui. Toque no botão laranja para publicar a primeira.
      </p>
    </div>
  );
}
