import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { type FlashcardViewModel } from "./hooks/useFlashcards";
import { PencilIcon, TrashIcon } from "lucide-react";

interface FlashcardsTableProps {
  flashcards: FlashcardViewModel[];
  onEdit: (flashcard: FlashcardViewModel) => void;
  onDelete: (flashcard: FlashcardViewModel) => void;
}

export function FlashcardsTable({ flashcards, onEdit, onDelete }: FlashcardsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Przód</TableHead>
            <TableHead className="w-1/2">Tył</TableHead>
            <TableHead className="w-[100px] text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flashcards.map((flashcard) => (
            <TableRow key={flashcard.id}>
              <TableCell className="font-medium">{flashcard.front}</TableCell>
              <TableCell>{flashcard.back}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(flashcard)}
                    aria-label="Edytuj fiszkę"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(flashcard)}
                    aria-label="Usuń fiszkę"
                    disabled={flashcard.isDeleting}
                    className={flashcard.isDeleting ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {flashcard.isDeleting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                    ) : (
                      <TrashIcon className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 