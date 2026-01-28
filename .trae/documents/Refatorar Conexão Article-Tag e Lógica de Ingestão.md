O problema identificado é que, embora o banco de dados (Prisma) suporte a relação, a aplicação não está expondo nem persistindo essa conexão de forma eficiente e visível no domínio.

Vou realizar a refatoração em três camadas para garantir que os Artigos e Tags estejam devidamente conectados e acessíveis:

### 1. Atualizar a Entidade de Domínio (`Article`)
A classe `Article` atual não possui a propriedade `tags`, o que impede que o restante da aplicação "enxergue" essa relação.
- **Ação**: Adicionar `tags?: Tag[]` na entidade `Article` e importar a classe `Tag`.

### 2. Refatorar o Repositório (`PrismaArticleRepository`)
O repositório não está solicitando as tags ao buscar artigos no banco de dados.
- **Ação**: Adicionar `include: { tags: true }` nos métodos `findById`, `findBySlug` e `findAll` para garantir que os artigos já venham populados com suas tags.

### 3. Otimizar o Processador (`ProcessorService`)
A lógica atual de criação de tags é ineficiente (faz um loop com `upsert` + `update` para cada tag) e separada da atualização do conteúdo.
- **Ação**: Refatorar para usar `connectOrCreate` do Prisma. Isso permitirá criar as tags (se não existirem) e conectá-las ao artigo em uma única operação atômica junto com a atualização do conteúdo.

Essas mudanças garantirão a relação N-M (Muitos-para-Muitos) correta e automática entre Artigos e Tags.