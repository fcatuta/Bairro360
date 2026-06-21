"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function EscolherBairroPage() {
  const router = useRouter();
  const supabase = createClient();

  const [bairros, setBairros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function buscarBairros() {
      const { data, error } = await supabase
        .from("bairros")
        .select("id, nome, cidade")
        .order("nome");

      if (!ativo) return;

      if (error) {
        console.error("Erro ao buscar bairros:", error);
        setErro("Não foi possível carregar a lista de bairros. Tente recarregar a página.");
      } else {
        setBairros(data || []);
      }
      setCarregando(false);
    }

    buscarBairros();
    return () => {
      ativo = false;
    };
  }, []);

  async function escolher(bairroId) {
    setSalvando(true);
    setErro("");

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("perfis")
      .update({ bairro_id: bairroId })
      .eq("id", authData.user.id);

    if (error) {
      console.error("Erro ao salvar bairro:", error);
      setErro("Não foi possível salvar seu bairro agora. Tente de novo.");
      setSalvando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", minHeight: "100vh", padding: "40px 24px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <Logo size={56} />
        <h1 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 22, fontWeight: 700, marginTop: 16, marginBottom: 4, textAlign: "center" }}>
          Qual é o seu bairro?
        </h1>
        <p style={{ fontSize: 14, color: "var(--cor-texto-fraco)", textAlign: "center", margin: 0 }}>
          Escolha o bairro para começar a ver e publicar ocorrências
        </p>
      </div>

      {carregando && (
        <p style={{ textAlign: "center", color: "var(--cor-texto-fraco)" }}>Carregando bairros...</p>
      )}

      {erro && (
        <p style={{ color: "var(--cor-vermelho)", fontSize: 14, textAlign: "center", marginBottom: 16 }}>{erro}</p>
      )}

      {!carregando && bairros.length === 0 && !erro && (
        <p style={{ textAlign: "center", color: "var(--cor-texto-fraco)" }}>
          Nenhum bairro cadastrado ainda. Peça para um administrador cadastrar o seu bairro.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bairros.map((b) => (
          <button
            key={b.id}
            onClick={() => escolher(b.id)}
            disabled={salvando}
            style={{
              textAlign: "left",
              padding: "16px 18px",
              borderRadius: 12,
              border: "1px solid var(--cor-borda)",
              background: "#FFFFFF",
              cursor: salvando ? "default" : "pointer",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--cor-texto)",
            }}
          >
            {b.nome}
            <div style={{ fontSize: 13, fontWeight: 400, color: "var(--cor-texto-fraco)", marginTop: 2 }}>
              {b.cidade}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
