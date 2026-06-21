import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { exigirAdmin } from "@/lib/admin";

export default async function AdminBairrosPage() {
  const { supabase } = await exigirAdmin();

  const { data: bairros } = await supabase
    .from("bairros")
    .select("id, nome, cidade, estado, criado_em")
    .order("criado_em", { ascending: false });

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Link href="/admin" aria-label="Voltar" style={{ display: "flex" }}>
          <ArrowLeft size={24} color="var(--cor-texto)" />
        </Link>
        <h1 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 20, fontWeight: 700, margin: 0, flex: 1 }}>
          Bairros
        </h1>
        <Link
          href="/admin/bairros/novo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--cor-laranja)",
            color: "#FFF",
            padding: "8px 14px",
            borderRadius: 10,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <Plus size={15} /> Novo
        </Link>
      </div>

      {(!bairros || bairros.length === 0) && (
        <p style={{ color: "var(--cor-texto-fraco)", textAlign: "center", padding: "40px 0" }}>
          Nenhum bairro cadastrado ainda.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bairros?.map((b) => (
          <Link
            key={b.id}
            href={`/admin/bairros/${b.id}`}
            style={{ background: "#FFFFFF", border: "1px solid var(--cor-borda)", borderRadius: 12, padding: "14px 16px", textDecoration: "none", color: "inherit", display: "block" }}
          >
            <div style={{ fontWeight: 700, fontSize: 15 }}>{b.nome}</div>
            <div style={{ fontSize: 13, color: "var(--cor-texto-fraco)" }}>{b.cidade} — {b.estado}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
