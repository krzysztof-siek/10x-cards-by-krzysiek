import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  FlashcardDto, 
  AcceptedSuggestionDto, 
  FlashcardsCreateCommand,
  FlashcardsCreateResponseDto,
  FlashcardUpdateDto,
  FlashcardUpdateResponseDto,
  FlashcardsListResponseDto,
  Source
} from '../../types';

interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  source?: Source;
}

// Constant for test user ID for development purposes
const TEST_USER_ID = '39ad558a-561f-4b9a-9cc7-e0580476a0f8';

export class FlashcardService {
  constructor(private supabase: SupabaseClient) {}

  async list(params: SearchParams = {}): Promise<FlashcardsListResponseDto> {
    const {
      page = 1,
      limit = 20,
      search = '',
      source
    } = params;

    // Ensure valid pagination values
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    const offset = (validPage - 1) * validLimit;

    // Start building the query
    let query = this.supabase
      .from('flashcards')
      .select('id, front, back, source, generation_id, created_at, updated_at', { count: 'exact' });

    // Apply search filter if provided
    if (search) {
      query = query.or(`front.ilike.%${search}%,back.ilike.%${search}%`);
    }

    // Apply source filter if provided
    if (source) {
      query = query.eq('source', source);
    }

    // Apply pagination
    query = query.range(offset, offset + validLimit - 1).order('created_at', { ascending: false });

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch flashcards: ${error.message}`);
    }

    return {
      data: data || [],
      meta: {
        page: validPage,
        limit: validLimit,
        total: count || 0
      }
    };
  }

  async getById(id: number): Promise<FlashcardDto> {
    const { data, error } = await this.supabase
      .from('flashcards')
      .select('id, front, back, source, generation_id, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Flashcard with ID ${id} not found`);
      }
      throw new Error(`Failed to fetch flashcard: ${error.message}`);
    }

    return data;
  }

  async create(cmd: FlashcardsCreateCommand): Promise<FlashcardsCreateResponseDto> {
    const { flashcards } = cmd;
    
    // Track creation results
    const results = {
      successful: [] as FlashcardDto[],
      failed: 0
    };

    if (flashcards.length === 0) {
      return {
        flashcards: [],
        meta: {
          total: 0,
          successful: 0,
          failed: 0
        }
      };
    }

    // Process each flashcard and add user_id
    const flashcardsToInsert = flashcards.map(card => ({
      front: card.front,
      back: card.back,
      source: card.source,
      generation_id: card.generation_id,
      user_id: TEST_USER_ID // Add the test user ID for development
    }));

    // Insert all flashcards in a single operation
    const { data, error } = await this.supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select('id, front, back, source, generation_id, created_at, updated_at');

    if (error) {
      throw new Error(`Failed to create flashcards: ${error.message}`);
    }

    // All insertions were successful
    results.successful = data || [];

    return {
      flashcards: results.successful,
      meta: {
        total: flashcards.length,
        successful: results.successful.length,
        failed: results.failed
      }
    };
  }

  async update(id: number, dto: FlashcardUpdateDto): Promise<FlashcardUpdateResponseDto> {
    // First check if the flashcard exists
    await this.getById(id);
    
    // Prepare update data
    const updateData = {
      front: dto.front,
      back: dto.back,
      source: dto.source,
      generation_id: dto.generation_id,
      updated_at: new Date().toISOString()
    };

    // Update the flashcard
    const { data, error } = await this.supabase
      .from('flashcards')
      .update(updateData)
      .eq('id', id)
      .select('id, front, back, source, generation_id, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(`Failed to update flashcard: ${error.message}`);
    }

    return {
      flashcard: data
    };
  }

  async delete(id: number): Promise<void> {
    // First check if the flashcard exists
    await this.getById(id);
    
    // Delete the flashcard
    const { error } = await this.supabase
      .from('flashcards')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete flashcard: ${error.message}`);
    }
  }

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