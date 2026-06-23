import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import TabBar from "@/components/TabBar";
import NovoBotaoFlutuante from "@/components/NovoBotaoFlutuante";
import FeedRealtime from "@/components/FeedRealtime";
import FeedFiltro from "@/components/FeedFiltro";
import { CheckCircle2 } from "lucide-react";

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("bairro_id, tipo, bairros(nome, emergencia_ativa)")
    .eq("id", authData.user.id)
    .single();

  if (!perfil?.bairro_id) redirect("/escolher-bairro");

  const bairroId = perfil.bairro_id;

  const [{ data: ocorrencias }, { count: totalResolvidas }] = await Promise.all([
    supabase
      .from("ocorrencias")
      .select(
        `id, categoria, titulo, descricao, status, criado_em, autor_id,
        perfis ( nome_completo ),
        ocorrencia_confirmacoes ( id ),
        ocorrencia_comentarios ( id )`
      )
      .eq("bairro_id", bairroId)
      .order("criado_em", { ascending: false })
      .limit(50),
    supabase
      .from("ocorrencias")
      .select("*", { count: "exact", head: true })
      .eq("bairro_id", bairroId)
      .eq("status", "resolvida"),
  ]);

  const lista = (ocorrencias || []).map((o) => ({
    ...o,
    total_confirmacoes: o.ocorrencia_confirmacoes?.length || 0,
    total_comentarios: o.ocorrencia_comentarios?.length || 0,
  }));

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", position: "relative" }}>
      <FeedRealtime bairroId={bairroId} />
      <TopBar
        bairroNome={perfil?.bairros?.nome}
        bairroId={bairroId}
        emergenciaAtiva={perfil?.bairros?.emergencia_ativa !== false}
      />

      <div style={{ padding: "10px 20px 0", display: "flex", gap: 8 }}>
        <a
          href="/perfil"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12.5, fontWeight: 700, color: "var(--cor-texto-fraco)",
            textDecoration: "none", border: "1px solid var(--cor-borda)",
            padding: "5px 12px", borderRadius: 20,
          }}
        >
          👤 Meu perfil
        </a>
        {perfil?.tipo === "administrador" && (
          <a
            href="/admin"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12.5, fontWeight: 700, color: "var(--cor-texto-fraco)",
              textDecoration: "none", border: "1px solid var(--cor-borda)",
              padding: "5px 12px", borderRadius: 20,
            }}
          >
            ⚙ Painel administrativo
          </a>
        )}
      </div>

      {/* Contador de resolvidas */}
      {totalResolvidas > 0 && (
        <div style={{
          margin: "12px 20px 0",
          padding: "10px 14px",
          borderRadius: 12,
          background: "#F0FDFA",
          border: "1px solid #0F766E",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <CheckCircle2 size={16} color="#0F766E" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F766E" }}>
            {totalResolvidas} {totalResolvidas === 1 ? "problema resolvido" : "problemas resolvidos"} no {perfil?.bairros?.nome} 🎉
          </span>
        </div>
      )}

      <FeedFiltro ocorrencias={lista} />

      <NovoBotaoFlutuante />
      <TabBar />
    </div>
  );
}