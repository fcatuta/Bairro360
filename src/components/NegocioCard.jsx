"use client";

import Link from "next/link";
import { Star, MessageCircle, Tag } from "lucide-react";
import { PLANOS, CATEGORIAS_NEGOCIO } from "@/lib/constants";

function labelCategoria(value) {
  return CATEGORIAS_NEGOCIO.find((c) => c.value === value)?.label || value;
}

export default function NegocioCard({ item }) {
  const plano = PLANOS[item.plano];

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid var(--cor-borda)",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <Link href={`/comercio/${item.id}`} style={{ display: "flex", gap: 12, alignItems: "center", textDecoration: "none", color: "inherit" }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: "var(--cor-borda-suave)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "var(--cor-texto-fraco)",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {item.nome.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{item.nome}</span>
            {plano && (
              <span style={{ fontSize: 10, fontWeight: 700, color: plano.color, background: plano.bg, padding: "2px 7px", borderRadius: 8 }}>
                {plano.label}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--cor-texto-fraco)" }}>{labelCategoria(item.categoria)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
            <Star size={13} fill="var(--cor-laranja)" color="var(--cor-laranja)" />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{item.nota_media?.toFixed(1) ?? "—"}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--cor-texto-fraco)" }}>{item.total_avaliacoes ?? 0} avaliações</div>
        </div>
      </Link>

      {item.cupom_valido && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, background: "var(--cor-verde-bg)", borderRadius: 8, padding: "6px 10px" }}>
          <Tag size={13} color="var(--cor-verde)" />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--cor-verde)" }}>{item.cupom_texto}</span>
        </div>
      )}

      {item.whatsapp && (
        <a
          href={`https://wa.me/55${item.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            marginTop: 10, padding: "9px 0", borderRadius: 9, background: "var(--cor-verde)",
            color: "#FFFFFF", fontSize: 13, fontWeight: 700, textDecoration: "none",
          }}
        >
          <MessageCircle size={15} /> Chamar no WhatsApp
        </a>
      )}
    </div>
  );
}
