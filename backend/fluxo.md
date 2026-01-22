1. Ingestão via RSS (IngestionService) <br/> Arquivo: ingestion.service.ts

- O cron ( handleCron ) faz:
  - Lê as fontes com rss-parser .
  - Para cada item, monta articleData :
    - title , content , summary , originalUrl , slug , publishedAt , sourceUrls , relevanceScore: 0 .
  - Chama createArticleUseCase.execute(articleData) .
  - Enfileira o job:

  ```
  await this.processingQueue.add('process-article', {
  articleId: createdArticle.id
  });
  ```
- Aqui não existe nenhuma chamada de IA nem o log <br/> 🧠 Analyzing generated content for metadata... .
- Ou seja: nessa fase, o artigo é criado “bruto”, com summary do feed e relevanceScore zerado.

2. Processamento com IA (ProcessorService) <br/> Arquivo: processor.service.ts

No processArticle :

1. Opcionalmente enriquece o artigo:
```const enriched = await this.enrichArticleUseCase.execute(article.id);```

2. Faz o scraping ( ScraperService ) e gera o texto final com generateText :
``` 
const { text: generatedContent } = await generateText({
  model: google('gemini-2.5-pro'),
  // prompt...
});
```

3. Só depois disso vem a análise de metadados: 
```
this.logger.debug(`🧠 Analyzing generated content for metadata...`);
const { object } = await generateObject({
  model: google('gemini-2.0-flash'),
  schema: z.object({
    tags: z.array(z.string()).max(5),
    summary: z.string(),
    relevanceScore: z.number().min(0).max(100),
  }),
  prompt: `
    Analise o seguinte artigo de tecnologia JÁ ESCRITO...
    Título Original: ${article.title}
    Artigo Gerado: ${generatedContent}
    ...
  `,
}); 
```
4. Em seguida, ele:
```
content: generatedContent,
summary: object.summary,
relevanceScore: object.relevanceScore,
```
- Cria/associa tags.
- Gera embedding e salva.