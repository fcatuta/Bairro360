"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function OcorrenciaInteracao({ ocorrenciaId, userId, jaConfirmou, totalConfirmacoes }) {
  const router = useRouter();
  const supabase = createClient();

  const [confirmado, setConfirmado] = useState(jaConfirmou);
  const [total, setTotal] = useState(totalConfirmacoes);
  const [comentario, setComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  async function handleConfirmar() {
    if (confirmado) return; // MVP: confirmação não é removível ainda

    const { error } = await supabase.from("ocorrencia_confirmacoes").insert({
      ocorrencia_id: ocorrenciaId,
      morador_id: userId,
    });

    if (!error) {
      setConfirmado(true);
      setTotal((t) => t + 1);
    }
  }

  async function handleComentar() {
    if (!comentario.trim()) return;
    setEnviandoComentario(true);

    const { error } = await supabase.from("ocorrencia_comentarios").insert({
      ocorrencia_id: ocorrenciaId,
      autor_id: userId,
      texto: comentario.trim(),
    });

    setEnviandoComentario(false);
    if (!error) {
      setComentario("");
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={handleConfirmar}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "16px 0",
          borderRadius: 12,
          border: confirmado ? "1px solid var(--cor-verde)" : "1px solid var(--cor-borda)",
          background: confirmado ? "var(--cor-verde-bg)" : "#FFFFFF",
          color: confirmado ? "var(--cor-verde)" : "var(--cor-texto-suave)",
          fontSize: 15.5,
          fontWeight: 700,
          cursor: confirmado ? "default" : "pointer",
          marginBottom: 24,
        }}
      >
        <CheckCircle2 size={20} />
        {confirmado ? `Você confirmou · ${total} confirmações` : `Confirmar que vi também · ${total}`}
      </button>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escreva um comentário..."
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid var(--cor-borda)",
            fontSize: 15,
            outline: "none",
          }}
        />
        <button
          onClick={handleComentar}
          disabled={enviandoComentario || !comentario.trim()}
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            border: "none",
            background: "var(--cor-texto)",
            color: "#FFF",
            fontSize: 14,
            fontWeight: 700,
            cursor: comentario.trim() ? "pointer" : "default",
          }}
        >
          Enviar
        </button>
      </div>
    </>
  );
}
