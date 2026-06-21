import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import TabBar from "@/components/TabBar";
import GuiaComercialBusca from "@/components/GuiaComercialBusca";

export default async function ComercioPage() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("bairro_id, bairros(nome, emergencia_ativa)")
    .eq("id", authData.user.id)
    .single();

  if (!perfil?.bairro_id) redirect("/escolher-bairro");

  const { data: negocios } = await supabase
    .from("negocios")
    .select("id, nome, categoria, plano, cupom_texto, cupom_validade, avaliacoes(nota)")
    .eq("bairro_id", perfil?.bairro_id)
    .eq("ativo", true);

  // Ranking: pagantes sempre primeiro; dentro de cada grupo, ordena por nota média.
  const lista = (negocios || [])
    .map((n) => {
      const notas = n.avaliacoes || [];
      const media = notas.length ? notas.reduce((s, a) => s + a.nota, 0) / notas.length : null;
      const cupomValido =
        n.cupom_texto && (!n.cupom_validade || n.cupom_validade >= new Date().toISOString().split("T")[0]);
      return { ...n, nota_media: media, total_avaliacoes: notas.length, cupom_valido: cupomValido };
    })
    .sort((a, b) => {
      const pagaA = a.plano === "pago" ? 0 : 1;
      const pagaB = b.plano === "pago" ? 0 : 1;
      if (pagaA !== pagaB) return pagaA - pagaB;
      return (b.nota_media ?? 0) - (a.nota_media ?? 0);
    });

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      <TopBar
        bairroNome={perfil?.bairros?.nome}
        bairroId={perfil?.bairro_id}
        emergenciaAtiva={perfil?.bairros?.emergencia_ativa !== false}
      />
      <GuiaComercialBusca negocios={lista} />
      <TabBar />
    </div>
  );
}
