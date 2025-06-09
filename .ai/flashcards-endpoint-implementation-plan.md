# API Endpoint Implementation Plan: Flashcards CRUD API

## 1. Przegląd punktu końcowego
Zestaw endpointów REST API do zarządzania fiszkami (flashcards) w systemie. Obejmuje operacje CRUD z obsługą tworzenia wsadowego, paginacji i wyszukiwania. Endpointy są zabezpieczone przez Supabase Auth i przestrzegają zasad Row Level Security (RLS).

## 2. Szczegóły żądania

### GET /flashcards
- Parametry Query:
  - `page`: number (domyślnie: 1)
  - `limit`: number (domyślnie: 20)
  - `search`: string (opcjonalnie)
  - `source`: 'manual' | 'ai-full' | 'ai-edited' (opcjonalnie)
- Headers:
  - `Authorization: Bearer <token>`

### GET /flashcards/:id
- Parametry Path:
  - `id`: number
- Headers:
  - `Authorization: Bearer <token>`

### POST /flashcards
- Request Body: `FlashcardsCreateCommand`
  ```typescript
  {
    flashcards: Array<{
      front: string,      // max 200 znaków
      back: string,       // max 500 znaków
      source: Source,     // 'manual' | 'ai-full' | 'ai-edited'
      generation_id: number | null
    }>
  }
  ```
- Headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

### PUT /flashcards/:id
- Parametry Path:
  - `id`: number
- Request Body: `FlashcardUpdateDto`
- Headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

### DELETE /flashcards/:id
- Parametry Path:
  - `id`: number
- Headers:
  - `Authorization: Bearer <token>`

## 3. Wykorzystywane typy

```typescript
// Istniejące typy z src/types.ts
import {
  FlashcardDto,
  FlashcardCreateDto,
  FlashcardsCreateCommand,
  FlashcardsCreateResponseDto,
  FlashcardUpdateDto,
  FlashcardUpdateResponseDto,
  FlashcardsListResponseDto,
  PaginationDto
} from '../types';

// Nowe typy do zdefiniowania
interface FlashcardServiceConfig {
  supabase: SupabaseClient;
}

interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  source?: Source;
}
```

## 4. Szczegóły odpowiedzi

### GET /flashcards
- 200 OK: `FlashcardsListResponseDto`
- 401 Unauthorized
- 500 Internal Server Error

### GET /flashcards/:id
- 200 OK: `FlashcardDetailResponseDto`
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

### POST /flashcards
- 201 Created: `FlashcardsCreateResponseDto`
- 400 Bad Request
- 401 Unauthorized
- 422 Unprocessable Entity
- 500 Internal Server Error

### PUT /flashcards/:id
- 200 OK: `FlashcardUpdateResponseDto`
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

### DELETE /flashcards/:id
- 204 No Content
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

## 5. Przepływ danych

### Service Layer
```typescript
// src/lib/services/flashcard.service.ts

export class FlashcardService {
  constructor(private config: FlashcardServiceConfig) {}

  async list(params: SearchParams): Promise<FlashcardsListResponseDto>;
  async getById(id: number): Promise<FlashcardDto>;
  async create(cmd: FlashcardsCreateCommand): Promise<FlashcardsCreateResponseDto>;
  async update(id: number, dto: FlashcardUpdateDto): Promise<FlashcardUpdateResponseDto>;
  async delete(id: number): Promise<void>;
}
```

### Endpoint Layer
```typescript
// src/pages/api/flashcards/[...].ts

export const prerender = false;

export async function GET({ params, request, locals }) {
  const flashcardService = new FlashcardService({ supabase: locals.supabase });
  // ... implementacja
}

// Analogicznie dla POST, PUT, DELETE
```

## 6. Względy bezpieczeństwa

1. Uwierzytelnianie:
   - Wykorzystanie Supabase Auth (JWT)
   - Middleware sprawdzające token w każdym żądaniu

2. Autoryzacja:
   - RLS policies w Supabase:
   ```sql
   CREATE POLICY "Users can only access their own flashcards"
   ON public.flashcards
   FOR ALL
   USING (auth.uid() = user_id);
   ```

3. Walidacja danych:
   - Zod schemas dla walidacji wejścia
   - Sanityzacja danych wejściowych
   - Sprawdzanie limitów długości
   - Walidacja enums

4. Rate Limiting:
   - Implementacja limitów żądań per user/IP

## 7. Obsługa błędów

1. Walidacja:
```typescript
export const flashcardCreateSchema = z.object({
  front: z.string().max(200),
  back: z.string().max(500),
  source: z.enum(['manual', 'ai-full', 'ai-edited']),
  generation_id: z.number().nullable()
}).refine(data => {
  if (data.source !== 'manual' && !data.generation_id) {
    return false;
  }
  if (data.source === 'manual' && data.generation_id) {
    return false;
  }
  return true;
}, 'Invalid generation_id for source type');
```

2. Standardowe odpowiedzi błędów:
```typescript
interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
}
```

3. Mapowanie błędów:
- Database errors -> 500
- Validation errors -> 400
- Not found -> 404
- Authorization -> 401/403
- Partial failure -> 422

## 8. Rozważania dotyczące wydajności

1. Indeksy bazy danych:
   - Na user_id
   - Na generation_id
   - Na source (dla filtrowania)
   - Composite index dla wyszukiwania

2. Paginacja:
   - Limit domyślny: 20
   - Max limit: 100
   - Offset pagination

3. Caching:
   - Response caching dla GET endpoints
   - Cache invalidation przy modyfikacjach

4. Query Optimization:
   - Eager loading dla powiązanych danych
   - Selective columns

## 9. Etapy wdrożenia

1. Przygotowanie środowiska:
   ```bash
   # Utworzenie plików
   touch src/lib/services/flashcard.service.ts
   touch src/lib/schemas/flashcard.schema.ts
   touch src/pages/api/flashcards/index.ts
   touch src/pages/api/flashcards/[id].ts
   ```

2. Implementacja warstwy serwisowej:
   - Utworzenie FlashcardService
   - Implementacja metod CRUD
   - Dodanie obsługi paginacji i wyszukiwania

3. Implementacja schematów walidacji:
   - Zod schemas dla wszystkich DTO
   - Custom validators

4. Implementacja endpointów:
   - GET /flashcards
   - GET /flashcards/:id
   - POST /flashcards
   - PUT /flashcards/:id
   - DELETE /flashcards/:id

5. Implementacja middleware:
   - Autoryzacja
   - Rate limiting
   - Error handling

6. Konfiguracja Supabase:
   - RLS policies
   - Indeksy
   - Foreign key constraints