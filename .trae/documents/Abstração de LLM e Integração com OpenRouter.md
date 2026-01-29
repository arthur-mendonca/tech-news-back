# Abstração de LLM e Integração com OpenRouter (v2)

Vou implementar uma camada de abstração para o serviço de LLM, permitindo o uso do OpenRouter como alternativa ao Gemini para geração de texto e metadados, enquanto mantenho a vetorização via Google.

## 1. Instalação de Dependências
- Instalar `@ai-sdk/openai` para integração com OpenRouter.

## 2. Camada de Abstração (`LLMModule`)
- Criar `src/core/llm/llm.service.ts`:
    - Encapsulará a escolha entre Gemini e OpenRouter via variável de ambiente `LLM_PROVIDER`.
    - Métodos `generateText` e `generateObject` para abstrair as chamadas à IA.
    - O modelo para OpenRouter será o `openai/gpt-oss-120b:free`.

## 3. Configuração
- Utilizar `OPEN_ROUTER_API_KEY` do arquivo `.env`.
- Adicionar `LLM_PROVIDER` (opções: `google` ou `openrouter`) para controle fácil.

## 4. Refatoração do `ProcessorService`
- Substituir as chamadas de geração de texto e objeto pelo novo `LLMService`.
- **Manutenção dos Embeddings**: A lógica de `google.embedding("text-embedding-004")` será mantida exatamente como está, garantindo a continuidade da vetorização das notícias.
- Prompts e schemas (Zod) permanecem inalterados.

## 5. Registro de Módulos
- Adicionar o `LLMModule` ao `ProcessorModule`.

Esta abordagem centraliza a lógica de IA, facilitando trocas futuras sem impactar a regra de negócio do processamento. Posso iniciar?