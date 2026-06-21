import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MapPin } from "lucide-react";
import TopBar from "@/components/TopBar";
import TabBar from "@/components/TabBar";

export default async function MapaPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("bairro_id, bairros(nome, emergencia_ativa)")
    .eq("id", authData.user.id)
    .single();

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      <TopBar
        bairroNome={perfil?.bairros?.nome}
        bairroId={perfil?.bairro_id}
        emergenciaAtiva={perfil?.bairros?.emergencia_ativa !== false}
      />

      <div style={{ padding: 20, paddingBottom: 100 }}>
        <div
          style={{
            height: 420,
            borderRadius: 16,
            background: "var(--cor-borda-suave)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--cor-texto-fraco)",
            gap: 8,
            border: "1px solid var(--cor-borda)",
            textAlign: "center",
            padding: 24,
          }}
        >
          <MapPin size={32} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Mapa do bairro em construção</span>
          <span style={{ fontSize: 12, maxWidth: 260 }}>
            Aqui as ocorrências vão aparecer como marcadores no mapa, organizados por categoria.
          </span>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
