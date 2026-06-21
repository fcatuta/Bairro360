"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NovoBairroPage() {
  const router = useRouter();
  const supabase = createClient();

  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSalvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const { error } = await supabase.from("bairros").insert({
      nome: nome.trim(),
      cidade: cidade.trim(),
      estado: estado.trim().toUpperCase(),
    });

    if (error) {
      console.error("Erro ao criar bairro:", error);
      setErro(
        error.code === "42501"
          ? "Sua conta não tem permissão de administrador. Verifique a migração no banco."
          : `Não foi possível criar o bairro: ${error.message}`
      );
      setSalvando(false);
      return;
    }

    router.push("/admin/bairros");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={() => router.back()} aria-label="Voltar" style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={24} color="var(--cor-texto)" />
        </button>
        <h1 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 20, fontWeight: 700, margin: 0 }}>
          Criar novo bairro
        </h1>
      </div>

      <form onSubmit={handleSalvar}>
        <Campo label="Nome do bairro">
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Jardim das Acácias"
            style={inputStyle}
          />
        </Campo>

        <Campo label="Cidade">
          <input
            required
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Ex: São Paulo"
            style={inputStyle}
          />
        </Campo>

        <Campo label="Estado (sigla)">
          <input
            required
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            placeholder="Ex: SP"
            maxLength={2}
            style={inputStyle}
          />
        </Campo>

        {erro && <p style={{ color: "var(--cor-vermelho)", fontSize: 14, marginBottom: 16 }}>{erro}</p>}

        <button type="submit" disabled={salvando} style={botaoPrimario}>
          {salvando ? "Criando..." : "Criar bairro"}
        </button>
      </form>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
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
};
