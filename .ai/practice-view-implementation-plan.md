# Plan implementacji widoku: Ćwiczenie fiszek (`/practice`)

## 1. Przegląd

Celem tego widoku jest umożliwienie zalogowanym użytkownikom aktywnego ćwiczenia i weryfikacji wiedzy z zapisanych fiszek. Widok będzie prezentował fiszki w losowej kolejności, wyświetlając przednią stronę fiszki i umożliwiając użytkownikowi wprowadzenie odpowiedzi, a następnie dostarczając natychmiastową informację zwrotną o poprawności tej odpowiedzi.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką:
- **Ścieżka:** `/practice`

Strona ta będzie chroniona i dostępna tylko dla uwierzytelnionych użytkowników.

## 3. Struktura komponentów

Hierarchia komponentów React zostanie zaimplementowana wewnątrz strony Astro (`/src/pages/practice.astro`). Główny komponent kliencki będzie odpowiedzialny za zarządzanie stanem i komunikację z API.

```
/src/pages/practice.astro
└── PracticeView.tsx (client:load)
    ├── PracticeCard.tsx
    │   ├── FlashcardFront.tsx (wyświetla pytanie)
    │   └── AnswerForm.tsx (formularz odpowiedzi)
    ├── FeedbackDisplay.tsx (wyświetla informację zwrotną)
    ├── PracticeControls.tsx (przyciski nawigacji i postęp)
    ├── PracticeSessionSummary.tsx (podsumowanie sesji, opcjonalne)
    └── EmptyState.tsx (renderowany warunkowo, gdy brak fiszek)
```

## 4. Szczegóły komponentów

### `PracticeView.tsx`
- **Opis:** Główny komponent-kontener, który zarządza stanem całego widoku, w tym pobieraniem losowych fiszek, weryfikacją odpowiedzi, śledzeniem postępu sesji oraz przechowywaniem wyników. Komunikuje się z API za pomocą customowego hooka `usePractice`.
- **Główne elementy:** Renderuje komponenty `PracticeCard`, `FeedbackDisplay`, `PracticeControls` oraz `EmptyState` (gdy brak fiszek).
- **Obsługiwane interakcje:** Zarządza przejściami między fiszkami, weryfikacją odpowiedzi i zakończeniem sesji.
- **Typy:** `FlashcardViewModel[]`, `PracticeSessionState`
- **Propsy:** Brak.

### `PracticeCard.tsx`
- **Opis:** Wyświetla bieżącą fiszkę w formie karty, prezentując przednią stronę (pytanie) oraz formularz do wprowadzenia odpowiedzi.
- **Główne elementy:** `Card`, `CardHeader` (z pytaniem), `CardContent` (z formularzem).
- **Obsługiwane interakcje:** `onAnswerSubmit(answer: string)`.
- **Typy:** `flashcard: FlashcardViewModel`, `isAnswerSubmitted: boolean`.
- **Propsy:** `flashcard`, `onAnswerSubmit`, `isAnswerSubmitted`.

### `FlashcardFront.tsx`
- **Opis:** Wyświetla przednią stronę fiszki (pytanie/zagadnienie) w czytelnym formacie.
- **Główne elementy:** Stylizowany tekst z pytaniem.
- **Typy:** `front: string`.
- **Propsy:** `front`.

### `AnswerForm.tsx`
- **Opis:** Formularz z polem tekstowym do wprowadzenia odpowiedzi i przyciskiem sprawdzenia.
- **Główne elementy:** `Form`, `Input` (dla odpowiedzi), `Button` "Sprawdź".
- **Obsługiwane interakcje:** `onSubmit(answer: string)`.
- **Typy:** `isDisabled: boolean`.
- **Propsy:** `onSubmit`, `isDisabled`.

### `FeedbackDisplay.tsx`
- **Opis:** Wyświetla informację zwrotną o poprawności odpowiedzi, używając kolorów (zielony dla poprawnej, czerwony dla niepoprawnej) oraz pokazuje poprawną odpowiedź w przypadku błędu.
- **Główne elementy:** Komunikat o wyniku, poprawna odpowiedź (warunkowo).
- **Typy:** `isCorrect: boolean`, `userAnswer: string`, `correctAnswer: string`.
- **Propsy:** `isCorrect`, `userAnswer`, `correctAnswer`, `isVisible`.

### `PracticeControls.tsx`
- **Opis:** Przyciski nawigacyjne do przechodzenia między fiszkami oraz wskaźnik postępu sesji.
- **Główne elementy:** `Button` "Następna", wskaźnik postępu (np. "3/10 fiszek").
- **Obsługiwane interakcje:** `onNext()`, `onFinish()`.
- **Typy:** `currentIndex: number`, `totalCount: number`.
- **Propsy:** `onNext`, `onFinish`, `currentIndex`, `totalCount`, `isAnswerSubmitted`.

### `PracticeSessionSummary.tsx`
- **Opis:** Podsumowanie zakończonej sesji ćwiczeniowej, wyświetlane po przejściu przez wszystkie fiszki.
- **Główne elementy:** Statystyki (liczba poprawnych/niepoprawnych odpowiedzi), `Button` "Zacznij nową sesję".
- **Obsługiwane interakcje:** `onStartNewSession()`.
- **Typy:** `correctCount: number`, `totalCount: number`.
- **Propsy:** `correctCount`, `totalCount`, `onStartNewSession`.

### `EmptyState.tsx`
- **Opis:** Komponent wyświetlany, gdy użytkownik nie ma żadnych fiszek do ćwiczenia.
- **Główne elementy:** Komunikat, link do strony z fiszkami.
- **Obsługiwane interakcje:** Brak.
- **Propsy:** Brak.

## 5. Typy

Większość typów DTO jest już zdefiniowana w `src/types.ts`. Wprowadzimy następujące typy po stronie klienta:

-   **`PracticeSessionState`**: Stan bieżącej sesji ćwiczeniowej.
    ```typescript
    export interface PracticeSessionState {
      flashcards: FlashcardViewModel[];
      currentIndex: number;
      answeredFlashcards: AnsweredFlashcard[];
      isFinished: boolean;
    }
    ```
-   **`AnsweredFlashcard`**: Fiszka z odpowiedzią użytkownika i oceną poprawności.
    ```typescript
    export interface AnsweredFlashcard {
      flashcardId: number;
      userAnswer: string;
      isCorrect: boolean;
    }
    ```
-   **`PracticeSessionSummary`**: Podsumowanie sesji.
    ```typescript
    export interface PracticeSessionSummary {
      totalCount: number;
      correctCount: number;
      incorrectCount: number;
      accuracy: number; // Procent poprawnych odpowiedzi
    }
    ```

## 6. Zarządzanie stanem

Logika biznesowa i stan widoku zostaną wyodrębnione do customowego hooka `usePractice`, co zapewni separację logiki od prezentacji.

-   **`usePractice()`**:
    -   **Zarządzany stan:** `sessionState`, `currentFlashcard`, `userAnswer`, `isAnswerSubmitted`, `isCorrect`, `sessionSummary`.
    -   **Odpowiedzialność:** Pobieranie losowych fiszek, weryfikacja odpowiedzi, śledzenie postępu, zarządzanie przejściami między fiszkami.
    -   **Zwracane wartości:** Obiekt ze stanem (`state`) oraz obiekt z akcjami (`actions`), które komponenty mogą wywoływać.

## 7. Integracja API

Komponenty będą komunikować się z następującymi endpointami API za pośrednictwem akcji w hooku `usePractice`.

-   **`GET /api/flashcards/random`**:
    -   **Użycie:** Pobieranie losowej puli fiszek do ćwiczenia przy rozpoczęciu sesji.
    -   **Parametry:** `limit` (liczba fiszek), `collectionId` (opcjonalnie, dla filtrowania).
    -   **Typ odpowiedzi:** `FlashcardDto[]`
-   **`POST /api/practice/sessions`**:
    -   **Użycie:** Zapisanie wyników sesji ćwiczeniowej (opcjonalne, do przyszłej analizy postępów).
    -   **Typ żądania:** `PracticeSessionCreateDto`
    -   **Typ odpowiedzi:** `PracticeSessionResponseDto`

## 8. Interakcje użytkownika

-   **Rozpoczęcie ćwiczenia:** Ładowanie strony -> pobranie losowych fiszek -> wyświetlenie pierwszej fiszki.
-   **Udzielenie odpowiedzi:** Wprowadzenie tekstu w pole odpowiedzi -> kliknięcie "Sprawdź" -> wyświetlenie informacji zwrotnej (zielona/czerwona) -> aktywacja przycisku "Następna".
-   **Przejście do kolejnej fiszki:** Kliknięcie "Następna" -> wyświetlenie kolejnej fiszki z puli -> resetowanie formularza odpowiedzi.
-   **Zakończenie sesji:** Po przejściu przez wszystkie fiszki -> wyświetlenie podsumowania sesji z wynikami -> opcja rozpoczęcia nowej sesji.

## 9. Warunki i walidacja

-   **Formularz odpowiedzi:**
    -   Odpowiedź nie może być pusta.
    -   Przycisk "Sprawdź" jest nieaktywny, dopóki użytkownik nie wprowadzi odpowiedzi.
    -   Przycisk "Następna" jest nieaktywny, dopóki użytkownik nie sprawdzi swojej odpowiedzi.
-   **Weryfikacja odpowiedzi:** 
    -   Odpowiedź jest porównywana z tyłem fiszki (poprawną odpowiedzią).
    -   Możliwe jest zaimplementowanie prostego algorytmu tolerancji błędów (np. ignorowanie wielkości liter, znaków interpunkcyjnych).

## 10. Obsługa błędów

-   **Błąd pobierania fiszek (np. 500):** Widok wyświetli komunikat o błędzie z opcją ponowienia próby.
-   **Brak fiszek:** Jeśli użytkownik nie ma żadnych fiszek, zostanie wyświetlony komponent `EmptyState` z sugestią utworzenia fiszek.
-   **Utrata połączenia:** Dane sesji będą przechowywane lokalnie, aby zapobiec utracie postępu w przypadku problemów z połączeniem.
-   **Brak autoryzacji (401):** Globalna obsługa błędów w kliencie API powinna przechwycić ten status i przekierować użytkownika na stronę logowania.

## 11. Kroki implementacji

1.  **Struktura plików:** Utworzenie pliku strony `/src/pages/practice.astro` oraz plików dla wszystkich komponentów React w `/src/components/views/practice/`.
2.  **Hook `usePractice`:** Implementacja customowego hooka z podstawową logiką pobierania losowych fiszek i zarządzania stanem sesji.
3.  **Komponent `PracticeView`:** Stworzenie głównego komponentu, który używa hooka `usePractice` i renderuje szkielet widoku.
4.  **Komponent `PracticeCard`:** Implementacja karty wyświetlającej fiszkę i formularz odpowiedzi.
5.  **Komponenty `FlashcardFront` i `AnswerForm`:** Implementacja komponentów do wyświetlania pytania i zbierania odpowiedzi.
6.  **Komponent `FeedbackDisplay`:** Implementacja wyświetlania informacji zwrotnej o poprawności odpowiedzi.
7.  **Komponent `PracticeControls`:** Implementacja przycisków nawigacyjnych i wskaźnika postępu.
8.  **Logika weryfikacji odpowiedzi:** Implementacja algorytmu sprawdzającego poprawność odpowiedzi użytkownika.
9.  **Komponent `PracticeSessionSummary`:** Implementacja podsumowania sesji ćwiczeniowej.
10. **Komponent `EmptyState`:** Implementacja widoku dla przypadku, gdy nie ma żadnych fiszek.
11. **Integracja z API:** Implementacja pobierania losowych fiszek z API.
12. **Styling i finalne poprawki:** Dopracowanie wyglądu za pomocą Tailwind i Shadcn/ui, zapewnienie responsywności i dostępności.
13. **Testowanie:** Sprawdzenie działania widoku w różnych scenariuszach (z fiszkami, bez fiszek, różne odpowiedzi). 