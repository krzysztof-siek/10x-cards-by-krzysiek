import type { SupabaseClient } from '@supabase/supabase-js';
import type { FlashcardDto, AcceptedSuggestionDto } from '../../types';

export class FlashcardService {
  constructor(private supabase: SupabaseClient) {}

  async saveAcceptedSuggestions(params: {
    userId: string;
    generationId: number;
    acceptedSuggestions: AcceptedSuggestionDto[];
  }): Promise<FlashcardDto[]> {
    const { userId, generationId, acceptedSuggestions } = params;

    // Przygotuj fiszki do zapisania
    const flashcardsToInsert = acceptedSuggestions.map(suggestion => ({
      user_id: userId,
      front: suggestion.front,
      back: suggestion.back,
      source: suggestion.edited ? 'ai-edited' : 'ai-full',
      generation_id: generationId
    }));

    // Zapisz fiszki w bazie danych
    const { data, error } = await this.supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to save flashcards: ${error.message}`);
    }

    // Zaktualizuj liczniki w tabeli generations
    const editedCount = acceptedSuggestions.filter(s => s.edited).length;
    const uneditedCount = acceptedSuggestions.length - editedCount;

    await this.updateGenerationCounts({
      generationId,
      editedCount,
      uneditedCount
    });

    return data;
  }

  private async updateGenerationCounts(params: {
    generationId: number;
    editedCount: number;
    uneditedCount: number;
  }): Promise<void> {
    const { generationId, editedCount, uneditedCount } = params;

    const { error } = await this.supabase
      .from('generations')
      .update({
        accepted_edited_count: editedCount,
        accepted_unedited_count: uneditedCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', generationId);

    if (error) {
      console.error('Failed to update generation counts:', error);
    }
  }
} 