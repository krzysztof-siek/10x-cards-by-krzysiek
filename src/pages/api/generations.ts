import type { APIRoute } from 'astro';
import { z } from 'zod';
import { GenerationService } from '../../lib/services/generation.service';
import { rateLimitService } from '../../lib/services/rate-limit.service';
import { ErrorLogService, formatError } from '../../lib/services/error-log.service';
import type { GenerateFlashcardsCommand, GenerationCreateResponseDto } from '../../types';
import { supabaseClient } from '../../db/supabase.client';

export const prerender = false;

const TEST_USER_ID = '39ad558a-561f-4b9a-9cc7-e0580476a0f8';
const IS_DEVELOPMENT = import.meta.env.MODE === 'development';

const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, 'Source text must be at least 1000 characters long')
    .max(10000, 'Source text cannot exceed 10000 characters')
});

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('API /generations: Otrzymano nowe żądanie generacji fiszek');
    
    // W trybie deweloperskim używamy test usera
    const userId = TEST_USER_ID;
    const supabase = supabaseClient;
    const errorLogService = new ErrorLogService(supabase);
    const generationService = new GenerationService(supabase);

    // Parse and validate input
    const body = await request.json() as GenerateFlashcardsCommand;
    console.log(`API /generations: Otrzymano tekst o długości ${body.source_text.length} znaków`);
    
    const validationResult = generateFlashcardsSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('API /generations: Błąd walidacji:', validationResult.error.errors);
      return new Response(
        JSON.stringify({
          error: 'Validation Error',
          message: 'Invalid input data',
          validation_errors: validationResult.error.errors
        }),
        { status: 400 }
      );
    }

    try {
      console.log('API /generations: Rozpoczynam generowanie fiszek');
      // Generate flashcard suggestions using the integrated GenerationService
      const result = await generationService.generateFlashcardSuggestions({
        userId,
        sourceText: body.source_text
      });

      console.log(`API /generations: Generowanie zakończone sukcesem. Wygenerowano ${result.suggestions.length} fiszek`);

      // Return response
      const response: GenerationCreateResponseDto = {
        generation: {
          id: result.generation.id,
          model: result.generation.model,
          generated_count: result.generation.generated_count,
          accepted_unedited_count: result.generation.accepted_unedited_count,
          accepted_edited_count: result.generation.accepted_edited_count,
          source_text_hash: result.generation.source_text_hash,
          source_text_length: result.generation.source_text_length,
          generation_duration: result.generation.generation_duration,
          created_at: result.generation.created_at,
          updated_at: result.generation.updated_at
        },
        suggestions: result.suggestions
      };

      return new Response(JSON.stringify(response), {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      // Obsługa błędów związanych z generacją
      console.error('API /generations: Błąd podczas generowania fiszek:', error);
      return new Response(
        JSON.stringify({
          error: 'Generation Error',
          message: error instanceof Error ? error.message : 'Failed to generate flashcard suggestions',
          details: error instanceof Error ? { name: error.name, stack: error.stack } : null
        }),
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('API /generations: Nieoczekiwany błąd:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error)
      }),
      { status: 500 }
    );
  }
}; 