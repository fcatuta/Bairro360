"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Escuta mudanças em tempo real numa ocorrência específica (confirmações
// e comentários de outros moradores) e atualiza a tela automaticamente.
export default function OcorrenciaRealtime({ ocorrenciaId }) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!ocorrenciaId) return;

    const canal = supabase
      .channel(`ocorrencia-${ocorrenciaId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ocorrencia_confirmacoes", filter: `ocorrencia_id=eq.${ocorrenciaId}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ocorrencia_comentarios", filter: `ocorrencia_id=eq.${ocorrenciaId}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ocorrencias", filter: `id=eq.${ocorrenciaId}` },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [ocorrenciaId]);

  return null;
}
