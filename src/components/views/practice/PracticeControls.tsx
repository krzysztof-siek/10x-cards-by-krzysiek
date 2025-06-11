import React from "react";

interface PracticeControlsProps {
  currentIndex: number;
  totalCount: number;
  onNext: () => void;
  isAnswerSubmitted: boolean;
}

export default function PracticeControls({
  currentIndex,
  totalCount,
  onNext,
  isAnswerSubmitted,
}: PracticeControlsProps) {
  return (
    <div className="flex justify-between items-center mt-6">
      <div className="text-gray-600">
        Fiszka {currentIndex + 1} z {totalCount}
      </div>
      <button
        onClick={onNext}
        disabled={!isAnswerSubmitted}
        className={`px-5 py-2 rounded-md ${
          isAnswerSubmitted
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-300 cursor-not-allowed text-gray-500"
        }`}
      >
        {currentIndex === totalCount - 1 ? "Zakończ" : "Następna"}
      </button>
    </div>
  );
}
