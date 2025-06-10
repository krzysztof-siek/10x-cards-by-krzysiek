import { authService } from "../../../lib/services/auth.service";
import type { AuthResponseDTO } from "../../../types";

export const prerender = false;

export async function POST(): Promise<Response> {
  try {
    // Wywołanie serwisu wylogowania
    const { error } = await authService.logout();

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Wystąpił błąd podczas wylogowywania",
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
        redirectTo: "/",
      } as AuthResponseDTO),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    // Obsługa błędu
    return new Response(
      JSON.stringify({
        success: false,
        message: "Wystąpił błąd podczas wylogowywania",
      }),
      { status: 500 }
    );
  }
}
