import { Button } from "@/components/ui/button";
import { FileTextIcon, PlusIcon } from "lucide-react";

interface EmptyStateProps {
  onAddFlashcard: () => void;
}

export function EmptyState({ onAddFlashcard }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <FileTextIcon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-xl font-semibold">Brak fiszek</h3>
      <p className="mt-3 text-sm text-muted-foreground max-w-md">
        Nie masz jeszcze żadnych fiszek. Zacznij tworzyć swoje materiały do nauki już teraz!
      </p>
      <Button onClick={onAddFlashcard} className="mt-6 px-6 py-2">
        <PlusIcon className="mr-2 h-4 w-4" />
        Dodaj pierwszą fiszkę
      </Button>
    </div>
  );
} 