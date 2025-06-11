import React from "react";

interface FeedbackDisplayProps {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  isVisible: boolean;
}

export default function FeedbackDisplay({ isCorrect, userAnswer, correctAnswer, isVisible }: FeedbackDisplayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`p-4 rounded-md mb-6 ${
        isCorrect ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"
      }`}
    >
      <div className="flex items-center mb-2">
        {isCorrect ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium text-green-700">Poprawna odpowiedź!</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium text-red-700">Niepoprawna odpowiedź</span>
          </>
        )}
      </div>

      {!isCorrect && (
        <div className="mt-2">
          <div className="text-sm text-gray-600 mb-1">Twoja odpowiedź:</div>
          <div className="p-2 bg-white rounded border border-gray-200 text-red-700">{userAnswer}</div>
          <div className="text-sm text-gray-600 mt-3 mb-1">Poprawna odpowiedź:</div>
          <div className="p-2 bg-white rounded border border-gray-200 text-green-700">{correctAnswer}</div>
        </div>
      )}
    </div>
  );
}
