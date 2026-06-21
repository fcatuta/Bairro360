"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TopBar from "@/components/TopBar";
import { CATEGORIAS } from "@/lib/constants";

export default function NovaOcorrenciaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categoria, setCategoria] = useState("seguranca");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

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

    const { error } = await supabase.from("ocorrencias").insert({
      bairro_id: perfil.bairro_id,
      autor_id: authData.user.id,
      categoria,
      titulo,
      descricao,
    });

    if (error) {
      setErro("Não foi possível publicar agora. Tente de novo em alguns segundos.");
      setEnviando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      <TopBar onBack={() => router.push("/")} title="Nova ocorrência" />

      <div style={{ padding: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8 }}>Categoria</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {Object.entries(CATEGORIAS).map(([key, c]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategoria(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "8px 13px",
                borderRadius: 20,
                border: categoria === key ? `1px solid ${c.color}` : "1px solid var(--cor-borda)",
                background: categoria === key ? c.bg : "#FFFFFF",
                color: categoria === key ? c.color : "var(--cor-texto-suave)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <c.icon size={13} />
              {c.label}
            </button>
          ))}
        </div>

        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8 }}>Título</label>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Resuma em poucas palavras"
          style={inputStyle}
        />

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

        {erro && <p style={{ color: "var(--cor-vermelho)", fontSize: 14, marginTop: 16 }}>{erro}</p>}

        <button
          onClick={handlePublicar}
          disabled={!titulo || !descricao || enviando}
          style={{
            width: "100%",
            padding: "17px 0",
            borderRadius: 12,
            border: "none",
            background: titulo && descricao && !enviando ? "var(--cor-laranja)" : "var(--cor-borda)",
            color: "#FFF",
            fontSize: 16,
            fontWeight: 700,
            cursor: titulo && descricao && !enviando ? "pointer" : "default",
            marginTop: 24,
          }}
        >
          {enviando ? "Publicando..." : "Publicar no bairro"}
        </button>
      </div>
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
};
