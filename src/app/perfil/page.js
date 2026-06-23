"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Save, Shield, AlertCircle, LogOut, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buscarEnderecoPorCep } from "@/lib/cep";
import VoltarTopBar from "@/components/VoltarTopBar";

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef(null);

  const [carregando, setCarregando] = useState(true);
  const [userId, setUserId] = useState(null);
  const [fotoUrl, setFotoUrl] = useState("");
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [contatoNome, setContatoNome] = useState("");
  const [contatoTelefone, setContatoTelefone] = useState("");

  // Privacidade
  const [visivelNaLista, setVisivelNaLista] = useState(false);
  const [whatsappPublico, setWhatsappPublico] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        router.push("/login");
        return;
      }
      setUserId(authData.user.id);

      const { data: perfil, error } = await supabase
        .from("perfis")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (error) {
        console.error("Erro ao carregar perfil:", error);
        setErro("Não foi possível carregar seu perfil.");
        setCarregando(false);
        return;
      }

      setFotoUrl(perfil.foto_url || "");
      setNomeCompleto(perfil.nome_completo || "");
      setTelefone(perfil.telefone || "");
      setWhatsapp(perfil.whatsapp || "");
      setCep(perfil.endereco_cep || "");
      setRua(perfil.endereco_rua || "");
      setNumero(perfil.endereco_numero || "");
      setContatoNome(perfil.contato_emergencia_nome || "");
      setContatoTelefone(perfil.contato_emergencia_telefone || "");
      setVisivelNaLista(perfil.visivel_na_lista ?? false);
      setWhatsappPublico(perfil.whatsapp_publico ?? false);
      setCarregando(false);
    }
    carregar();
  }, []);

  async function handleBuscarCep(valor) {
    setCep(valor);
    const limpo = valor.replace(/\D/g, "");
    if (limpo.length === 8) {
      setBuscandoCep(true);
      const endereco = await buscarEnderecoPorCep(valor);
      setBuscandoCep(false);
      if (endereco) setRua(endereco.rua);
    }
  }

  async function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 5 * 1024 * 1024) {
      setErro("A foto precisa ter no máximo 5MB.");
      return;
    }

    setErro("");
    setEnviandoFoto(true);

    const extensao = file.name.split(".").pop();
    const caminho = `${userId}/foto.${extensao}`;

    const { error: erroUpload } = await supabase.storage
      .from("fotos-perfil")
      .upload(caminho, file, { upsert: true });

    if (erroUpload) {
      setErro(`Não foi possível enviar a foto: ${erroUpload.message}`);
      setEnviandoFoto(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("fotos-perfil").getPublicUrl(caminho);
    const novaUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: erroPerfil } = await supabase
      .from("perfis")
      .update({ foto_url: novaUrl })
      .eq("id", userId);

    setEnviandoFoto(false);

    if (erroPerfil) {
      setErro(`Foto enviada, mas houve um erro ao salvar: ${erroPerfil.message}`);
      return;
    }

    setFotoUrl(novaUrl);
  }

  async function handleSalvar(e) {
    e.preventDefault();
    setErro("");
    setSucesso(false);
    setSalvando(true);

    const { error } = await supabase
      .from("perfis")
      .update({
        nome_completo: nomeCompleto.trim(),
        telefone: telefone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        endereco_cep: cep.trim() || null,
        endereco_rua: rua.trim() || null,
        endereco_numero: numero.trim() || null,
        contato_emergencia_nome: contatoNome.trim() || null,
        contato_emergencia_telefone: contatoTelefone.trim() || null,
        visivel_na_lista: visivelNaLista,
        whatsapp_publico: whatsappPublico,
      })
      .eq("id", userId);

    setSalvando(false);

    if (error) {
      setErro(`Não foi possível salvar: ${error.message}`);
      return;
    }

    setSucesso(true);
    router.refresh();
  }

  if (carregando) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
        <VoltarTopBar title="Meu perfil" />
        <p style={{ textAlign: "center", color: "var(--cor-texto-fraco)", padding: 40 }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      <VoltarTopBar title="Meu perfil" />

      <div style={{ padding: 20, paddingBottom: 60 }}>
        {/* Foto de perfil */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%", background: "var(--cor-borda-suave)",
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            overflow: "hidden", border: "2px solid var(--cor-borda)",
          }}>
            {fotoUrl ? (
              <img src={fotoUrl} alt="Sua foto de perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 32, fontWeight: 700, color: "var(--cor-texto-fraco)" }}>
                {nomeCompleto.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={enviandoFoto}
            style={{
              display: "flex", alignItems: "center", gap: 6, marginTop: 10, background: "none",
              border: "1px solid var(--cor-borda)", borderRadius: 20, padding: "7px 14px",
              fontSize: 13, fontWeight: 700, color: "var(--cor-texto-suave)", cursor: "pointer",
            }}
          >
            <Camera size={14} />
            {enviandoFoto ? "Enviando..." : "Trocar foto"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFotoChange} style={{ display: "none" }} />
        </div>

        <form onSubmit={handleSalvar}>
          {/* Dados pessoais */}
          <SecaoTitulo texto="Dados pessoais" />
          <Campo label="Nome completo">
            <input required value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} style={inputStyle} />
          </Campo>
          <Campo label="Telefone">
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" style={inputStyle} />
          </Campo>
          <Campo label="WhatsApp">
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="11999999999" style={inputStyle} />
          </Campo>

          {/* Endereço */}
          <SecaoTitulo texto="Endereço" />
          <div style={{ background: "var(--cor-azul-bg)", borderRadius: 10, padding: "10px 12px", display: "flex", gap: 8, marginBottom: 16 }}>
            <Shield size={15} color="var(--cor-azul)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12.5, color: "var(--cor-azul)", margin: 0, lineHeight: 1.45 }}>
              O CEP e o número da sua casa ficam privados — só você e os administradores do bairro podem ver. Outros moradores veem apenas o nome da rua.
            </p>
          </div>
          <Campo label="CEP">
            <input value={cep} onChange={(e) => handleBuscarCep(e.target.value)} placeholder="00000-000" maxLength={9} style={inputStyle} />
            {buscandoCep && <span style={{ fontSize: 12, color: "var(--cor-texto-fraco)" }}>Buscando endereço...</span>}
          </Campo>
          <Campo label="Rua">
            <input value={rua} onChange={(e) => setRua(e.target.value)} style={inputStyle} />
          </Campo>
          <Campo label="Número da casa">
            <input value={numero} onChange={(e) => setNumero(e.target.value)} style={inputStyle} />
          </Campo>

          {/* Contato de emergência */}
          <SecaoTitulo texto="Contato de emergência" />
          <p style={{ fontSize: 12.5, color: "var(--cor-texto-fraco)", marginBottom: 14, lineHeight: 1.45 }}>
            Alguém de confiança que possa ser acionado caso aconteça algo com você.
          </p>
          <Campo label="Nome">
            <input value={contatoNome} onChange={(e) => setContatoNome(e.target.value)} style={inputStyle} />
          </Campo>
          <Campo label="Telefone">
            <input value={contatoTelefone} onChange={(e) => setContatoTelefone(e.target.value)} placeholder="(11) 99999-9999" style={inputStyle} />
          </Campo>

          {/* Privacidade */}
          <SecaoTitulo texto="Privacidade" />
          <p style={{ fontSize: 12.5, color: "var(--cor-texto-fraco)", marginBottom: 14, lineHeight: 1.45 }}>
            Escolha o que outros moradores do bairro podem ver sobre você.
          </p>

          <Toggle
            ativo={visivelNaLista}
            onChange={setVisivelNaLista}
            titulo="Aparecer na lista de moradores"
            descricao="Seu nome e foto ficam visíveis para os outros moradores do Jardim França."
            iconeAtivo={<Eye size={16} />}
            iconeInativo={<EyeOff size={16} />}
          />

          {visivelNaLista && (
            <Toggle
              ativo={whatsappPublico}
              onChange={setWhatsappPublico}
              titulo="Exibir botão de WhatsApp"
              descricao="Outros moradores poderão te chamar pelo WhatsApp diretamente da lista."
              iconeAtivo={<Eye size={16} />}
              iconeInativo={<EyeOff size={16} />}
              destaque
            />
          )}

          {erro && (
            <p style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cor-vermelho)", fontSize: 14, marginBottom: 16 }}>
              <AlertCircle size={15} /> {erro}
            </p>
          )}
          {sucesso && <p style={{ color: "var(--cor-verde)", fontSize: 14, marginBottom: 16 }}>Perfil salvo com sucesso.</p>}

          <button
            type="submit"
            disabled={salvando}
            style={{ ...botaoPrimario, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <Save size={17} />
            {salvando ? "Salvando..." : "Salvar perfil"}
          </button>
        </form>

        {/* Sair */}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--cor-borda-suave)" }}>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%",
              padding: "14px 0", borderRadius: 12, border: "1px solid var(--cor-borda)", background: "#FFFFFF",
              color: "var(--cor-texto-suave)", fontSize: 14.5, fontWeight: 700, cursor: "pointer",
            }}
          >
            <LogOut size={16} /> Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ ativo, onChange, titulo, descricao, iconeAtivo, iconeInativo, destaque = false }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-start", gap: 14,
        padding: "14px 16px", borderRadius: 14, marginBottom: 12,
        background: ativo ? (destaque ? "#F0FDFA" : "#FFF7ED") : "#FFFFFF",
        border: `1px solid ${ativo ? (destaque ? "#0F766E" : "var(--cor-laranja)") : "var(--cor-borda)"}`,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onClick={() => onChange(!ativo)}
    >
      {/* Ícone */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        background: ativo ? (destaque ? "#0F766E" : "var(--cor-laranja)") : "var(--cor-borda-suave)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: ativo ? "#FFFFFF" : "var(--cor-texto-fraco)",
        marginTop: 2,
      }}>
        {ativo ? iconeAtivo : iconeInativo}
      </div>

      {/* Texto */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 14, fontWeight: 700,
          color: ativo ? (destaque ? "#0F766E" : "var(--cor-laranja-escuro)") : "var(--cor-texto)",
          marginBottom: 3,
        }}>
          {titulo}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--cor-texto-fraco)", lineHeight: 1.4 }}>
          {descricao}
        </div>
      </div>

      {/* Switch visual */}
      <div style={{
        width: 44, height: 24, borderRadius: 12, flexShrink: 0, marginTop: 6,
        background: ativo ? (destaque ? "#0F766E" : "var(--cor-laranja)") : "#E2E8F0",
        position: "relative", transition: "background 0.15s ease",
      }}>
        <div style={{
          position: "absolute", top: 3,
          left: ativo ? 23 : 3,
          width: 18, height: 18, borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          transition: "left 0.15s ease",
        }} />
      </div>
    </div>
  );
}

function SecaoTitulo({ texto }) {
  return (
    <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--cor-texto-fraco)", textTransform: "uppercase", letterSpacing: 0.4, marginTop: 24, marginBottom: 14 }}>
      {texto}
    </h2>
  );
}

function Campo({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "13px 14px", borderRadius: 10,
  border: "1px solid var(--cor-borda)", fontSize: 15, outline: "none",
  boxSizing: "border-box", background: "#FFFFFF", fontFamily: "inherit",
};

const botaoPrimario = {
  width: "100%", padding: "16px 0", borderRadius: 12, border: "none",
  background: "var(--cor-laranja)", color: "#FFF", fontSize: 16,
  fontWeight: 700, cursor: "pointer", marginTop: 8,
};
