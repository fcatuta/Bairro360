"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Save, Users, MessageSquare, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function EditarBairroForm({ bairro, contagens }) {
  const router = useRouter();
  const supabase = createClient();

  const [nome, setNome] = useState(bairro.nome || "");
  const [cidade, setCidade] = useState(bairro.cidade || "");
  const [estado, setEstado] = useState(bairro.estado || "");
  const [ativo, setAtivo] = useState(bairro.ativo);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const temVinculos = contagens.moradores > 0 || contagens.ocorrencias > 0 || contagens.negocios > 0;

  async function handleSalvar(e) {
    e.preventDefault();
    setErro("");
    setSucesso(false);
    setSalvando(true);

    const { error } = await supabase
      .from("bairros")
      .update({ nome: nome.trim(), cidade: cidade.trim(), estado: estado.trim().toUpperCase(), ativo })
      .eq("id", bairro.id);

    setSalvando(false);

    if (error) {
      console.error("Erro ao atualizar bairro:", error);
      setErro(`Não foi possível salvar: ${error.message}`);
      return;
    }

    setSucesso(true);
    router.refresh();
  }

  async function handleExcluir() {
    setErro("");
    setExcluindo(true);

    const { error } = await supabase.from("bairros").delete().eq("id", bairro.id);

    setExcluindo(false);

    if (error) {
      console.error("Erro ao excluir bairro:", error);
      setErro(
        error.code === "23503"
          ? "Não é possível excluir: ainda existem moradores, ocorrências ou anunciantes vinculados a este bairro."
          : `Não foi possível excluir: ${error.message}`
      );
      return;
    }

    router.push("/admin/bairros");
    router.refresh();
  }

  return (
    <form onSubmit={handleSalvar}>
      {/* Resumo do que está vinculado a este bairro */}
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        <Contagem icone={Users} numero={contagens.moradores} legenda="moradores" />
        <Contagem icone={MessageSquare} numero={contagens.ocorrencias} legenda="ocorrências" />
        <Contagem icone={Store} numero={contagens.negocios} legenda="anunciantes" />
      </div>

      <Campo label="Nome do bairro">
        <input required value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} />
      </Campo>

      <Campo label="Cidade">
        <input required value={cidade} onChange={(e) => setCidade(e.target.value)} style={inputStyle} />
      </Campo>

      <Campo label="Estado (sigla)">
        <input required value={estado} onChange={(e) => setEstado(e.target.value)} maxLength={2} style={inputStyle} />
      </Campo>

      <button
        type="button"
        onClick={() => setAtivo(!ativo)}
        style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "14px 16px", borderRadius: 12,
          border: ativo ? "1px solid var(--cor-verde)" : "1px solid var(--cor-vermelho)",
          background: ativo ? "var(--cor-verde-bg)" : "var(--cor-vermelho-bg)",
          color: ativo ? "var(--cor-verde)" : "var(--cor-vermelho)",
          fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 20, textAlign: "left",
        }}
      >
        {ativo ? "✓ Ativo — aparece para novos moradores" : "✕ Desativado — escondido, mas histórico preservado"}
      </button>

      {erro && <p style={{ color: "var(--cor-vermelho)", fontSize: 14, marginBottom: 16 }}>{erro}</p>}
      {sucesso && <p style={{ color: "var(--cor-verde)", fontSize: 14, marginBottom: 16 }}>Salvo com sucesso.</p>}

      <button
        type="submit"
        disabled={salvando}
        style={{ ...botaoPrimario, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        <Save size={17} />
        {salvando ? "Salvando..." : "Salvar alterações"}
      </button>

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--cor-borda-suave)" }}>
        <p style={{ fontSize: 12.5, color: "var(--cor-texto-fraco)", marginBottom: 12, lineHeight: 1.5 }}>
          {temVinculos
            ? "Este bairro tem dados vinculados — use \"Desativar\" acima para escondê-lo sem perder o histórico. A exclusão definitiva só é permitida para bairros vazios."
            : "Este bairro não tem nenhum dado vinculado ainda — pode ser excluído definitivamente com segurança."}
        </p>

        {!confirmarExclusao ? (
          <button
            type="button"
            onClick={() => setConfirmarExclusao(true)}
            disabled={temVinculos}
            style={{
              ...botaoPerigo,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: temVinculos ? 0.4 : 1,
              cursor: temVinculos ? "not-allowed" : "pointer",
            }}
          >
            <Trash2 size={17} />
            Excluir definitivamente
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

function Contagem({ icone: Icone, numero, legenda }) {
  return (
    <div style={{ flex: 1, background: "#FFFFFF", border: "1px solid var(--cor-borda)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
      <Icone size={16} color="var(--cor-texto-fraco)" style={{ marginBottom: 4 }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--cor-texto)" }}>{numero}</div>
      <div style={{ fontSize: 11, color: "var(--cor-texto-fraco)" }}>{legenda}</div>
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

const botaoPerigo = {
  width: "100%",
  padding: "14px 0",
  borderRadius: 12,
  border: "1px solid var(--cor-vermelho)",
  background: "#FFFFFF",
  color: "var(--cor-vermelho)",
  fontSize: 15,
  fontWeight: 700,
};
