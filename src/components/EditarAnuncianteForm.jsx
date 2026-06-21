"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIAS_NEGOCIO, PLANOS } from "@/lib/constants";

const PLANO_OPCOES = [
  { value: "gratuito", label: "Gratuito" },
  { value: "bronze", label: "Bronze" },
  { value: "prata", label: "Prata" },
  { value: "ouro", label: "Ouro" },
];

export default function EditarAnuncianteForm({ negocio }) {
  const router = useRouter();
  const supabase = createClient();

  const [nome, setNome] = useState(negocio.nome || "");
  const [categoria, setCategoria] = useState(negocio.categoria || "outros");
  const [plano, setPlano] = useState(negocio.plano || "gratuito");
  const [telefone, setTelefone] = useState(negocio.telefone || "");
  const [whatsapp, setWhatsapp] = useState(negocio.whatsapp || "");
  const [endereco, setEndereco] = useState(negocio.endereco || "");
  const [descricao, setDescricao] = useState(negocio.descricao || "");
  const [ativo, setAtivo] = useState(negocio.ativo);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleExcluir() {
    setErro("");
    setExcluindo(true);

    const { error } = await supabase.from("negocios").delete().eq("id", negocio.id);

    setExcluindo(false);

    if (error) {
      console.error("Erro ao excluir anunciante:", error);
      setErro(`Não foi possível excluir: ${error.message}`);
      return;
    }

    router.push("/admin/anunciantes");
    router.refresh();
  }

  async function handleSalvar(e) {
    e.preventDefault();
    setErro("");
    setSucesso(false);
    setSalvando(true);

    const { error } = await supabase
      .from("negocios")
      .update({
        nome: nome.trim(),
        categoria,
        plano,
        telefone: telefone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        endereco: endereco.trim() || null,
        descricao: descricao.trim() || null,
        ativo,
      })
      .eq("id", negocio.id);

    setSalvando(false);

    if (error) {
      console.error("Erro ao atualizar anunciante:", error);
      setErro(`Não foi possível salvar: ${error.message}`);
      return;
    }

    setSucesso(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSalvar}>
      <Campo label="Nome do negócio">
        <input required value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} />
      </Campo>

      <Campo label="Categoria">
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={inputStyle}>
          {CATEGORIAS_NEGOCIO.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </Campo>

      <Campo label="Plano contratado">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PLANO_OPCOES.map((p) => {
            const cores = PLANOS[p.value];
            const ativoPlano = plano === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPlano(p.value)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 20,
                  border: ativoPlano ? `1px solid ${cores?.color || "var(--cor-texto)"}` : "1px solid var(--cor-borda)",
                  background: ativoPlano ? (cores?.bg || "var(--cor-borda-suave)") : "#FFFFFF",
                  color: ativoPlano ? (cores?.color || "var(--cor-texto)") : "var(--cor-texto-suave)",
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
        <input value={telefone} onChange={(e) => setTelefone(e.target.value)} style={inputStyle} />
      </Campo>

      <Campo label="WhatsApp">
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={inputStyle} />
      </Campo>

      <Campo label="Endereço">
        <input value={endereco} onChange={(e) => setEndereco(e.target.value)} style={inputStyle} />
      </Campo>

      <Campo label="Descrição">
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }} />
      </Campo>

      <button
        type="button"
        onClick={() => setAtivo(!ativo)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "14px 16px",
          borderRadius: 12,
          border: ativo ? "1px solid var(--cor-verde)" : "1px solid var(--cor-vermelho)",
          background: ativo ? "var(--cor-verde-bg)" : "var(--cor-vermelho-bg)",
          color: ativo ? "var(--cor-verde)" : "var(--cor-vermelho)",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: 18,
        }}
      >
        {ativo ? "✓ Ativo — aparece no guia comercial" : "✕ Inativo — escondido do app"}
      </button>

      {erro && <p style={{ color: "var(--cor-vermelho)", fontSize: 14, marginBottom: 16 }}>{erro}</p>}
      {sucesso && <p style={{ color: "var(--cor-verde)", fontSize: 14, marginBottom: 16 }}>Salvo com sucesso.</p>}

      <button type="submit" disabled={salvando} style={botaoPrimario}>
        {salvando ? "Salvando..." : "Salvar alterações"}
      </button>

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--cor-borda-suave)" }}>
        {!confirmarExclusao ? (
          <button
            type="button"
            onClick={() => setConfirmarExclusao(true)}
            style={{ ...botaoPerigo, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <Trash2 size={17} />
            Excluir anunciante
          </button>
        ) : (
          <div style={{ background: "var(--cor-vermelho-bg)", borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 14, color: "var(--cor-vermelho)", fontWeight: 700, marginBottom: 12 }}>
              Tem certeza? Essa ação não pode ser desfeita.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setConfirmarExclusao(false)}
                style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid var(--cor-borda)", background: "#FFFFFF", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExcluir}
                disabled={excluindo}
                style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "var(--cor-vermelho)", color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                {excluindo ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
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

const botaoPerigo = {
  width: "100%",
  padding: "14px 0",
  borderRadius: 12,
  border: "1px solid var(--cor-vermelho)",
  background: "#FFFFFF",
  color: "var(--cor-vermelho)",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};
