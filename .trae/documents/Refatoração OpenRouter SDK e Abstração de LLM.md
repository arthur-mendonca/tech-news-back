# Refatoração da Integração com OpenRouter e Abstração de LLM (v3)

Vou implementar a integração com o OpenRouter utilizando o SDK oficial (`@openrouter/sdk`), seguindo rigorosamente a documentação Quickstart consultada, e resolver o erro de tipagem do TypeScript.

## 1. Ajuste de Dependências
- Desinstalar `@ai-sdk/openai`.
- Instalar `@openrouter/sdk`.

## 2. Refatoração do `LLMService`
- **Interfaces de Abstração**: Definir `LLMTextResponse` e `LLMObjectResponse<T>` para padronizar o retorno. Isso resolve o erro TS4053, pois as funções terão tipos de retorno explícitos e não dependerão de tipos internos não exportados do Vercel AI SDK.
- **Implementação do OpenRouter SDK**:
    - Instanciar `OpenRouter` com a chave `OPEN_ROUTER_API_KEY`.
    - Implementar `generateText` e `generateObject` utilizando o método `client.chat.send`.
    - **Geração de Texto**: Extrair o conteúdo de `result.choices[0].message.content`.
    - **Geração de Objetos**: Solicitar formato JSON no prompt, realizar o parse manual do conteúdo retornado e validar utilizando o `schema` Zod fornecido.
    - Utilizar o modelo `openai/gpt-oss-120b:free`.
- **Manutenção do Google (Gemini)**:
    - Continuar utilizando `ai` e `@ai-sdk/google` para o provedor Google.
    - Mapear os resultados para as novas interfaces padronizadas.

## 3. Benefícios
- **Conformidade**: Utiliza o SDK oficial recomendado pelo OpenRouter.
- **Flexibilidade**: A aplicação continua podendo alternar entre Google e OpenRouter via `LLM_PROVIDER`.
- **Estabilidade**: Resolve definitivamente o erro de compilação do TypeScript.

Posso iniciar a implementação?