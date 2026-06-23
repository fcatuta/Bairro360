"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, Image } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import TopBar from "@/components/TopBar";
import { CATEGORIAS } from "@/lib/constants";

export default function NovaOcorrenciaPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef(null);

  const [categoria, setCategoria] = useState("seguranca");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState(null); // File object
  const [fotoPreview, setFotoPreview] = useState(null); // URL para preview
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErro("A foto precisa ter no máximo 10MB.");
      return;
    }

    setErro("");
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  function handleRemoverFoto() {
    setFoto(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handlePublicar() {
    setErro("");
    setEnviando(true);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      router.push("/login");
      return;
    }

    const { data: perfil } = await supabase
      .from("perfis")
      .select("bairro_id")
      .eq("id", authData.user.id)
      .single();

    if (!perfil?.bairro_id) {
      router.push("/escolher-bairro");
      return;
    }

    // Upload da foto se houver
    let fotoUrl = null;
    if (foto) {
      const extensao = foto.name.split(".").pop();
      const caminho = `${authData.user.id}/${Date.now()}.${extensao}`;

      const { error: erroUpload } = await supabase.storage
        .from("fotos-ocorrencias")
        .upload(caminho, foto);

      if (erroUpload) {
        setErro("Não foi possível enviar a foto. Tente de novo.");
        setEnviando(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("fotos-ocorrencias")
        .getPublicUrl(caminho);

      fotoUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("ocorrencias").insert({
      bairro_id: perfil.bairro_id,
      autor_id: authData.user.id,
      categoria,
      titulo,
      descricao,
      foto_url: fotoUrl,
    });

    if (error) {
      setErro("Não foi possível publicar agora. Tente de novo em alguns segundos.");
      setEnviando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  const podePublicar = titulo.trim() && descricao.trim() && !enviando;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      <TopBar onBack={() => router.push("/")} title="Nova ocorrência" />

      <div style={{ padding: 20, paddingBottom: 40 }}>
        {/* Categoria */}
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8 }}>Categoria</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {Object.entries(CATEGORIAS).map(([key, c]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategoria(key)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "8px 13px", borderRadius: 20,
                border: categoria === key ? `1px solid ${c.color}` : "1px solid var(--cor-borda)",
                background: categoria === key ? c.bg : "#FFFFFF",
                color: categoria === key ? c.color : "var(--cor-texto-suave)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <c.icon size={13} />
              {c.label}
            </button>
          ))}
        </div>

        {/* Título */}
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8 }}>Título</label>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Resuma em poucas palavras"
          style={inputStyle}
        />

        {/* Descrição */}
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8, marginTop: 20 }}>
          Descrição
        </label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Conte o que aconteceu, onde e quando"
          rows={5}
          style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
        />

        {/* Foto */}
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8, marginTop: 20 }}>
          Foto <span style={{ fontWeight: 400, color: "var(--cor-texto-fraco)" }}>(opcional)</span>
        </label>

        {fotoPreview ? (
          <div style={{ position: "relative", marginBottom: 8 }}>
            <img
              src={fotoPreview}
              alt="Preview"
              style={{
                width: "100%", borderRadius: 12, objectFit: "cover",
                maxHeight: 260, display: "block",
                border: "1px solid var(--cor-borda)",
              }}
            />
            <button
              type="button"
              onClick={handleRemoverFoto}
              style={{
                position: "absolute", top: 10, right: 10,
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(15,23,42,0.65)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={16} color="#FFFFFF" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%", padding: "18px 0", borderRadius: 12,
              border: "2px dashed var(--cor-borda)", background: "#FAFAFA",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 8, cursor: "pointer", marginBottom: 8,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "var(--cor-laranja-bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Camera size={22} color="var(--cor-laranja)" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--cor-texto)" }}>
              Adicionar foto
            </span>
            <span style={{ fontSize: 12, color: "var(--cor-texto-fraco)" }}>
              Toque para tirar ou escolher uma foto
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFotoChange}
          style={{ display: "none" }}
        />

        {erro && <p style={{ color: "var(--cor-vermelho)", fontSize: 14, marginTop: 16 }}>{erro}</p>}

        <button
          onClick={handlePublicar}
          disabled={!podePublicar}
          style={{
            width: "100%", padding: "17px 0", borderRadius: 12, border: "none",
            background: podePublicar ? "var(--cor-laranja)" : "var(--cor-borda)",
            color: "#FFF", fontSize: 16, fontWeight: 700,
            cursor: podePublicar ? "pointer" : "default", marginTop: 24,
          }}
        >
          {enviando ? "Publicando..." : "Publicar no bairro"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "13px 14px", borderRadius: 10,
  border: "1px solid var(--cor-borda)", fontSize: 15, outline: "none",
  boxSizing: "border-box", background: "#FFFFFF",
};
