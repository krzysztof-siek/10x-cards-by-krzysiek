export const GlobalSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="h-10 w-10 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700 font-medium">Generating flashcards...</p>
        <p className="text-gray-500 text-sm mt-1">This may take a moment</p>
      </div>
    </div>
  );
}; 