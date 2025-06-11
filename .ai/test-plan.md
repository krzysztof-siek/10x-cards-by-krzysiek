# Plan Testów dla Aplikacji "10x Cards"

## 1. Wprowadzenie i cele testowania

### Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji "10x Cards", która umożliwia użytkownikom tworzenie i zarządzanie fiszkami do nauki, w tym automatyczne generowanie ich na podstawie tekstu z wykorzystaniem AI. Plan ten obejmuje strategię, zakres, zasoby i harmonogram działań związanych z zapewnieniem jakości.

### Cele testowania

Głównym celem testów jest zapewnienie, że aplikacja spełnia wymagania funkcjonalne i niefunkcjonalne, jest stabilna, bezpieczna i intuicyjna dla użytkownika końcowego.

Szczegółowe cele:
- Weryfikacja poprawności działania kluczowych funkcjonalności (rejestracja, logowanie, zarządzanie fiszkami, generowanie AI).
- Zapewnienie bezpieczeństwa danych użytkownika i autoryzacji dostępu.
- Identyfikacja i eliminacja błędów przed wdrożeniem produkcyjnym.
- Weryfikacja stabilności integracji z usługami zewnętrznymi (Supabase, OpenRouter/LLM).
- Zapewnienie wysokiej jakości doświadczenia użytkownika (UX) i intuicyjności interfejsu (UI).
- Potwierdzenie, że aplikacja działa poprawnie na docelowych platformach i przeglądarkach.

## 2. Zakres testów

### Funkcjonalności objęte testami:

- **Moduł uwierzytelniania:**
    - Rejestracja nowego użytkownika.
    - Logowanie i wylogowywanie.
    - Zarządzanie sesją użytkownika.
    - Resetowanie hasła.
    - Ochrona tras wymagających zalogowania.
- **Moduł zarządzania fiszkami:**
    - Tworzenie, odczyt, aktualizacja i usuwanie (CRUD) zestawów fiszek.
    - Wyświetlanie listy zestawów fiszek.
    - Walidacja danych w formularzach.
- **Moduł generowania fiszek (AI):**
    - Wprowadzanie tekstu źródłowego.
    - Generowanie sugestii fiszek przez AI.
    - Dodawanie wygenerowanych fiszek do zestawu.
    - Obsługa stanów ładowania i błędów.
- **Moduł ćwiczeń:**
    - Wyświetlanie fiszek w trybie nauki.
    - Walidacja odpowiedzi użytkownika.
    - Wyświetlanie informacji zwrotnej (poprawna/niepoprawna odpowiedź).
    - Kontrola postępu sesji ćwiczeniowej.
    - Obsługa przejść między fiszkami.
    - Porównywanie odpowiedzi z uwzględnieniem formatowania.
    - Wyświetlanie statystyk sesji.
- **API Backendowe:**
    - Testowanie każdego endpointu pod kątem poprawności działania, walidacji i obsługi błędów.

### Funkcjonalności wyłączone z testów:

- Wewnętrzna logika komponentów z biblioteki Shadcn/ui (testowana będzie tylko ich integracja).
- Testowanie wydajności i niezawodności zewnętrznych usług (Supabase, OpenRouter) - skupimy się na obsłudze ich ewentualnych błędów po naszej stronie.

## 3. Typy testów do przeprowadzenia

1.  **Testy jednostkowe (Unit Tests):**
    - **Cel:** Weryfikacja małych, izolowanych fragmentów kodu (funkcje, hooki, serwisy).
    - **Narzędzia:** Vitest.
    - **Zakres:** Głównie logika w `src/lib/services`, hooki React (`useFlashcards`, `useFlashcardGenerator`), funkcje pomocnicze w `src/lib/utils.ts`.
2.  **Testy komponentowe (Component Tests):**
    - **Cel:** Weryfikacja pojedynczych komponentów React w izolacji od reszty aplikacji.
    - **Narzędzia:** Vitest, React Testing Library.
    - **Zakres:** Wszystkie interaktywne komponenty w `src/components`, np. `LoginForm`, `FlashcardsTable`, `GenerateFlashcardsView`. Testowanie renderowania, stanu i interakcji.
3.  **Testy integracyjne (Integration Tests):**
    - **Cel:** Weryfikacja współpracy między różnymi częściami systemu.
    - **Narzędzia:** Vitest (dla backendu), Playwright.
    - **Zakres:**
        - Testowanie endpointów API (`src/pages/api`) wraz z ich interakcją z serwisami i bazą danych (na testowej bazie danych).
        - Testowanie integracji z mockowanym API LLM.
        - Testowanie interakcji frontend-backend.
4.  **Testy End-to-End (E2E):**
    - **Cel:** Symulacja rzeczywistych scenariuszy użycia aplikacji z perspektywy użytkownika.
    - **Narzędzia:** Playwright.
    - **Zakres:** Pełne przepływy użytkownika, np.:
        - `Rejestracja -> Logowanie -> Wygenerowanie fiszek -> Zapisanie zestawu -> Wylogowanie`.
        - `Logowanie -> Edycja istniejącego zestawu -> Usunięcie zestawu`.
5.  **Testy manualne (Manual Testing):**
    - **Cel:** Eksploracyjne testowanie aplikacji w celu znalezienia błędów, których nie wykryły testy automatyczne, oraz ocena ogólnego UX/UI.
    - **Zakres:** Cała aplikacja, ze szczególnym uwzględnieniem responsywności (RWD) i użyteczności.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### Scenariusz 1: Rejestracja i logowanie użytkownika (E2E)

1.  Przejdź na stronę główną.
2.  Kliknij przycisk "Zarejestruj się".
3.  Wypełnij formularz poprawnymi danymi i prześlij go.
4.  Oczekiwany rezultat: Użytkownik zostaje przekierowany do panelu aplikacji, widzi powitalną wiadomość.
5.  Wyloguj się.
6.  Przejdź na stronę logowania.
7.  Wprowadź dane użyte podczas rejestracji.
8.  Oczekiwany rezultat: Użytkownik zostaje pomyślnie zalogowany.

### Scenariusz 2: Pełny cykl życia fiszek (E2E)

1.  Zaloguj się do aplikacji.
2.  Przejdź do strony generowania fiszek.
3.  Wklej fragment tekstu i kliknij "Generuj".
4.  Oczekiwany rezultat: Po chwili ładowania pojawia się lista sugestii fiszek.
5.  Wybierz kilka sugestii i kliknij "Utwórz fiszki".
6.  Wprowadź nazwę dla nowego zestawu i zapisz go.
7.  Oczekiwany rezultat: Użytkownik zostaje przekierowany do widoku swoich fiszek, nowy zestaw jest widoczny na liście.
8.  Edytuj jedną z fiszek w nowym zestawie.
9.  Oczekiwany rezultat: Zmiana jest widoczna i zapisana.
10. Usuń jedną fiszkę z zestawu.
11. Oczekiwany rezultat: Fiszka znika z listy.
12. Usuń cały zestaw fiszek.
13. Oczekiwany rezultat: Zestaw znika z listy.

### Scenariusz 3: Obsługa błędów API (Integracyjny/E2E)

1.  Spróbuj zarejestrować użytkownika z adresem e-mail, który już istnieje w systemie.
2.  Oczekiwany rezultat: Wyświetlony zostaje czytelny komunikat o błędzie.
3.  Podczas generowania fiszek (z mockowanym API), zasymuluj błąd 500 z serwera LLM.
4.  Oczekiwany rezultat: Aplikacja wyświetla użytkownikowi komunikat o błędzie, nie ulega awarii.
5.  Spróbuj uzyskać dostęp do `/flashcards` jako niezalogowany użytkownik.
6.  Oczekiwany rezultat: Użytkownik zostaje przekierowany na stronę logowania.

## 5. Środowisko testowe

- **Środowisko lokalne dewelopera:** Uruchamianie testów jednostkowych i komponentowych podczas rozwoju.
- **Środowisko CI (Continuous Integration):** Automatyczne uruchamianie wszystkich testów (jednostkowych, integracyjnych, E2E) na platformie CI (np. GitHub Actions) po każdym pushu do repozytorium.
- **Baza danych:** Dedykowana, odizolowana instancja bazy danych Supabase na potrzeby testów automatycznych, czyszczona przed każdym uruchomieniem zestawu testów.

## 6. Narzędzia do testowania

- **Test Runner / Framework:** Vitest
- **Biblioteka do testowania komponentów:** React Testing Library
- **Framework do testów E2E:** Playwright
- **Automatyzacja CI/CD:** GitHub Actions
- **Zarządzanie projektem i błędami:** GitHub Issues / Jira (lub podobne)

## 7. Harmonogram testów

- **Faza 1 (Rozwój):** Testy jednostkowe i komponentowe są pisane równolegle z nowymi funkcjonalnościami.
- **Faza 2 (Przed wdrożeniem):** Pełne uruchomienie wszystkich testów automatycznych (jednostkowe, integracyjne, E2E) jest wymagane przed każdym wdrożeniem na produkcję.
- **Faza 3 (Po wdrożeniu):** Uruchomienie kluczowych testów E2E (smoke tests) na środowisku produkcyjnym w celu weryfikacji poprawności wdrożenia.
- **Testy regresji:** Wszystkie testy automatyczne są uruchamiane regularnie (np. co noc) oraz przed każdym wydaniem, aby zapobiec regresjom.

## 8. Kryteria akceptacji testów

### Kryteria wejścia (rozpoczęcia testów):

- Kod został zintegrowany z główną gałęzią deweloperską.
- Aplikacja pomyślnie się buduje i uruchamia.
- Dostępne jest środowisko testowe wraz z bazą danych.

### Kryteria wyjścia (zakończenia testów):

- 100% testów automatycznych przechodzi pomyślnie.
- Pokrycie kodu testami jednostkowymi i integracyjnymi dla kluczowej logiki biznesowej (`src/lib/services`) wynosi co najmniej 90%.
- Brak krytycznych i poważnych błędów w systemie raportowania.
- Wszystkie scenariusze testowe zostały wykonane i zaakceptowane.

## 9. Role i odpowiedzialności w procesie testowania

- **Deweloperzy:** Odpowiedzialni za pisanie testów jednostkowych i komponentowych dla tworzonego przez siebie kodu oraz za naprawę błędów znalezionych podczas testów.
- **Inżynier QA / Inżynier Automatyzacji Testów:** Odpowiedzialny za tworzenie i utrzymanie testów integracyjnych i E2E, zarządzanie procesem testowym, raportowanie błędów i weryfikację poprawek.
- **Product Owner / Manager:** Odpowiedzialny za zdefiniowanie wymagań i kryteriów akceptacji oraz ostateczną akceptację funkcjonalności.

## 10. Procedury raportowania błędów

1.  **Zgłaszanie błędów:** Każdy znaleziony błąd musi zostać zgłoszony w systemie do śledzenia błędów (np. GitHub Issues).
2.  **Format zgłoszenia:** Zgłoszenie błędu powinno zawierać:
    - Tytuł: Krótki, zwięzły opis problemu.
    - Opis: Szczegółowe informacje o błędzie.
    - Kroki do odtworzenia: Dokładna instrukcja, jak wywołać błąd.
    - Oczekiwany rezultat: Jak aplikacja powinna się zachować.
    - Rzeczywisty rezultat: Co faktycznie się stało.
    - Środowisko: Wersja przeglądarki, system operacyjny.
    - Priorytet/Waga: (np. Krytyczny, Poważny, Drobny).
    - Załączniki: Zrzuty ekranu, nagrania wideo, logi z konsoli.
3.  **Cykl życia błędu:**
    - `Nowy` -> `W analizie` -> `W naprawie` -> `Gotowy do testów` -> `W weryfikacji` -> `Zamknięty` / `Otwarty ponownie`.
4.  **Triage błędów:** Regularne spotkania zespołu w celu przeglądu, priorytetyzacji i przypisania zgłoszonych błędów. 