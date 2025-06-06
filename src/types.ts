// src/types.ts
import type { Database } from './db/database.types';

// ------------------------------------------------------------------------------------
// Aliases for base database row and insert/update types
// ------------------------------------------------------------------------------------
export type Flashcard = Database['public']['Tables']['flashcards']['Row'];
export type FlashcardInsert = Database['public']['Tables']['flashcards']['Insert'];
export type FlashcardUpdate = Database['public']['Tables']['flashcards']['Update'];
export type Generation = Database['public']['Tables']['generations']['Row'];
export type GenerationErrorLog = Database['public']['Tables']['generation_error_logs']['Row'];

// ------------------------------------------------------------------------------------
// 1. Flashcard DTO
//    Represents a flashcard as returned by the API endpoints
// ------------------------------------------------------------------------------------
export type FlashcardDto = Omit<
  Flashcard,
  'user_id'
>;

// ------------------------------------------------------------------------------------
// 2. Pagination DTO
//    Contains pagination details used in list responses
// ------------------------------------------------------------------------------------
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

// ------------------------------------------------------------------------------------
// 3. Flashcards List Response DTO (GET /flashcards)
// ------------------------------------------------------------------------------------
export interface FlashcardsListResponseDto {
  data: FlashcardDto[];
  meta: PaginationDto;
}

// ------------------------------------------------------------------------------------
// 4. Flashcard Detail Response DTO (GET /flashcards/{id})
// ------------------------------------------------------------------------------------
export interface FlashcardDetailResponseDto {
  flashcard: FlashcardDto;
}

// ------------------------------------------------------------------------------------
// 5. Flashcard Create DTO & Command Model (POST /flashcards)
// ------------------------------------------------------------------------------------
export type Source = Database['public']['Enums']['flashcard_source'];

export interface FlashcardCreateDto {
  front: string; // max 200 znaków
  back: string;  // max 500 znaków
  source: Source;
  generation_id: number | null; // wymagane dla ai-*, null dla manual
}

export interface FlashcardsCreateCommand {
  flashcards: FlashcardCreateDto[];
}

// ------------------------------------------------------------------------------------
// 6. Flashcards Create Response DTO
//    Response from creating flashcards
// ------------------------------------------------------------------------------------
export interface FlashcardsCreateResponseDto {
  flashcards: FlashcardDto[];
  meta: {
    total: number;
    successful: number;
    failed: number;
  };
}

// ------------------------------------------------------------------------------------
// 7. Flashcard Update DTO (PUT /flashcards/{id})
//    Zgodnie z api-plan taki sam jak create (niepartial)
// ------------------------------------------------------------------------------------
export type FlashcardUpdateDto = FlashcardCreateDto;

// ------------------------------------------------------------------------------------
// 8. Flashcard Update Response DTO (PUT /flashcards/{id})
// ------------------------------------------------------------------------------------
export interface FlashcardUpdateResponseDto {
  flashcard: FlashcardDto;
}

// ------------------------------------------------------------------------------------
// 9. Generate Flashcards Command (POST /generations)
// ------------------------------------------------------------------------------------
export interface GenerateFlashcardsCommand {
  source_text: string; // między 1000-10000 znaków
}

// ------------------------------------------------------------------------------------
// 10. Suggestion DTO
//     Represents a single flashcard suggestion from the LLM
//     Note: Zgodnie z api-plan.md suggestions nie mają pola source
// ------------------------------------------------------------------------------------
export interface SuggestionDto {
  front: string;
  back: string;
}

// ------------------------------------------------------------------------------------
// 11. Generation Create Response DTO (POST /generations)
// ------------------------------------------------------------------------------------
export interface GenerationCreateResponseDto {
  generation: Omit<Generation, 'user_id'>;
  suggestions: SuggestionDto[];
}

// ------------------------------------------------------------------------------------
// 12. Generations List Response DTO (GET /generations)
// ------------------------------------------------------------------------------------
export interface GenerationsListResponseDto {
  data: Omit<Generation, 'user_id'>[];
  meta: PaginationDto;
}

// ------------------------------------------------------------------------------------
// 13. Generation Detail Response DTO (GET /generations/{id})
//     Zgodnie z api-plan.md: "Retrieve details + counts"
//     Dodano opcjonalne flashcards dla kompletności
// ------------------------------------------------------------------------------------
export interface GenerationDetailResponseDto {
  generation: Omit<Generation, 'user_id'>;
  flashcards?: FlashcardDto[]; // Opcjonalne - dla pełnych detali
}

// ------------------------------------------------------------------------------------
// 14. Accept Suggestions Command & Response DTO (POST /generations/{id}/flashcards)
// ------------------------------------------------------------------------------------
export interface AcceptedSuggestionDto extends SuggestionDto {
  edited: boolean;
}

export interface AcceptSuggestionsCommand {
  accepted: AcceptedSuggestionDto[];
}

export interface AcceptSuggestionsResponseDto {
  flashcards: FlashcardDto[];
}

// ------------------------------------------------------------------------------------
// 15. Generation Error Log DTO & List Response DTO (GET /generation-error-logs)
//     Bez user_id zgodnie z planem API
// ------------------------------------------------------------------------------------
export type GenerationErrorLogDto = Omit<
  GenerationErrorLog,
  'user_id'
>;

export interface GenerationErrorLogsListResponseDto {
  data: GenerationErrorLogDto[];
  meta: PaginationDto;
}

// ------------------------------------------------------------------------------------
// 16. Error Response DTOs
//     Standardowe struktury błędów dla spójności API
// ------------------------------------------------------------------------------------
export interface ApiErrorDto {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ValidationErrorDto extends ApiErrorDto {
  validation_errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}
