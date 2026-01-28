# Plano de Refatoração Final dos Módulos

Vou finalizar a refatoração dos módulos `Article`, `Ingestion` e `Processor` para garantir que todos sigam o "padrão ouro" do módulo `Tag`, com foco total na Inversão de Dependência e separação de camadas.

## 1. Módulo Article (Revisão)
- O módulo já está bem estruturado. Vou apenas garantir que o `ArticleModule` exporte corretamente os tokens das interfaces e os Use Cases necessários.

## 2. Módulo Ingestion (Desacoplamento e Wiring)
- **Desacoplar do Prisma:** Criar a interface `IFeedSourceRepository` em `domain/repositories` e sua implementação `PrismaFeedSourceRepository` em `infra/repositories`.
- **Refatorar Use Case:** Atualizar o `IngestFeedUseCase` para injetar `IFeedSourceRepository` via `@Inject`, removendo a dependência direta do `PrismaService`.
- **Wiring:** Atualizar o `IngestionModule` para usar a sintaxe `{ provide: TOKEN, useClass: CLASS }` para todos os gateways e o novo repositório.

## 3. Módulo Processor (Wiring e Consistência)
- **Wiring:** Revisar o `ProcessorModule` para garantir que todos os gateways (`IContentGeneratorGateway`, `IEmbeddingsGateway`, etc.) e o `IArticleProcessorRepository` estejam configurados com a sintaxe de tokens.

## 4. Camada Core e Shared
- **Injeção de Serviços:** Validar que `PrismaService` e `LLMService` são injetados **apenas** nas classes dentro das pastas `infra` de cada módulo. Use Cases e Entidades de domínio não devem conhecer esses serviços diretamente.

## 5. Verificação
- Rodar o linter para garantir que não existam erros de tipos ou injeções incorretas.
- Verificar se todas as dependências circulares foram resolvidas com `forwardRef` onde necessário.

Deseja que eu inicie a aplicação deste plano?
