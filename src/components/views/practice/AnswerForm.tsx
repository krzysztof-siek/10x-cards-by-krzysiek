import React from "react";

interface AnswerFormProps {
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  onSubmit: (answer: string) => void;
  isDisabled: boolean;
}

export default function AnswerForm({ userAnswer, setUserAnswer, onSubmit, isDisabled }: AnswerFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer.trim()) {
      onSubmit(userAnswer);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
          Twoja odpowiedź
        </label>
        <textarea
          id="answer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={isDisabled}
          className={`w-full p-3 border rounded-md ${isDisabled ? "bg-gray-100" : "bg-white"}`}
          rows={3}
          placeholder="Wpisz swoją odpowiedź..."
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isDisabled || !userAnswer.trim()}
          className={`px-4 py-2 rounded-md ${
            isDisabled || !userAnswer.trim()
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Sprawdź
        </button>
      </div>
    </form>
  );
}
