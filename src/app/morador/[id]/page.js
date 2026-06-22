import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Phone, MapPin, Calendar } from "lucide-react";
import VoltarTopBar from "@/components/VoltarTopBar";

function formatarMesAno(dataIso) {
  const d = new Date(dataIso);
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function InfoLinha({ icone: Icone, texto }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--cor-borda-suave)" }}>
      <Icone size={18} color="var(--cor-texto-fraco)" />
      <span style={{ fontSize: 14, color: "var(--cor-texto)" }}>{texto}</span>
    </div>
  );
}

export default async function PerfilPublicoPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect("/login");

  // Buscando os dados do morador e o nome do bairro vinculado
  const { data: morador, error } = await supabase
    .from("perfis")
    .select(`
      id, 
      nome_completo, 
      foto_url, 
      telefone, 
      whatsapp, 
      endereco_rua, 
      tipo, 
      criado_em,
      bairros ( nome )
    `)
    .eq("id", id)
    .single();

  if (error || !morador) {
    console.error("Erro ao buscar morador:", error);
    notFound();
  }

  const ehOProprioUsuario = morador.id === authData.user.id;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#F9FAFB" }}>
      <VoltarTopBar title="Perfil do morador" />

      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 96, height: 96, borderRadius: "50%", background: "#E5E7EB",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", border: "2px solid #D1D5DB", marginBottom: 14,
            }}
          >
            {morador.foto_url ? (
              <img src={morador.foto_url} alt={morador.nome_completo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 32, fontWeight: 700, color: "#9CA3AF" }}>
                {morador.nome_completo?.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0, textAlign: "center", color: "#111827" }}>
            {morador.nome_completo}
            {ehOProprioUsuario && <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 400 }}> (você)</span>}
          </h1>
          {morador.tipo !== "morador" && (
            <span style={{ fontSize: 12, fontWeight: 700, color: "#EA580C", textTransform: "capitalize", marginTop: 4 }}>
              {morador.tipo}
            </span>
          )}
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14, padding: 16 }}>
          {morador.bairros?.nome && (
            <InfoLinha icone={MapPin} texto={morador.endereco_rua ? `${morador.endereco_rua} · ${morador.bairros.nome}` : morador.bairros.nome} />
          )}
          <InfoLinha icone={Calendar} texto={`No bairro desde ${formatarMesAno(morador.criado_em)}`} />
          
          {morador.whatsapp && (
            <a
              href={`https://wa.me/55${morador.whatsapp.replace(/\D/g, "" )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10, 
                marginTop: 14, padding: "12px 14px", borderRadius: 10, 
                background: "#16A34A", color: "#FFF", textDecoration: "none", 
                fontSize: 14, fontWeight: 700 
              }}
            >
              <Phone size={16} /> Chamar no WhatsApp
            </a>
          )}
        </div>

        <p style={{ fontSize: 12, color: "#6B7280", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          Endereço completo e outros dados pessoais ficam privados, visíveis apenas para o próprio morador e para administradores.
        </p>
      </div>
    </div>
  );
}
