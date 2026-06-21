import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import TabBar from "@/components/TabBar";
import NegocioCard from "@/components/NegocioCard";

const ORDEM_PLANO = { ouro: 0, prata: 1, bronze: 2, gratuito: 3 };

export default async function ComercioPage() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("bairro_id, bairros(nome)")
    .eq("id", authData.user.id)
    .single();

  if (!perfil?.bairro_id) redirect("/escolher-bairro");

  const { data: negocios } = await supabase
    .from("negocios")
    .select("id, nome, categoria, plano, avaliacoes(nota)")
    .eq("bairro_id", perfil?.bairro_id)
    .eq("ativo", true);

  const lista = (negocios || [])
    .map((n) => {
      const notas = n.avaliacoes || [];
      const media = notas.length ? notas.reduce((s, a) => s + a.nota, 0) / notas.length : null;
      return { ...n, nota_media: media, total_avaliacoes: notas.length };
    })
    .sort((a, b) => (ORDEM_PLANO[a.plano] ?? 9) - (ORDEM_PLANO[b.plano] ?? 9));

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      <TopBar bairroNome={perfil?.bairros?.nome} />

      <div style={{ padding: "16px 20px 100px" }}>
        {lista.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--cor-texto-fraco)", padding: "40px 0" }}>
            Nenhum comércio cadastrado no seu bairro ainda.
          </p>
        ) : (
          lista.map((item) => <NegocioCard key={item.id} item={item} />)
        )}
      </div>

      <TabBar />
    </div>
  );
}
