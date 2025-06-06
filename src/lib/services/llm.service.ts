import type { SuggestionDto } from '../../types';
import { OpenRouterService, OpenRouterAuthenticationError, OpenRouterRateLimitError, OpenRouterServerError, NetworkError } from '../openrouter.service';

interface LLMResponse {
  suggestions: SuggestionDto[];
  error?: {
    code: string;
    message: string;
  };
}

interface LLMConfig {
  model: string;
  maxRetries: number;
  timeoutMs: number;
}

const SYSTEM_PROMPT = `Generate concise flashcards from the text. Each card must have a question (front) and answer (back).
Rules:
1. Create 3-7 key flashcards
2. Keep questions clear and specific
3. Keep answers brief
4. Focus on main concepts only
5. Return JSON array only`;

export class LLMService {
  private config: LLMConfig;
  private controller: AbortController | null = null;
  private openRouterService: OpenRouterService;

  constructor(config: LLMConfig) {
    this.config = {
      ...config,
      maxRetries: config.maxRetries || 3,
      timeoutMs: config.timeoutMs || 30000 // Zmniejszamy timeout do 30 sekund
    };
    this.openRouterService = new OpenRouterService();
  }

  async generateFlashcardSuggestions(sourceText: string): Promise<LLMResponse> {
    console.log('LLMService: Rozpoczynam generowanie fiszek z tekstu o długości', sourceText.length);
    
    let lastError: Error | null = null;
    let attempt = 0;
    
    while (attempt < this.config.maxRetries) {
      attempt++;
      console.log(`LLMService: Próba #${attempt} z ${this.config.maxRetries}`);
      
      try {
        if (this.controller) {
          this.controller.abort();
        }
        this.controller = new AbortController();
        
        const timeoutId = setTimeout(() => {
          if (this.controller) {
            console.log(`LLMService: Przekroczono czas oczekiwania (${this.config.timeoutMs}ms), przerywam żądanie`);
            this.controller.abort();
          }
        }, this.config.timeoutMs);
        
        try {
          console.log('LLMService: Wysyłam żądanie do OpenRouter API, model:', this.config.model);
          const schema = {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                front: { type: 'string' },
                back: { type: 'string' }
              },
              required: ['front', 'back']
            },
            minItems: 3,
            maxItems: 7
          };
          
          const suggestions = await this.openRouterService.getStructuredCompletion<SuggestionDto[]>({
            messages: [
              { role: 'user', content: sourceText }
            ],
            model: this.config.model,
            systemPrompt: SYSTEM_PROMPT,
            schemaName: 'flashcards',
            schema,
            temperature: 0.9, // Zwiększamy temperaturę dla szybszych odpowiedzi
            maxTokens: 500    // Ograniczamy maksymalną długość odpowiedzi
          });
          
          clearTimeout(timeoutId);
          
          if (!Array.isArray(suggestions)) {
            throw new Error('Invalid response format: expected an array of suggestions');
          }

          const validSuggestions = suggestions.filter(s => 
            s && typeof s === 'object' && 
            'front' in s && typeof s.front === 'string' &&
            'back' in s && typeof s.back === 'string'
          );

          if (validSuggestions.length === 0) {
            throw new Error('No valid flashcard suggestions in the response');
          }

          if (validSuggestions.length < 3) {
            throw new Error(`Too few valid flashcards: got ${validSuggestions.length}, expected at least 3`);
          }
          
          console.log(`LLMService: Sukces! Wygenerowano ${validSuggestions.length} fiszek`);
          
          return { suggestions: validSuggestions };
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`LLMService: Błąd podczas generowania fiszek (próba ${attempt}):`, error);
        
        // Nie ponawia prób w przypadku błędów autentykacji
        if (error instanceof OpenRouterAuthenticationError) {
          break;
        }
        
        // Przerwanie w przypadku przerwania połączenia (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          break;
        }
        
        // Dla błędów rate limit i błędów serwera, czekamy przed ponowieniem próby
        if (error instanceof OpenRouterRateLimitError || error instanceof OpenRouterServerError) {
          const delay = Math.min(Math.pow(2, attempt) * 1000, 10000); // Max 10 sekund
          console.log(`LLMService: Czekam ${delay}ms przed kolejną próbą`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Dla pozostałych błędów, również czekamy przed ponowną próbą
        const delay = Math.min(Math.pow(2, attempt) * 1000, 5000); // Max 5 sekund
        console.log(`LLMService: Czekam ${delay}ms przed kolejną próbą`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Mapowanie rodzajów błędów na kody błędów
    let errorCode = 'LLM_ERROR';
    if (lastError instanceof OpenRouterAuthenticationError) {
      errorCode = 'AUTHENTICATION_ERROR';
    } else if (lastError instanceof OpenRouterRateLimitError) {
      errorCode = 'RATE_LIMIT_ERROR';
    } else if (lastError instanceof NetworkError) {
      errorCode = 'NETWORK_ERROR';
    } else if (lastError instanceof Error && lastError.name === 'AbortError') {
      errorCode = 'TIMEOUT_ERROR';
    }

    return {
      suggestions: [],
      error: {
        code: errorCode,
        message: lastError?.message || 'Failed to generate flashcards after multiple attempts'
      }
    };
  }
}

// Create singleton instance with improved configuration
export const llmService = new LLMService({
  model: 'openai/gpt-4o-mini',
  maxRetries: 3,
  timeoutMs: 60000
}); 