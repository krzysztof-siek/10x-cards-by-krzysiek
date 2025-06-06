import { useState } from 'react';
import type { 
  GenerateFlashcardsCommand, 
  SuggestionDto, 
  ApiErrorDto,
  AcceptSuggestionsCommand,
  AcceptedSuggestionDto
} from '../../types';

// View model for suggestions with UI-specific properties
export interface SuggestionViewModel {
  id: string;
  front: string;
  back: string;
  isSelected: boolean;
  isEdited: boolean;
  originalFront: string;
  originalBack: string;
}

// State for the generator component
export interface GenerationState {
  suggestions: SuggestionViewModel[];
  generationId: number | null;
  isLoading: boolean;
  isSaving: boolean;
  error: ApiErrorDto | null;
}

export const useFlashcardGenerator = () => {
  const [state, setState] = useState<GenerationState>({
    suggestions: [],
    generationId: null,
    isLoading: false,
    isSaving: false,
    error: null
  });

  // Generate suggestions from text
  const generateSuggestions = async (command: GenerateFlashcardsCommand) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(command)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const data = await response.json();
      
      // Map API DTO to ViewModel
      const suggestions: SuggestionViewModel[] = data.suggestions.map((suggestion: SuggestionDto) => ({
        id: crypto.randomUUID(),
        front: suggestion.front,
        back: suggestion.back,
        isSelected: true, // Default to selected
        isEdited: false,
        originalFront: suggestion.front,
        originalBack: suggestion.back
      }));

      setState({
        suggestions,
        generationId: data.generation.id,
        isLoading: false,
        isSaving: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as ApiErrorDto
      }));
    }
  };

  // Save selected and possibly edited suggestions
  const saveSuggestions = async () => {
    if (!state.generationId) return;
    
    setState(prev => ({ ...prev, isSaving: true, error: null }));
    
    try {
      // Filter only selected suggestions
      const selectedSuggestions = state.suggestions.filter(s => s.isSelected);
      
      // Map to API DTO format
      const accepted: AcceptedSuggestionDto[] = selectedSuggestions.map(suggestion => ({
        front: suggestion.front,
        back: suggestion.back,
        edited: suggestion.isEdited
      }));
      
      const command: AcceptSuggestionsCommand = { accepted };
      
      const response = await fetch(`/api/generations/${state.generationId}/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(command)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      // Reset state after successful save
      setState({
        suggestions: [],
        generationId: null,
        isLoading: false,
        isSaving: false,
        error: null
      });
      
      return await response.json();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error as ApiErrorDto
      }));
    }
  };

  // Update a suggestion (when editing)
  const updateSuggestion = (id: string, front: string, back: string) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(suggestion => {
        if (suggestion.id === id) {
          const isEdited = 
            front !== suggestion.originalFront || 
            back !== suggestion.originalBack;
          
          return {
            ...suggestion,
            front,
            back,
            isEdited
          };
        }
        return suggestion;
      })
    }));
  };

  // Toggle selection state of a suggestion
  const toggleSuggestion = (id: string) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(suggestion => {
        if (suggestion.id === id) {
          return {
            ...suggestion,
            isSelected: !suggestion.isSelected
          };
        }
        return suggestion;
      })
    }));
  };

  // Delete a suggestion from the list
  const deleteSuggestion = (id: string) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(suggestion => suggestion.id !== id)
    }));
  };

  // Get count of selected suggestions
  const getSelectedCount = () => {
    return state.suggestions.filter(s => s.isSelected).length;
  };

  return {
    ...state,
    generateSuggestions,
    saveSuggestions,
    updateSuggestion,
    toggleSuggestion,
    deleteSuggestion,
    getSelectedCount
  };
}; 