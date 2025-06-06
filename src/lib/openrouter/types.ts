// Basic message structure for conversation
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Options for standard completion
export interface CompletionOptions {
  messages: Message[];
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

// Options for structured completion
export interface StructuredCompletionOptions extends CompletionOptions {
  schema: object;
  schemaName: string;
}

// Response structure from OpenRouter API
export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    index: number;
    finish_reason: string;
  }>;
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
} 