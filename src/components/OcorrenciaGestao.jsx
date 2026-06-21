"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIAS } from "@/lib/constants";

export default function OcorrenciaGestao({ ocorrencia, podeEditar, podeExcluir }) {
  const router = useRouter();
  const supabase = createClient();

  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(ocorrencia.titulo);
  const [descricao, setDescricao] = useState(ocorrencia.descricao);
  const [categoria, setCategoria] = useState(ocorrencia.categoria);
  const [status, setStatus] = useState(ocorrencia.status);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [erro, setErro] = useState("");

  if (!podeEditar && !podeExcluir) return null;

  async function handleSalvar() {
    setErro("");
    setSalvando(true);

    const { error } = await supabase
      .from("ocorrencias")
      .update({ titulo: titulo.trim(), descricao: descricao.trim(), categoria, status })
      .eq("id", ocorrencia.id);

    setSalvando(false);

    if (error) {
      console.error("Erro ao editar ocorrência:", error);
      setErro(`Não foi possível salvar: ${error.message}`);
      return;
    }

    setEditando(false);
    router.refresh();
  }

  async function handleExcluir() {
    setErro("");
    setExcluindo(true);

    const { error } = await supabase.from("ocorrencias").delete().eq("id", ocorrencia.id);

    setExcluindo(false);

    if (error) {
      console.error("Erro ao excluir ocorrência:", error);
      setErro(`Não foi possível excluir: ${error.message}`);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (editando) {
    return (
      <div style={{ background: "#FFFFFF", border: "1px solid var(--cor-borda)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--cor-texto-fraco)" }}>EDITANDO</p>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {Object.entries(CATEGORIAS).map(([key, c]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategoria(key)}
              style={{
                display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 16,
                border: categoria === key ? `1px solid ${c.color}` : "1px solid var(--cor-borda)",
                background: categoria === key ? c.bg : "#FFFFFF",
                color: categoria === key ? c.color : "var(--cor-texto-suave)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              <c.icon size={12} />
              {c.label}
            </button>
          ))}
        </div>

        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          style={{ ...inputStyle, marginBottom: 10, fontWeight: 700 }}
        />
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: "none", fontFamily: "inherit", marginBottom: 10 }}
        />

        <label style={{ fontSize: 12, fontWeight: 700, color: "var(--cor-texto-fraco)", display: "block", marginBottom: 6 }}>
          Status
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }}>
          <option value="aberta">Aberta</option>
          <option value="em_andamento">Em andamento</option>
          <option value="resolvida">Resolvida</option>
          <option value="encerrada">Encerrada</option>
        </select>

        {erro && <p style={{ color: "var(--cor-vermelho)", fontSize: 13, marginBottom: 10 }}>{erro}</p>}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setEditando(false)}
            style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid var(--cor-borda)", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            <X size={15} /> Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "var(--cor-laranja)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            <Save size={15} /> {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
      {podeEditar && (
        <button
          onClick={() => setEditando(true)}
          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--cor-borda)", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--cor-texto-suave)", cursor: "pointer" }}
        >
          <Pencil size={14} /> Editar
        </button>
      )}

      {podeExcluir && !confirmarExclusao && (
        <button
          onClick={() => setConfirmarExclusao(true)}
          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--cor-vermelho)", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--cor-vermelho)", cursor: "pointer" }}
        >
          <Trash2 size={14} /> Excluir
        </button>
      )}

      {podeExcluir && confirmarExclusao && (
        <div style={{ flex: 1, display: "flex", gap: 8 }}>
          <button
            onClick={() => setConfirmarExclusao(false)}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--cor-borda)", background: "#FFFFFF", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleExcluir}
            disabled={excluindo}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--cor-vermelho)", color: "#FFF", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            {excluindo ? "Excluindo..." : "Confirmar"}
          </button>
        </div>
      )}

      {erro && <p style={{ color: "var(--cor-vermelho)", fontSize: 13 }}>{erro}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 9,
  border: "1px solid var(--cor-borda)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  background: "#FBF7F0",
};
