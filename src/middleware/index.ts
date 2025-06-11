import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "../db/supabase.client";
import { authService } from "../lib/services/auth.service";

export const onRequest = defineMiddleware(async (context, next) => {
  // Dodanie klienta Supabase do kontekstu
  context.locals.supabase = supabaseClient;

  // Pobieranie i dodawanie informacji o sesji
  const { session, error } = await authService.getSession();

  if (session && !error) {
    // Dodanie informacji o użytkowniku do kontekstu
    context.locals.user = session.user;
    context.locals.session = session;
  }

  // Sprawdzenie czy strona wymaga autoryzacji
  const url = new URL(context.request.url);
  const protectedRoutes = ["/flashcards", "/generate", "/practice"];

  if (protectedRoutes.some((route) => url.pathname.startsWith(route)) && !session) {
    // Przekierowanie niezalogowanego użytkownika do strony logowania
    return context.redirect("/auth/login");
  }

  return next();
});
