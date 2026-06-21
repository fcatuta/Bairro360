import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Star, Phone } from "lucide-react";
import VoltarTopBar from "@/components/VoltarTopBar";
import AvaliacaoForm from "@/components/AvaliacaoForm";
import { PLANOS, CATEGORIAS_NEGOCIO } from "@/lib/constants";

function labelCategoria(value) {
  return CATEGORIAS_NEGOCIO.find((c) => c.value === value)?.label || value;
}

function tempoRelativo(dataIso) {
  const diffMs = Date.now() - new Date(dataIso).getTime();
  const dias = Math.floor(diffMs / 86400000);
  if (dias < 1) return "hoje";
  if (dias === 1) return "há 1 dia";
  if (dias < 30) return `há ${dias} dias`;
  return `há ${Math.floor(dias / 30)} meses`;
}

export default async function NegocioDetalhePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect("/login");

  const { data: item } = await supabase
    .from("negocios")
    .select(
      `
      id, nome, categoria, descricao, telefone, whatsapp, plano,
      avaliacoes ( id, nota, comentario, criado_em, autor_id, perfis ( nome_completo ) )
      `
    )
    .eq("id", id)
    .single();

  if (!item) notFound();

  const avaliacoes = [...(item.avaliacoes || [])].sort(
    (a, b) => new Date(b.criado_em) - new Date(a.criado_em)
  );
  const media = avaliacoes.length
    ? avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length
    : null;
  const jaAvaliou = avaliacoes.some((a) => a.autor_id === authData.user.id);
  const plano = PLANOS[item.plano];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      <VoltarTopBar title={item.nome} />

      <div style={{ padding: 20, paddingBottom: 40 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: "var(--cor-borda-suave)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cor-texto-fraco)",
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            {item.nome.charAt(0)}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 19, fontWeight: 700, margin: 0 }}>
                {item.nome}
              </h2>
              {plano && (
                <span style={{ fontSize: 11, fontWeight: 700, color: plano.color, background: plano.bg, padding: "3px 8px", borderRadius: 8 }}>
                  {plano.label}
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "var(--cor-texto-fraco)" }}>{labelCategoria(item.categoria)}</div>
          </div>
        </div>

        {item.descricao && (
          <p style={{ fontSize: 15, color: "var(--cor-texto)", lineHeight: 1.6, marginBottom: 20 }}>
            {item.descricao}
          </p>
        )}

        <div style={{ display: "flex", gap: 20, marginBottom: 20, padding: "14px 0", borderTop: "1px solid var(--cor-borda-suave)", borderBottom: "1px solid var(--cor-borda-suave)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Star size={16} fill="var(--cor-laranja)" color="var(--cor-laranja)" />
            <span style={{ fontSize: 15, fontWeight: 700 }}>{media ? media.toFixed(1) : "—"}</span>
            <span style={{ fontSize: 13, color: "var(--cor-texto-fraco)" }}>({avaliacoes.length})</span>
          </div>
        </div>

        {item.whatsapp && (
          <a
            href={`https://wa.me/${item.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: "100%",
              padding: "13px 0",
              borderRadius: 12,
              border: "none",
              background: "var(--cor-verde)",
              color: "#FFF",
              fontSize: 14.5,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            <Phone size={16} /> Chamar no WhatsApp
          </a>
        )}

        <AvaliacaoForm negocioId={item.id} userId={authData.user.id} jaAvaliou={jaAvaliou} />

        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
          Avaliações da comunidade
        </h3>
        {avaliacoes.length === 0 && (
          <p style={{ fontSize: 14, color: "var(--cor-texto-fraco)" }}>Ainda não há avaliações.</p>
        )}
        {avaliacoes.map((a) => (
          <div key={a.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--cor-borda-suave)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{a.perfis?.nome_completo || "Morador"}</span>
              <span style={{ fontSize: 12, color: "var(--cor-texto-fraco)" }}>{tempoRelativo(a.criado_em)}</span>
            </div>
            <div style={{ display: "flex", gap: 2, marginBottom: 4 }}>
              {[...Array(5)].map((_, idx) => (
                <Star key={idx} size={12} fill={idx < a.nota ? "var(--cor-laranja)" : "none"} color="var(--cor-laranja)" />
              ))}
            </div>
            {a.comentario && (
              <p style={{ fontSize: 14, color: "var(--cor-texto)", margin: 0, lineHeight: 1.5 }}>{a.comentario}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
