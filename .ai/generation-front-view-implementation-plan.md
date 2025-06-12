# Plan implementacji widoku: Generowanie fiszek (AI)

## 1. Przegląd

Widok "Generowanie fiszek (AI)" jest kluczowym elementem aplikacji, umożliwiającym użytkownikom transformację dostarczonego tekstu w zestaw propozycji fiszek przy użyciu modelu językowego (LLM). Użytkownik wkleja tekst, inicjuje proces generowania, a następnie otrzymuje listę sugestii, które może przeglądać, edytować, akceptować i finalnie zapisać w swojej kolekcji.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką dla zalogowanych użytkowników:

- **Ścieżka:** `/generate`

## 3. Struktura komponentów

Hierarchia komponentów React dla tego widoku zostanie zorganizowana w następujący sposób, aby zapewnić reużywalność i separację logiki od prezentacji.

```
/src/pages/generate.astro
└── GenerateFlashcardsView.tsx (client:load)
    ├── GlobalSpinner.tsx (wyświetlany warunkowo)
    ├── SourceTextForm.tsx
    │   ├── Textarea (z Shadcn/ui)
    │   ├── <p> (licznik znaków)
    │   └── Button (z Shadcn/ui, "Generuj")
    └── SuggestionsList.tsx (wyświetlany warunkowo)
        ├── <div> (podsumowanie, np. "Wybrano 5 z 12")
        ├── Button (z Shadcn/ui, "Zapisz wybrane")
        └── <ul>
            └── SuggestionItem.tsx (mapowanie po liście sugestii)
                ├── Checkbox (z Shadcn/ui)
                ├── <div> (tekst `front` lub pole input)
                ├── <div> (tekst `back` lub pole input)
                ├── Button (z Shadcn/ui, "Edytuj" / "Zapisz zmiany")
                └── Button (z Shadcn/ui, "Usuń")
```

## 4. Szczegóły komponentów

### `GenerateFlashcardsView.tsx` (Komponent kontener)

- **Opis:** Główny komponent zarządzający całym stanem i logiką widoku. Odpowiada za orkiestrację wywołań API oraz przepływ danych między komponentami potomnymi. Wykorzystuje customowy hook `useFlashcardGenerator` do enkapsulacji logiki.
- **Główne elementy:** `GlobalSpinner`, `SourceTextForm`, `SuggestionsList`.
- **Obsługiwane interakcje:** Przekazuje funkcje do obsługi zdarzeń z formularza (`generateSuggestions`) i listy sugestii (`saveSuggestions`).
- **Typy:** `GenerationState`.
- **Propsy:** Brak.

### `SourceTextForm.tsx` (Komponent prezentacyjny)

- **Opis:** Formularz z polem `Textarea` do wklejania tekstu źródłowego, licznikiem znaków i przyciskiem do rozpoczęcia generowania.
- **Główne elementy:** `Textarea`, `Button` (z biblioteki Shadcn/ui), paragraf (`<p>`) do wyświetlania licznika znaków.
- **Obsługiwane interakcje:** `onSubmit` – wywoływane po kliknięciu przycisku "Generuj", przekazuje dane formularza do rodzica.
- **Obsługiwana walidacja:**
  - `source_text` jest polem wymaganym.
  - Długość `source_text` musi mieścić się w przedziale 1000–10000 znaków.
  - Przycisk "Generuj" jest nieaktywny (`disabled`), jeśli walidacja nie przechodzi lub trwa proces generowania.
- **Typy:** `GenerateFlashcardsCommand`.
- **Propsy:**
  - `isLoading: boolean`
  - `onSubmit: (data: GenerateFlashcardsCommand) => void`

### `SuggestionsList.tsx` (Komponent prezentacyjny)

- **Opis:** Wyświetla listę sugestii (`SuggestionItem`), podsumowanie zaznaczeń oraz przycisk do zapisywania wybranych fiszek.
- **Główne elementy:** `Button`, lista `<ul>` renderująca komponenty `SuggestionItem`.
- **Obsługiwane interakcje:**
  - `onSave`: Wywoływane po kliknięciu "Zapisz wybrane".
  - `onSuggestionChange`: Aktualizacja treści fiszki.
  - `onSuggestionToggle`: Zaznaczenie/odznaczenie fiszki.
  - `onSuggestionDelete`: Usunięcie sugestii z listy.
- **Obsługiwana walidacja:** Przycisk "Zapisz wybrane" jest nieaktywny (`disabled`), jeśli żadna sugestia nie jest zaznaczona.
- **Typy:** `SuggestionViewModel[]`.
- **Propsy:**
  - `suggestions: SuggestionViewModel[]`
  - `onSave: () => void`
  - `onSuggestionChange: (id: string, front: string, back: string) => void`
  - `onSuggestionToggle: (id: string) => void`
  - `onSuggestionDelete: (id: string) => void`

### `SuggestionItem.tsx` (Komponent prezentacyjny)

- **Opis:** Reprezentuje pojedynczą sugestię fiszki. Umożliwia jej zaznaczenie, usunięcie z listy oraz edycję "inline".
- **Główne elementy:** `Checkbox`, `Button` (Edytuj/Usuń). W trybie edycji, tekst zamienia się na pola `Input`.
- **Obsługiwane interakcje:** `onToggle`, `onDelete`, `onUpdate` (po zakończeniu edycji).
- **Typy:** `SuggestionViewModel`.
- **Propsy:**
  - `suggestion: SuggestionViewModel`
  - `onToggle: (id: string) => void`
  - `onDelete: (id: string) => void`
  - `onUpdate: (id: string, front: string, back: string) => void`

## 5. Typy

Do poprawnej implementacji widoku, oprócz typów DTO z `src/types.ts`, wymagany jest dodatkowy typ `ViewModel`.

- **`SuggestionDto` (Typ DTO z API)**

  ```typescript
  interface SuggestionDto {
    front: string;
    back: string;
  }
  ```

- **`SuggestionViewModel` (Typ dla stanu UI)**
  Reprezentuje sugestię w stanie komponentu. Rozszerza DTO o pola niezbędne do zarządzania interfejsu.
  ```typescript
  interface SuggestionViewModel {
    id: string; // Unikalny identyfikator po stronie klienta (np. z crypto.randomUUID())
    front: string; // Treść przodu fiszki
    back: string; // Treść tyłu fiszki
    isSelected: boolean; // Czy użytkownik zaznaczył tę sugestię do zapisu
    isEdited: boolean; // Czy użytkownik zmodyfikował oryginalną treść
    originalFront: string; // Oryginalna treść przodu do porównania
    originalBack: string; // Oryginalna treść tyłu do porównania
  }
  ```

## 6. Zarządzanie stanem

Logika i stan widoku zostaną zamknięte w customowym hooku `useFlashcardGenerator`, co zapewni czystość komponentu `GenerateFlashcardsView` i łatwość testowania.

- **`useFlashcardGenerator()`**
  - **Stan wewnętrzny (`GenerationState`):**
    - `suggestions: SuggestionViewModel[]`
    - `generationId: number | null`
    - `isLoading: boolean` (dla globalnego spinnera)
    - `isSaving: boolean` (dla przycisku zapisu)
    - `error: ApiErrorDto | null`
  - **Funkcje zwracane przez hook:**
    - `generateSuggestions(command: GenerateFlashcardsCommand)`: Obsługuje wywołanie `POST /api/generations`.
    - `saveSuggestions()`: Obsługuje wywołanie `POST /api/generations/{id}/flashcards`.
    - `updateSuggestion(id, front, back)`: Aktualizuje pojedynczą sugestię.
    - `toggleSuggestion(id)`: Zmienia stan `isSelected`.
    - `deleteSuggestion(id)`: Usuwa sugestię z listy.

## 7. Integracja API

1.  **Generowanie sugestii**

    - **Endpoint:** `POST /api/generations`
    - **Akcja:** Użytkownik klika przycisk "Generuj".
    - **Typ żądania:** `GenerateFlashcardsCommand`
      ```json
      { "source_text": "..." }
      ```
    - **Typ odpowiedzi:** `GenerationCreateResponseDto`
      ```json
      {
        "generation": { "id": 1, ... },
        "suggestions": [ { "front": "...", "back": "..." } ]
      }
      ```
    - **Logika:** Funkcja `generateSuggestions` z hooka `useFlashcardGenerator` wysyła żądanie, pokazuje globalny spinner, a po otrzymaniu odpowiedzi mapuje `SuggestionDto[]` na `SuggestionViewModel[]` i aktualizuje stan.

2.  **Zapisywanie zaakceptowanych fiszek**
    - **Endpoint:** `POST /api/generations/{id}/flashcards`
    - **Akcja:** Użytkownik klika przycisk "Zapisz wybrane".
    - **Typ żądania:** `AcceptSuggestionsCommand`
      ```json
      {
        "accepted": [
          { "front": "...", "back": "...", "edited": true },
          { "front": "...", "back": "...", "edited": false }
        ]
      }
      ```
    - **Typ odpowiedzi:** `AcceptSuggestionsResponseDto`
    - **Logika:** Funkcja `saveSuggestions` filtruje zaznaczone (`isSelected`) sugestie, mapuje je na format `AcceptedSuggestionDto` (ustawiając flagę `edited` na podstawie porównania z oryginalną treścią) i wysyła żądanie.

## 8. Interakcje użytkownika

- **Wpisywanie tekstu:** Licznik znaków aktualizuje się na bieżąco. Przycisk "Generuj" aktywuje/dezaktywuje się w zależności od długości tekstu.
- **Kliknięcie "Generuj":** Blokada UI, pojawia się `GlobalSpinner`. Po zakończeniu, lista sugestii jest wypełniana danymi lub pojawia się komunikat błędu.
- **Zaznaczenie/odznaczenie Checkboxa:** Zmienia stan `isSelected` dla danej sugestii. Aktualizuje podsumowanie i stan przycisku "Zapisz wybrane".
- **Kliknięcie "Edytuj":** Pola tekstowe `front` i `back` dla danej pozycji stają się polami `<input>`. Przycisk "Edytuj" zmienia się na "Zapisz zmiany".
- **Kliknięcie "Usuń":** Sugestia znika z listy.
- **Kliknięcie "Zapisz wybrane":** Przycisk pokazuje stan ładowania. Po sukcesie wyświetlany jest toast z potwierdzeniem, a lista sugestii jest czyszczona. W przypadku błędu, wyświetlany jest toast z błędem.

## 9. Warunki i walidacja

- **Formularz `SourceTextForm`:**
  - **Warunek:** Długość tekstu źródłowego.
  - **Walidacja:** Musi zawierać od 1000 do 10000 znaków.
  - **Efekt w UI:** Przycisk "Generuj" jest `disabled`, jeśli warunek nie jest spełniony. Pomocniczy tekst informuje o wymaganiach.
- **Lista `SuggestionsList`:**
  - **Warunek:** Liczba zaznaczonych sugestii.
  - **Walidacja:** Co najmniej jedna sugestia musi być zaznaczona (`isSelected: true`).
  - **Efekt w UI:** Przycisk "Zapisz wybrane" jest `disabled`, jeśli warunek nie jest spełniony.

## 10. Obsługa błędów

- **Błąd walidacji po stronie klienta:** Interfejs uniemożliwia wysłanie żądania (nieaktywne przyciski).
- **Błąd API podczas generowania (`POST /api/generations`):** Globalny spinner jest chowany, a użytkownikowi wyświetlany jest komunikat błędu za pomocą komponentu `Toast` (np. "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie.").
- **Błąd API podczas zapisywania (`POST /api/generations/{id}/flashcards`):** Stan ładowania na przycisku "Zapisz wybrane" jest usuwany. Wyświetlany jest `Toast` z błędem. Stan formularza (zaznaczenia, edycje) jest zachowany, aby umożliwić ponowną próbę.
- **Brak sugestii:** Jeśli API zwróci pustą listę sugestii, należy wyświetlić odpowiedni komunikat (np. "Nie udało się wygenerować żadnych fiszek na podstawie podanego tekstu.").

## 11. Kroki implementacji

1.  **Struktura plików:** Stworzenie plików dla komponentów: `GenerateFlashcardsView.tsx`, `SourceTextForm.tsx`, `SuggestionsList.tsx`, `SuggestionItem.tsx` w katalogu `src/components/` oraz strony `src/pages/generate.astro`.
2.  **Custom Hook:** Implementacja hooka `useFlashcardGenerator` z całą logiką stanu (state, funkcje obsługi).
3.  **Komponent `SourceTextForm`:** Budowa formularza z `Textarea` z Shadcn/ui, logiką walidacji długości tekstu i licznikiem znaków.
4.  **Komponenty listy sugestii:** Implementacja `SuggestionsList` i `SuggestionItem`, w tym obsługa trybu edycji w `SuggestionItem`.
5.  **Komponent kontenera:** Złożenie widoku w `GenerateFlashcardsView.tsx`, użycie hooka `useFlashcardGenerator` i przekazanie stanu oraz funkcji do komponentów potomnych.
6.  **Integracja API:** Podłączenie funkcji z hooka do rzeczywistych wywołań `fetch` do endpointów `/api/generations`.
7.  **Obsługa ładowania i błędów:** Implementacja `GlobalSpinner` oraz systemu powiadomień `Toast` (np. z `react-hot-toast` lub Shadcn/ui) do informowania użytkownika o stanie operacji.
8.  **Strona Astro:** Stworzenie pliku `generate.astro`, który zaimportuje i wyrenderuje komponent `GenerateFlashcardsView.tsx` z dyrektywą `client:load`. Dodanie ochrony trasy w middleware.
9.  **Stylowanie:** Dopracowanie wyglądu za pomocą Tailwind CSS zgodnie z ogólnym designem aplikacji.
10. **Testowanie:** Przetestowanie pełnego cyklu: wpisanie tekstu, generowanie, edycja, zaznaczanie, usuwanie i zapisywanie, włączając w to scenariusze błędów.
