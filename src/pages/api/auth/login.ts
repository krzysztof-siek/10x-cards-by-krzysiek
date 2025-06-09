import type { APIContext } from 'astro';
import { authService } from '../../../lib/services/auth.service';
import { loginSchema } from '../../../lib/schemas/auth.schema';
import type { AuthResponseDTO, LoginDTO } from '../../../types';
import { rateLimitService } from '../../../lib/services/rate-limit.service';

export const prerender = false;

export async function POST({ request, locals }: APIContext): Promise<Response> {
  try {
    // Zastosowanie rate limitingu dla endpointu logowania
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = await rateLimitService.checkRateLimit(`login-${clientIp}`);
    
    if (!allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Zbyt wiele prób logowania. Spróbuj ponownie za chwilę.'
        } as AuthResponseDTO),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parsowanie danych wejściowych
    const body = await request.json();
    
    // Walidacja danych
    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Nieprawidłowe dane logowania',
          errors: result.error.format()
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { email, password } = result.data as LoginDTO;
    
    // Wywołanie serwisu autentykacji
    const { user, session, error } = await authService.login(email, password);
    
    if (error || !user || !session) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Nieprawidłowe dane logowania'
        } as AuthResponseDTO),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Sukces - zwracamy odpowiedź z przekierowaniem
    return new Response(
      JSON.stringify({
        success: true,
        redirectTo: '/flashcards'
      } as AuthResponseDTO),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Login error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Wystąpił błąd podczas logowania'
      } as AuthResponseDTO),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 