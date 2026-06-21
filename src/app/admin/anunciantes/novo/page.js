"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIAS_NEGOCIO, PLANOS } from "@/lib/constants";

const PLANO_OPCOES = [
  { value: "gratuito", label: "Gratuito" },
  { value: "bronze", label: "Bronze" },
  { value: "prata", label: "Prata" },
  { value: "ouro", label: "Ouro" },
];

export default function NovoAnunciantePage() {
  const router = useRouter();
  const supabase = createClient();

  const [bairros, setBairros] = useState([]);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("padaria");
  const [bairroId, setBairroId] = useState("");
  const [plano, setPlano] = useState("gratuito");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    supabase
      .from("bairros")
      .select("id, nome")
      .order("nome")
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao buscar bairros:", error);
          return;
        }
        setBairros(data || []);
        if (data && data.length > 0) setBairroId(data[0].id);
      });
  }, []);

  async function handleSalvar(e) {
    e.preventDefault();
    setErro("");

    if (!bairroId) {
      setErro("Escolha um bairro para o anunciante.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase.from("negocios").insert({
      bairro_id: bairroId,
      nome: nome.trim(),
      categoria,
      plano,
      telefone: telefone.trim() || null,
      whatsapp: whatsapp.trim() || null,
      endereco: endereco.trim() || null,
      descricao: descricao.trim() || null,
      telefone_validado: true, // cadastrado manualmente por um administrador
    });

    if (error) {
      console.error("Erro ao cadastrar anunciante:", error);
      setErro(
        error.code === "42501"
          ? "Sua conta não tem permissão de administrador. Verifique a migração no banco."
          : `Não foi possível cadastrar: ${error.message}`
      );
      setSalvando(false);
      return;
    }

    router.push("/admin/anunciantes");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={() => router.back()} aria-label="Voltar" style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={24} color="var(--cor-texto)" />
        </button>
        <h1 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 20, fontWeight: 700, margin: 0 }}>
          Cadastrar anunciante
        </h1>
      </div>

      <form onSubmit={handleSalvar}>
        <Campo label="Nome do negócio">
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Padaria Pão Nosso"
            style={inputStyle}
          />
        </Campo>

        <Campo label="Categoria">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={inputStyle}>
            {CATEGORIAS_NEGOCIO.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Campo>

        <Campo label="Bairro">
          <select required value={bairroId} onChange={(e) => setBairroId(e.target.value)} style={inputStyle}>
            {bairros.length === 0 && <option value="">Carregando bairros...</option>}
            {bairros.map((b) => (
              <option key={b.id} value={b.id}>{b.nome}</option>
            ))}
          </select>
        </Campo>

        <Campo label="Plano contratado">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PLANO_OPCOES.map((p) => {
              const cores = PLANOS[p.value];
              const ativo = plano === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlano(p.value)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 20,
                    border: ativo ? `1px solid ${cores?.color || "var(--cor-texto)"}` : "1px solid var(--cor-borda)",
                    background: ativo ? (cores?.bg || "var(--cor-borda-suave)") : "#FFFFFF",
                    color: ativo ? (cores?.color || "var(--cor-texto)") : "var(--cor-texto-suave)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </Campo>

        <Campo label="Telefone">
          <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" style={inputStyle} />
        </Campo>

        <Campo label="WhatsApp (com DDD, só números)">
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="11999999999" style={inputStyle} />
        </Campo>

        <Campo label="Endereço">
          <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número" style={inputStyle} />
        </Campo>

        <Campo label="Descrição (opcional)">
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
          />
        </Campo>

        {erro && <p style={{ color: "var(--cor-vermelho)", fontSize: 14, marginBottom: 16 }}>{erro}</p>}

        <button type="submit" disabled={salvando} style={botaoPrimario}>
          {salvando ? "Cadastrando..." : "Cadastrar anunciante"}
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
};
