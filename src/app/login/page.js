"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", minHeight: "100vh", padding: "40px 24px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <Logo size={56} />
        <h1 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 24, fontWeight: 700, marginTop: 16, marginBottom: 4 }}>
          Entrar
        </h1>
        <p style={{ fontSize: 14, color: "var(--cor-texto-fraco)", textAlign: "center", margin: 0 }}>
          Acesse a rede do seu bairro
        </p>
      </div>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 7 }}>E-mail</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 7 }}>Senha</label>
          <input
            required
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            style={inputStyle}
          />
        </div>

        {erro && <p style={{ color: "var(--cor-vermelho)", fontSize: 14, marginBottom: 16 }}>{erro}</p>}

        <button type="submit" disabled={carregando} style={botaoPrimario}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 14, color: "var(--cor-texto-fraco)", marginTop: 24 }}>
        Ainda não tem conta?{" "}
        <Link href="/cadastro" style={{ color: "var(--cor-laranja)", fontWeight: 700, textDecoration: "none" }}>
          Criar conta
        </Link>
      </p>
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
  fontFamily: "inherit",
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
