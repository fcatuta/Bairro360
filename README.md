# Bairro360 — MVP

Rede privada de bairro: feed de ocorrências, guia comercial e avaliações,
conectado a um banco de dados real no Supabase.

## O que já funciona

- Cadastro e login de morador (e-mail e senha)
- Feed de ocorrências do bairro (criar, ver, confirmar, comentar)
- Guia comercial (lista de negócios, ordenada por plano: Ouro > Prata > Bronze > Gratuito)
- Avaliações de negócios (estrelas + comentário)
- Botão de emergência (ligar para a polícia + avisar moderadores)
- Mapa (placeholder — integração com Google Maps fica para uma próxima etapa)

## Como rodar localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o Supabase

Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

Abra `.env.local` e preencha com os dados do seu projeto Supabase
(Project Settings → API → Data API):

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3. Rodar o schema do banco (se ainda não rodou)

Se você ainda não rodou o `schema.sql` no SQL Editor do Supabase, faça
isso antes de continuar — sem as tabelas, o app não funciona.

### 4. Iniciar o app

```bash
npm run dev
```

Abra http://localhost:3000 no navegador.

## Estrutura do projeto

```
src/
  app/                  → páginas (App Router do Next.js)
    page.js             → feed de ocorrências (tela inicial)
    login/               → tela de login
    cadastro/             → tela de criar conta
    comercio/             → guia comercial
      [id]/               → detalhe de um negócio
    ocorrencias/
      [id]/               → detalhe de uma ocorrência
      nova/                → criar nova ocorrência
    mapa/                 → mapa do bairro (placeholder)
  components/            → componentes reutilizáveis de UI
  lib/
    supabase/             → configuração de conexão com o Supabase
    constants.js          → categorias, status e planos (cores, ícones, labels)
  middleware.js           → mantém a sessão de login válida
```

## Próximos passos sugeridos

1. Cadastrar negócios reais (hoje só é possível direto pelo Table Editor do
   Supabase — uma tela de "anunciar meu negócio" é o próximo passo natural,
   já que é a fonte de monetização).
2. Conectar pagamento (Stripe ou Mercado Pago) para os planos Bronze/Prata/Ouro.
3. Integrar o Google Maps de verdade na tela de mapa.
4. Migrar login de e-mail/senha para celular/SMS (requer configurar um
   provedor como Twilio no painel do Supabase em Authentication → Providers → Phone).
5. Upload de fotos nas ocorrências (usar o Supabase Storage).

## Publicar online (deploy)

O caminho mais simples é a Vercel (criadora do Next.js, plano gratuito
suficiente para o piloto):

1. Crie uma conta em vercel.com (pode entrar com GitHub).
2. Suba este projeto para um repositório no GitHub.
3. Na Vercel, clique em "New Project" e importe o repositório.
4. Em "Environment Variables", adicione as mesmas duas variáveis do
   `.env.local` (NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY).
5. Clique em "Deploy".

Em poucos minutos o app estará no ar com um endereço público.
