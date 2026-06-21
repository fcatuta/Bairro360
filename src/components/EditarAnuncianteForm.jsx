"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIAS_NEGOCIO, PLANOS } from "@/lib/constants";
import { somarMeses, statusVencimento, formatarData } from "@/lib/vencimento";

const hoje = new Date().toISOString().split("T")[0];

export default function EditarAnuncianteForm({ negocio }) {
  const router = useRouter();
  const supabase = createClient();

  const [nome, setNome] = useState(negocio.nome || "");
  const [categoria, setCategoria] = useState(negocio.categoria || "outros");
  const [ehPago, setEhPago] = useState(negocio.plano === "pago");
  const [planoVencimento, setPlanoVencimento] = useState(negocio.plano_vencimento || "");
  const [valorMensal, setValorMensal] = useState(negocio.plano_valor_mensal ? String(negocio.plano_valor_mensal) : String(PLANOS.pago.valorPadrao));
  const [cupomTexto, setCupomTexto] = useState(negocio.cupom_texto || "");
  const [cupomValidade, setCupomValidade] = useState(negocio.cupom_validade || "");
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

  const venc = statusVencimento(ehPago ? "pago" : "gratuito", planoVencimento);

  function handleRenovar(meses) {
    const base = planoVencimento && planoVencimento >= hoje ? planoVencimento : hoje;
    setPlanoVencimento(somarMeses(base, meses));
  }

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
        plano: ehPago ? "pago" : "gratuito",
        plano_vencimento: ehPago ? planoVencimento || null : null,
        plano_valor_mensal: ehPago && valorMensal ? parseFloat(valorMensal) : null,
        cupom_texto: ehPago && cupomTexto.trim() ? cupomTexto.trim() : null,
        cupom_validade: ehPago && cupomTexto.trim() && cupomValidade ? cupomValidade : null,
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

      <label
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 12,
          border: ehPago ? "1px solid #8A6111" : "1px solid var(--cor-borda)",
          background: ehPago ? "#FBEFD3" : "#FFFFFF",
          cursor: "pointer", marginBottom: 18,
        }}
      >
        <input type="checkbox" checked={ehPago} onChange={(e) => setEhPago(e.target.checked)} style={{ width: 18, height: 18 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: ehPago ? "#8A6111" : "var(--cor-texto)" }}>
          Anunciante pago
        </span>
      </label>

      {ehPago && (
        <div style={{ background: "var(--cor-laranja-bg)", borderRadius: 12, padding: 16, marginBottom: 18 }}>
          {venc && (
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 700, color: venc.color, background: venc.bg, padding: "4px 10px", borderRadius: 10, marginBottom: 12 }}>
              {venc.label}
            </div>
          )}

          <Campo label="Valor mensal (R$)">
            <input type="number" step="0.01" value={valorMensal} onChange={(e) => setValorMensal(e.target.value)} style={inputStyle} />
          </Campo>

          <Campo label="Vencimento do plano">
            <input type="date" value={planoVencimento} onChange={(e) => setPlanoVencimento(e.target.value)} style={inputStyle} />
          </Campo>

          <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--cor-texto-fraco)", display: "block", marginBottom: 8 }}>
            Renovar a partir de hoje (ou do vencimento atual, se ainda não venceu):
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[1, 3, 6, 12].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleRenovar(m)}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 16,
                  border: "1px solid var(--cor-laranja)", background: "#FFFFFF", color: "var(--cor-laranja)",
                  fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                }}
              >
                <RefreshCw size={12} /> +{m}m
              </button>
            ))}
          </div>
        </div>
      )}

      {ehPago && (
        <>
          <Campo label="Cupom de desconto (opcional)">
            <input value={cupomTexto} onChange={(e) => setCupomTexto(e.target.value)} placeholder='Ex: "10% OFF"' style={inputStyle} />
          </Campo>
          {cupomTexto.trim() && (
            <Campo label="Cupom válido até (opcional)">
              <input type="date" value={cupomValidade} onChange={(e) => setCupomValidade(e.target.value)} style={inputStyle} />
            </Campo>
          )}
        </>
      )}

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
          display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "14px 16px", borderRadius: 12,
          border: ativo ? "1px solid var(--cor-verde)" : "1px solid var(--cor-vermelho)",
          background: ativo ? "var(--cor-verde-bg)" : "var(--cor-vermelho-bg)",
          color: ativo ? "var(--cor-verde)" : "var(--cor-vermelho)",
          fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 18,
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
