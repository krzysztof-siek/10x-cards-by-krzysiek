# Konfiguracja LLM dla generowania fiszek

Aplikacja 10x Cards używa API modelu językowego (LLM) do generowania propozycji fiszek. Domyślnie w trybie deweloperskim używane są mocki, ale możesz skonfigurować aplikację, aby używała faktycznego API.

## Ustawienie kluczy API

1. Utwórz plik `.env` w katalogu głównym projektu (lub `.env.local` dla ustawień lokalnych) z następującymi zmiennymi:

```
OPENROUTER_API_KEY=twój_klucz_api
USE_REAL_LLM=true
```

2. Klucz API możesz uzyskać tworząc konto na [OpenRouter](https://openrouter.ai/).

3. Zrestartuj serwer deweloperski, aby zmiany zostały zastosowane.

## Rozwiązywanie problemów

- Jeśli widzisz komunikat "Missing OpenRouter API key", upewnij się, że dodałeś prawidłowy klucz API do pliku `.env`.
- Jeśli widzisz błędy związane z API, sprawdź, czy Twój klucz API jest aktywny i ma wystarczające środki.
- Możesz ręcznie przełączać się między mockami a prawdziwym API, zmieniając wartość `USE_REAL_LLM` w pliku `.env`.

## Uwagi

- Używanie API modelu językowego może generować koszty, zależne od wybranego modelu i ilości zapytań.
- Domyślnie aplikacja korzysta z modelu `openai/gpt-4`, który zapewnia wysoką jakość generowanych fiszek.
- Możesz zmienić model w pliku `src/lib/services/llm.service.ts`, modyfikując parametr `model` w konstruktorze serwisu. 