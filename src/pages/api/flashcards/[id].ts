import type { APIRoute } from "astro";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import { flashcardUpdateSchema } from "../../../lib/schemas/flashcard.schema";
import type { FlashcardUpdateDto, FlashcardDetailResponseDto, ValidationErrorDto } from "../../../types";

export const prerender = false;

/**
 * Helper function to parse and validate ID parameter
 */
function parseAndValidateId(id: string | undefined): number | null {
  if (!id) return null;

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) return null;

  return parsedId;
}

/**
 * GET /api/flashcards/:id
 * Get a single flashcard by ID
 */
export const GET: APIRoute = async ({ params, locals }) => {
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

    const id = parseAndValidateId(params.id);

    if (id === null) {
      return new Response(
        JSON.stringify({
          error: "Invalid Request",
          message: "Invalid flashcard ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Używamy ID zalogowanego użytkownika
    const userId = locals.user.id;
    const supabase = locals.supabase;
    const flashcardService = new FlashcardService(supabase);

    try {
      // Get flashcard using the service - przekazujemy userId
      const flashcard = await flashcardService.getById(id, userId);

      // Return response
      const response: FlashcardDetailResponseDto = { flashcard };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // Handle not found error
      if (error instanceof Error && error.message.includes("not found")) {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: `Flashcard with ID ${id} not found`,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Re-throw for general error handling
      throw error;
    }
  } catch (error) {
    console.error("Error fetching flashcard:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while fetching the flashcard",
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
 * PUT /api/flashcards/:id
 * Update a flashcard
 */
export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    // Sprawdzenie autoryzacji
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to update a flashcard",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const id = parseAndValidateId(params.id);

    if (id === null) {
      return new Response(
        JSON.stringify({
          error: "Invalid Request",
          message: "Invalid flashcard ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Używamy ID zalogowanego użytkownika
    const userId = locals.user.id;
    const supabase = locals.supabase;
    const flashcardService = new FlashcardService(supabase);

    // Parse and validate the request body
    const body = (await request.json()) as FlashcardUpdateDto;
    const validationResult = flashcardUpdateSchema.safeParse(body);

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

    try {
      // Update flashcard using the service - przekazujemy userId
      const result = await flashcardService.update(id, validationResult.data, userId);

      // Return response
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // Handle not found error
      if (error instanceof Error && error.message.includes("not found")) {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: `Flashcard with ID ${id} not found`,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Re-throw for general error handling
      throw error;
    }
  } catch (error) {
    console.error("Error updating flashcard:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while updating the flashcard",
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
 * DELETE /api/flashcards/:id
 * Delete a flashcard
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Sprawdzenie autoryzacji
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to delete a flashcard",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const id = parseAndValidateId(params.id);

    if (id === null) {
      return new Response(
        JSON.stringify({
          error: "Invalid Request",
          message: "Invalid flashcard ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Używamy ID zalogowanego użytkownika
    const userId = locals.user.id;
    const supabase = locals.supabase;
    const flashcardService = new FlashcardService(supabase);

    try {
      // Delete flashcard using the service - przekazujemy userId
      await flashcardService.delete(id, userId);

      // Return empty response with 204 status code
      return new Response(null, { status: 204 });
    } catch (error) {
      // Handle not found error
      if (error instanceof Error && error.message.includes("not found")) {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: `Flashcard with ID ${id} not found`,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Re-throw for general error handling
      throw error;
    }
  } catch (error) {
    console.error("Error deleting flashcard:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while deleting the flashcard",
        details: error instanceof Error ? { message: error.message } : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
