"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Save, Shield, Phone, MapPin, AlertCircle } from "lucide-react";
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
      if (endereco) {
        setRua(endereco.rua);
      }
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
      console.error("Erro ao enviar foto:", erroUpload);
      setErro(`Não foi possível enviar a foto: ${erroUpload.message}`);
      setEnviandoFoto(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("fotos-perfil").getPublicUrl(caminho);
    const novaUrl = `${urlData.publicUrl}?t=${Date.now()}`; // evita cache da foto antiga

    const { error: erroPerfil } = await supabase
      .from("perfis")
      .update({ foto_url: novaUrl })
      .eq("id", userId);

    setEnviandoFoto(false);

    if (erroPerfil) {
      console.error("Erro ao salvar URL da foto:", erroPerfil);
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
      })
      .eq("id", userId);

    setSalvando(false);

    if (error) {
      console.error("Erro ao salvar perfil:", error);
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
          <div
            style={{
              width: 96, height: 96, borderRadius: "50%", background: "var(--cor-borda-suave)",
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
              overflow: "hidden", border: "2px solid var(--cor-borda)",
            }}
          >
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            style={{ display: "none" }}
          />
        </div>

        <form onSubmit={handleSalvar}>
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

          <SecaoTitulo texto="Endereço" />
          <div style={{ background: "var(--cor-azul-bg)", borderRadius: 10, padding: "10px 12px", display: "flex", gap: 8, marginBottom: 16 }}>
            <Shield size={15} color="var(--cor-azul)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12.5, color: "var(--cor-azul)", margin: 0, lineHeight: 1.45 }}>
              O CEP e o número da sua casa ficam privados — só você e os administradores do bairro podem ver. Outros moradores veem apenas o nome da rua.
            </p>
          </div>
          <Campo label="CEP">
            <input
              value={cep}
              onChange={(e) => handleBuscarCep(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              style={inputStyle}
            />
            {buscandoCep && <span style={{ fontSize: 12, color: "var(--cor-texto-fraco)" }}>Buscando endereço...</span>}
          </Campo>
          <Campo label="Rua">
            <input value={rua} onChange={(e) => setRua(e.target.value)} style={inputStyle} />
          </Campo>
          <Campo label="Número da casa">
            <input value={numero} onChange={(e) => setNumero(e.target.value)} style={inputStyle} />
          </Campo>

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
  width: "100%",
  padding: "13px 14px",
  borderRadius: 10,
  border: "1px solid var(--cor-borda)",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  background: "#FFFFFF",
  fontFamily: "inherit",
};

const botaoPrimario = {
  width: "100%",
  padding: "16px 0",
  borderRadius: 12,
  border: "none",
  background: "var(--cor-laranja)",
  color: "#FFF",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  marginTop: 8,
};
