import { z } from "zod";

// Define the base flashcard schema
export const flashcardBaseSchema = z
  .object({
    front: z.string().max(200, "Front text cannot exceed 200 characters"),
    back: z.string().max(500, "Back text cannot exceed 500 characters"),
    source: z.enum(["manual", "ai-full", "ai-edited"], {
      errorMap: () => ({ message: "Source must be one of: manual, ai-full, ai-edited" }),
    }),
    generation_id: z.number().nullable(),
  })
  .refine(
    (data) => {
      // If source is 'manual', generation_id must be null
      if (data.source === "manual" && data.generation_id !== null) {
        return false;
      }

      // If source is 'ai-full' or 'ai-edited', generation_id must not be null
      if ((data.source === "ai-full" || data.source === "ai-edited") && data.generation_id === null) {
        return false;
      }

      return true;
    },
    {
      message: 'For "manual" source, generation_id must be null. For AI sources, generation_id is required.',
      path: ["generation_id"],
    }
  );

// Schema for creating a single flashcard
export const flashcardCreateSchema = flashcardBaseSchema;

// Schema for creating multiple flashcards
export const flashcardsCreateSchema = z.object({
  flashcards: z
    .array(flashcardCreateSchema)
    .min(1, "At least one flashcard must be provided")
    .max(100, "Cannot create more than 100 flashcards at once"),
});

// Schema for updating a flashcard
export const flashcardUpdateSchema = flashcardBaseSchema;

// Schema for search parameters
export const flashcardsSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  source: z.enum(["manual", "ai-full", "ai-edited"]).optional(),
  random: z.boolean().optional().default(false),
});
