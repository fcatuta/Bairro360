"use client";

import Link from "next/link";
import { ThumbsUp, MessageCircle } from "lucide-react";
import { CATEGORIAS, STATUS } from "@/lib/constants";

function tempoRelativo(dataIso) {
  const diffMs = Date.now() - new Date(dataIso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} dia${d > 1 ? "s" : ""}`;
}

export default function OcorrenciaCard({ item }) {
  const cat = CATEGORIAS[item.categoria] || CATEGORIAS.outros;
  const st = STATUS[item.status] || STATUS.aberta;
  const Icon = cat.icon;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #F1F5F9",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
      }}
    >
      <Link href={`/ocorrencias/${item.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
        {/* Linha 1: categoria + status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: cat.bg,
              color: cat.color,
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Icon size={12} />
            {cat.label}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: st.color,
              background: st.bg,
              padding: "3px 10px",
              borderRadius: 999,
            }}
          >
            {st.label}
          </span>
        </div>

        {/* Linha 2: título */}
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#1E293B",
            margin: "0 0 10px",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.titulo}
        </h3>
      </Link>

      {/* Linha 3: autor + contadores */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#94A3B8" }}>
        <Link
          href={`/morador/${item.autor_id}`}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            marginRight: 8,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <span style={{ fontWeight: 600, color: "#64748B" }}>{item.perfis?.nome_completo || "Morador"}</span>
          <span style={{ color: "#94A3B8" }}> · {tempoRelativo(item.criado_em)}</span>
        </Link>
        <Link
          href={`/ocorrencias/${item.id}`}
          style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, color: "#94A3B8", textDecoration: "none" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ThumbsUp size={13} /> {item.total_confirmacoes ?? 0}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MessageCircle size={13} /> {item.total_comentarios ?? 0}
          </span>
        </Link>
      </div>
    </div>
  );
}
