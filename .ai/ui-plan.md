# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji 10x-cards została zaprojektowana w celu zapewnienia płynnego i intuicyjnego doświadczenia, koncentrując się na kluczowych przepływach pracy zdefiniowanych w dokumentacji produktu (PRD) i notatkach z sesji planowania. Architektura opiera się na frameworku Astro, wykorzystując interaktywne "wyspy" React do dynamicznych komponentów. Takie podejście łączy zalety wydajności statycznie generowanych stron (Astro) z bogatą interaktywnością React tam, gdzie jest to potrzebne.

Główne filary architektury to:
- **Uwierzytelnianie:** Pełny, bezpieczny przepływ uwierzytelniania, w tym rejestracja, logowanie i odzyskiwanie hasła.
- **Generowanie fiszek (AI):** Centralna funkcja aplikacji, umożliwiająca użytkownikom generowanie propozycji fiszek z tekstu, a następnie ich przeglądanie i zapisywanie.
- **Zarządzanie fiszkami:** Pełna funkcjonalność CRUD (Tworzenie, Odczyt, Aktualizacja, Usuwanie) dla fiszek i kolekcji, w których są one zorganizowane.
- **Historia:** Widok pozwalający użytkownikom śledzić ich poprzednie interakcje z modułem generowania AI.

Projekt jest realizowany w podejściu "desktop-first", a za globalny stan aplikacji (np. status uwierzytelnienia) odpowiada React Context API. Komunikacja z API backendu jest hermetyzowana w dedykowanych hookach React, aby zapewnić czystość i reużywalność kodu.

## 2. Lista widoków

Poniżej przedstawiono listę wszystkich niezbędnych widoków (stron) w aplikacji.

---

### **Nazwa widoku:** Strona logowania
- **Ścieżka:** `/login`
- **Główny cel:** Umożliwienie zarejestrowanym użytkownikom bezpiecznego dostępu do ich konta.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami na e-mail i hasło.
- **Kluczowe komponenty widoku:**
  - `LoginForm.tsx`: Interaktywny komponent React zawierający logikę formularza, walidację po stronie klienta i komunikację z API uwierzytelniania.
  - Linki do stron `/register` i `/forgot-password`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Jasne komunikaty o błędach (np. "Nieprawidłowy e-mail lub hasło"). Po pomyślnym zalogowaniu użytkownik jest przekierowywany do widoku `/generate`.
  - **Dostępność:** Poprawne etykiety dla pól formularza, obsługa nawigacji klawiaturą.
  - **Bezpieczeństwo:** Komunikacja z API odbywa się przez HTTPS. Hasło nie jest przechowywane w stanie aplikacji w postaci jawnej.

---

### **Nazwa widoku:** Strona rejestracji
- **Ścieżka:** `/register`
- **Główny cel:** Umożliwienie nowym użytkownikom stworzenia konta w serwisie.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami na e-mail, hasło i potwierdzenie hasła.
- **Kluczowe komponenty widoku:**
  - `RegisterForm.tsx`: Interaktywny komponent React z walidacją (np. złożoność hasła, zgodność haseł).
  - Link do strony `/login`.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Informacje zwrotne w czasie rzeczywistym dotyczące walidacji hasła. Po pomyślnej rejestracji użytkownik jest automatycznie logowany i przekierowywany do `/generate`.
  - **Dostępność:** Pełna obsługa klawiatury i czytników ekranu dla formularza.
  - **Bezpieczeństwo:** Podobne jak w widoku logowania.

---

### **Nazwa widoku:** Odzyskiwanie hasła
- **Ścieżka:** `/forgot-password`
- **Główny cel:** Inicjacja procesu resetowania hasła przez użytkownika.
- **Kluczowe informacje do wyświetlenia:** Formularz z polem na adres e-mail.
- **Kluczowe komponenty widoku:**
  - `ForgotPasswordForm.tsx`: Komponent React do wysłania prośby o reset hasła.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Po wysłaniu formularza użytkownik widzi wyraźny komunikat informujący o wysłaniu linku do resetu hasła na podany adres e-mail.
  - **Dostępność:** Standardowe wytyczne dostępności dla formularzy.
  - **Bezpieczeństwo:** Strona nie potwierdza, czy dany e-mail istnieje w bazie danych, aby zapobiec wyliczeniu użytkowników.

---

### **Nazwa widoku:** Aktualizacja hasła
- **Ścieżka:** `/update-password`
- **Główny cel:** Umożliwienie użytkownikowi ustawienia nowego hasła po kliknięciu w link resetujący.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami na nowe hasło i jego potwierdzenie.
- **Kluczowe komponenty widoku:**
  - `UpdatePasswordForm.tsx`: Komponent React obsługujący zmianę hasła na podstawie tokena z URL.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Wyraźne zasady dotyczące nowego hasła. Po pomyślnej zmianie użytkownik jest informowany i przekierowywany do strony logowania.
  - **Dostępność:** Standardowe wytyczne dostępności.
  - **Bezpieczeństwo:** Token resetujący jest jednorazowy i ma ograniczony czas ważności.

---

### **Nazwa widoku:** Generowanie fiszek (AI)
- **Ścieżka:** `/generate`
- **Główny cel:** Główne narzędzie aplikacji, pozwalające na generowanie propozycji fiszek z dostarczonego tekstu.
- **Kluczowe informacje do wyświetlenia:**
  - Duże pole tekstowe na tekst źródłowy z dynamicznym licznikiem znaków.
  - Lista wygenerowanych sugestii fiszek (przód, tył).
  - Przyciski akcji (generuj, zapisz wybrane).
- **Kluczowe komponenty widoku:**
  - `SourceTextForm.tsx`: Formularz z polem `textarea` i logiką walidacji (długość tekstu 1k-10k znaków).
  - `SuggestionsList.tsx`: Dynamiczna lista sugestii, gdzie każda pozycja ma checkbox, opcję edycji "inline" oraz przycisk do usunięcia z listy (przed zapisem).
  - `GlobalSpinner.tsx`: Globalna nakładka z animacją ładowania, blokująca interfejs podczas komunikacji z AI.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Proces jest jasny: wklej tekst -> generuj -> przeglądaj i edytuj -> zapisz. Globalny spinner informuje o trwającym procesie. Po zapisie sugestii użytkownik otrzymuje komunikat typu "toast" i pozostaje na stronie, aby kontynuować pracę.
  - **Dostępność:** Wszystkie interaktywne elementy (przyciski, pola edycji) są dostępne z klawiatury.
  - **Bezpieczeństwo:** Widok dostępny tylko dla zalogowanych użytkowników (chroniony przez middleware).

---

### **Nazwa widoku:** Moje fiszki
- **Ścieżka:** `/flashcards`
- **Główny cel:** Zarządzanie wszystkimi zapisanymi fiszkami i kolekcjami użytkownika.
- **Kluczowe informacje do wyświetlenia:**
  - Lista/tabela fiszek użytkownika z podziałem na strony (paginacja).
  - Narzędzia do zarządzania kolekcjami (tworzenie, zmiana nazwy, usuwanie).
  - Filtry (np. według kolekcji).
- **Kluczowe komponenty widoku:**
  - `CollectionsManager.tsx`: Komponent do zarządzania kolekcjami.
  - `FlashcardsTable.tsx`: Tabela prezentująca fiszki z opcjami sortowania, paginacji i akcjami (edycja, usuwanie).
  - `FlashcardForm.tsx`: Formularz (wewnątrz modala/dialogu) do tworzenia nowej fiszki lub edycji istniejącej.
  - `DeleteConfirmationDialog.tsx`: Modal potwierdzający usunięcie fiszki lub kolekcji.
  - `EmptyState.tsx`: Komponent wyświetlany, gdy użytkownik nie ma jeszcze żadnych fiszek.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Tworzenie i edycja odbywają się w modalach, co utrzymuje kontekst listy. Paginacja zapobiega ładowaniu dużej liczby danych na raz.
  - **Dostępność:** Tabela jest odpowiednio oznaczona dla czytników ekranu, a wszystkie akcje są dostępne z klawiatury.
  - **Bezpieczeństwo:** Widok i wszystkie operacje na danych są chronione i dostępne tylko dla właściciela danych.

---

### **Nazwa widoku:** Historia generowania
- **Ścieżka:** `/generations`
- **Główny cel:** Umożliwienie użytkownikowi przeglądania historii zapytań do AI.
- **Kluczowe informacje do wyświetlenia:** Tabela z historią generacji, zawierająca datę, fragment tekstu źródłowego, status (np. "Ukończono", "Błąd") oraz liczbę fiszek utworzonych z danej generacji.
- **Kluczowe komponenty widoku:**
  - `GenerationsTable.tsx`: Tabela z listą historycznych zapytań i paginacją.
  - `EmptyState.tsx`: Komponent na wypadek braku historii.
- **UX, dostępność i względy bezpieczeństwa:**
  - **UX:** Widok "tylko do odczytu", pozwala na szybkie zorientowanie się w poprzednich działaniach.
  - **Dostępność:** Standardy dostępności dla tabeli danych.
  - **Bezpieczeństwo:** Dostęp tylko dla zalogowanego użytkownika.

## 3. Mapa podróży użytkownika

Główny przypadek użycia (generowanie i zapisywanie fiszek AI):

1.  **Logowanie:** Użytkownik trafia na `/login`, wprowadza dane i zostaje przekierowany na `/generate`.
2.  **Generowanie:** Na stronie `/generate`, użytkownik wkleja tekst do `SourceTextForm` i klika "Generuj".
3.  **Oczekiwanie:** Na ekranie pojawia się `GlobalSpinner`, informując o przetwarzaniu.
4.  **Przegląd:** Po otrzymaniu odpowiedzi od API, spinner znika, a `SuggestionsList` wypełnia się propozycjami.
5.  **Interakcja:** Użytkownik przegląda listę. Może edytować treść każdej propozycji bezpośrednio na liście, usunąć niechciane propozycje lub odznaczyć je za pomocą checkboxa.
6.  **Zapisywanie:** Użytkownik zaznacza fiszki, które chce zapisać. Pojawia się opcja wyboru kolekcji (lub stworzenia nowej). Po kliknięciu "Zapisz", wysyłane jest żądanie do API.
7.  **Potwierdzenie:** Użytkownik otrzymuje powiadomienie "toast" o pomyślnym zapisaniu fiszek. Lista sugestii jest czyszczona, a formularz gotowy do ponownego użycia. Użytkownik pozostaje na stronie `/generate`.
8.  **Weryfikacja:** Użytkownik może nawigować do `/flashcards`, aby zobaczyć nowo dodane fiszki w odpowiedniej kolekcji, lub do `/generations`, aby zobaczyć wpis w historii dotyczący tej operacji.

## 4. Układ i struktura nawigacji

Nawigacja jest scentralizowana w głównym komponencie `Layout.astro`, który definiuje stałą strukturę dla większości stron.

- **Nagłówek (Header):**
  - **Użytkownik niezalogowany:** Wyświetla logo, przyciski "Zaloguj się" i "Zarejestruj się".
  - **Użytkownik zalogowany:** Wyświetla logo oraz główne linki nawigacyjne:
    - **Generuj** (`/generate`)
    - **Moje fiszki** (`/flashcards`)
    - **Historia** (`/generations`)
    - W prawym górnym rogu znajduje się menu użytkownika (ikona/avatar) z opcją "Wyloguj".
- **Obszar główny (Main Content):** Dynamicznie renderuje zawartość strony (widoku).
- **Stopka (Footer):** Zawiera linki do polityki prywatności i regulaminu.
- **Ochrona tras:** Middleware w Astro (`src/middleware/index.ts`) będzie przechwytywać próby dostępu do chronionych stron (`/generate`, `/flashcards`, `/generations`) przez niezalogowanych użytkowników i przekierowywać ich do `/login`.

## 5. Kluczowe komponenty

Poniżej znajduje się lista kluczowych, reużywalnych komponentów, które stanowią fundament interfejsu użytkownika. Komponenty pochodzą z biblioteki Shadcn/ui i są dostosowane do potrzeb aplikacji.

- **`AuthContext.tsx`:** Globalny kontekst React, który przechowuje informacje o sesji i statusie uwierzytelnienia użytkownika, udostępniając je wszystkim interaktywnym komponentom.
- **`Layout.astro`:** Główny szablon strony zawierający nagłówek, nawigację i stopkę. W nim zagnieżdżony jest również globalny komponent `Toaster` do wyświetlania powiadomień.
- **`GlobalSpinner.tsx`:** Komponent nakładki pełnoekranowej, używany do blokowania interfejsu podczas długotrwałych operacji, takich jak generowanie fiszek.
- **`DeleteConfirmationDialog.tsx`:** Reużywalny modal, który prosi użytkownika o potwierdzenie przed wykonaniem nieodwracalnej akcji, takiej jak usunięcie fiszki lub kolekcji.
- **`EmptyState.tsx`:** Komponent wyświetlany, gdy lista danych (np. fiszek, historii generowania) jest pusta. Zawiera czytelną informację oraz opcjonalny przycisk wzywający do akcji (np. "Stwórz swoją pierwszą fiszkę").
- **`PageHeader.tsx`:** Standardowy komponent nagłówka strony, zawierający tytuł widoku oraz opcjonalne przyciski akcji (np. "Dodaj nową fiszkę" w widoku `/flashcards`).
- **Formularze (np. `LoginForm`, `FlashcardForm`):** Zbudowane przy użyciu `react-hook-form` i `zod` do walidacji, co zapewnia spójne i niezawodne działanie formularzy w całej aplikacji.
- **Tabele (np. `FlashcardsTable`, `GenerationsTable`):** Komponenty oparte na `tanstack/react-table` do wyświetlania danych tabelarycznych z wbudowaną obsługą paginacji, sortowania i filtrowania. 