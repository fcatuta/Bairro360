"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AvaliacaoForm({ negocioId, userId, jaAvaliou }) {
  const router = useRouter();
  const supabase = createClient();

  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  if (jaAvaliou) {
    return (
      <p style={{ fontSize: 14, color: "var(--cor-texto-fraco)", marginBottom: 20 }}>
        Você já avaliou este negócio. Obrigado pela contribuição!
      </p>
    );
  }

  async function handleEnviar() {
    if (nota === 0) {
      setErro("Escolha de 1 a 5 estrelas antes de enviar.");
      return;
    }
    setErro("");
    setEnviando(true);

    const { error } = await supabase.from("avaliacoes").insert({
      negocio_id: negocioId,
      autor_id: userId,
      nota,
      comentario: comentario.trim() || null,
    });

    setEnviando(false);
    if (error) {
      setErro("Não foi possível enviar sua avaliação agora.");
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ marginBottom: 24, padding: 16, background: "#FFFFFF", borderRadius: 14, border: "1px solid var(--cor-borda)" }}>
      <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Deixe sua avaliação</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setNota(n)}
            aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            <Star size={26} fill={n <= nota ? "var(--cor-laranja)" : "none"} color="var(--cor-laranja)" />
          </button>
        ))}
      </div>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Conte como foi sua experiência (opcional)"
        rows={3}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid var(--cor-borda)",
          fontSize: 14,
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          marginBottom: 10,
        }}
      />
      {erro && <p style={{ color: "var(--cor-vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}
      <button
        onClick={handleEnviar}
        disabled={enviando}
        style={{
          width: "100%",
          padding: "12px 0",
          borderRadius: 10,
          border: "none",
          background: "var(--cor-texto)",
          color: "#FFF",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {enviando ? "Enviando..." : "Enviar avaliação"}
      </button>
    </div>
  );
}
