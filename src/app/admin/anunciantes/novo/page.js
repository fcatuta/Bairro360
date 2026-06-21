"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIAS_NEGOCIO, PLANOS } from "@/lib/constants";
import { somarMeses } from "@/lib/vencimento";

const hoje = new Date().toISOString().split("T")[0];

export default function NovoAnunciantePage() {
  const router = useRouter();
  const supabase = createClient();

  const [bairros, setBairros] = useState([]);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("padaria");
  const [bairroId, setBairroId] = useState("");

  const [ehPago, setEhPago] = useState(false);
  const [planoInicio, setPlanoInicio] = useState(hoje);
  const [duracaoMeses, setDuracaoMeses] = useState(1);
  const [cobrancaImediata, setCobrancaImediata] = useState(true);
  const [valorMensal, setValorMensal] = useState(String(PLANOS.pago.valorPadrao));

  const [cupomTexto, setCupomTexto] = useState("");
  const [cupomValidade, setCupomValidade] = useState("");

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

    const planoVencimento = ehPago ? somarMeses(planoInicio, duracaoMeses) : null;

    const { error } = await supabase.from("negocios").insert({
      bairro_id: bairroId,
      nome: nome.trim(),
      categoria,
      plano: ehPago ? "pago" : "gratuito",
      plano_inicio: ehPago ? planoInicio : null,
      plano_vencimento: planoVencimento,
      plano_valor_mensal: ehPago && cobrancaImediata && valorMensal ? parseFloat(valorMensal) : null,
      cupom_texto: ehPago && cupomTexto.trim() ? cupomTexto.trim() : null,
      cupom_validade: ehPago && cupomTexto.trim() && cupomValidade ? cupomValidade : null,
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
          <input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Padaria Pão Nosso" style={inputStyle} />
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

        <label
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 12,
            border: ehPago ? "1px solid #8A6111" : "1px solid var(--cor-borda)",
            background: ehPago ? "#FBEFD3" : "#FFFFFF",
            cursor: "pointer", marginBottom: 18,
          }}
        >
          <input type="checkbox" checked={ehPago} onChange={(e) => setEhPago(e.target.checked)} style={{ width: 18, height: 18 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: ehPago ? "#8A6111" : "var(--cor-texto)" }}>
              Anunciante pago (R$ {PLANOS.pago.valorPadrao.toFixed(2).replace(".", ",")}/mês)
            </div>
            <div style={{ fontSize: 12, color: "var(--cor-texto-fraco)" }}>
              Aparece em destaque no guia comercial
            </div>
          </div>
        </label>

        {ehPago && (
          <div style={{ background: "var(--cor-laranja-bg)", borderRadius: 12, padding: 16, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Gift size={16} color="var(--cor-laranja)" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--cor-laranja)" }}>Período e cobrança</span>
            </div>

            <Campo label="Início do plano">
              <input type="date" value={planoInicio} onChange={(e) => setPlanoInicio(e.target.value)} style={inputStyle} />
            </Campo>

            <Campo label="Duração">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1, 2, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuracaoMeses(m)}
                    style={{
                      padding: "8px 13px", borderRadius: 16,
                      border: duracaoMeses === m ? "1px solid var(--cor-laranja)" : "1px solid var(--cor-borda)",
                      background: "#FFFFFF",
                      color: duracaoMeses === m ? "var(--cor-laranja)" : "var(--cor-texto-suave)",
                      fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {m} {m === 1 ? "mês" : "meses"}
                  </button>
                ))}
              </div>
            </Campo>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, marginBottom: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={cobrancaImediata} onChange={(e) => setCobrancaImediata(e.target.checked)} style={{ width: 16, height: 16 }} />
              Já está pagando (não é período gratuito/cortesia)
            </label>

            {cobrancaImediata && (
              <Campo label="Valor mensal acordado (R$)">
                <input type="number" step="0.01" value={valorMensal} onChange={(e) => setValorMensal(e.target.value)} style={inputStyle} />
              </Campo>
            )}

            <p style={{ fontSize: 12.5, color: "var(--cor-texto-suave)", margin: 0, lineHeight: 1.45 }}>
              Vence em: <strong>{somarMeses(planoInicio, duracaoMeses).split("-").reverse().join("/")}</strong>
              {!cobrancaImediata && " — período de cortesia, sem cobrança."}
            </p>
          </div>
        )}

        {ehPago && (
          <>
            <Campo label="Cupom de desconto (opcional)">
              <input
                value={cupomTexto}
                onChange={(e) => setCupomTexto(e.target.value)}
                placeholder='Ex: "10% OFF" ou "Pão francês grátis na 1ª compra"'
                style={inputStyle}
              />
            </Campo>
            {cupomTexto.trim() && (
              <Campo label="Cupom válido até (opcional)">
                <input type="date" value={cupomValidade} onChange={(e) => setCupomValidade(e.target.value)} style={inputStyle} />
              </Campo>
            )}
          </>
        )}

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
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }} />
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
