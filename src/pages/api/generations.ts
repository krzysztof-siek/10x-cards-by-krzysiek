import type { APIRoute } from "astro";
import { z } from "zod";
import { GenerationService } from "../../lib/services/generation.service";
import type { GenerateFlashcardsCommand, GenerationCreateResponseDto } from "../../types";
export const prerender = false;

const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters long")
    .max(10000, "Source text cannot exceed 10000 characters"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdzenie autoryzacji
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to generate flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Używamy ID zalogowanego użytkownika
    const userId = locals.user.id;
    const supabase = locals.supabase; // Używamy supabase z locals zamiast globalnego klienta
    const generationService = new GenerationService(supabase);

    // Parse and validate input
    const body = (await request.json()) as GenerateFlashcardsCommand;

    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation Error",
          message: "Invalid input data",
          validation_errors: validationResult.error.errors,
        }),
        { status: 400 }
      );
    }

    try {
      // Generate flashcard suggestions using the integrated GenerationService
      const result = await generationService.generateFlashcardSuggestions({
        userId,
        sourceText: body.source_text,
      });

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
          updated_at: result.generation.updated_at,
        },
        suggestions: result.suggestions,
      };

      return new Response(JSON.stringify(response), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // Obsługa błędów związanych z generacją
      return new Response(
        JSON.stringify({
          error: "Generation Error",
          message: error instanceof Error ? error.message : "Failed to generate flashcard suggestions",
          details: error instanceof Error ? { name: error.name, stack: error.stack } : null,
        }),
        { status: 503 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        details:
          error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
      }),
      { status: 500 }
    );
  }
};
