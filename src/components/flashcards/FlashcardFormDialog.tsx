import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { FlashcardCreateDto, FlashcardUpdateDto, Source } from "../../types";
import type { FlashcardViewModel } from "./hooks/useFlashcards";

// Validation schema
const flashcardSchema = z.object({
  front: z
    .string()
    .min(1, "Przód fiszki jest wymagany")
    .max(200, "Przód fiszki może mieć maksymalnie 200 znaków"),
  back: z
    .string()
    .min(1, "Tył fiszki jest wymagany")
    .max(500, "Tył fiszki może mieć maksymalnie 500 znaków"),
  source: z.string() as z.ZodType<Source>,
  generation_id: z.number().nullable(),
});

type FlashcardFormValues = z.infer<typeof flashcardSchema>;

interface FlashcardFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FlashcardCreateDto | FlashcardUpdateDto) => void;
  flashcardToEdit?: FlashcardViewModel | null;
  error?: string | null;
}

export function FlashcardFormDialog({
  isOpen,
  onClose,
  onSave,
  flashcardToEdit,
  error,
}: FlashcardFormDialogProps) {
  const isEditing = !!flashcardToEdit;
  const title = isEditing ? "Edytuj fiszkę" : "Dodaj fiszkę";
  const isAiSource = flashcardToEdit?.source === 'ai-full' || flashcardToEdit?.source === 'ai-edited';

  // Form with zod validation
  const form = useForm<FlashcardFormValues>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      front: "",
      back: "",
      source: "manual" as Source,
      generation_id: null,
    },
  });

  // Reset form when dialog opens/closes or when flashcardToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (flashcardToEdit) {
        form.reset({
          front: flashcardToEdit.front,
          back: flashcardToEdit.back,
          source: flashcardToEdit.source,
          generation_id: flashcardToEdit.generation_id,
        });
      } else {
        form.reset({
          front: "",
          back: "",
          source: "manual" as Source,
          generation_id: null,
        });
      }
    }
  }, [isOpen, flashcardToEdit, form]);

  const onSubmit = (values: FlashcardFormValues) => {
    // If creating a new flashcard, ensure source is 'manual' and generation_id is null
    if (!isEditing) {
      values.source = 'manual';
      values.generation_id = null;
    }
    // If editing an AI-generated card, change source to 'ai-edited'
    else if (isAiSource) {
      values.source = 'ai-edited';
    }
    
    onSave(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {isAiSource && (
            <div className="text-sm text-muted-foreground mt-1">
              Edycja fiszki wygenerowanej przez AI spowoduje zmianę jej typu na "AI (edytowane)".
            </div>
          )}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="front"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Przód</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Wpisz treść przodu fiszki"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="back"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Tył</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Wpisz treść tyłu fiszki"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Anuluj
              </Button>
              <Button type="submit">Zapisz</Button>
            </DialogFooter>
          </form>
        </Form>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
} 