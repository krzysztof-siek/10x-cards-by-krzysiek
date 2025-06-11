import React from "react";
import { usePractice } from "../../../lib/hooks/usePractice";
import PracticeCard from "./PracticeCard";
import FeedbackDisplay from "./FeedbackDisplay";
import PracticeControls from "./PracticeControls";
import PracticeSessionSummary from "./PracticeSessionSummary";
import EmptyState from "./EmptyState";

export default function PracticeView() {
  const { state, actions } = usePractice();
  const { sessionState, currentFlashcard, userAnswer, isAnswerSubmitted, isCorrect, isLoading, error, sessionSummary } =
    state;

  const { setUserAnswer, checkAnswer, goToNextFlashcard, startNewSession } = actions;

  // Obsługa błędu
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button onClick={startNewSession} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  // Ładowanie
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Brak fiszek
  if (!isLoading && sessionState.flashcards.length === 0) {
    return <EmptyState />;
  }

  // Zakończona sesja
  if (sessionState.isFinished && sessionSummary) {
    return (
      <PracticeSessionSummary
        correctCount={sessionSummary.correctCount}
        totalCount={sessionSummary.totalCount}
        accuracy={sessionSummary.accuracy}
        onStartNewSession={startNewSession}
      />
    );
  }

  // Sesja w trakcie
  return (
    <div className="max-w-2xl mx-auto">
      {currentFlashcard && (
        <>
          <PracticeCard
            flashcard={currentFlashcard}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            onAnswerSubmit={checkAnswer}
            isAnswerSubmitted={isAnswerSubmitted}
          />

          {isAnswerSubmitted && (
            <FeedbackDisplay
              isCorrect={isCorrect}
              userAnswer={userAnswer}
              correctAnswer={currentFlashcard.back}
              isVisible={isAnswerSubmitted}
            />
          )}

          <PracticeControls
            currentIndex={sessionState.currentIndex}
            totalCount={sessionState.flashcards.length}
            onNext={goToNextFlashcard}
            isAnswerSubmitted={isAnswerSubmitted}
          />
        </>
      )}
    </div>
  );
}
