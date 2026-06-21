import Link from "next/link";
import { ArrowLeft, MapPin, Clock } from "lucide-react";
import { exigirAdmin } from "@/lib/admin";
import ResolverAlertaButton from "@/components/ResolverAlertaButton";

function tempoRelativo(dataIso) {
  const diffMs = Date.now() - new Date(dataIso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? "s" : ""}`;
}

export default async function AdminAlertasPage() {
  const { supabase } = await exigirAdmin();

  const { data: alertas } = await supabase
    .from("alertas_emergencia")
    .select("id, latitude, longitude, resolvido, criado_em, perfis(nome_completo, telefone, whatsapp), bairros(nome)")
    .order("criado_em", { ascending: false })
    .limit(50);

  const pendentes = (alertas || []).filter((a) => !a.resolvido);
  const resolvidos = (alertas || []).filter((a) => a.resolvido);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Link href="/admin" aria-label="Voltar" style={{ display: "flex" }}>
          <ArrowLeft size={24} color="var(--cor-texto)" />
        </Link>
        <h1 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 20, fontWeight: 700, margin: 0 }}>
          Alertas de emergência
        </h1>
      </div>

      {pendentes.length === 0 && resolvidos.length === 0 && (
        <p style={{ color: "var(--cor-texto-fraco)", textAlign: "center", padding: "40px 0" }}>
          Nenhum alerta registrado ainda.
        </p>
      )}

      {pendentes.length > 0 && (
        <>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--cor-vermelho)", textTransform: "uppercase", marginBottom: 10 }}>
            Pendentes ({pendentes.length})
          </h2>
          {pendentes.map((a) => (
            <AlertaCard key={a.id} alerta={a} />
          ))}
        </>
      )}

      {resolvidos.length > 0 && (
        <>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--cor-texto-fraco)", textTransform: "uppercase", marginTop: 24, marginBottom: 10 }}>
            Resolvidos
          </h2>
          {resolvidos.map((a) => (
            <AlertaCard key={a.id} alerta={a} resolvido />
          ))}
        </>
      )}
    </div>
  );
}

function AlertaCard({ alerta, resolvido }) {
  const linkMapa = alerta.latitude && alerta.longitude
    ? `https://www.google.com/maps?q=${alerta.latitude},${alerta.longitude}`
    : null;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: `1px solid ${resolvido ? "var(--cor-borda)" : "var(--cor-vermelho)"}`,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        opacity: resolvido ? 0.7 : 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{alerta.perfis?.nome_completo || "Morador"}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--cor-texto-fraco)" }}>
          <Clock size={12} /> {tempoRelativo(alerta.criado_em)}
        </span>
      </div>
      <div style={{ fontSize: 13, color: "var(--cor-texto-fraco)", marginBottom: 10 }}>
        {alerta.bairros?.nome}
        {alerta.perfis?.telefone && ` · ${alerta.perfis.telefone}`}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {linkMapa && (
          <a
            href={linkMapa}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9, border: "1px solid var(--cor-azul)", color: "var(--cor-azul)", fontSize: 12.5, fontWeight: 700, textDecoration: "none" }}
          >
            <MapPin size={13} /> Ver localização
          </a>
        )}
        {!resolvido && <ResolverAlertaButton alertaId={alerta.id} />}
      </div>
    </div>
  );
}
