# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego

Endpoint służy do generowania sugestii fiszek na podstawie tekstu źródłowego przez model LLM. Tworzy rekord generacji w bazie danych i zwraca wygenerowane sugestie. Jest to kluczowy endpoint dla funkcjonalności AI w aplikacji do nauki z fiszkami.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/generations`
- **Parametry**:
  - **Wymagane**: 'brak (wszystkie dane w body)'
  - **Opcjonalne**: brak
- **Request Body**:
  ```json
  {
    "source_text": "Tekst źródłowy o długości między 1000-10000 znaków"
  }
  ```
- **Content-Type**: `application/json`
- **Authentication**: Bearer token (JWT) w headerze Authorization

## 3. Wykorzystywane typy

- **Command Model**: `GenerateFlashcardsCommand`
- **Response DTO**: `GenerationCreateResponseDto`
- **Nested DTOs**: `SuggestionDto`, `Generation` (z pominięciem user_id)
- **Database Types**: `Generation`, `GenerationErrorLog`

## 4. Szczegóły odpowiedzi

### Sukces (201 Created)

```json
{
  "generation": {
    "id": 123,
    "model": "gpt-4",
    "generated_count": 5,
    "accepted_unedited_count": null,
    "accepted_edited_count": null,
    "source_text_hash": "abc123...",
    "source_text_length": 2500,
    "generation_duration": 3000,
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "suggestions": [
    { "front": "Pytanie 1", "back": "Odpowiedź 1" },
    { "front": "Pytanie 2", "back": "Odpowiedź 2" }
  ]
}
```

### Błędy

- **400 Bad Request**: Nieprawidłowa długość source_text
- **401 Unauthorized**: Brak lub nieprawidłowy token JWT
- **503 Service Unavailable**: Błąd usługi LLM
- **500 Internal Server Error**: Błędy serwera/bazy danych

## 5. Przepływ danych

1. **Walidacja uwierzytelnienia**: Sprawdzenie JWT tokenu i pobranie user_id
2. **Walidacja danych wejściowych**: Sprawdzenie długości source_text (1000-10000 znaków)
3. **Przygotowanie danych**: Obliczenie hash'a i długości tekstu źródłowego
4. **Wywołanie LLM**: Wysłanie żądania do usługi AI (OpenRouter.ai)
5. **Tworzenie rekordu generacji**: Zapisanie informacji o generacji w bazie danych
6. **Obsługa błędów LLM**: W przypadku błędu zapis do generation_error_logs
7. **Zwrócenie odpowiedzi**: Formatowanie i zwrócenie danych

## 6. Względy bezpieczeństwa

- **Uwierzytelnienie**: Wymagany ważny JWT token w headerze Authorization
- **Autoryzacja**: RLS polityki zapewniają dostęp tylko do własnych generacji użytkownika
- **Walidacja danych**: Ścisła walidacja długości source_text
- **Rate Limiting**: Potencjalne ograniczenie liczby żądań na użytkownika/czas
- **Hash tekstu**: Przechowywanie hash'a zamiast pełnego tekstu ze względów bezpieczeństwa
- **Sanityzacja**: Walidacja i czyszczenie danych wejściowych przed wysłaniem do LLM

## 7. Obsługa błędów

### Walidacja wejścia (400)

- source_text krótszy niż 1000 znaków
- source_text dłuższy niż 10000 znaków
- source_text nie jest stringiem lub jest pusty
- Nieprawidłowy format JSON

### Błędy uwierzytelnienia (401)

- Brak headerza Authorization
- Nieprawidłowy lub wygasły JWT token

### Błędy LLM (503)

- Usługa OpenRouter.ai niedostępna
- Timeout wywołania LLM
- Błędy rate limiting od dostawcy LLM

### Błędy serwera (500)

- Błędy połączenia z bazą danych
- Błędy zapisu do generation_error_logs
- Nieoczekiwane błędy aplikacji

**Logowanie błędów**: Wszystkie błędy LLM zapisywane w tabeli generation_error_logs z szczegółami: model, source_text_hash, source_text_length, error_code, error_message.

## 8. Rozważania dotyczące wydajności

- **Timeout LLM**: Ustawienie odpowiedniego timeout'u dla wywołań LLM (np. 30-60 sekund)
- **Streaming**: Rozważenie streamowania odpowiedzi LLM dla lepszego UX
- **Caching**: Potencjalne cache'owanie na podstawie source_text_hash dla identycznych tekstów
- **Async processing**: Rozważenie asynchronicznego przetwarzania dla długich tekstów
- **Connection pooling**: Wykorzystanie connection poolingu dla bazy danych
- **Memory management**: Optymalne zarządzanie pamięcią dla dużych tekstów źródłowych

## 9. Etapy wdrożenia

1. **Utworzenie struktury plików**

   - `src/pages/api/generations.ts` - główny endpoint
   - `src/lib/services/llm.service.ts` - serwis LLM
   - `src/lib/services/generation.service.ts` - serwis generacji
   - `src/lib/services/error-log.service.ts` - serwis logowania błędów

2. **Implementacja walidacji danych wejściowych**

   - Utworzenie schematu Zod dla `GenerateFlashcardsCommand`
   - Walidacja długości source_text (1000-10000 znaków)
   - Walidacja formatu JSON

3. **Implementacja serwisu LLM**

   - Konfiguracja klienta OpenRouter.ai
   - Implementacja wywołania LLM z odpowiednim promptem
   - Obsługa timeout'ów i błędów sieciowych
   - Parsowanie odpowiedzi LLM do formatu `SuggestionDto[]`

4. **Implementacja serwisu generacji**

   - Funkcja tworzenia rekordu generacji w bazie danych
   - Obliczanie hash'a tekstu źródłowego (np. SHA-256)
   - Pomiar czasu trwania generacji
   - Integracja z Supabase klientem

5. **Implementacja serwisu logowania błędów**

   - Funkcja zapisywania błędów LLM do generation_error_logs
   - Mapowanie kodów błędów na czytelne komunikaty
   - Zachowanie informacji o kontekście błędu

6. **Implementacja głównego endpointa**

   - Sprawdzenie uwierzytelnienia (supabase z context.locals)
   - Walidacja danych wejściowych
   - Koordynacja wywołań serwisów
   - Obsługa błędów i zwracanie odpowiednich kodów statusu
   - Formatowanie odpowiedzi zgodnie z `GenerationCreateResponseDto`

7. **Implementacja middleware uwierzytelnienia** (jeśli nie istnieje)

   - Walidacja JWT tokenu
   - Dodanie userId do context.locals
   - Obsługa błędów uwierzytelnienia

8. **Dokumentacja i finalizacja**
   - Aktualizacja dokumentacji API
   - Sprawdzenie zgodności z typami TypeScript
   - Weryfikacja zgodności z regułami linter'a
   - Code review i optymalizacje wydajności
