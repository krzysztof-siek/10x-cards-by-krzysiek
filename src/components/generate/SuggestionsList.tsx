import { Button } from "../ui/button";
import { SuggestionItem } from "./SuggestionItem";
import type { SuggestionViewModel } from "./useFlashcardGenerator";

interface SuggestionsListProps {
  suggestions: SuggestionViewModel[];
  onSave: () => void;
  onSuggestionChange: (id: string, front: string, back: string) => void;
  onSuggestionToggle: (id: string) => void;
  onSuggestionDelete: (id: string) => void;
  isSaving: boolean;
}

export const SuggestionsList = ({
  suggestions,
  onSave,
  onSuggestionChange,
  onSuggestionToggle,
  onSuggestionDelete,
  isSaving,
}: SuggestionsListProps) => {
  // Calculate counts for the summary
  const totalCount = suggestions.length;
  const selectedCount = suggestions.filter((s) => s.isSelected).length;

  // Check if Save button should be disabled
  const isSaveDisabled = selectedCount === 0 || isSaving;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium">{selectedCount}</span> z <span className="font-medium">{totalCount}</span>{" "}
          propozycji wybranych
        </div>
        <Button onClick={onSave} disabled={isSaveDisabled} className="min-w-[120px]">
          {isSaving ? "Zapisywanie..." : "Zapisz wybrane"}
        </Button>
      </div>

      {totalCount === 0 ? (
        <div className="text-center py-10 text-gray-500">Brak dostępnych propozycji.</div>
      ) : (
        <ul className="space-y-4">
          {suggestions.map((suggestion) => (
            <SuggestionItem
              key={suggestion.id}
              suggestion={suggestion}
              onToggle={onSuggestionToggle}
              onDelete={onSuggestionDelete}
              onUpdate={onSuggestionChange}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
