"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResolverAlertaButton({ alertaId }) {
  const router = useRouter();
  const supabase = createClient();
  const [salvando, setSalvando] = useState(false);

  async function handleResolver() {
    setSalvando(true);
    const { error } = await supabase
      .from("alertas_emergencia")
      .update({ resolvido: true })
      .eq("id", alertaId);
    setSalvando(false);
    if (!error) router.refresh();
  }

  return (
    <button
      onClick={handleResolver}
      disabled={salvando}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9,
        border: "1px solid var(--cor-verde)", background: "#FFFFFF", color: "var(--cor-verde)",
        fontSize: 12.5, fontWeight: 700, cursor: "pointer",
      }}
    >
      <CheckCircle2 size={13} /> {salvando ? "..." : "Marcar resolvido"}
    </button>
  );
}
