# Refatoração do Módulo de Ingestão (Clean Architecture)

Vou refatorar o módulo `ingestion` para seguir estritamente os padrões de Clean Architecture, separando as responsabilidades em Domínio, Infraestrutura, Casos de Uso e Interface, conforme solicitado.

## Camada de Domínio (`domain/gateways`)
1.  **Criar `IScraperGateway`**: Interface abstrata para o serviço de scraping.
2.  **Criar `ISearchGateway`**: Interface abstrata para o serviço de busca de artigos relacionados.
3.  **Criar `IFeedParserGateway`**: Interface abstrata para o processamento de feeds RSS, definindo um DTO de `FeedItem` neutro para evitar dependências externas nos Casos de Uso.

## Camada de Infraestrutura (`infra/adapters`)
1.  **Implementar `JinaScraperAdapter`**: Mover a lógica atual do `ScraperService` (utilizando `axios`) para este adaptador.
2.  **Implementar `DdgSearchAdapter`**: Mover a lógica atual do `SearchService` (utilizando `duck-duck-scrape`) para este adaptador.
3.  **Implementar `RssParserAdapter`**: Criar um novo adaptador que utiliza a biblioteca `rss-parser` para implementar a interface do domínio.

## Camada de Casos de Uso (`use-cases`)
1.  **Refatorar `EnrichArticleUseCase`**: Atualizar para injetar `ISearchGateway` via Token (`Symbol`), removendo a dependência direta do serviço concreto.
2.  **Criar `IngestFeedUseCase`**: Novo caso de uso que orquestra a leitura do feed (via `IFeedParserGateway`) e a criação de artigos (via `CreateArticleUseCase`), além de adicionar tarefas à fila de processamento.

## Camada de Interface / Orquestração
1.  **Refatorar `IngestionService`**: Manter apenas a lógica de agendamento (CRON) e gatilhos manuais, delegando a execução da lógica de negócio para o `IngestFeedUseCase`.
2.  **Atualizar `IngestionModule`**: Registrar todos os novos adaptadores e casos de uso, configurando os provedores para utilizar os Tokens de interface.

## Limpeza
- Remover os arquivos antigos em `services/` (`scraper.service.ts` e `search.service.ts`).
- Garantir que as camadas de Domínio e Casos de Uso não possuam imports de bibliotecas de terceiros como `axios`, `duck-duck-scrape` ou `rss-parser`.

Você confirma este plano para iniciarmos a implementação?