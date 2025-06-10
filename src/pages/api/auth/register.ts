import type { APIContext } from "astro";
import { authService } from "../../../lib/services/auth.service";
import { registerSchema } from "../../../lib/schemas/auth.schema";
import type { AuthResponseDTO, RegisterDTO } from "../../../types";
import { rateLimitService } from "../../../lib/services/rate-limit.service";

export const prerender = false;

export async function POST({ request }: APIContext): Promise<Response> {
  try {
    // Zastosowanie rate limitingu dla endpointu rejestracji
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    const { allowed } = await rateLimitService.checkRateLimit(`register-${clientIp}`);

    if (!allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Zbyt wiele prób rejestracji. Spróbuj ponownie za chwilę.",
        } as AuthResponseDTO),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parsowanie danych wejściowych
    const body = await request.json();

    // Walidacja danych
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Nieprawidłowe dane rejestracji",
          errors: result.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { email, password } = result.data as RegisterDTO;

    // Wywołanie serwisu autentykacji
    const { user, error } = await authService.register(email, password);

    if (error) {
      // Sprawdzenie konkretnych błędów Supabase
      if (error.message.includes("email already registered")) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Użytkownik o podanym adresie email już istnieje",
          } as AuthResponseDTO),
          {
            status: 409, // Conflict
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: error.message || "Wystąpił błąd podczas rejestracji",
        } as AuthResponseDTO),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Nie udało się utworzyć konta",
        } as AuthResponseDTO),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sukces - zwracamy odpowiedź z przekierowaniem
    return new Response(
      JSON.stringify({
        success: true,
        message: "Zarejestrowano pomyślnie",
        redirectTo: "/flashcards",
      } as AuthResponseDTO),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Wystąpił błąd podczas rejestracji",
      } as AuthResponseDTO),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
