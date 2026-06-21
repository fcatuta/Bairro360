import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { exigirAdmin } from "@/lib/admin";
import EditarBairroForm from "@/components/EditarBairroForm";
import MoradoresDoBairro from "@/components/MoradoresDoBairro";

export default async function EditarBairroPage({ params }) {
  const { id } = await params;
  const { supabase } = await exigirAdmin();

  const { data: bairro } = await supabase
    .from("bairros")
    .select("*")
    .eq("id", id)
    .single();

  if (!bairro) notFound();

  const [{ count: moradores }, { count: ocorrencias }, { count: negocios }, { data: outrosBairros }, { data: moradoresLista }] =
    await Promise.all([
      supabase.from("perfis").select("*", { count: "exact", head: true }).eq("bairro_id", id),
      supabase.from("ocorrencias").select("*", { count: "exact", head: true }).eq("bairro_id", id),
      supabase.from("negocios").select("*", { count: "exact", head: true }).eq("bairro_id", id),
      supabase.from("bairros").select("id, nome").neq("id", id).order("nome"),
      supabase.from("perfis").select("id, nome_completo, tipo").eq("bairro_id", id).order("nome_completo"),
    ]);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Link href="/admin/bairros" aria-label="Voltar" style={{ display: "flex" }}>
          <ArrowLeft size={24} color="var(--cor-texto)" />
        </Link>
        <h1 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 20, fontWeight: 700, margin: 0 }}>
          Editar bairro
        </h1>
      </div>

      <EditarBairroForm
        bairro={bairro}
        contagens={{ moradores: moradores ?? 0, ocorrencias: ocorrencias ?? 0, negocios: negocios ?? 0 }}
      />

      <MoradoresDoBairro
        moradores={moradoresLista || []}
        outrosBairros={outrosBairros || []}
      />
    </div>
  );
}
