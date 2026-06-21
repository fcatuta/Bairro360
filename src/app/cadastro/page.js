"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleCadastro(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      console.error("Erro no signUp:", JSON.stringify(error, null, 2));
      setErro(traduzErro(error.message));
      setCarregando(false);
      return;
    }

    // Se o Supabase não retornou uma sessão ativa, normalmente significa
    // que a confirmação de e-mail ainda está ativada no projeto.
    if (!data.session) {
      console.warn("signUp não retornou sessão ativa. data:", JSON.stringify(data, null, 2));
      setErro(
        "Conta criada! Se a confirmação por e-mail estiver ativada no Supabase, verifique sua caixa de entrada antes de entrar."
      );
      setCarregando(false);
      return;
    }

    // Cria a linha correspondente na tabela "perfis" com os dados extras.
    // O bairro fica em branco por enquanto — é escolhido depois, dentro do app.
    if (data.user) {
      const { error: erroPerfil } = await supabase.from("perfis").insert({
        id: data.user.id,
        nome_completo: nomeCompleto,
      });

      if (erroPerfil) {
        console.error("Erro ao criar perfil:", JSON.stringify(erroPerfil, null, 2));
        console.error("Código:", erroPerfil.code, "| Mensagem:", erroPerfil.message, "| Detalhes:", erroPerfil.details);
        setErro(`Conta criada, mas houve um problema ao salvar seu perfil: ${erroPerfil.message || "erro desconhecido"}`);
        setCarregando(false);
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", minHeight: "100vh", padding: "40px 24px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <Logo size={56} />
        <h1 style={{ fontFamily: "var(--fonte-titulo)", fontSize: 24, fontWeight: 700, marginTop: 16, marginBottom: 4 }}>
          Criar conta
        </h1>
        <p style={{ fontSize: 14, color: "var(--cor-texto-fraco)", textAlign: "center", margin: 0 }}>
          Junte-se à rede do seu bairro
        </p>
      </div>

      <form onSubmit={handleCadastro}>
        <Campo label="Nome completo">
          <input
            required
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            placeholder="Seu nome"
            style={inputStyle}
          />
        </Campo>

        <Campo label="E-mail">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={inputStyle}
          />
        </Campo>

        <Campo label="Senha">
          <input
            required
            type="password"
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            style={inputStyle}
          />
        </Campo>

        {erro && (
          <p style={{ color: "var(--cor-vermelho)", fontSize: 14, marginBottom: 16 }}>{erro}</p>
        )}

        <button type="submit" disabled={carregando} style={botaoPrimario}>
          {carregando ? "Criando conta..." : "Criar minha conta"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 14, color: "var(--cor-texto-fraco)", marginTop: 24 }}>
        Já tem conta?{" "}
        <Link href="/login" style={{ color: "var(--cor-laranja)", fontWeight: 700, textDecoration: "none" }}>
          Entrar
        </Link>
      </p>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: "var(--cor-texto)", display: "block", marginBottom: 7 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function traduzErro(msg) {
  if (msg.includes("already registered")) return "Esse e-mail já está cadastrado. Tente entrar.";
  if (msg.includes("Password")) return "A senha precisa ter pelo menos 6 caracteres.";
  return "Não foi possível criar a conta. Verifique os dados e tente de novo.";
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
