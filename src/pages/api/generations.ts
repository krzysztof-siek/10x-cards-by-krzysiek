import type { APIRoute } from 'astro';
import { z } from 'zod';
import crypto from 'crypto';
import { llmService } from '../../lib/services/llm.service';
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
    // W trybie deweloperskim używamy test usera
    const userId = TEST_USER_ID;
    const supabase = supabaseClient;
    const errorLogService = new ErrorLogService(supabase);

    // 2. Parse and validate input
    const body = await request.json() as GenerateFlashcardsCommand;
    const validationResult = generateFlashcardsSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation Error',
          message: 'Invalid input data',
          validation_errors: validationResult.error.errors
        }),
        { status: 400 }
      );
    }

    // 3. Generate suggestions using LLM
    const startTime = Date.now();
    const llmResponse = await llmService.generateFlashcardSuggestions(body.source_text);
    const generationDuration = Date.now() - startTime;

    if (llmResponse.error) {
      return new Response(
        JSON.stringify({
          error: 'LLM Error',
          message: 'Failed to generate flashcard suggestions',
          details: llmResponse.error
        }),
        { status: 503 }
      );
    }

    // 4. Create generation record
    const generationService = new GenerationService(supabase);
    const generation = await generationService.createGeneration({
      userId,
      sourceText: body.source_text,
      suggestions: llmResponse.suggestions,
      model: 'openai/gpt-4',
      generationDurationMs: generationDuration
    });

    // 5. Return response
    const response: GenerationCreateResponseDto = {
      generation: {
        id: generation.id,
        model: generation.model,
        generated_count: generation.generated_count,
        accepted_unedited_count: generation.accepted_unedited_count,
        accepted_edited_count: generation.accepted_edited_count,
        source_text_hash: generation.source_text_hash,
        source_text_length: generation.source_text_length,
        generation_duration: generation.generation_duration,
        created_at: generation.created_at,
        updated_at: generation.updated_at
      },
      suggestions: llmResponse.suggestions
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}; 