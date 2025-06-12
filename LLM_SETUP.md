# Konfiguracja LLM dla 10x-cards-by-krzysiek

Aplikacja korzysta z API OpenRouter do generowania fiszek. Aby poprawnie korzystać z tej funkcjonalności, konieczne jest skonfigurowanie klucza API.

## Uzyskanie klucza API OpenRouter

1. Utwórz konto na [OpenRouter](https://openrouter.ai/)
2. Po zalogowaniu, przejdź do zakładki [Keys](https://openrouter.ai/keys)
3. Wygeneruj nowy klucz API klikając "Create Key"
4. Skopiuj wygenerowany klucz, który zaczyna się od `sk-or-v1-...`

## Konfiguracja klucza API w projekcie

### Opcja 1: Zmienne środowiskowe w pliku .env

1. Utwórz plik `.env` w głównym katalogu projektu
2. Dodaj następującą linię z Twoim kluczem API:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```
3. Zrestartuj serwer deweloperski

### Opcja 2: Zmienne środowiskowe systemowe

Możesz również skonfigurować zmienną środowiskową systemową:

**Linux/macOS:**

```bash
export OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

**Windows (PowerShell):**

```powershell
$env:OPENROUTER_API_KEY = "sk-or-v1-your-key-here"
```

## Używany model

Aplikacja korzysta z modelu **OpenAI GPT-3.5-Turbo** (`openai/gpt-3.5-turbo`), który oferuje dobry balans między jakością generowanych fiszek a kosztem i szybkością generowania. Jest to sprawdzony i stabilny model, który dobrze radzi sobie z zadaniami związanymi z tworzeniem fiszek edukacyjnych.

## Inne dostępne modele

Jeśli chcesz zmienić model, możesz to zrobić edytując plik `src/lib/services/llm.service.ts` i zmieniając wartość parametru `model` w konstruktorze serwisu. Lista wszystkich dostępnych modeli jest dostępna na stronie [OpenRouter Models](https://openrouter.ai/models).

Popularne alternatywy:

- `anthropic/claude-3-haiku` - dobra jakość, szybszy niż Opus
- `anthropic/claude-3-opus` - wysoka jakość, ale wolniejszy i droższy
- `openai/gpt-4` - wysokiej jakości model OpenAI
- `meta-llama/llama-3-8b-instruct` - darmowy model Meta AI

## Rozwiązywanie problemów

Jeśli otrzymujesz błąd dotyczący klucza API:

1. Upewnij się, że klucz API jest poprawnie skonfigurowany
2. Sprawdź, czy Twój klucz ma wystarczające środki/kredyty
3. Upewnij się, że model, którego próbujesz użyć, jest dostępny w Twoim planie
4. Sprawdź, czy model obsługuje strukturyzowane dane w formacie JSON
