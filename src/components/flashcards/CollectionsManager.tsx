import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, FolderIcon, TrashIcon, PencilIcon } from "lucide-react";
import type { Collection } from "./hooks/useFlashcards";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

interface CollectionsManagerProps {
  collections: Collection[];
  selectedCollectionId: number | null;
  onSelectCollection: (collectionId: number | null) => void;
  onCreate: (name: string) => void;
  onDelete: (id: number) => void;
}

export function CollectionsManager({
  collections,
  selectedCollectionId,
  onSelectCollection,
  onCreate,
  onDelete,
}: CollectionsManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      onCreate(newCollectionName.trim());
      setNewCollectionName("");
      setIsCreating(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (collectionToDelete) {
      onDelete(collectionToDelete.id);
      setCollectionToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Kolekcje</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCreating(true)}
          aria-label="Dodaj kolekcję"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="space-y-2">
          <Input
            placeholder="Nazwa kolekcji"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            autoFocus
          />
          <div className="flex space-x-2">
            <Button type="submit" size="sm" disabled={!newCollectionName.trim()}>
              Zapisz
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setNewCollectionName("");
              }}
            >
              Anuluj
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-1">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className={`flex items-center justify-between rounded-md px-3 py-2 ${
              selectedCollectionId === collection.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <button
              className="flex items-center space-x-2 text-left"
              onClick={() => onSelectCollection(collection.id)}
            >
              <FolderIcon className="h-4 w-4" />
              <span>{collection.name}</span>
              {collection.flashcard_count !== undefined && (
                <span className="text-xs opacity-70">({collection.flashcard_count})</span>
              )}
            </button>
            
            {collection.id !== 1 && ( // Assuming ID 1 is "All" or a default collection
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 ${
                  selectedCollectionId === collection.id
                    ? "hover:bg-primary-foreground/20"
                    : "hover:bg-accent-foreground/20"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCollectionToDelete(collection);
                }}
                aria-label={`Usuń kolekcję ${collection.name}`}
              >
                <TrashIcon className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <DeleteConfirmationDialog
        isOpen={!!collectionToDelete}
        onClose={() => setCollectionToDelete(null)}
        onConfirm={handleDeleteConfirm}
        itemType="collection"
        itemName={collectionToDelete?.name || ""}
      />
    </div>
  );
} 