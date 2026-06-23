import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users } from "lucide-react";
import VoltarTopBar from "@/components/VoltarTopBar";

export default async function MoradoresPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) redirect("/login");

  // Busca o bairro do usuário logado
  const { data: meuPerfil } = await supabase
    .from("perfis")
    .select("bairro_id, bairros(nome)")
    .eq("id", authData.user.id)
    .single();

  const bairroId = meuPerfil?.bairro_id;
  const bairroNome = meuPerfil?.bairros?.nome;

  // Busca moradores do mesmo bairro que optaram por aparecer na lista
  const { data: moradores } = await supabase
    .from("perfis")
    .select("id, nome_completo, foto_url, endereco_rua, whatsapp, whatsapp_publico, tipo, criado_em")
    .eq("bairro_id", bairroId)
    .eq("visivel_na_lista", true)
    .order("nome_completo");

  const lista = moradores || [];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      <VoltarTopBar title="Moradores" />

      <div style={{ padding: "16px 16px 100px" }}>
        {/* Cabeçalho */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Users size={20} color="var(--cor-laranja)" />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--cor-texto)", margin: 0 }}>
            {bairroNome}
          </h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--cor-texto-fraco)", marginBottom: 20 }}>
          {lista.length} {lista.length === 1 ? "morador visível" : "moradores visíveis"} · Apenas quem optou por aparecer é exibido aqui.
        </p>

        {lista.length === 0 ? (
          <div style={{
            background: "#FFFFFF", border: "1px solid var(--cor-borda)", borderRadius: 16,
            padding: 32, textAlign: "center"
          }}>
            <Users size={36} color="var(--cor-borda)" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--cor-texto)", marginBottom: 6 }}>
              Nenhum morador na lista ainda
            </p>
            <p style={{ fontSize: 13, color: "var(--cor-texto-fraco)", margin: 0 }}>
              Os moradores podem optar por aparecer aqui nas configurações do perfil.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lista.map((m) => (
              <MoradorCard key={m.id} morador={m} euSouEle={m.id === authData.user.id} />
            ))}
          </div>
        )}

        {/* Aviso sobre privacidade */}
        <div style={{
          marginTop: 24, padding: "12px 14px", borderRadius: 12,
          background: "var(--cor-fundo-alt, #F1F5F9)", border: "1px solid var(--cor-borda)"
        }}>
          <p style={{ fontSize: 12, color: "var(--cor-texto-fraco)", margin: 0, lineHeight: 1.5 }}>
            Quer aparecer aqui? Acesse <strong>Meu Perfil → Privacidade</strong> e ative a opção.
          </p>
        </div>
      </div>
    </div>
  );
}

function MoradorCard({ morador, euSouEle }) {
  const inicial = morador.nome_completo?.charAt(0).toUpperCase() || "?";
  const whatsappVisivel = morador.whatsapp_publico && morador.whatsapp;

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #F1F5F9",
      borderRadius: 16,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
    }}>
      {/* Foto / inicial */}
      <Link href={`/morador/${morador.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "var(--cor-borda-suave, #F1F5F9)",
          border: "2px solid var(--cor-borda, #E2E8F0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {morador.foto_url ? (
            <img src={morador.foto_url} alt={morador.nome_completo}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--cor-texto-fraco, #94A3B8)" }}>
              {inicial}
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link href={`/morador/${morador.id}`} style={{ textDecoration: "none" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 2 }}>
            {morador.nome_completo}
            {euSouEle && (
              <span style={{ fontSize: 11, fontWeight: 400, color: "var(--cor-texto-fraco)", marginLeft: 6 }}>
                (você)
              </span>
            )}
          </div>
        </Link>
        <div style={{ fontSize: 12, color: "#94A3B8" }}>
          {morador.endereco_rua || "Jardim França"}
          {morador.tipo !== "morador" && (
            <span style={{
              marginLeft: 8, fontSize: 11, fontWeight: 700,
              color: "var(--cor-laranja)", textTransform: "capitalize"
            }}>
              · {morador.tipo}
            </span>
          )}
        </div>
      </div>

      {/* Botão WhatsApp */}
      {whatsappVisivel && (
        <a
          href={`https://wa.me/55${morador.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chamar ${morador.nome_completo} no WhatsApp`}
          style={{
            flexShrink: 0,
            width: 40, height: 40, borderRadius: "50%",
            background: "#0F766E",
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none",
          }}
        >
          {/* Ícone WhatsApp inline SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}
    </div>
  );
}
