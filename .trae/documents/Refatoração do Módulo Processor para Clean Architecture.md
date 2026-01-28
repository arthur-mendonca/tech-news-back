# Refatoração do Módulo Processor

Vou quebrar a "God Class" `ProcessorService` seguindo os princípios de Clean Architecture e SRP, separando responsabilidades em Use Cases, Gateways e Repositories.

## 1. Definição das Interfaces de Domínio (`domain/`)

Criar abstrações para desacoplar a lógica de negócio das implementações tecnológicas:

- **`IContentGeneratorGateway`**: Interface para geração de conteúdo e metadados via LLM.
- **`IEmbeddingsGateway`**: Interface para geração de vetores de texto.
- **`IScraperGateway`**: Interface para extração de conteúdo de URLs (desacoplada do módulo ingestion).
- **`IEnrichmentGateway`**: Interface para enriquecimento de fontes do artigo.
- **`IArticleProcessorRepository`**: Interface para persistência de dados específicos do processamento (incluindo embeddings).

## 2. Implementação da Infraestrutura (`infra/`)

Criar os adaptadores e repositórios concretos:

- **`LLMContentGeneratorAdapter`**: Implementa `IContentGeneratorGateway` utilizando o `LLMService`.
- **`GoogleEmbeddingsAdapter`**: Implementa `IEmbeddingsGateway` utilizando o SDK do Google Gemini.
- **`IngestionScraperAdapter`**: Adaptador que delega para a implementação de scraping existente.
- **`PrismaArticleProcessorRepository`**: Implementa `IArticleProcessorRepository` encapsulando o `PrismaService` e a lógica de **SQL Raw** para o `pgvector`.

## 3. Implementação do Use Case (`use-cases/`)

- **`ProcessArticleUseCase`**: Novo orquestrador que substituirá a lógica principal do `ProcessorService`. Ele coordenará o fluxo:
  1. Recuperação do artigo.
  2. Enriquecimento de fontes.
  3. Scraping de conteúdo.
  4. Geração de texto/metadados.
  5. Geração de embeddings.
  6. Persistência final.

## 4. Atualização dos Componentes do Módulo

- **`ProcessorConsumer`**: Atualizado para injetar apenas o `ProcessArticleUseCase`.
- **`ProcessorModule`**: Configuração das novas provisões e exportações, garantindo a correta injeção de dependências.
- **`ProcessorService`**: Será removido após a migração completa da lógica.

## 5. Verificação

- Garantir que não existam dependências circulares entre os módulos.
- Validar a execução do linter e a integridade dos tipos.

Deseja que eu prossiga com a criação dessa estrutura?
