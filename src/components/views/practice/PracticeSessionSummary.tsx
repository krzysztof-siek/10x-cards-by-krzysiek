import React from "react";

interface PracticeSessionSummaryProps {
  correctCount: number;
  totalCount: number;
  accuracy: number;
  onStartNewSession: () => void;
}

export default function PracticeSessionSummary({
  correctCount,
  totalCount,
  accuracy,
  onStartNewSession,
}: PracticeSessionSummaryProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Podsumowanie sesji</h2>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span className="font-medium">Liczba fiszek:</span>
          <span>{totalCount}</span>
        </div>

        <div className="flex justify-between items-center p-3 bg-green-50 rounded">
          <span className="font-medium text-green-800">Poprawne odpowiedzi:</span>
          <span className="text-green-800">{correctCount}</span>
        </div>

        <div className="flex justify-between items-center p-3 bg-red-50 rounded">
          <span className="font-medium text-red-800">Niepoprawne odpowiedzi:</span>
          <span className="text-red-800">{totalCount - correctCount}</span>
        </div>

        <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
          <span className="font-medium text-blue-800">Dokładność:</span>
          <span className="text-blue-800">{accuracy.toFixed(1)}%</span>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onStartNewSession}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Rozpocznij nową sesję
        </button>
      </div>

      {accuracy >= 80 ? (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded text-center">
          <p className="font-medium">Świetna robota! 🎉</p>
          <p className="text-sm mt-1">Utrzymuj taką skuteczność a szybko opanujesz materiał!</p>
        </div>
      ) : accuracy >= 50 ? (
        <div className="mt-6 p-4 bg-yellow-100 text-yellow-800 rounded text-center">
          <p className="font-medium">Dobry wynik! 👍</p>
          <p className="text-sm mt-1">Kontynuuj naukę, aby poprawić swoją skuteczność.</p>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-red-100 text-red-800 rounded text-center">
          <p className="font-medium">Nie poddawaj się! 💪</p>
          <p className="text-sm mt-1">Regularne powtórki pomogą ci poprawić wyniki.</p>
        </div>
      )}
    </div>
  );
}
