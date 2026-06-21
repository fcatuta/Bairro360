import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { exigirAdmin } from "@/lib/admin";
import EditarAnuncianteForm from "@/components/EditarAnuncianteForm";

export default async function EditarAnunciantePage({ params }) {
  const { id } = await params;
  const { supabase } = await exigirAdmin();

  const { data: negocio } = await supabase
    .from("negocios")
    .select("*")
    .eq("id", id)
    .single();

  if (!negocio) notFound();

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Link href="/admin/anunciantes" aria-label="Voltar" style={{ display: "flex" }}>
          <ArrowLeft size={24} color="var(--cor-texto)" />
        </Link>
        <h1 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 20, fontWeight: 700, margin: 0 }}>
          Editar anunciante
        </h1>
      </div>

      <EditarAnuncianteForm negocio={negocio} />
    </div>
  );
}
