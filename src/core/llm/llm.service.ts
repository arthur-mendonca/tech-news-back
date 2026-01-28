import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from '@ai-sdk/google';
import { generateText as aiGenerateText, generateObject as aiGenerateObject } from 'ai';
import { z } from 'zod';
import { LLMTextResponse, LLMObjectResponse } from './types/llm-response.types';
import { OpenRouterResponse } from './types/openrouter.types';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);

  constructor(private readonly configService: ConfigService) { }

  async generateText(options: {
    prompt: string;
    capability?: 'high-quality' | 'fast';
  }): Promise<LLMTextResponse> {
    const provider = this.configService.get<string>('LLM_PROVIDER') || 'google';
    this.logger.debug(`Generating text using ${provider}...`);

    if (provider === 'openrouter') {
      const apiKey = this.configService.get<string>('OPEN_ROUTER_API_KEY');
      if (!apiKey) {
        throw new Error('OPEN_ROUTER_API_KEY is missing');
      }

      const url = 'https://openrouter.ai/api/v1/chat/completions';
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };
      const payload = {
        model: 'openai/gpt-oss-120b:free',
        messages: [
          {
            role: 'user',
            content: options.prompt,
          },
        ],
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as OpenRouterResponse;
      const content = data.choices?.[0]?.message?.content;

      if (typeof content !== 'string') {
        throw new Error('OpenRouter returned an empty or invalid response');
      }

      return { text: content };
    }

    // Default: Google Gemini
    const modelName = options.capability === 'high-quality' ? 'gemini-2.5-pro' : 'gemini-2.0-flash';
    const result = await aiGenerateText({
      model: google(modelName),
      prompt: options.prompt,
    });

    return { text: result.text };
  }

  async generateObject<T>(options: {
    prompt: string;
    schema: z.ZodType<T>;
    capability?: 'high-quality' | 'fast';
  }): Promise<LLMObjectResponse<T>> {
    const provider = this.configService.get<string>('LLM_PROVIDER') || 'google';
    this.logger.debug(`Generating object using ${provider}...`);

    if (provider === 'openrouter') {
      const apiKey = this.configService.get<string>('OPEN_ROUTER_API_KEY');
      if (!apiKey) {
        throw new Error('OPEN_ROUTER_API_KEY is missing');
      }

      const promptWithJsonInstruction = `${options.prompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object that follows the requested structure. Do not include any other text, markdown blocks, or explanation.`;

      const url = 'https://openrouter.ai/api/v1/chat/completions';
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };
      const payload = {
        model: 'openai/gpt-oss-120b:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that only responds in valid JSON format.',
          },
          {
            role: 'user',
            content: promptWithJsonInstruction,
          },
        ],
        // response_format is supported by many models on OpenRouter
        response_format: { type: 'json_object' },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as OpenRouterResponse;
      const content = data.choices?.[0]?.message?.content;

      if (typeof content !== 'string') {
        throw new Error('OpenRouter returned an empty response for object generation');
      }

      try {
        const cleanContent = content.replace(/```json\n?|```/g, '').trim();
        const json = JSON.parse(cleanContent) as unknown;
        const validated = options.schema.parse(json);
        return { object: validated };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to parse or validate JSON from OpenRouter. Raw content: "${content}"`);
        this.logger.error(`Validation error details: ${errorMessage}`);
        throw error;
      }
    }

    // Default: Google Gemini
    const modelName = options.capability === 'high-quality' ? 'gemini-2.5-pro' : 'gemini-2.0-flash';
    const result = await aiGenerateObject({
      model: google(modelName),
      schema: options.schema,
      prompt: options.prompt,
    });

    return { object: result.object };
  }
}
