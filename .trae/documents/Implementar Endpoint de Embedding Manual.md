# Implementar Endpoint de Vetorização Manual de Artigos

Vou criar um novo endpoint que permite gerar e salvar o embedding de um artigo manualmente, utilizando o conteúdo atual do artigo.

## Alterações Propostas

### 1. Camada de Domínio (Article)
- Atualizar a interface `IArticleRepository` em [article.repository.interface.ts](file:///c:/Users/arthu/Documents/Documentos/C%C3%B3digo/tech-news/src/modules/article/domain/article.repository.interface.ts) para incluir o método `updateEmbedding(id: string, embedding: number[]): Promise<void>`.
- Adicionar opcionalmente o campo `embedding?: number[]` na entidade `Article` em [article.entity.ts](file:///c:/Users/arthu/Documents/Documentos/C%C3%B3digo/tech-news/src/modules/article/domain/article.entity.ts).

### 2. Camada de Infraestrutura (Article)
- Implementar o método `updateEmbedding` no `PrismaArticleRepository` em [prisma-article.repository.ts](file:///c:/Users/arthu/Documents/Documentos/C%C3%B3digo/tech-news/src/modules/article/infra/prisma-article.repository.ts) utilizando `this.prisma.$executeRaw` para garantir o cast correto para o tipo `::vector` do PostgreSQL.

### 3. Camada de Aplicação (Article)
- Criar o Use Case `EmbedArticleUseCase` em `src/modules/article/use-cases/embed-article.use-case.ts`:
    1. Buscar o artigo pelo ID.
    2. Validar se o artigo possui conteúdo (`content`).
    3. Chamar o `IEmbeddingsGateway` para gerar o vetor a partir do conteúdo.
    4. Persistir o vetor usando o repositório.

### 4. Camada de Interface (Article)
- Adicionar o endpoint `POST /articles/:id/embed` no `ArticleController` em [article.controller.ts](file:///c:/Users/arthu/Documents/Documentos/C%C3%B3digo/tech-news/src/modules/article/interface/article.controller.ts).

### 5. Configuração de Módulos
- Exportar o `IEmbeddingsGateway` do `ProcessorModule` em [processor.module.ts](file:///c:/Users/arthu/Documents/Documentos/C%C3%B3digo/tech-news/src/modules/processor/processor.module.ts).
- Importar o `ProcessorModule` (usando `forwardRef`) no `ArticleModule` em [article.module.ts](file:///c:/Users/arthu/Documents/Documentos/C%C3%B3digo/tech-news/src/modules/article/article.module.ts) e registrar o novo Use Case.

## Verificação
- Vou realizar uma chamada de teste (ou simular) para garantir que o embedding seja gerado e salvo corretamente no banco de dados.

Você gostaria que eu prossiga com essa implementação?