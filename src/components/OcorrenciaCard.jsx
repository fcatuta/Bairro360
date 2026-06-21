"use client";

import Link from "next/link";
import { ThumbsUp, MessageCircle } from "lucide-react";
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

export default function OcorrenciaCard({ item }) {
  const cat = CATEGORIAS[item.categoria] || CATEGORIAS.outros;
  const st = STATUS[item.status] || STATUS.aberta;
  const Icon = cat.icon;

  return (
    <Link
      href={`/ocorrencias/${item.id}`}
      style={{
        display: "block",
        background: "#FFFFFF",
        border: "1px solid var(--cor-borda)",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: cat.bg,
            color: cat.color,
            padding: "4px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <Icon size={13} />
          {cat.label}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: st.color, background: st.bg, padding: "3px 9px", borderRadius: 12 }}>
          {st.label}
        </span>
      </div>

      <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--cor-texto)", margin: "0 0 6px", lineHeight: 1.35 }}>
        {item.titulo}
      </h3>
      <p style={{ fontSize: 15, color: "var(--cor-texto-suave)", margin: "0 0 12px", lineHeight: 1.55 }}>
        {item.descricao}
      </p>

      <div style={{ fontSize: 12.5, color: "var(--cor-texto-fraco)", marginBottom: 10 }}>
        {item.perfis?.nome_completo || "Morador"} · {tempoRelativo(item.criado_em)}
      </div>

      <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: "1px solid var(--cor-borda-suave)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--cor-texto-suave)" }}>
          <ThumbsUp size={15} /> {item.total_confirmacoes ?? 0} confirmações
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--cor-texto-suave)" }}>
          <MessageCircle size={15} /> {item.total_comentarios ?? 0} comentários
        </span>
      </div>
    </Link>
  );
}
