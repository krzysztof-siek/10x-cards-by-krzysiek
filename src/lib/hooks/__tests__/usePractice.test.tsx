import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePractice } from "../usePractice";
import type { FlashcardDto } from "../../../types";

// Mock dla globalnego fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock dla funkcji compareAnswers
vi.mock("../usePractice", async () => {
  const actual = await vi.importActual("../usePractice");
  return {
    ...actual,
    compareAnswers: vi.fn((userAnswer) => {
      // Symulujemy, że "Odpowiedź 1" i "Odpowiedź 2" są poprawne, a wszystko inne niepoprawne
      return userAnswer === "Odpowiedź 1" || userAnswer === "Odpowiedź 2";
    }),
  };
});

describe("usePractice", () => {
  const mockFlashcards: FlashcardDto[] = [
    {
      id: 1,
      front: "Pytanie 1",
      back: "Odpowiedź 1",
      source: "manual",
      generation_id: null,
      created_at: "2023-01-01T00:00:00.000Z",
      updated_at: "2023-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      front: "Pytanie 2",
      back: "Odpowiedź 2",
      source: "manual",
      generation_id: null,
      created_at: "2023-01-01T00:00:00.000Z",
      updated_at: "2023-01-01T00:00:00.000Z",
    },
  ];

  beforeEach(() => {
    // Reset mocków przed każdym testem
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("powinien pobrać fiszki przy inicjalizacji", async () => {
    // Mock odpowiedzi API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockFlashcards }),
    });

    const { result } = renderHook(() => usePractice());

    // Początkowy stan powinien pokazywać ładowanie
    expect(result.current.state.isLoading).toBe(true);

    // Czekamy na zakończenie asynchronicznych operacji
    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    // Sprawdzamy czy fiszki zostały załadowane
    expect(result.current.state.sessionState.flashcards).toHaveLength(2);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/flashcards?limit=10&random=true"));
  });

  it("powinien obsłużyć błąd podczas pobierania fiszek", async () => {
    // Mock błędu API
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => usePractice());

    // Czekamy na zakończenie asynchronicznych operacji
    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    // Sprawdzamy czy błąd został obsłużony
    expect(result.current.state.error).toBeTruthy();
    expect(result.current.state.error).toContain("Nie udało się pobrać fiszek");
  });

  it("powinien obsługiwać odpowiedzi i aktualizować stan", async () => {
    // Mock odpowiedzi API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockFlashcards }),
    });

    const { result } = renderHook(() => usePractice());

    // Czekamy na załadowanie fiszek
    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    // Sprawdzamy czy stan początkowy jest poprawny
    expect(result.current.state.sessionState.answeredFlashcards).toHaveLength(0);
    expect(result.current.state.isAnswerSubmitted).toBe(false);

    // Zapisujemy ID pierwszej fiszki
    const firstFlashcardId = result.current.state.currentFlashcard.id;
    // eslint-disable-next-line no-console
    console.log("Pierwsza fiszka ID:", firstFlashcardId);

    // Sprawdzenie odpowiedzi (mockujemy sprawdzenie)
    act(() => {
      result.current.actions.checkAnswer("Odpowiedź 1");
    });

    // Sprawdzamy czy stan został zaktualizowany po sprawdzeniu odpowiedzi
    expect(result.current.state.isAnswerSubmitted).toBe(true);
    expect(result.current.state.sessionState.answeredFlashcards).toHaveLength(1);

    // Przejście do następnej fiszki
    act(() => {
      result.current.actions.goToNextFlashcard();
    });

    // Sprawdzamy czy stan został zresetowany po przejściu do następnej fiszki
    expect(result.current.state.isAnswerSubmitted).toBe(false);

    // Sprawdzamy ID drugiej fiszki (powinna być inna niż pierwsza)
    const secondFlashcardId = result.current.state.currentFlashcard.id;
    // eslint-disable-next-line no-console
    console.log("Druga fiszka ID:", secondFlashcardId);

    // Sprawdzamy czy ID drugiej fiszki jest inne niż pierwszej
    expect(secondFlashcardId).not.toBe(firstFlashcardId);
  });

  it("powinien śledzić postęp sesji i zakończyć ją po przejściu przez wszystkie fiszki", async () => {
    // Mock odpowiedzi API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockFlashcards }),
    });

    const { result } = renderHook(() => usePractice());

    // Czekamy na załadowanie fiszek
    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    // Odpowiadamy na pierwszą fiszkę
    act(() => {
      result.current.actions.checkAnswer("Odpowiedź 1");
    });

    // Przejście do następnej fiszki
    act(() => {
      result.current.actions.goToNextFlashcard();
    });

    // Odpowiadamy na drugą fiszkę
    act(() => {
      result.current.actions.checkAnswer("Odpowiedź 2");
    });

    // Przejście do następnej fiszki (koniec sesji)
    act(() => {
      result.current.actions.goToNextFlashcard();
    });

    // Sprawdzamy czy sesja została zakończona
    expect(result.current.state.sessionState.isFinished).toBe(true);
    expect(result.current.state.sessionSummary).toBeTruthy();
    expect(result.current.state.sessionSummary?.totalCount).toBe(2);
    // Nie testujemy dokładnej liczby poprawnych odpowiedzi, które zależą od implementacji compareAnswers
  });

  it("powinien zresetować stan i pobrać nowe fiszki po rozpoczęciu nowej sesji", async () => {
    // Mock pierwszej odpowiedzi API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockFlashcards }),
    });

    const { result } = renderHook(() => usePractice());

    // Czekamy na załadowanie fiszek
    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    // Symulujemy zakończenie sesji - zmieniamy bezpośrednio stan
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result.current.state.sessionState as any).isFinished = true;
    });

    // Mock drugiej odpowiedzi API (nowa sesja)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockFlashcards }),
    });

    // Rozpoczynamy nową sesję
    act(() => {
      result.current.actions.startNewSession();
    });

    // Sprawdzamy czy stan został zresetowany
    expect(result.current.state.sessionState.isFinished).toBe(false);
    expect(result.current.state.isAnswerSubmitted).toBe(false);
    expect(result.current.state.userAnswer).toBe("");

    // Czekamy na ponowne załadowanie fiszek
    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    // Sprawdzamy czy nowe fiszki zostały załadowane
    expect(result.current.state.sessionState.flashcards).toHaveLength(2);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("powinien próbować zapisać wyniki sesji", async () => {
    // Mock odpowiedzi API dla pobierania fiszek
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockFlashcards }),
    });

    const { result } = renderHook(() => usePractice());

    // Czekamy na załadowanie fiszek
    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    // Symulujemy zakończenie sesji - zmieniamy bezpośrednio stan
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result.current.state.sessionState as any).isFinished = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result.current.state.sessionState as any).answeredFlashcards = [
        { flashcardId: 1, userAnswer: "Odpowiedź 1", isCorrect: true },
        { flashcardId: 2, userAnswer: "Błędna", isCorrect: false },
      ];
    });

    // Mock odpowiedzi API dla zapisywania wyników
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    // Sprawdzamy czy funkcja została wywołana
    await act(async () => {
      await result.current.actions.saveSessionResults();
    });

    // Sprawdzamy czy fetch został wywołany z odpowiednimi parametrami
    expect(mockFetch).toHaveBeenCalledTimes(2); // raz dla pobierania, raz dla zapisywania
    expect(mockFetch).toHaveBeenLastCalledWith("/api/practice/sessions", expect.any(Object));
  });
});
