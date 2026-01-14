# **Contexto do Projeto: Backend API**

Você é um Engenheiro de Software Sênior especialista em Node.js e Nest.js.  
Estamos iniciando o desenvolvimento da API do "Tech Blog Automation v2.1", uma plataforma de jornalismo sintético.  
**Objetivo:** Criar a estrutura do Backend (API) dentro de um repositório Monorepo (pasta apps/api ou raiz api/).

## **1\. Stack Tecnológica**

* **Framework:** Nest.js (versão mais recente).  
* **Linguagem:** TypeScript (Strict mode).  
* **Banco de Dados:** PostgreSQL.  
* **ORM:** Prisma (com suporte a extensão vector para pgvector).  
* **Filas:** BullMQ (com Redis).  
* **IA Integration:** Vercel AI SDK Core.

## **2\. Regras de Arquitetura (Clean Architecture)**

O sistema deve ser um Monólito Modular seguindo Clean Architecture rigorosa.  
A dependência deve apontar sempre de fora para dentro (Infra \-\> App \-\> Domain).  
**Camadas Obrigatórias:**

1. **Domain:** Entidades de domínio, Value Objects e Interfaces de Repositório (IArticleRepository). *Sem dependências de frameworks.*  
2. **Application:** Casos de uso (Use Cases) que orquestram a lógica. Recebem repositórios via injeção de dependência no construtor.  
3. **Infrastructure:** Implementação concreta dos repositórios (Prisma), Adapters de IA e Configuração de Filas.  
4. **Interface:** Controllers HTTP (REST), Consumers de Fila (Jobs) e Resolvers.

**Estrutura de Pastas Sugerida:**

src/  
├── core/                   \# Shared kernel (DTOs base, Exceptions, Guards)  
├── modules/  
│   ├── article/            \# Módulo de Artigos  
│   │   ├── domain/         \# Entities, Repository Interfaces  
│   │   ├── use-cases/      \# ex: create-article.use-case.ts  
│   │   ├── infra/          \# ex: prisma-article.repository.ts  
│   │   └── interface/      \# ex: article.controller.ts  
│   ├── ingestion/          \# Módulo de Ingestão (RSS, IA)  
│   │   └── ...  
├── app.module.ts  
└── main.ts

## **3\. Modelo de Dados (Prisma Schema)**

Configure o schema.prisma inicial com os seguintes modelos essenciais:

datasource db {  
  provider \= "postgresql"  
  url      \= env("DATABASE\_URL")  
  extensions \= \[vector\] // Habilita pgvector  
}

model Article {  
  id            String   @id @default(uuid())  
  slug          String   @unique  
  title         String  
  summary       String  
  content       String   @db.Text  
  originalUrl   String  
  sourceUrls    String\[\]  
  relevanceScore Int  
  published     Boolean  @default(false)  
  createdAt     DateTime @default(now())  
  // Adicione suporte a campo vector se necessário para o provider  
}

model FeedSource {  
  id        String   @id @default(uuid())  
  name      String  
  url       String  
  isActive  Boolean  @default(true)  
}

## **4\. Tarefas Iniciais**

Gere o código para:

1. Setup inicial do Nest.js.  
2. Configuração do Prisma com os models acima.  
3. Implementação do módulo Article completo (Entity, Interface, Use Case de criação, Implementação Prisma, Controller) demonstrando a inversão de dependência.