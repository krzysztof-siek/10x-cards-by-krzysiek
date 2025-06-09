# Specyfikacja architektury modułu autentykacji dla 10x-cards

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1. Strony i komponenty autentykacji

#### Nowe strony Astro:
- `src/pages/auth/login.astro` - Strona logowania
- `src/pages/auth/register.astro` - Strona rejestracji
- `src/pages/auth/reset-password.astro` - Strona odzyskiwania hasła
- `src/pages/auth/new-password.astro` - Strona ustawiania nowego hasła (po resetowaniu)

#### Nowe komponenty React:
- `src/components/auth/LoginForm.tsx` - Formularz logowania
- `src/components/auth/RegisterForm.tsx` - Formularz rejestracji
- `src/components/auth/ResetPasswordForm.tsx` - Formularz resetowania hasła
- `src/components/auth/NewPasswordForm.tsx` - Formularz ustawiania nowego hasła
- `src/components/auth/AuthStatus.tsx` - Komponent wyświetlający status autentykacji (zalogowany/niezalogowany)

#### Modyfikacje istniejących komponentów:
- `src/components/ui/topbar.tsx` - Modyfikacja pasków nawigacyjnych:
  - Dla niezalogowanych użytkowników: Przyciski logowania/rejestracji w prawym górnym rogu
  - Dla zalogowanych użytkowników: Wyświetlanie imienia użytkownika oraz ikonki z możliwością wylogowania w prawym górnym rogu

### 1.2. Podział odpowiedzialności między komponentami

#### Strony Astro:
- Odpowiadają za renderowanie statycznego HTML z formularzami
- Implementują logikę przekierowania niezalogowanych użytkowników z chronionych stron
- Przekazują stan sesji do komponentów React (hydration props)
- Uniemożliwiają dostęp do widoku fiszek i generatora dla niezalogowanych użytkowników
- Niezalogowany użytkownik ma dostęp jedynie do strony głównej, z której może zostać przekierowany do stron logowania lub rejestracji

#### Komponenty React:
- Odpowiadają za obsługę formularzy autentykacji (walidacja, wysyłanie, obsługa błędów)
- Zarządzają stanem formularzy (dane wejściowe, błędy, stan ładowania)
- Wywołują odpowiednie API Supabase Auth
- Obsługują przekierowania po udanej autentykacji
- W przypadku pomyślnej rejestracji przekierowują użytkownika do generatora fiszek (zgodnie z US-001)
- W przypadku pomyślnego logowania przekierowują użytkownika do generatora fiszek (zgodnie z US-002)

### 1.3. Walidacja i komunikaty błędów

#### Walidacja po stronie klienta:
- Pola email: format adresu email (regex)
- Hasło: min. 8 znaków, conajmniej jedna wielka litera, cyfra i znak specjalny
- Powtórzone hasło: zgodność z pierwszym hasłem

#### Komunikaty błędów:
- Nieprawidłowy format adresu email
- Hasło nie spełnia wymagań bezpieczeństwa
- Hasła nie są zgodne
- Użytkownik o podanym adresie email już istnieje
- Nieprawidłowe dane logowania (zgodnie z US-002)
- Konto z podanym adresem email nie istnieje (przy resetowaniu hasła)
- Błąd serwera (ogólny komunikat)

### 1.4. Scenariusze użytkownika

#### Nawigacja dla niezalogowanego użytkownika:
1. Niezalogowany użytkownik ma dostęp wyłącznie do strony głównej
2. Próba dostępu do widoku listy fiszek lub generatora powoduje przekierowanie do strony logowania
3. Z głównej strony użytkownik może przejść do strony logowania lub rejestracji za pomocą przycisków w prawym górnym rogu

#### Rejestracja:
1. Użytkownik wchodzi na stronę `/auth/register` poprzez przycisk w prawym górnym rogu
2. Wypełnia formularz rejestracyjny (email, hasło, powtórzenie hasła)
3. Po walidacji danych, formularz wywołuje API Supabase Auth
4. W przypadku sukcesu użytkownik otrzymuje potwierdzenie pomyślnej rejestracji i zostaje zalogowany (zgodnie z US-001)
5. Użytkownik jest przekierowywany do widoku generowania fiszek (zgodnie z US-001)
6. W przypadku błędu wyświetlany jest odpowiedni komunikat

#### Logowanie:
1. Użytkownik wchodzi na stronę `/auth/login` poprzez przycisk w prawym górnym rogu
2. Wypełnia formularz logowania (email, hasło)
3. Po walidacji danych, formularz wywołuje API Supabase Auth
4. W przypadku sukcesu użytkownik jest przekierowywany do widoku generowania fiszek (zgodnie z US-002)
5. W przypadku błędu wyświetlany jest odpowiedni komunikat o nieprawidłowych danych (zgodnie z US-002)

#### Odzyskiwanie hasła:
1. Użytkownik klika "Zapomniałem hasła" na stronie logowania
2. Zostaje przekierowany do formularza odzyskiwania hasła
3. Po podaniu adresu email i walidacji, wysyłana jest wiadomość z linkiem do resetowania hasła
4. Użytkownik otrzymuje potwierdzenie wysłania wiadomości
5. Po kliknięciu w link w wiadomości, użytkownik trafia na stronę ustawiania nowego hasła
6. Po podaniu i potwierdzeniu nowego hasła, może zalogować się używając nowych danych

#### Wylogowanie:
1. Zalogowany użytkownik klika ikonkę wylogowania w prawym górnym rogu
2. Sesja jest usuwana z Supabase Auth
3. Użytkownik jest przekierowywany do strony głównej

#### Usunięcie konta:
1. Zalogowany użytkownik przechodzi do ustawień konta
2. Wybiera opcję usunięcia konta
3. Po potwierdzeniu, konto wraz z powiązanymi fiszkami zostaje trwale usunięte (zgodnie z punktem 3 Wymagań funkcjonalnych)
4. Użytkownik zostaje wylogowany i przekierowany do strony głównej

## 2. LOGIKA BACKENDOWA

### 2.1. Struktura endpointów API

#### Endpointy Astro API:
- `src/pages/api/auth/register.ts` - Endpoint rejestracji
- `src/pages/api/auth/login.ts` - Endpoint logowania
- `src/pages/api/auth/logout.ts` - Endpoint wylogowania
- `src/pages/api/auth/reset-password.ts` - Endpoint resetowania hasła
- `src/pages/api/auth/new-password.ts` - Endpoint ustawiania nowego hasła
- `src/pages/api/auth/delete-account.ts` - Endpoint usuwania konta użytkownika i powiązanych fiszek (zgodnie z punktem 3 Wymagań funkcjonalnych)

### 2.2. Modele danych

#### Rozszerzenie modelu Supabase:
- Nie wymaga dodatkowych tabel - wykorzystuje wbudowane tabele Supabase Auth
- Rozszerzenie typu Database w `src/db/database.types.ts` o typy auth

#### Modele DTO:
- `src/types.ts` - Rozszerzenie o typy dla autentykacji:
  - `RegisterDTO` - Dane rejestracji (email, hasło, powtórzone hasło)
  - `LoginDTO` - Dane logowania (email, hasło)
  - `ResetPasswordDTO` - Dane resetowania hasła (email)
  - `NewPasswordDTO` - Dane nowego hasła (hasło, powtórzone hasło, token)
  - `DeleteAccountDTO` - Dane potrzebne do usunięcia konta (potwierdzenie hasła)

### 2.3. Mechanizm walidacji danych wejściowych

#### Walidacja serwerowa:
- Wykorzystanie biblioteki Zod do definiowania schematów walidacyjnych
- Implementacja schematów w `src/lib/schemas/auth.schema.ts`
- Walidacja danych wejściowych przed wywołaniem Supabase Auth API
- Zapewnienie bezpiecznego przechowywania danych logowania (zgodnie z US-002)

### 2.4. Obsługa wyjątków

#### Strategie obsługi błędów:
- Mapowanie błędów Supabase Auth na przyjazne dla użytkownika komunikaty
- Logowanie błędów na serwerze z wykorzystaniem `error-log.service.ts`
- Zwracanie odpowiednich kodów HTTP i komunikatów błędów

### 2.5. Aktualizacja renderowania server-side

#### Middleware Astro:
- Rozszerzenie `src/middleware/index.ts` o funkcjonalność sprawdzania sesji
- Dodanie kontekstu użytkownika do `Astro.locals`
- Implementacja mechanizmu ochrony stron wymagających autentykacji
- Uniemożliwienie dostępu do widoku fiszek i generatora dla niezalogowanych użytkowników
- Przekierowanie niezalogowanych użytkowników próbujących uzyskać dostęp do chronionych stron na stronę logowania

## 3. SYSTEM AUTENTYKACJI

### 3.1. Integracja z Supabase Auth

#### Serwis autentykacji:
- `src/lib/services/auth.service.ts` - Główny serwis obsługujący autentykację
- Metody:
  - `register(email, password)` - Rejestracja użytkownika
  - `login(email, password)` - Logowanie użytkownika
  - `logout()` - Wylogowanie użytkownika
  - `resetPassword(email)` - Wysłanie linku do resetowania hasła
  - `updatePassword(password, token)` - Ustawienie nowego hasła
  - `getSession()` - Pobranie aktualnej sesji
  - `getUser()` - Pobranie danych zalogowanego użytkownika
  - `deleteAccount(password)` - Usunięcie konta użytkownika i powiązanych fiszek (zgodnie z punktem 3 Wymagań funkcjonalnych)

#### Zarządzanie sesją:
- Wykorzystanie mechanizmów Supabase Auth do zarządzania sesją
- Przechowywanie tokenu JWT w bezpiecznych ciasteczkach
- Automatyczne odświeżanie tokenu
- Bezpieczne przechowywanie danych logowania (zgodnie z US-002)

### 3.2. Ochrona stron wymagających autentykacji

#### Implementacja ochrony stron:
- Wykorzystanie prerendering flag w stronach Astro (`export const prerender = false;`)
- Dodanie sprawdzania autentykacji w middleware
- Automatyczne przekierowanie niezalogowanych użytkowników do strony logowania
- Ochrona stron generatora i listy fiszek przed dostępem przez niezalogowanych użytkowników
- Dostęp niezalogowanych użytkowników ograniczony wyłącznie do strony głównej i stron autentykacji

#### Stany interfejsu zależne od autentykacji:
- Dynamiczne wyświetlanie elementów nawigacji w zależności od stanu autentykacji:
  - Dla niezalogowanych: przyciski logowania/rejestracji w prawym górnym rogu
  - Dla zalogowanych: imię użytkownika oraz ikonka z opcją wylogowania w prawym górnym rogu
- Blokowanie dostępu do chronionych zasobów API dla niezalogowanych użytkowników

### 3.3. Zgodność z RODO

- Implementacja mechanizmów umożliwiających użytkownikowi wgląd do swoich danych
- Umożliwienie usunięcia konta i wszystkich powiązanych danych na żądanie (zgodnie z punktem 7 Wymagań funkcjonalnych)
- Przechowywanie tylko niezbędnych danych osobowych (email)
- Jasna informacja o przetwarzaniu danych osobowych podczas rejestracji

## 4. IMPLEMENTACJA TECHNICZNA

### 4.1. Nowe zależności
- Nie ma potrzeby dodawania nowych zależności - wykorzystujemy istniejące:
  - `@supabase/supabase-js` - klient Supabase
  - `zod` - biblioteka do walidacji danych
  - `astro` z włączonym trybem SSR i eksperymentalną obsługą sesji

### 4.2. Przepływ danych

#### Rejestracja:
1. Komponent `RegisterForm` zbiera dane od użytkownika
2. Dane są walidowane przez schematy Zod
3. Komponent wysyła żądanie do endpointu `/api/auth/register`
4. Endpoint wykorzystuje `auth.service.ts` do rejestracji w Supabase Auth
5. W przypadku sukcesu tworzona jest sesja i użytkownik jest przekierowywany do generatora fiszek (zgodnie z US-001)
6. W przypadku błędu, informacja jest zwracana do formularza

#### Logowanie:
1. Komponent `LoginForm` zbiera dane od użytkownika
2. Dane są walidowane przez schematy Zod
3. Komponent wysyła żądanie do endpointu `/api/auth/login`
4. Endpoint wykorzystuje `auth.service.ts` do logowania w Supabase Auth
5. W przypadku sukcesu tworzona jest sesja i użytkownik jest przekierowywany do generatora fiszek (zgodnie z US-002)
6. W przypadku błędu, informacja jest zwracana do formularza

#### Ochrona stron:
1. Middleware sprawdza sesję z Supabase Auth
2. Jeśli sesja istnieje, dane użytkownika są dodawane do `Astro.locals`
3. Jeśli sesja nie istnieje a strona wymaga autentykacji, następuje przekierowanie do strony logowania
4. Komponenty Astro mogą sprawdzać stan autentykacji i renderować odpowiednią zawartość

#### Wylogowanie:
1. Użytkownik klika ikonkę wylogowania w prawym górnym rogu
2. Wywoływany jest endpoint `/api/auth/logout`
3. Sesja jest usuwana z Supabase Auth
4. Użytkownik jest przekierowywany do strony głównej

#### Usunięcie konta:
1. Użytkownik potwierdza chęć usunięcia konta podając hasło
2. Endpoint `/api/auth/delete-account` wywołuje metodę `deleteAccount` z `auth.service.ts`
3. Serwis usuwa wszystkie fiszki użytkownika z bazy danych
4. Następnie usuwa konto użytkownika z Supabase Auth
5. Po pomyślnym usunięciu, użytkownik jest wylogowywany i przekierowywany do strony głównej

### 4.3. Bezpieczeństwo

#### Przechowywanie tokenów:
- Tokeny JWT przechowywane w bezpiecznych ciasteczkach (HttpOnly, Secure, SameSite)
- Automatyczne odświeżanie tokenów przez klienta Supabase

#### Ochrona przed atakami:
- Implementacja rate-limitingu dla endpointów autentykacji
- Walidacja danych wejściowych na poziomie schematu
- Sanityzacja danych przed użyciem w zapytaniach 