import React from "react";

export default function EmptyState() {
  return (
    <div className="text-center py-10 max-w-md mx-auto">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 mx-auto text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Brak fiszek do ćwiczenia</h3>
      <p className="text-gray-600 mb-6">
        Wygląda na to, że nie masz jeszcze żadnych fiszek. Dodaj fiszki, aby rozpocząć ćwiczenie.
      </p>
      <div className="flex justify-center space-x-4">
        <a
          href="/flashcards"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Przejdź do moich fiszek
        </a>
        <a
          href="/generate"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Wygeneruj fiszki
        </a>
      </div>
    </div>
  );
}
