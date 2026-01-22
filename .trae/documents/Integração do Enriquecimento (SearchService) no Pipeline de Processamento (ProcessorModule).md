# Plano de Integração do Enriquecimento no Pipeline de Processamento

Abaixo detalho as alterações para mover a lógica de busca para o `ProcessorModule` e automatizar o enriquecimento de artigos.

## 1. Refatorar `ProcessorModule`
Arquivo: `backend/src/modules/processor/processor.module.ts`

- **Importar:** `ArticleModule` (necessário para que o `EnrichArticleUseCase` acesse o repositório de artigos).
- **Provedores:** Adicionar `SearchService` e `EnrichArticleUseCase`.
- **Exportações:** Exportar `EnrichArticleUseCase` (para que o `IngestionModule` continue usando-o no controller manual).

## 2. Refatorar `IngestionModule`
Arquivo: `backend/src/modules/ingestion/ingestion.module.ts`

- **Provedores:** Remover `SearchService` e `EnrichArticleUseCase` (pois agora eles são providos pelo `ProcessorModule`, que já é importado aqui).

## 3. Atualizar `ProcessorService`
Arquivo: `backend/src/modules/processor/processor.service.ts`

- **Injeção de Dependência:** Injetar `EnrichArticleUseCase` no construtor.
- **Lógica de Processamento:**
  - No método `processArticle`, adicionar uma etapa inicial de enriquecimento.
  - Envolver essa chamada em um `try/catch` independente para garantir que falhas na busca (ex: erro de rede no DuckDuckGo) não interrompam o restante do processamento (resumo e embedding).
