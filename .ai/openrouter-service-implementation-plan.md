# Przewodnik Implementacji Usługi OpenRouter

Niniejszy dokument stanowi szczegółowy plan wdrożenia usługi `OpenRouterService` w środowisku Astro z wykorzystaniem TypeScript. Usługa ta będzie odpowiedzialna za hermetyzację logiki komunikacji z API OpenRouter.

## 1. Opis usługi

`OpenRouterService` to klasa TypeScript, która działa jako adapter do API chatu OpenRouter (`/api/v1/chat/completions`). Jej głównym celem jest uproszczenie procesu wysyłania żądań i odbierania odpowiedzi od modeli językowych, zarządzanie konfiguracją (klucze API, domyślne parametry) oraz obsługa błędów. Usługa zostanie zaimplementowana w taki sposób, aby była wykorzystywana wyłącznie po stronie serwera (np. w endpointach API Astro), aby nie ujawniać klucza API po stronie klienta.

## 2. Opis konstruktora

Konstruktor klasy `OpenRouterService` nie będzie przyjmował żadnych argumentów. Konfiguracja, w tym klucz API, będzie wczytywana bezpośrednio ze zmiennych środowiskowych po stronie serwera.

```typescript
// Lokalizacja: src/lib/openrouter/index.ts

import { OPENROUTER_API_KEY } from "$env/static/private";

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://openrouter.ai/api/v1";

  constructor() {
    if (!OPENROUTER_API_KEY) {
      // Ten błąd zostanie rzucony podczas inicjalizacji serwera,
      // jeśli zmienna środowiskowa nie jest ustawiona.
      throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
    }
    this.apiKey = OPENROUTER_API_KEY;
  }

  // ... metody
}
```

## 3. Publiczne metody i pola

Usługa będzie eksponować dwie główne metody publiczne.

### `async getCompletion(options: CompletionOptions): Promise<string>`

Metoda ta służy do uzyskiwania standardowych uzupełnień tekstowych.

- **Argumenty (`CompletionOptions`)**:
  - `messages` (`Message[]`): Historia konwersacji.
  - `model` (`string`): Nazwa modelu do użycia (np. `anthropic/claude-3-haiku-20240307`).
  - `systemPrompt?` (`string`): Opcjonalny komunikat systemowy.
  - `temperature?` (`number`): Parametr kontrolujący losowość (np. `0.7`).
  - `maxTokens?` (`number`): Maksymalna liczba tokenów w odpowiedzi.
- **Zwraca**: `Promise<string>` zawierający odpowiedź tekstową od modelu.

### `async getStructuredCompletion<T>(options: StructuredCompletionOptions): Promise<T>`

Metoda generyczna do uzyskiwania odpowiedzi w formacie JSON, zgodnych z podanym schematem.

- **Argumenty (`StructuredCompletionOptions`)**:
  - Rozszerza `CompletionOptions`.
  - `schema` (`object`): Obiekt schematu JSON definiujący oczekiwaną strukturę.
  - `schemaName` (`string`): Nazwa dla schematu, używana w żądaniu.
- **Zwraca**: `Promise<T>` gdzie `T` to typ zgodny z dostarczonym schematem, zawierający sparsowany obiekt JSON.

## 4. Prywatne metody i pola

Logika wewnętrzna będzie hermetyzowana w metodach prywatnych.

### `private async #request<T>(payload: object): Promise<T>`

Prywatna metoda do wysyłania żądań `POST` do API OpenRouter. Będzie odpowiedzialna za dodawanie nagłówków autoryzacyjnych, serializację ciała żądania i obsługę podstawowych odpowiedzi HTTP.

### `private #buildPayload(options: CompletionOptions | StructuredCompletionOptions): object`

Metoda pomocnicza do budowania obiektu ładunku (payload) dla API na podstawie opcji dostarczonych do metod publicznych. Tutaj będzie implementowana logika tworzenia tablicy `messages` i formatowania `response_format`.

### `private #handleApiError(response: Response, responseData: any): never`

Metoda pomocnicza do rzucania spersonalizowanych błędów na podstawie kodu statusu HTTP i treści odpowiedzi z API.

## 5. Obsługa błędów

W celu zapewnienia solidności usługi, zdefiniowane zostaną niestandardowe klasy błędów.

- `OpenRouterAuthenticationError`: Rzucany przy błędzie 401 (nieprawidłowy klucz API).
- `OpenRouterRateLimitError`: Rzucany przy błędzie 429 (przekroczony limit zapytań).
- `OpenRouterInvalidRequestError`: Rzucany przy błędzie 400 (nieprawidłowe żądanie), zawiera szczegóły błędu z API.
- `OpenRouterServerError`: Rzucany przy błędach 5xx po stronie serwera OpenRouter.
- `JSONParsingError`: Rzucany, gdy model nie zwróci poprawnego formatu JSON, mimo że był o to proszony.
- `NetworkError`: Rzucany w przypadku problemów z połączeniem sieciowym.

## 6. Kwestie bezpieczeństwa

1.  **Klucz API**: Klucz `OPENROUTER_API_KEY` musi być przechowywany wyłącznie jako zmienna środowiskowa serwera (`$env/static/private` w Astro) i nigdy nie może być eksponowany po stronie klienta.
2.  **Walidacja wejścia**: Wszystkie dane wejściowe pochodzące od użytkowników (np. treść wiadomości) powinny być walidowane i/lub sanityzowane przed przekazaniem do usługi, aby zminimalizować ryzyko Prompt Injection.
3.  **Dostęp do usługi**: `OpenRouterService` powinna być używana tylko w kontekście serwerowym, np. w endpointach API (`src/pages/api/*`), a nie w komponentach React/Astro renderowanych po stronie klienta.

## 7. Plan wdrożenia krok po kroku

### Krok 1: Konfiguracja środowiska

1.  Utwórz plik `.env` w głównym katalogu projektu.
2.  Dodaj do niego swój klucz API:
    ```env
    # .env
    OPENROUTER_API_KEY="sk-or-v1-..."
    ```
3.  Upewnij się, że plik `.env` jest dodany do `.gitignore`.

### Krok 2: Struktura plików

Utwórz następującą strukturę plików w katalogu `src/lib`:

```
src/
└── lib/
    └── openrouter/
        ├── index.ts         # Główny plik usługi
        ├── types.ts         # Definicje typów i interfejsów
        └── errors.ts        # Niestandardowe klasy błędów
```

### Krok 3: Definicje typów (types.ts)

Zdefiniuj interfejsy dla wiadomości, opcji i odpowiedzi. Zaleca się użycie Zod do walidacji w czasie wykonania.

```typescript
// src/lib/openrouter/types.ts

// Podstawowa struktura wiadomości w konwersacji
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Opcje dla standardowego uzupełnienia
export interface CompletionOptions {
  messages: Message[];
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

// Opcje dla uzupełnienia strukturyzowanego
export interface StructuredCompletionOptions extends CompletionOptions {
  schema: object;
  schemaName: string;
}

// Struktura odpowiedzi z API OpenRouter
export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  // inne pola, np. usage
}
```

### Krok 4: Niestandardowe błędy (errors.ts)

Zaimplementuj klasy błędów.

```typescript
// src/lib/openrouter/errors.ts

export class OpenRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class OpenRouterAuthenticationError extends OpenRouterError {}
export class OpenRouterRateLimitError extends OpenRouterError {}
export class OpenRouterInvalidRequestError extends OpenRouterError {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
  }
}
export class OpenRouterServerError extends OpenRouterError {}
export class JSONParsingError extends OpenRouterError {}
export class NetworkError extends OpenRouterError {}
```

### Krok 5: Implementacja usługi (index.ts)

Zaimplementuj logikę `OpenRouterService`, włączając w to metody publiczne i prywatne.

```typescript
// src/lib/openrouter/index.ts

import { OPENROUTER_API_KEY } from "$env/static/private";
import {
  OpenRouterAuthenticationError,
  OpenRouterInvalidRequestError,
  OpenRouterRateLimitError,
  OpenRouterServerError,
  JSONParsingError,
  NetworkError,
} from "./errors";
import type { CompletionOptions, Message, OpenRouterResponse, StructuredCompletionOptions } from "./types";

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://openrouter.ai/api/v1";

  constructor() {
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
    }
    this.apiKey = OPENROUTER_API_KEY;
  }

  public async getCompletion(options: CompletionOptions): Promise<string> {
    const payload = this.#buildPayload(options);
    const response = await this.#request<OpenRouterResponse>(payload);
    return response.choices[0].message.content;
  }

  public async getStructuredCompletion<T>(options: StructuredCompletionOptions): Promise<T> {
    const payload = this.#buildPayload(options);
    const response = await this.#request<OpenRouterResponse>(payload);
    const content = response.choices[0].message.content;

    try {
      return JSON.parse(content) as T;
    } catch (error) {
      throw new JSONParsingError("Failed to parse model response as JSON.");
    }
  }

  #buildPayload(options: CompletionOptions | StructuredCompletionOptions): object {
    const messages: Message[] = [...options.messages];
    if (options.systemPrompt) {
      messages.unshift({ role: "system", content: options.systemPrompt });
    }

    const payload: any = {
      model: options.model,
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    };

    if ("schema" in options) {
      payload.response_format = {
        type: "json_schema",
        json_schema: {
          name: options.schemaName,
          strict: true,
          schema: options.schema,
        },
      };

      // Dodaj instrukcję dla modelu, aby użył schematu
      const lastUserMessageIndex = messages.findLastIndex((m) => m.role === "user");
      if (lastUserMessageIndex > -1) {
        messages[lastUserMessageIndex].content +=
          `\n\nProszę, odpowiedz, używając narzędzia JSON o nazwie "${options.schemaName}".`;
      }
    }

    return payload;
  }

  async #request<T>(payload: object): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        this.#handleApiError(response, data);
      }

      return data as T;
    } catch (error) {
      if (error instanceof OpenRouterError) throw error;
      throw new NetworkError("A network error occurred while communicating with OpenRouter.");
    }
  }

  #handleApiError(response: Response, data: any): never {
    const errorMessage = data?.error?.message || `API request failed with status ${response.status}`;
    switch (response.status) {
      case 401:
        throw new OpenRouterAuthenticationError(errorMessage);
      case 429:
        throw new OpenRouterRateLimitError(errorMessage);
      case 400:
        throw new OpenRouterInvalidRequestError(errorMessage, data?.error?.details);
      case 500:
      default:
        throw new OpenRouterServerError(errorMessage);
    }
  }
}
```

### Krok 6: Przykład użycia w API Astro

Utwórz endpoint API, aby zademonstrować użycie usługi.

```typescript
// src/pages/api/chat.ts
import type { APIRoute } from "astro";
import { OpenRouterService } from "@lib/openrouter";
import { OpenRouterInvalidRequestError } from "@lib/openrouter/errors";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Prosta walidacja wejścia
    if (!body.message || typeof body.message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    const openrouter = new OpenRouterService();

    // Przykład dla getStructuredCompletion
    const userDetails = await openrouter.getStructuredCompletion<{ name: string; email: string }>({
      messages: [
        {
          role: "user",
          content: `Nazywam się Jan Kowalski, a mój email to jan.kowalski@example.com. Wyodrębnij te informacje. Użyj polskiego imienia i nazwiska. ${body.message}`,
        },
      ],
      model: "anthropic/claude-3-haiku-20240307",
      systemPrompt: "Jesteś asystentem, który wyodrębnia dane i zwraca je w formacie JSON.",
      schemaName: "extract_user_details",
      schema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Imię i nazwisko użytkownika." },
          email: { type: "string", format: "email", description: "Adres email użytkownika." },
        },
        required: ["name", "email"],
      },
    });

    return new Response(JSON.stringify(userDetails), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(error);
    const status = error instanceof OpenRouterInvalidRequestError ? 400 : 500;
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
};
```
