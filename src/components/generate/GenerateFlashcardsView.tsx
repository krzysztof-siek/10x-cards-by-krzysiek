import { useEffect } from "react";
import { SourceTextForm } from "./SourceTextForm";
import { SuggestionsList } from "./SuggestionsList";
import { GlobalSpinner } from "./GlobalSpinner";
import { useFlashcardGenerator } from "./useFlashcardGenerator";
import type { GenerateFlashcardsCommand } from "../../types";
import { toast } from "sonner";

export const GenerateFlashcardsView = () => {
  const {
    suggestions,
    isLoading,
    isSaving,
    error,
    generateSuggestions,
    saveSuggestions,
    updateSuggestion,
    toggleSuggestion,
    deleteSuggestion,
  } = useFlashcardGenerator();

  // Handle form submission to generate flashcards
  const handleGenerateSubmit = async (data: GenerateFlashcardsCommand) => {
    try {
      await generateSuggestions(data);
    } catch {
      // Error is already handled in the hook
    }
  };

  // Handle saving selected flashcards
  const handleSaveSuggestions = async () => {
    try {
      const result = await saveSuggestions();

      if (result) {
        toast.success("Sukces!", {
          description: `${result.flashcards.length} fiszek zostało zapisanych do Twojej kolekcji.`,
        });
      }
    } catch {
      // Error is already handled in the hook
    }
  };

  // Show error notifications when errors occur
  useEffect(() => {
    if (error) {
      toast.error("Błąd", {
        description: error.message || "Wystąpił nieoczekiwany błąd",
      });
    }
  }, [error]);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Generuj fiszki z pomocą AI</h1>
          <p className="text-gray-600">
            Wklej swój tekst poniżej, aby wygenerować propozycje fiszek przy pomocy sztucznej inteligencji. Możesz
            przeglądać, edytować i wybierać, które z nich chcesz zapisać do swojej kolekcji.
          </p>
        </div>

        {/* Show either the form or suggestions based on state */}
        {suggestions.length === 0 ? (
          <div className="bg-white p-6 rounded-lg border">
            <SourceTextForm isLoading={isLoading} onSubmit={handleGenerateSubmit} />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg border">
            <SuggestionsList
              suggestions={suggestions}
              onSave={handleSaveSuggestions}
              onSuggestionChange={updateSuggestion}
              onSuggestionToggle={toggleSuggestion}
              onSuggestionDelete={deleteSuggestion}
              isSaving={isSaving}
            />
          </div>
        )}
      </div>

      {/* Global spinner for loading state */}
      {isLoading && <GlobalSpinner />}
    </div>
  );
};
