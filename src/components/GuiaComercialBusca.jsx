"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import NegocioCard from "./NegocioCard";
import { CATEGORIAS_NEGOCIO } from "@/lib/constants";

export default function GuiaComercialBusca({ negocios, ruaMorador, bairroNome }) {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);

  const categoriasComItens = useMemo(() => {
    const presentes = new Set(negocios.map((n) => n.categoria));
    return CATEGORIAS_NEGOCIO.filter((c) => presentes.has(c.value));
  }, [negocios]);

  const lista = negocios.filter((n) => {
    const passaBusca = n.nome.toLowerCase().includes(busca.toLowerCase());
    const passaCategoria = !categoriaAtiva || n.categoria === categoriaAtiva;
    return passaBusca && passaCategoria;
  });

  return (
    <div style={{ padding: "16px 20px 100px" }}>
      <div style={{ position: "relative", marginBottom: 14 }}>
        <Search size={16} color="var(--cor-texto-fraco)" style={{ position: "absolute", left: 12, top: 13 }} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar comércio ou serviço..."
          style={{
            width: "100%",
            padding: "11px 14px 11px 36px",
            borderRadius: 10,
            border: "1px solid var(--cor-borda)",
            fontSize: 15,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {categoriasComItens.length > 1 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 2 }}>
          <button
            onClick={() => setCategoriaAtiva(null)}
            style={{
              flexShrink: 0, padding: "6px 14px", borderRadius: 20,
              border: !categoriaAtiva ? "1px solid var(--cor-laranja)" : "1px solid var(--cor-borda)",
              background: !categoriaAtiva ? "var(--cor-laranja)" : "#FFFFFF",
              color: !categoriaAtiva ? "#FFFFFF" : "var(--cor-texto-suave)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Tudo
          </button>
          {categoriasComItens.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoriaAtiva(c.value)}
              style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 20,
                border: categoriaAtiva === c.value ? "1px solid var(--cor-laranja)" : "1px solid var(--cor-borda)",
                background: categoriaAtiva === c.value ? "var(--cor-laranja)" : "#FFFFFF",
                color: categoriaAtiva === c.value ? "#FFFFFF" : "var(--cor-texto-suave)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {lista.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--cor-texto-fraco)", padding: "40px 0" }}>
          {negocios.length === 0 ? "Nenhum comércio cadastrado no seu bairro ainda." : "Nada encontrado para essa busca."}
        </p>
      ) : (
        lista.map((item) => (
          <NegocioCard key={item.id} item={item} ruaMorador={ruaMorador} bairroNome={bairroNome} />
        ))
      )}
    </div>
  );
}
