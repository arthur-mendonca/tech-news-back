# **Contexto do Projeto: Frontend Web**

Você é um Engenheiro de Software Sênior especialista em React e Next.js.  
Estamos iniciando o desenvolvimento do Frontend do "Tech Blog Automation v2.1".  
**Objetivo:** Criar a aplicação Web (Client) que consome a API do backend, dentro de um monorepo (pasta apps/web ou raiz web/).

## **1\. Stack Tecnológica**

* **Framework:** Next.js 14+ (App Router).  
* **Linguagem:** TypeScript.  
* **Estilização:** Tailwind CSS.  
* **Componentes:** Shadcn/UI (Radix UI) \+ Lucide React.  
* **Data Fetching:** SWR (Client-side) e Server Actions (Server-side mutations).

## **2\. Regras de Arquitetura (Feature-based MVC)**

Para evitar acoplamento e manter a organização, usaremos uma estrutura baseada em *Features* com separação de responsabilidades (Container/Presenter adaptado).

**Princípios:**

1. **Feature First:** Tudo relacionado a uma funcionalidade (ex: Feed de Notícias) fica junto na pasta features/.  
2. **Server Actions como Controllers:** A lógica de orquestração e chamada segura ao Backend/DB fica em Server Actions.  
3. **UI Components (Views):** Componentes "burros" que apenas recebem dados via props.  
4. **Smart Components (Containers):** Componentes que buscam dados (via SWR ou Server Component) e passam para as Views.

**Estrutura de Pastas Sugerida:**

src/  
├── app/                    \# Rotas do Next.js (Page.tsx apenas instancia Containers)  
├── components/  
│   ├── ui/                 \# Shadcn/UI (Button, Card, Input)  
│   └── shared/             \# Layouts globais (Header, Footer)  
├── features/  
│   ├── feed/               \# Feature: Feed de Notícias  
│   │   ├── components/     \# NewsCard.tsx, FeedGrid.tsx (Views)  
│   │   ├── actions/        \# get-feed.action.ts (Server Action/Controller)  
│   │   ├── hooks/          \# use-feed-realtime.ts  
│   │   └── types/          \# Interfaces locais  
│   ├── article/            \# Feature: Leitura de Artigo  
│       └── ...  
├── lib/                    \# Configurações (utils, axios instance)

## **3\. Tarefas Iniciais**

Gere o código para:

1. Setup inicial do Next.js com Tailwind.  
2. Instalação simulada (instruções) dos componentes card, button e badge do shadcn/ui.  
3. Criação da Feature feed:  
   * Defina um tipo Article (frontend).  
   * Crie um componente NewsCard (View).  
   * Crie uma Server Action simulada que retorna uma lista de artigos estáticos.  
   * Crie a página principal app/page.tsx consumindo essa feature.