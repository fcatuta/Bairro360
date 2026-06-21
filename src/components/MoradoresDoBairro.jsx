"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ArrowRightLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function MoradoresDoBairro({ moradores, outrosBairros }) {
  const router = useRouter();
  const supabase = createClient();

  const [editandoId, setEditandoId] = useState(null);
  const [destino, setDestino] = useState("");
  const [movendo, setMovendo] = useState(false);
  const [erro, setErro] = useState("");

  async function handleMover(moradorId) {
    if (!destino) {
      setErro("Escolha o bairro de destino.");
      return;
    }
    setErro("");
    setMovendo(true);

    const { error } = await supabase
      .from("perfis")
      .update({ bairro_id: destino })
      .eq("id", moradorId);

    setMovendo(false);

    if (error) {
      console.error("Erro ao mover morador:", error);
      setErro(`Não foi possível mover: ${error.message}`);
      return;
    }

    setEditandoId(null);
    setDestino("");
    router.refresh();
  }

  if (moradores.length === 0) return null;

  return (
    <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--cor-borda-suave)" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--cor-texto-fraco)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 14 }}>
        <Users size={15} /> Moradores deste bairro ({moradores.length})
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {moradores.map((m) => (
          <div key={m.id} style={{ background: "#FFFFFF", border: "1px solid var(--cor-borda)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{m.nome_completo}</div>
                {m.tipo !== "morador" && (
                  <div style={{ fontSize: 11, color: "var(--cor-laranja)", fontWeight: 700, textTransform: "capitalize" }}>{m.tipo}</div>
                )}
              </div>
              {editandoId !== m.id && (
                <button
                  onClick={() => { setEditandoId(m.id); setErro(""); }}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid var(--cor-borda)", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 700, color: "var(--cor-texto-suave)", cursor: "pointer" }}
                >
                  <ArrowRightLeft size={12} /> Mover
                </button>
              )}
            </div>

            {editandoId === m.id && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--cor-borda-suave)" }}>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid var(--cor-borda)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}
                >
                  <option value="">Escolha o bairro de destino...</option>
                  {outrosBairros.map((b) => (
                    <option key={b.id} value={b.id}>{b.nome}</option>
                  ))}
                </select>
                {erro && <p style={{ color: "var(--cor-vermelho)", fontSize: 12, marginBottom: 8 }}>{erro}</p>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setEditandoId(null); setDestino(""); setErro(""); }}
                    style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid var(--cor-borda)", background: "#FFFFFF", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleMover(m.id)}
                    disabled={movendo}
                    style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: "var(--cor-laranja)", color: "#FFF", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                  >
                    {movendo ? "Movendo..." : "Confirmar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
