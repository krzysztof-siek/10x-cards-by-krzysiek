import { useState, useEffect, useCallback } from "react";
import type { PracticeSessionState, AnsweredFlashcard, PracticeSessionSummary } from "../../types";

// Funkcja pomocnicza do porównywania odpowiedzi z tolerancją na drobne różnice
const compareAnswers = (userAnswer: string, correctAnswer: string): boolean => {
  if (!userAnswer || !correctAnswer) return false;

  // Normalizacja odpowiedzi: zamiana na małe litery, usunięcie znaków interpunkcyjnych i białych znaków
  const normalizeAnswer = (answer: string) => {
    return answer
      .toLowerCase()
      .replace(/[.,/#!$%&*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const normalizedUserAnswer = normalizeAnswer(userAnswer);
  const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);

  return normalizedUserAnswer === normalizedCorrectAnswer;
};

interface UsePracticeOptions {
  collectionId?: number;
  limit?: number;
}

export const usePractice = (options: UsePracticeOptions = {}) => {
  const { collectionId, limit = 10 } = options;

  // Stan sesji ćwiczeniowej
  const [sessionState, setSessionState] = useState<PracticeSessionState>({
    flashcards: [],
    currentIndex: 0,
    answeredFlashcards: [],
    isFinished: false,
  });

  // Stan odpowiedzi użytkownika
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Stan ładowania i błędów
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Aktualnie wyświetlana fiszka
  const currentFlashcard = sessionState.flashcards[sessionState.currentIndex];

  // Podsumowanie sesji
  const sessionSummary: PracticeSessionSummary | null = sessionState.isFinished
    ? {
        totalCount: sessionState.answeredFlashcards.length,
        correctCount: sessionState.answeredFlashcards.filter((f) => f.isCorrect).length,
        incorrectCount: sessionState.answeredFlashcards.filter((f) => !f.isCorrect).length,
        accuracy:
          sessionState.answeredFlashcards.length > 0
            ? (sessionState.answeredFlashcards.filter((f) => f.isCorrect).length /
                sessionState.answeredFlashcards.length) *
              100
            : 0,
      }
    : null;

  // Pobranie fiszek z API
  const fetchFlashcards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Budowanie parametrów zapytania
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (collectionId) {
        params.append("collectionId", collectionId.toString());
      }
      // Dodajemy parametr random=true, aby otrzymać losowe fiszki
      params.append("random", "true");

      // Pobieranie fiszek z API
      const response = await fetch(`/api/flashcards?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Nie udało się pobrać fiszek (${response.status})`);
      }

      const data = await response.json();

      // Sprawdzenie czy odpowiedź ma oczekiwaną strukturę
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Nieprawidłowa odpowiedź z API");
      }

      // Jeśli brak fiszek
      if (data.data.length === 0) {
        setSessionState({
          flashcards: [],
          currentIndex: 0,
          answeredFlashcards: [],
          isFinished: false,
        });
        return;
      }

      // Losowa kolejność fiszek (na wszelki wypadek, gdyby API nie obsługiwało parametru random)
      const shuffledData = [...data.data].sort(() => Math.random() - 0.5);

      setSessionState({
        flashcards: shuffledData,
        currentIndex: 0,
        answeredFlashcards: [],
        isFinished: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setIsLoading(false);
    }
  }, [collectionId, limit]);

  // Sprawdzenie odpowiedzi użytkownika
  const checkAnswer = useCallback(
    (answer: string) => {
      if (!currentFlashcard) return;

      const isCorrect = compareAnswers(answer, currentFlashcard.back);

      // Dodanie odpowiedzi do historii
      const answeredFlashcard: AnsweredFlashcard = {
        flashcardId: currentFlashcard.id,
        userAnswer: answer,
        isCorrect,
      };

      setSessionState((prev) => ({
        ...prev,
        answeredFlashcards: [...prev.answeredFlashcards, answeredFlashcard],
      }));

      setIsAnswerSubmitted(true);
      setIsCorrect(isCorrect);
    },
    [currentFlashcard]
  );

  // Przejście do następnej fiszki
  const goToNextFlashcard = useCallback(() => {
    if (sessionState.currentIndex >= sessionState.flashcards.length - 1) {
      // Koniec sesji
      setSessionState((prev) => ({
        ...prev,
        isFinished: true,
      }));
    } else {
      // Następna fiszka
      setSessionState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));

      // Reset stanu odpowiedzi
      setUserAnswer("");
      setIsAnswerSubmitted(false);
      setIsCorrect(false);
    }
  }, [sessionState.currentIndex, sessionState.flashcards.length]);

  // Rozpoczęcie nowej sesji
  const startNewSession = useCallback(() => {
    setSessionState({
      flashcards: [],
      currentIndex: 0,
      answeredFlashcards: [],
      isFinished: false,
    });
    setUserAnswer("");
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Zapisanie wyników sesji
  const saveSessionResults = useCallback(async () => {
    if (!sessionState.isFinished) return;

    try {
      const correctFlashcardIds = sessionState.answeredFlashcards.filter((f) => f.isCorrect).map((f) => f.flashcardId);

      const flashcardIds = sessionState.answeredFlashcards.map((f) => f.flashcardId);

      const response = await fetch("/api/practice/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcardIds,
          correctFlashcardIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`Nie udało się zapisać wyników sesji (${response.status})`);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd przy zapisie wyników");
      return false;
    }
  }, [sessionState.isFinished, sessionState.answeredFlashcards]);

  // Efekt pobierający fiszki przy pierwszym renderowaniu
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  return {
    state: {
      sessionState,
      currentFlashcard,
      userAnswer,
      isAnswerSubmitted,
      isCorrect,
      isLoading,
      error,
      sessionSummary,
    },
    actions: {
      setUserAnswer,
      checkAnswer,
      goToNextFlashcard,
      startNewSession,
      saveSessionResults,
    },
  };
};
