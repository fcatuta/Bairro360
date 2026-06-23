import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OcorrenciaInteracao from "@/components/OcorrenciaInteracao";
import OcorrenciaGestao from "@/components/OcorrenciaGestao";
import OcorrenciaRealtime from "@/components/OcorrenciaRealtime";
import VoltarTopBar from "@/components/VoltarTopBar";
import { CATEGORIAS, STATUS } from "@/lib/constants";

function tempoRelativo(dataIso) {
  const diffMs = Date.now() - new Date(dataIso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? "s" : ""}`;
}

export default async function OcorrenciaDetalhePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect("/login");

  const { data: item } = await supabase
    .from("ocorrencias")
    .select(
      `
      id, categoria, titulo, descricao, status, criado_em, autor_id, foto_url,
      perfis ( nome_completo ),
      ocorrencia_confirmacoes ( id, morador_id ),
      ocorrencia_comentarios ( id, texto, criado_em, autor_id, perfis ( nome_completo ) )
      `
    )
    .eq("id", id)
    .single();

  if (!item) notFound();

  const { data: meuPerfil } = await supabase
    .from("perfis")
    .select("tipo")
    .eq("id", authData.user.id)
    .single();

  const souAdmin = meuPerfil?.tipo === "administrador";
  const souAutor = item.autor_id === authData.user.id;

  const cat = CATEGORIAS[item.categoria] || CATEGORIAS.outros;
  const st = STATUS[item.status] || STATUS.aberta;
  const Icon = cat.icon;
  const jaConfirmou = item.ocorrencia_confirmacoes?.some((c) => c.morador_id === authData.user.id);
  const comentarios = [...(item.ocorrencia_comentarios || [])].sort(
    (a, b) => new Date(a.criado_em) - new Date(b.criado_em)
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      <OcorrenciaRealtime ocorrenciaId={item.id} />
      <VoltarTopBar title="Ocorrência" />

      <div style={{ padding: 20, paddingBottom: 40 }}>
        {/* Categoria + status */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: cat.bg, color: cat.color,
            padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            <Icon size={13} />
            {cat.label}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: st.color,
            background: st.bg, padding: "3px 9px", borderRadius: 12,
          }}>
            {st.label}
          </span>
        </div>

        {/* Título */}
        <h2 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 22, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.3 }}>
          {item.titulo}
        </h2>

        {/* Autor + tempo */}
        <p style={{ fontSize: 14, color: "var(--cor-texto-fraco)", margin: "0 0 16px" }}>
          <Link href={`/morador/${item.autor_id}`} style={{ color: "inherit", fontWeight: 700, textDecoration: "none" }}>
            {item.perfis?.nome_completo || "Morador"}
          </Link>{" "}
          · {tempoRelativo(item.criado_em)}
        </p>

        {/* Foto da ocorrência */}
        {item.foto_url && (
          <div style={{ marginBottom: 20 }}>
            <img
              src={item.foto_url}
              alt="Foto da ocorrência"
              style={{
                width: "100%", borderRadius: 14, objectFit: "cover",
                maxHeight: 300, display: "block",
                border: "1px solid var(--cor-borda)",
                boxShadow: "0 2px 12px rgba(15,23,42,0.08)",
              }}
            />
          </div>
        )}

        {/* Descrição */}
        <p style={{ fontSize: 16, color: "var(--cor-texto)", lineHeight: 1.65, margin: "0 0 20px" }}>
          {item.descricao}
        </p>

        <OcorrenciaGestao
          ocorrencia={item}
          podeEditar={souAutor || souAdmin}
          podeExcluir={souAutor || souAdmin}
        />

        <OcorrenciaInteracao
          ocorrenciaId={item.id}
          userId={authData.user.id}
          jaConfirmou={jaConfirmou}
          totalConfirmacoes={item.ocorrencia_confirmacoes?.length || 0}
        />

        {/* Comentários */}
        <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 24, marginBottom: 12 }}>
          Comentários ({comentarios.length})
        </h3>
        {comentarios.length === 0 && (
          <p style={{ fontSize: 14, color: "var(--cor-texto-fraco)" }}>Seja o primeiro a comentar.</p>
        )}
        {comentarios.map((c) => (
          <div key={c.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--cor-borda-suave)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <Link href={`/morador/${c.autor_id}`} style={{ fontSize: 13, fontWeight: 700, color: "inherit", textDecoration: "none" }}>
                {c.perfis?.nome_completo || "Morador"}
              </Link>
              <span style={{ fontSize: 12, color: "var(--cor-texto-fraco)" }}>{tempoRelativo(c.criado_em)}</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--cor-texto)", margin: 0, lineHeight: 1.5 }}>{c.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
