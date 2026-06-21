import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { exigirAdmin } from "@/lib/admin";
import { PLANOS, CATEGORIAS_NEGOCIO } from "@/lib/constants";

function labelCategoria(value) {
  return CATEGORIAS_NEGOCIO.find((c) => c.value === value)?.label || value;
}

export default async function AdminAnunciantesPage() {
  const { supabase } = await exigirAdmin();

  const { data: negocios } = await supabase
    .from("negocios")
    .select("id, nome, categoria, plano, ativo, telefone, bairros(nome)")
    .order("plano", { ascending: true });

  const ordem = { ouro: 0, prata: 1, bronze: 2, gratuito: 3 };
  const lista = [...(negocios || [])].sort((a, b) => (ordem[a.plano] ?? 9) - (ordem[b.plano] ?? 9));

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Link href="/admin" aria-label="Voltar" style={{ display: "flex" }}>
          <ArrowLeft size={24} color="var(--cor-texto)" />
        </Link>
        <h1 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 20, fontWeight: 700, margin: 0, flex: 1 }}>
          Anunciantes
        </h1>
        <Link
          href="/admin/anunciantes/novo"
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

      {(!lista || lista.length === 0) && (
        <p style={{ color: "var(--cor-texto-fraco)", textAlign: "center", padding: "40px 0" }}>
          Nenhum anunciante cadastrado ainda.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {lista.map((n) => {
          const plano = PLANOS[n.plano];
          return (
            <Link
              key={n.id}
              href={`/admin/anunciantes/${n.id}`}
              style={{
                background: "#FFFFFF",
                border: "1px solid var(--cor-borda)",
                borderRadius: 12,
                padding: "14px 16px",
                textDecoration: "none",
                color: "inherit",
                display: "block",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{n.nome}</span>
                {plano ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: plano.color, background: plano.bg, padding: "3px 9px", borderRadius: 8 }}>
                    {plano.label}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cor-texto-fraco)", background: "var(--cor-borda-suave)", padding: "3px 9px", borderRadius: 8 }}>
                    Gratuito
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "var(--cor-texto-fraco)" }}>
                {labelCategoria(n.categoria)} · {n.bairros?.nome || "Sem bairro"}
                {!n.ativo && <span style={{ color: "var(--cor-vermelho)", fontWeight: 700 }}> · Inativo</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
