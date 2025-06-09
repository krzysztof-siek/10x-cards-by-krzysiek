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
import { PencilIcon, TrashIcon, BrainIcon, UserIcon, CalendarIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Source } from "../../types";

interface FlashcardsTableProps {
  flashcards: FlashcardViewModel[];
  onEdit: (flashcard: FlashcardViewModel) => void;
  onDelete: (flashcard: FlashcardViewModel) => void;
}

// Komponent dla tekstu z ucinaniem i tooltipem
function TruncatedText({ text, className }: { text: string; className?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("block truncate w-full cursor-help", className)}>
            {text}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="max-w-md p-4">
          <p className="max-h-[300px] overflow-y-auto break-words">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Format daty dla wyświetlania
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

// Komponent dla wyświetlania źródła fiszki
function SourceBadge({ source }: { source: Source }) {
  let label: string;
  let variant: "default" | "outline" | "secondary" | "destructive";
  let icon = null;
  
  switch (source) {
    case 'ai-full':
      label = "AI";
      variant = "secondary";
      icon = <BrainIcon className="h-3 w-3 mr-1" />;
      break;
    case 'ai-edited':
      label = "AI (edytowane)";
      variant = "outline";
      icon = <BrainIcon className="h-3 w-3 mr-1" />;
      break;
    case 'manual':
    default:
      label = "Ręcznie";
      variant = "default";
      icon = <UserIcon className="h-3 w-3 mr-1" />;
      break;
  }
  
  return (
    <Badge variant={variant} className="inline-flex items-center">
      {icon}
      {label}
    </Badge>
  );
}

export function FlashcardsTable({ flashcards, onEdit, onDelete }: FlashcardsTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Przód</TableHead>
              <TableHead className="w-[30%]">Tył</TableHead>
              <TableHead className="w-[15%]">Typ</TableHead>
              <TableHead className="w-[15%]">Utworzono</TableHead>
              <TableHead className="w-[10%] text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flashcards.map((flashcard) => (
              <TableRow key={flashcard.id}>
                <TableCell className="font-medium w-[30%] p-3 align-top">
                  <div className="w-full overflow-hidden">
                    <TruncatedText text={flashcard.front} className="font-medium" />
                  </div>
                </TableCell>
                <TableCell className="w-[30%] p-3 align-top">
                  <div className="w-full overflow-hidden">
                    <TruncatedText text={flashcard.back} />
                  </div>
                </TableCell>
                <TableCell className="w-[15%] p-3 align-top">
                  <SourceBadge source={flashcard.source} />
                </TableCell>
                <TableCell className="w-[15%] p-3 align-top text-muted-foreground text-sm">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1.5" />
                    {formatDate(flashcard.created_at)}
                  </div>
                </TableCell>
                <TableCell className="text-right w-[10%] p-3 align-top">
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
    </div>
  );
} 