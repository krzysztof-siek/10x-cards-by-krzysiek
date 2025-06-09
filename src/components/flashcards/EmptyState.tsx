import { Button } from "@/components/ui/button";
import { FileTextIcon, PlusIcon } from "lucide-react";

interface EmptyStateProps {
  onAddFlashcard: () => void;
}

export function EmptyState({ onAddFlashcard }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileTextIcon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Brak fiszek</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Nie masz jeszcze żadnych fiszek. Zacznij tworzyć swoje materiały do nauki już teraz!
      </p>
      <Button onClick={onAddFlashcard} className="mt-4">
        <PlusIcon className="mr-2 h-4 w-4" />
        Dodaj pierwszą fiszkę
      </Button>
    </div>
  );
} 