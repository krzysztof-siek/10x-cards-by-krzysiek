import { useState } from "react";
import type { ChangeEvent } from "react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { SuggestionViewModel } from "./useFlashcardGenerator";

interface SuggestionItemProps {
  suggestion: SuggestionViewModel;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, front: string, back: string) => void;
}

export const SuggestionItem = ({ suggestion, onToggle, onDelete, onUpdate }: SuggestionItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(suggestion.front);
  const [editedBack, setEditedBack] = useState(suggestion.back);

  const handleToggle = () => {
    onToggle(suggestion.id);
  };

  const handleDelete = () => {
    onDelete(suggestion.id);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onUpdate(suggestion.id, editedFront, editedBack);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedFront(suggestion.front);
    setEditedBack(suggestion.back);
    setIsEditing(false);
  };

  return (
    <li className="flex flex-col gap-3 p-4 border rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id={`suggestion-${suggestion.id}`} checked={suggestion.isSelected} onCheckedChange={handleToggle} />
          <label
            htmlFor={`suggestion-${suggestion.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {suggestion.isEdited ? (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded ml-2">Edytowane</span>
            ) : null}
          </label>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Anuluj
              </Button>
              <Button size="sm" onClick={handleSaveClick}>
                Zapisz zmiany
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                Edytuj
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Usuń
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <div className="text-sm font-medium mb-1">Przód:</div>
          {isEditing ? (
            <Input
              value={editedFront}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedFront(e.target.value)}
              className="w-full"
              maxLength={200}
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md">{suggestion.front}</div>
          )}
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Tył:</div>
          {isEditing ? (
            <Input
              value={editedBack}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedBack(e.target.value)}
              className="w-full"
              maxLength={500}
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md">{suggestion.back}</div>
          )}
        </div>
      </div>
    </li>
  );
};
