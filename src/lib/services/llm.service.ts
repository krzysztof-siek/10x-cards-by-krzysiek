import type { SuggestionDto } from '../../types';

interface LLMResponse {
  suggestions: SuggestionDto[];
  error?: {
    code: string;
    message: string;
  };
}

interface LLMConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
  timeoutMs: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const SYSTEM_PROMPT = `You are a helpful AI assistant that generates flashcards from provided text.
Your task is to create a set of question-answer pairs that effectively capture the key concepts from the text.
Each flashcard should have a clear question on the front and a concise answer on the back.
Follow these guidelines:
1. Create 5-10 flashcards depending on the content density
2. Focus on the most important concepts
3. Make questions specific and unambiguous
4. Keep answers concise but complete
5. Avoid yes/no questions
6. Use proper terminology from the text
7. Format output as a JSON array of objects with 'front' and 'back' properties`;

// Przykładowe dane dla trybu deweloperskiego
const MOCK_SUGGESTIONS: SuggestionDto[] = [
  {
    front: "Kiedy i przez kogo został stworzony JavaScript?",
    back: "JavaScript został stworzony przez Brendana Eicha w 1995 roku podczas jego pracy w Netscape Communications Corporation."
  },
  {
    front: "Jakie są główne paradygmaty programowania obsługiwane przez JavaScript?",
    back: "JavaScript obsługuje programowanie obiektowe, funkcyjne i imperatywne."
  },
  {
    front: "Co to jest Node.js i jak wpłynął na rozwój JavaScriptu?",
    back: "Node.js to środowisko uruchomieniowe wprowadzone w 2009 roku, które pozwala na uruchamianie JavaScriptu poza przeglądarką i umożliwia tworzenie wydajnych aplikacji serwerowych."
  },
  {
    front: "Jakie są kluczowe cechy typowania w JavaScript?",
    back: "JavaScript wykorzystuje dynamiczne typowanie, co oznacza, że typy zmiennych są określane w czasie wykonania programu."
  },
  {
    front: "Co to jest NPM i jaką rolę pełni w ekosystemie JavaScript?",
    back: "NPM (Node Package Manager) jest największym repozytorium oprogramowania na świecie, zawierającym miliony pakietów i bibliotek dla JavaScript."
  }
];

export class LLMService {
  private config: LLMConfig;
  private controller: AbortController | null = null;
  private readonly useMocks: boolean;

  constructor(config: LLMConfig) {
    this.config = config;
    // Używaj mocków w trybie deweloperskim, chyba że ustawiono USE_REAL_LLM=true
    this.useMocks = import.meta.env.MODE === 'development' && import.meta.env.USE_REAL_LLM !== 'true';
  }

  async generateFlashcardSuggestions(sourceText: string): Promise<LLMResponse> {
    // W trybie deweloperskim domyślnie używamy mocków, ale możemy to nadpisać
    if (this.useMocks) {
      console.log('Using mock flashcard suggestions in development mode');
      return {
        suggestions: MOCK_SUGGESTIONS
      };
    }

    // Sprawdź, czy mamy klucz API
    if (!this.config.apiKey || this.config.apiKey === 'test') {
      console.error('Missing OpenRouter API key. Please set OPENROUTER_API_KEY environment variable.');
      return {
        suggestions: [],
        error: {
          code: 'MISSING_API_KEY',
          message: 'OpenRouter API key is missing or invalid. Please set OPENROUTER_API_KEY environment variable.'
        }
      };
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await this.callLLM(sourceText);
        return {
          suggestions: response.suggestions
        };
      } catch (error) {
        lastError = error as Error;
        if (error instanceof Error && error.name === 'AbortError') {
          break; // Don't retry on timeout
        }
        // Wait before retrying, with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // W przypadku błędu, w trybie deweloperskim możemy zwrócić mocki jako fallback
    if (import.meta.env.MODE === 'development') {
      console.warn('Failed to generate flashcards with LLM, falling back to mocks');
      return {
        suggestions: MOCK_SUGGESTIONS
      };
    }

    return {
      suggestions: [],
      error: {
        code: lastError?.name || 'LLM_ERROR',
        message: lastError?.message || 'Failed to generate flashcards after multiple attempts'
      }
    };
  }

  private async callLLM(sourceText: string): Promise<{ suggestions: SuggestionDto[] }> {
    if (this.controller) {
      this.controller.abort();
    }
    this.controller = new AbortController();

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': 'https://10x-cards.krzysiek.io',
          'X-Title': '10x Cards by Krzysiek'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: sourceText
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        }),
        signal: this.controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json() as OpenRouterResponse;
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from LLM');
      }

      let suggestions: SuggestionDto[];
      try {
        suggestions = JSON.parse(content);
      } catch (e) {
        throw new Error('Failed to parse LLM response as JSON');
      }

      if (!Array.isArray(suggestions) || !suggestions.every(s => 
        typeof s === 'object' && 
        typeof s.front === 'string' && 
        typeof s.back === 'string')) {
        throw new Error('Invalid response format from LLM');
      }

      return { suggestions };
    } finally {
      this.controller = null;
    }
  }
}

// Create singleton instance
export const llmService = new LLMService({
  apiKey: import.meta.env.OPENROUTER_API_KEY || 'test',
  model: 'openai/gpt-4',
  maxRetries: 3,
  timeoutMs: 60000
}); 