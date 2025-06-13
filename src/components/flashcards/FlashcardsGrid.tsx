import { type FlashcardViewModel } from "./hooks/useFlashcards";
import { PencilIcon, TrashIcon, BrainIcon, UserIcon, CalendarIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Source } from "../../types";

interface FlashcardsGridProps {
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
          <span className={cn("block truncate w-full cursor-help", className)}>{text}</span>
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
  return new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Komponent dla wyświetlania źródła fiszki
function SourceBadge({ source }: { source: Source }) {
  let label: string;
  let variant: "default" | "outline" | "secondary" | "destructive";
  let icon = null;

  switch (source) {
    case "ai-full":
      label = "AI";
      variant = "secondary";
      icon = <BrainIcon className="h-3 w-3 mr-1" />;
      break;
    case "ai-edited":
      label = "AI (edytowane)";
      variant = "outline";
      icon = <BrainIcon className="h-3 w-3 mr-1" />;
      break;
    case "manual":
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

// Komponent pojedynczej karty fiszki
function FlashcardCard({
  flashcard,
  onEdit,
  onDelete,
}: {
  flashcard: FlashcardViewModel;
  onEdit: (flashcard: FlashcardViewModel) => void;
  onDelete: (flashcard: FlashcardViewModel) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg shadow-sm bg-card overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">
            <TruncatedText text={flashcard.front} className="font-medium" />
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded-full"
            aria-label={isExpanded ? "Zwiń" : "Rozwiń"}
          >
            {isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Tył:</h4>
            <p className="text-sm mb-3">
              <TruncatedText text={flashcard.back} />
            </p>

            <div className="flex flex-wrap gap-2 items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <SourceBadge source={flashcard.source} />
                <span className="text-xs text-muted-foreground flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1.5" />
                  {formatDate(flashcard.created_at)}
                </span>
              </div>

              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(flashcard)} aria-label="Edytuj fiszkę">
                  <PencilIcon className="h-4 w-4 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:inline-block">Edytuj</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(flashcard)}
                  aria-label="Usuń fiszkę"
                  disabled={flashcard.isDeleting}
                  className={flashcard.isDeleting ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {flashcard.isDeleting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current mr-1"></div>
                  ) : (
                    <TrashIcon className="h-4 w-4 text-destructive mr-1" />
                  )}
                  <span className="sr-only sm:not-sr-only sm:inline-block">Usuń</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isExpanded && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">Kliknij, aby zobaczyć więcej</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(flashcard)} aria-label="Edytuj fiszkę">
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(flashcard)}
                aria-label="Usuń fiszkę"
                disabled={flashcard.isDeleting}
              >
                {flashcard.isDeleting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                ) : (
                  <TrashIcon className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Widok tabeli dla większych ekranów
function TableView({ flashcards, onEdit, onDelete }: FlashcardsGridProps) {
  return (
    <div className="rounded-md border overflow-hidden hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-muted/50">
              <th className="w-[30%] text-left p-3 font-medium">Przód</th>
              <th className="w-[30%] text-left p-3 font-medium">Tył</th>
              <th className="w-[15%] text-left p-3 font-medium">Typ</th>
              <th className="w-[15%] text-left p-3 font-medium">Utworzono</th>
              <th className="w-[10%] text-right p-3 font-medium">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {flashcards.map((flashcard) => (
              <tr key={flashcard.id} className="border-t">
                <td className="font-medium w-[30%] p-3 align-top">
                  <div className="w-full overflow-hidden">
                    <TruncatedText text={flashcard.front} className="font-medium" />
                  </div>
                </td>
                <td className="w-[30%] p-3 align-top">
                  <div className="w-full overflow-hidden">
                    <TruncatedText text={flashcard.back} />
                  </div>
                </td>
                <td className="w-[15%] p-3 align-top">
                  <SourceBadge source={flashcard.source} />
                </td>
                <td className="w-[15%] p-3 align-top text-muted-foreground text-sm">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1.5" />
                    {formatDate(flashcard.created_at)}
                  </div>
                </td>
                <td className="text-right w-[10%] p-3 align-top">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(flashcard)} aria-label="Edytuj fiszkę">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Widok kart dla mniejszych ekranów
function CardView({ flashcards, onEdit, onDelete }: FlashcardsGridProps) {
  return (
    <div className="md:hidden space-y-4">
      {flashcards.map((flashcard) => (
        <FlashcardCard key={flashcard.id} flashcard={flashcard} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export function FlashcardsGrid({ flashcards, onEdit, onDelete }: FlashcardsGridProps) {
  return (
    <>
      <TableView flashcards={flashcards} onEdit={onEdit} onDelete={onDelete} />
      <CardView flashcards={flashcards} onEdit={onEdit} onDelete={onDelete} />
    </>
  );
}
