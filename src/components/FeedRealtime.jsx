"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Escuta mudanças em tempo real nas tabelas relevantes para o bairro
// e atualiza a página automaticamente (sem o usuário precisar dar F5).
// Não renderiza nada na tela — é só um "ouvinte" em segundo plano.
export default function FeedRealtime({ bairroId }) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!bairroId) return;

    const canal = supabase
      .channel(`feed-bairro-${bairroId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ocorrencias", filter: `bairro_id=eq.${bairroId}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ocorrencia_confirmacoes" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ocorrencia_comentarios" },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [bairroId]);

  return null;
}
