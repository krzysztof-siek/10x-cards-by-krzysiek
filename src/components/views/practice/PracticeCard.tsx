import React from "react";
import type { FlashcardDto } from "../../../types";
import FlashcardFront from "./FlashcardFront";
import AnswerForm from "./AnswerForm";

interface PracticeCardProps {
  flashcard: FlashcardDto;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  onAnswerSubmit: (answer: string) => void;
  isAnswerSubmitted: boolean;
}

export default function PracticeCard({
  flashcard,
  userAnswer,
  setUserAnswer,
  onAnswerSubmit,
  isAnswerSubmitted,
}: PracticeCardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
      <div className="p-6 border-b">
        <FlashcardFront front={flashcard.front} />
      </div>
      <div className="p-6">
        <AnswerForm
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          onSubmit={onAnswerSubmit}
          isDisabled={isAnswerSubmitted}
        />
      </div>
    </div>
  );
}
