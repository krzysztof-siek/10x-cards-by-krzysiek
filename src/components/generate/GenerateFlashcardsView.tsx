import { useEffect } from 'react';
import { SourceTextForm } from './SourceTextForm';
import { SuggestionsList } from './SuggestionsList';
import { GlobalSpinner } from './GlobalSpinner';
import { useFlashcardGenerator } from './useFlashcardGenerator';
import type { GenerateFlashcardsCommand } from '../../types';
import { toast } from 'sonner';

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
    getSelectedCount
  } = useFlashcardGenerator();
  
  // Handle form submission to generate flashcards
  const handleGenerateSubmit = async (data: GenerateFlashcardsCommand) => {
    try {
      await generateSuggestions(data);
    } catch (error) {
      // Error is already handled in the hook
    }
  };
  
  // Handle saving selected flashcards
  const handleSaveSuggestions = async () => {
    try {
      const result = await saveSuggestions();
      
      if (result) {
        toast.success("Success!", {
          description: `${result.flashcards.length} flashcards have been saved to your collection.`
        });
      }
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // Show error notifications when errors occur
  useEffect(() => {
    if (error) {
      toast.error("Error", {
        description: error.message || "An unexpected error occurred"
      });
    }
  }, [error]);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Generate Flashcards with AI</h1>
          <p className="text-gray-600">
            Paste your text below to generate AI-powered flashcard suggestions. You can
            review, edit, and select which ones to save to your collection.
          </p>
        </div>

        {/* Show either the form or suggestions based on state */}
        {suggestions.length === 0 ? (
          <div className="bg-white p-6 rounded-lg border">
            <SourceTextForm 
              isLoading={isLoading} 
              onSubmit={handleGenerateSubmit} 
            />
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