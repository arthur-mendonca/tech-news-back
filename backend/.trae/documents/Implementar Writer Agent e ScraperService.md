# Implementar Geração de Conteúdo (Writer)

## 1. Criar `ScraperService`
- **Arquivo:** `src/modules/ingestion/services/scraper.service.ts`
- **Ação:** Criar o serviço que consome a API da Jina AI (`https://r.jina.ai/`).
- **Detalhes:**
    - Usar `axios` para requisições GET.
    - Implementar timeout de 10s.
    - Retornar string vazia em caso de erro.
    - Seguir o exemplo fornecido.

## 2. Atualizar Módulos
- **IngestionModule** (`src/modules/ingestion/ingestion.module.ts`):
    - Adicionar `ScraperService` aos `providers` e `exports`.
- **ProcessorModule** (`src/modules/processor/processor.module.ts`):
    - Adicionar `ScraperService` aos `providers`.
    - **Nota:** Como o `IngestionModule` já importa o `ProcessorModule`, adicionaremos o serviço diretamente aos providers do `ProcessorModule` para evitar dependência circular.

## 3. Refatorar `ProcessorService`
- **Arquivo:** `src/modules/processor/processor.service.ts`
- **Ação:** Implementar o fluxo de "Writer".
- **Passos:**
    1.  **Injeção:** Injetar `ScraperService` no construtor.
    2.  **Enriquecimento:** Capturar o retorno de `enrichArticleUseCase.execute(article.id)` para obter as `sourceUrls` atualizadas.
    3.  **Scraping:**
        - Criar lista de URLs (original + fontes).
        - Limitar a 4 fontes.
        - Usar `scraperService.scrape` em paralelo (`Promise.all`).
        - Concatenar conteúdos.
    4.  **Geração de Texto (Writer):**
        - Usar `generateText` (do pacote `ai`) com modelo Gemini.
        - Prompt: "Jornalista sênior...".
    5.  **Metadados e Embedding:**
        - Usar o **texto gerado** como entrada para `generateObject` (resumo, tags, score).
        - Usar título + **resumo gerado** para `embed`.
    6.  **Persistência:**
        - Atualizar `Article` com `content`, `summary`, `tags`, `relevanceScore` e `embedding`.

## 4. Verificação
- Verificar se o serviço compila corretamente.
- (Opcional) Verificar estado do banco de dados (relativo ao erro anterior de migração) se necessário para rodar testes.
