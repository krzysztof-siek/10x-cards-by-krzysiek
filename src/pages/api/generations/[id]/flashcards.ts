import type { APIRoute } from "astro";
import { z } from "zod";
import type { AcceptSuggestionsCommand, AcceptSuggestionsResponseDto } from "../../../../types";
import { FlashcardService } from "../../../../lib/services/flashcard.service";

export const prerender = false;

// Walidacja danych wejściowych
const acceptSuggestionsSchema = z.object({
  accepted: z
    .array(
      z.object({
        front: z.string().max(200, "Front text cannot exceed 200 characters"),
        back: z.string().max(500, "Back text cannot exceed 500 characters"),
        edited: z.boolean(),
      })
    )
    .min(1, "At least one suggestion must be accepted"),
});

export const POST: APIRoute = async ({ request, params, locals }) => {
  try {
    // Sprawdzenie autoryzacji
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to save flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Używamy ID zalogowanego użytkownika
    const userId = locals.user.id;
    const supabase = locals.supabase;
    const flashcardService = new FlashcardService(supabase);

    // Pobierz ID generacji z parametrów URL
    const generationId = parseInt(params.id || "0", 10);

    if (isNaN(generationId) || generationId <= 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid Input",
          message: "Invalid generation ID",
        }),
        { status: 400 }
      );
    }

    // Parsuj i waliduj dane wejściowe
    const body = (await request.json()) as AcceptSuggestionsCommand;
    const validationResult = acceptSuggestionsSchema.safeParse(body);

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

    // Zapisz fiszki używając serwisu
    const savedFlashcards = await flashcardService.saveAcceptedSuggestions({
      userId,
      generationId,
      acceptedSuggestions: body.accepted,
    });

    // Przygotuj odpowiedź
    const response: AcceptSuggestionsResponseDto = {
      flashcards: savedFlashcards.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        source: card.source,
        generation_id: card.generation_id,
        created_at: card.created_at,
        updated_at: card.updated_at,
      })),
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
};
