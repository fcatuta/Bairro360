import Link from "next/link";
import { MapPin, Store, Plus, ArrowLeft } from "lucide-react";
import { exigirAdmin } from "@/lib/admin";

export default async function AdminHomePage() {
  const { supabase } = await exigirAdmin();

  const { count: totalBairros } = await supabase
    .from("bairros")
    .select("*", { count: "exact", head: true });

  const { count: totalNegocios } = await supabase
    .from("negocios")
    .select("*", { count: "exact", head: true });

  const { count: totalPagantes } = await supabase
    .from("negocios")
    .select("*", { count: "exact", head: true })
    .neq("plano", "gratuito");

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <Link href="/" aria-label="Voltar ao app" style={{ display: "flex" }}>
          <ArrowLeft size={24} color="var(--cor-texto)" />
        </Link>
        <h1 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 22, fontWeight: 700, margin: 0 }}>
          Painel administrativo
        </h1>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <Cartao numero={totalBairros ?? 0} legenda="Bairros" />
        <Cartao numero={totalNegocios ?? 0} legenda="Anunciantes" />
        <Cartao numero={totalPagantes ?? 0} legenda="Pagantes" cor="var(--cor-laranja)" />
      </div>

      <Secao titulo="Bairros">
        <BotaoLink href="/admin/bairros" icone={MapPin} texto="Ver todos os bairros" />
        <BotaoLink href="/admin/bairros/novo" icone={Plus} texto="Criar novo bairro" destaque />
      </Secao>

      <Secao titulo="Anunciantes (comércio, prestadores, imobiliárias)">
        <BotaoLink href="/admin/anunciantes" icone={Store} texto="Ver todos os anunciantes" />
        <BotaoLink href="/admin/anunciantes/novo" icone={Plus} texto="Cadastrar novo anunciante" destaque />
      </Secao>
    </div>
  );
}

function Cartao({ numero, legenda, cor = "var(--cor-texto)" }) {
  return (
    <div style={{ flex: 1, background: "#FFFFFF", border: "1px solid var(--cor-borda)", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: cor }}>{numero}</div>
      <div style={{ fontSize: 12, color: "var(--cor-texto-fraco)" }}>{legenda}</div>
    </div>
  );
}

function Secao({ titulo, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--cor-texto-fraco)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>
        {titulo}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function BotaoLink({ href, icone: Icone, texto, destaque }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 16px",
        borderRadius: 12,
        border: destaque ? "1px solid var(--cor-laranja)" : "1px solid var(--cor-borda)",
        background: destaque ? "var(--cor-laranja-bg)" : "#FFFFFF",
        color: destaque ? "var(--cor-laranja)" : "var(--cor-texto)",
        textDecoration: "none",
        fontSize: 15,
        fontWeight: 700,
      }}
    >
      <Icone size={18} />
      {texto}
    </Link>
  );
}
