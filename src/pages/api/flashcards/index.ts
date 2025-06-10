import type { APIRoute } from "astro";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import { flashcardsSearchSchema, flashcardsCreateSchema } from "../../../lib/schemas/flashcard.schema";
import type { FlashcardsCreateCommand, ValidationErrorDto } from "../../../types";
export const prerender = false;

/**
 * GET /api/flashcards
 * List flashcards with pagination and search capabilities
 */
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Sprawdzenie autoryzacji
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to access this resource",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get search parameters from URL
    const searchParams = {
      page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
      limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
      search: url.searchParams.get("search") || undefined,
      source: (url.searchParams.get("source") as any) || undefined,
    };

    // Validate search parameters
    const validationResult = flashcardsSearchSchema.safeParse(searchParams);

    if (!validationResult.success) {
      const errorResponse: ValidationErrorDto = {
        error: "Validation Error",
        message: "Invalid search parameters",
        validation_errors: validationResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: "invalid_parameter",
        })),
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Używamy ID zalogowanego użytkownika
    const userId = locals.user.id;
    const supabase = locals.supabase; // Używamy supabase z locals zamiast globalnego klienta
    const flashcardService = new FlashcardService(supabase);

    // Get flashcards using the service - dodajemy userId do parametrów
    const result = await flashcardService.list({
      ...validationResult.data,
      userId,
    });

    // Return response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while fetching flashcards",
        details: error instanceof Error ? { message: error.message } : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * POST /api/flashcards
 * Create new flashcards (batch operation)
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdzenie autoryzacji
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to create flashcards",
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
    const flashcardService = new FlashcardService(supabase);

    // Parse and validate the request body
    const body = (await request.json()) as FlashcardsCreateCommand;
    const validationResult = flashcardsCreateSchema.safeParse(body);

    if (!validationResult.success) {
      const errorResponse: ValidationErrorDto = {
        error: "Validation Error",
        message: "Invalid flashcard data",
        validation_errors: validationResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: "invalid_field",
        })),
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create flashcards using the service
    const result = await flashcardService.create(validationResult.data, userId);

    // Return response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while creating flashcards",
        details: error instanceof Error ? { message: error.message } : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
