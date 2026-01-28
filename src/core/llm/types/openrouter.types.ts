export interface OpenRouterToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenRouterReasoningDetail {
  type: string;
  summary: string;
  id: string;
  format?: string;
  index: number;
}

export interface OpenRouterImage {
  image_url: {
    url: string;
  };
}

export interface OpenRouterLogProbToken {
  token: string;
  logprob: number;
  bytes: number[] | null;
  top_logprobs: {
    token: string;
    logprob: number;
    bytes: number[] | null;
  }[];
}

export interface OpenRouterLogProbs {
  content: OpenRouterLogProbToken[] | null;
  refusal: OpenRouterLogProbToken[] | null;
}

export interface OpenRouterMessage {
  role: string;
  content: string | null;
  name?: string;
  tool_calls?: OpenRouterToolCall[];
  refusal?: string | null;
  reasoning?: string;
  reasoning_details?: OpenRouterReasoningDetail[];
  images?: OpenRouterImage[];
}

export interface OpenRouterChoice {
  finish_reason: string | null;
  index: number;
  message: OpenRouterMessage;
  logprobs: OpenRouterLogProbs | null;
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  completion_tokens_details?: {
    reasoning_tokens?: number;
    audio_tokens?: number;
    accepted_prediction_tokens?: number;
    rejected_prediction_tokens?: number;
  };
  prompt_tokens_details?: {
    cached_tokens?: number;
    cache_write_tokens?: number;
    audio_tokens?: number;
    video_tokens?: number;
  };
}

export interface OpenRouterResponse {
  id: string;
  choices: OpenRouterChoice[];
  created: number;
  model: string;
  object: string;
  system_fingerprint?: string;
  usage?: OpenRouterUsage;
  provider?: string; // Optional as per docs/examples variation
}
