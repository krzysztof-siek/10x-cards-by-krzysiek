# REST API Plan

## 1. Resources

- **User** (`users` via Supabase Auth)
- **Flashcard** (`flashcards`)
- **Generation** (`generations`)
- **Generation Error Log** (`generation_error_logs`)
- **Collection** (`collections`)\* (assumed new table)

## 2. Endpoints

### 2.2 Flashcards

#### List Flashcards

- Method: GET
- URL: `/flashcards`
- Description: Retrieve paginated list of user's flashcards.
- Query Parameters: `page`, `limit`, `search`, `source`
- Response 200:
  ```json
  { "data": [{ "id": 1, "front": "...", "back": "..." /*...*/ }], "meta": { "page": 1, "limit": 20, "total": 100 } }
  ```

#### Get Flashcard

- Method: GET
- URL: `/flashcards/:id`
- Description: Retrieve single flashcard
- Response 200: flashcard object
- Errors: 404, 403

#### Create Flashcards

- Method: POST
- URL: `/flashcards`
- Description: Create one or multiple flashcards (manual or AI-generated)
- Request Body:
  ```json
  {
    "flashcards": [
      {
        "front": "Question text (max 200 chars)",
        "back": "Answer text (max 500 chars)",
        "source": "manual" | "ai-full" | "ai-edited",
        "generation_id": 123  // null for manual, required for ai-full and ai-edited
      }
    ]
  }
  ```
- Response 201:
  ```json
  {
    "flashcards": [
      {
        "id": 1,
        "front": "Question text",
        "back": "Answer text",
        "source": "manual",
        "generation_id": null,
        "created_at": "2024-01-01T12:00:00Z"
      }
      // ... more flashcards
    ],
    "meta": {
      "total": 1,
      "successful": 1,
      "failed": 0
    }
  }
  ```
- Errors:
  - 400 (validation):
    - front exceeds 200 characters
    - back exceeds 500 characters
    - invalid source value
    - missing generationId for ai-full/ai-edited sources
    - generationId present for manual source
  - 422 (if any flashcards failed to create, with details)

#### Update Flashcard

- Method: PUT
- URL: `/flashcards/:id`
- Description: Edit flashcard
- Request Body: same as create
- Response 200: updated flashcard
- Errors: 400, 404, 403

#### Delete Flashcard

- Method: DELETE
- URL: `/flashcards/:id`
- Description: Permanently remove a flashcard
- Response 204
- Errors: 404, 403

### 2.3 Generations

#### Create Generation & Generate Suggestions

- Method: POST
- URL: `/generations`
- Description: Send source text to LLM, create generation record
- Request Body:
  ```json
  {
    "source_text": "... 1k–10k chars ..."
  }
  ```
- Response 201:
  ```json
  {
    "generation": {
      /* generation record */
    },
    "suggestions": [{ "front": "...", "back": "..." }]
  }
  ```
- Errors: 400 (length), 503 (LLM error), 500 (AI service errors - logs recorded in 'generation_error_logs')

#### List Generations

- Method: GET
- URL: `/generations`
- Query: `page`, `limit`
- Response: paginated generation list

#### Get Generation

- Method: GET
- URL: `/generations/:id`
- Description: Retrieve details + counts

#### Accept Suggestions

- Method: POST
- URL: `/generations/:id/flashcards`
- Description: Persist selected suggestions
- Request Body:
  ```json
  { "accepted": [ { "front": "...", "back": "...", "edited": false }, ... ] }
  ```
- Response 201: list of created flashcards

### 2.4 Generation Error Logs

#### List Error Logs

- Method: GET
- URL: `/generation-error-logs`
- Description: View past generation errors for the authenticated user or admin
- Query: `page`, `limit`

## 3. Authentication and Authorization

- **Mechanism**: Supabase Auth (JWT)
- **Header**: `Authorization: Bearer <token>`
- **RLS**: Each table implements policies: `user_id = auth.uid()`
- **Role Guarding**: Middleware checks valid JWT and attaches `userId`

## 4. Validation and Business Logic

- **Flashcard**:
  - `front` length ≤ 200
  - `back` length ≤ 500
  - `source` ∈ [`ai-full`, `ai-edited`, `manual`]
- **Generation**:
  - `source_text` length between 1000–10000 chars
- **Error Log**:
  - `source_text_length` same as generation
- **User**:
  - `email` valid format
  - `password` ≥ 8 chars, complexity rules
- **Collections**:
  - `name` non-empty, ≤ 100 chars
- **Session Responses**:
  - `ease` integer 1–5, `correct` boolean

**Business Workflows**:

- Generate: Create generation record, call LLM, return suggestions
- Accept: Persist chosen suggestions, update counts
- Manual CRUD: standard create/update/delete with RLS
- Study: Fetch due cards by algorithm, record responses

_Note: Collections resource assumes schema addition; integrate with existing RLS._
