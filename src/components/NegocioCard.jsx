"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { PLANOS, CATEGORIAS_NEGOCIO } from "@/lib/constants";

function labelCategoria(value) {
  return CATEGORIAS_NEGOCIO.find((c) => c.value === value)?.label || value;
}

export default function NegocioCard({ item }) {
  const plano = PLANOS[item.plano];

  return (
    <Link
      href={`/comercio/${item.id}`}
      style={{
        background: "#FFFFFF",
        border: "1px solid var(--cor-borda)",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        display: "flex",
        gap: 12,
        alignItems: "center",
        textDecoration: "none",
        color: "inherit",
      }}
    >
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
  );
}
