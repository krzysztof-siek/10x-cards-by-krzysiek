# Plan implementacji widoku: Moje fiszki (`/flashcards`)

## 1. Przegląd

Celem tego widoku jest zapewnienie zalogowanemu użytkownikowi pełnej funkcjonalności zarządzania swoimi fiszkami (CRUD - Create, Read, Update, Delete) oraz kolekcjami, w których te fiszki są zorganizowane. Widok będzie centralnym miejscem do przeglądania, dodawania, edytowania i usuwania własnych materiałów do nauki.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką:
- **Ścieżka:** `/flashcards`

Strona ta powinna być chroniona i dostępna tylko dla uwierzytelnionych użytkowników.

## 3. Struktura komponentów

Hierarchia komponentów React zostanie zaimplementowana wewnątrz strony Astro (`/src/pages/flashcards.astro`). Główny komponent kliencki będzie odpowiedzialny za zarządzanie stanem i komunikację z API.

```
/src/pages/flashcards.astro
└── FlashcardsView.tsx (client:load)
    ├── CollectionsManager.tsx
    │   └── DeleteConfirmationDialog.tsx (dla kolekcji)
    ├── FlashcardsHeader.tsx (zawiera wyszukiwarkę i przycisk "Dodaj fiszkę")
    ├── FlashcardsTable.tsx
    │   └── (renderuje wiersze fiszek z akcjami)
    ├── PaginationControls.tsx
    ├── FlashcardFormDialog.tsx (dla tworzenia/edycji fiszki)
    ├── DeleteConfirmationDialog.tsx (dla fiszek)
    └── EmptyState.tsx (renderowany warunkowo)
```

## 4. Szczegóły komponentów

### `FlashcardsView.tsx`
- **Opis:** Główny komponent-kontener, który zarządza stanem całego widoku, w tym listą fiszek, kolekcjami, filtrami, paginacją oraz stanem dialogów (modal). Komunikuje się z API za pomocą customowego hooka `useFlashcards`.
- **Główne elementy:** Renderuje komponenty `CollectionsManager`, `FlashcardsHeader`, `FlashcardsTable` oraz modale.
- **Obsługiwane interakcje:** Obsługuje zdarzenia od komponentów podrzędnych, takie jak zmiana filtra, paginacji, otwarcie modala edycji/tworzenia/usuwania.
- **Typy:** `FlashcardViewModel[]`, `Collection[]`, `ApiFilters`
- **Propsy:** Brak.

### `CollectionsManager.tsx`
- **Opis:** Wyświetla listę kolekcji, pozwala na filtrowanie fiszek po wybranej kolekcji oraz udostępnia akcje CRUD dla kolekcji (tworzenie, zmiana nazwy, usuwanie).
- **Główne elementy:** Lista przycisków lub linków reprezentujących kolekcje, przycisk "Dodaj kolekcję".
- **Obsługiwane interakcje:** `onSelectCollection(collectionId)`, `onCreateCollection(name)`, `onDeleteCollection(id)`.
- **Typy:** `collections: Collection[]`, `selectedCollectionId: number | null`.
- **Propsy:** `collections`, `selectedCollectionId`, `onSelectCollection`, `onCreate`, `onDelete`.

### `FlashcardsTable.tsx`
- **Opis:** Prezentuje listę fiszek w formie tabeli (`Shadcn/ui Table`). Zawiera paginację i przyciski akcji dla każdego wiersza.
- **Główne elementy:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `Button`.
- **Obsługiwane interakcje:** `onEdit(flashcard)`, `onDelete(flashcard)`.
- **Typy:** `flashcards: FlashcardViewModel[]`.
- **Propsy:** `flashcards`, `onEdit`, `onDelete`.

### `FlashcardFormDialog.tsx`
- **Opis:** Modal (`Shadcn/ui Dialog`) z formularzem do tworzenia nowej lub edycji istniejącej fiszki.
- **Główne elementy:** `Dialog`, `DialogContent`, `Form`, `Input` (dla przodu i tyłu fiszki), `Button` "Zapisz".
- **Obsługiwane interakcje:** `onSave(data: FlashcardCreateDto | FlashcardUpdateDto)`.
- **Warunki walidacji:**
  - `front`: pole wymagane, maksymalnie 200 znaków.
  - `back`: pole wymagane, maksymalnie 500 znaków.
- **Typy:** `flashcardToEdit?: FlashcardViewModel`.
- **Propsy:** `isOpen`, `onClose`, `onSave`, `flashcardToEdit`.

### `DeleteConfirmationDialog.tsx`
- **Opis:** Prosty modal (`Shadcn/ui Dialog`) proszący o potwierdzenie operacji usunięcia fiszki lub kolekcji.
- **Główne elementy:** `Dialog`, `DialogContent`, `Button` "Potwierdź", `Button` "Anuluj".
- **Obsługiwane interakcje:** `onConfirm()`.
- **Typy:** `itemType: 'flashcard' | 'collection'`, `itemName: string`.
- **Propsy:** `isOpen`, `onClose`, `onConfirm`, `itemType`, `itemName`.

## 5. Typy

Większość typów DTO jest już zdefiniowana w `src/types.ts`. Wprowadzimy następujące typy po stronie klienta:

-   **`FlashcardViewModel`**: Rozszerza `FlashcardDto` o pola potrzebne do zarządzania stanem UI.
    ```typescript
    import { FlashcardDto } from './types';

    export interface FlashcardViewModel extends FlashcardDto {
      isDeleting?: boolean; // Flaga do wyświetlania spinnera podczas usuwania
    }
    ```
-   **`Collection`**: Typ dla kolekcji (do zdefiniowania, gdy powstanie API).
    ```typescript
    export interface Collection {
      id: number;
      name: string;
      flashcard_count?: number;
    }
    ```
-   **`ApiFilters`**: Obiekt przechowujący stan filtrów do zapytania API.
    ```typescript
    export interface ApiFilters {
      page: number;
      limit: number;
      search: string;
      collectionId: number | null;
    }
    ```

## 6. Zarządzanie stanem

Logika biznesowa i stan widoku zostaną wyodrębnione do customowego hooka `useFlashcards`, co zapewni separację logiki od prezentacji.

-   **`useFlashcards()`**:
    -   **Zarządzany stan:** `flashcards`, `collections`, `pagination`, `filters`, `isLoading`, `error`, `dialogState`.
    -   **Odpowiedzialność:** Pobieranie danych, obsługa akcji użytkownika (CRUD), zarządzanie stanem ładowania i błędów, kontrolowanie otwierania i zamykania modali.
    -   **Zwracane wartości:** Obiekt ze stanem (`state`) oraz obiekt z akcjami (`actions`), które komponenty mogą wywoływać.

## 7. Integracja API

Komponenty będą komunikować się z API `/api/flashcards` za pośrednictwem akcji w hooku `useFlashcards`.

-   **`GET /api/flashcards`**:
    -   **Użycie:** Pobieranie listy fiszek przy ładowaniu widoku i przy każdej zmianie filtrów.
    -   **Typ odpowiedzi:** `FlashcardsListResponseDto`
-   **`POST /api/flashcards`**:
    -   **Użycie:** Tworzenie nowej fiszki z `FlashcardFormDialog`.
    -   **Typ żądania:** `FlashcardsCreateCommand`
    -   **Typ odpowiedzi:** `FlashcardsCreateResponseDto`
-   **`PUT /api/flashcards/:id`**:
    -   **Użycie:** Aktualizacja istniejącej fiszki z `FlashcardFormDialog`.
    -   **Typ żądania:** `FlashcardUpdateDto`
    -   **Typ odpowiedzi:** `FlashcardUpdateResponseDto`
-   **`DELETE /api/flashcards/:id`**:
    -   **Użycie:** Usuwanie fiszki po potwierdzeniu w `DeleteConfirmationDialog`.
    -   **Typ odpowiedzi:** `204 No Content`

## 8. Interakcje użytkownika

-   **Dodawanie fiszki:** Kliknięcie "Dodaj fiszkę" -> otwarcie `FlashcardFormDialog` -> wypełnienie i zapis -> wywołanie `POST` -> zamknięcie modala i odświeżenie listy.
-   **Edycja fiszki:** Kliknięcie "Edytuj" w wierszu tabeli -> otwarcie `FlashcardFormDialog` z danymi -> edycja i zapis -> wywołanie `PUT` -> zamknięcie modala i aktualizacja wiersza na liście.
-   **Usuwanie fiszki:** Kliknięcie "Usuń" -> otwarcie `DeleteConfirmationDialog` -> potwierdzenie -> wywołanie `DELETE` -> zamknięcie modala i usunięcie wiersza z listy.
-   **Wyszukiwanie:** Wpisywanie tekstu w pole wyszukiwania -> wywołanie `GET` z parametrem `search` (z debouncingiem).
-   **Paginacja:** Kliknięcie na numer strony -> wywołanie `GET` z parametrem `page`.

## 9. Warunki i walidacja

Walidacja po stronie klienta będzie realizowana w komponencie `FlashcardFormDialog` przy użyciu `react-hook-form` i `zod`, aby zapewnić natychmiastowy feedback dla użytkownika.

-   **Formularz fiszki:**
    -   Pole `front`: Musi być wypełnione. Długość nie może przekraczać 200 znaków.
    -   Pole `back`: Musi być wypełnione. Długość nie może przekraczać 500 znaków.
-   **Stan interfejsu:** Przycisk "Zapisz" w formularzu jest nieaktywny, dopóki wszystkie warunki walidacji nie zostaną spełnione. Komunikaty o błędach wyświetlane są pod odpowiednymi polami.

## 10. Obsługa błędów

-   **Błąd pobierania danych (np. 500):** Widok wyświetli komunikat o błędzie zamiast tabeli z fiszkami, z opcją ponowienia próby.
-   **Błąd walidacji z API (400):** Formularz w modalu pozostanie otwarty, a błędy zwrócone z API zostaną wyświetlone przy odpowiednich polach.
-   **Błąd zapisu/usunięcia (404, 500):** Użytkownik zobaczy powiadomienie typu "toast" z informacją o niepowodzeniu operacji. Stan `isDeleting` zostanie zresetowany.
-   **Brak autoryzacji (401):** Globalna obsługa błędów w kliencie API powinna przechwycić ten status i przekierować użytkownika na stronę logowania.

## 11. Kroki implementacji

1.  **Struktura plików:** Utworzenie pliku strony `/src/pages/flashcards.astro` oraz plików dla wszystkich komponentów React w `/src/components/views/flashcards/`.
2.  **Hook `useFlashcards`:** Implementacja customowego hooka z podstawową logiką pobierania danych (`GET /flashcards`) oraz zarządzania stanem (`isLoading`, `error`, `data`).
3.  **Komponent `FlashcardsView`:** Stworzenie głównego komponentu, który używa hooka `useFlashcards` i renderuje szkielet widoku.
4.  **Komponent `FlashcardsTable`:** Implementacja tabeli wyświetlającej dane fiszek, w tym przyciski akcji (na razie bez logiki).
5.  **Paginacja:** Dodanie komponentu `PaginationControls` i podłączenie go do logiki w `useFlashcards`.
6.  **Dialog usuwania:** Implementacja `DeleteConfirmationDialog` i logiki usuwania (`DELETE /flashcards/:id`) w hooku, w tym obsługa stanu `isDeleting` dla `FlashcardViewModel`.
7.  **Dialog tworzenia/edycji:** Implementacja `FlashcardFormDialog` wraz z walidacją po stronie klienta (`react-hook-form` + `zod`).
8.  **Logika tworzenia i edycji:** Implementacja metod `createFlashcard` (`POST`) i `updateFlashcard` (`PUT`) w `useFlashcards`.
9.  **Filtrowanie i wyszukiwanie:** Dodanie `FlashcardsHeader` z polem do wyszukiwania i podłączenie go do stanu filtrów w hooku (z debouncingiem).
10. **Komponent `EmptyState`:** Implementacja widoku dla przypadku, gdy nie ma żadnych fiszek.
11. **Komponent `CollectionsManager`:** Implementacja komponentu do zarządzania kolekcjami (może być początkowo placeholderem, jeśli API nie jest gotowe).
12. **Styling i finalne poprawki:** Dopracowanie wyglądu za pomocą Tailwind i Shadcn/ui, zapewnienie responsywności i dostępności. 