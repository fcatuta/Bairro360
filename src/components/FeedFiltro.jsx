"use client";

import { useState } from "react";
import OcorrenciaCard from "./OcorrenciaCard";

const FILTROS = [
  { value: null,          label: "Todas" },
  { value: "aberta",      label: "Abertas" },
  { value: "em_andamento",label: "Em andamento" },
  { value: "resolvida",   label: "Resolvidas" },
  { value: "encerrada",   label: "Encerradas" },
];

export default function FeedFiltro({ ocorrencias }) {
  const [filtro, setFiltro] = useState(null);

  const lista = filtro
    ? ocorrencias.filter((o) => o.status === filtro)
    : ocorrencias;

  return (
    <>
      {/* Filtros de status */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 20px 4px", paddingBottom: 8 }}>
        {FILTROS.map((f) => {
          const ativo = filtro === f.value;
          return (
            <button
              key={String(f.value)}
              onClick={() => setFiltro(f.value)}
              style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 999,
                border: ativo ? "1px solid var(--cor-laranja)" : "1px solid var(--cor-borda)",
                background: ativo ? "var(--cor-laranja)" : "#FFFFFF",
                color: ativo ? "#FFFFFF" : "var(--cor-texto-suave)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div style={{ padding: "12px 20px 100px" }}>
        {lista.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--cor-texto-fraco)" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--cor-texto)", marginBottom: 6 }}>
              Nenhuma ocorrência {filtro ? "com esse status" : "ainda"}
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.5 }}>
              {filtro
                ? "Tente outro filtro ou volte para ver todas."
                : "Toque no botão laranja para publicar a primeira."}
            </p>
          </div>
        ) : (
          lista.map((item) => <OcorrenciaCard key={item.id} item={item} />)
        )}
      </div>
    </>
  );
}
