import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: "flashcard" | "collection";
  itemName: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemType,
  itemName,
}: DeleteConfirmationDialogProps) {
  const title = itemType === "flashcard" ? "Usuń fiszkę" : "Usuń kolekcję";
  
  const description =
    itemType === "flashcard"
      ? "Czy na pewno chcesz usunąć tę fiszkę? Tej operacji nie można cofnąć."
      : "Czy na pewno chcesz usunąć tę kolekcję? Fiszki w tej kolekcji nie zostaną usunięte. Tej operacji nie można cofnąć.";

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangleIcon className="h-5 w-5" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {itemName && (
          <div className="my-2 rounded-md bg-muted p-3 text-center font-medium">
            {itemName}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Usuń
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 