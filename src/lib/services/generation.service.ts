import type { SupabaseClient } from '@supabase/supabase-js';
import type { Generation, SuggestionDto } from '../../types';
import crypto from 'crypto';

export class GenerationService {
  constructor(private supabase: SupabaseClient) {}

  async createGeneration(params: {
    userId: string;
    sourceText: string;
    suggestions: SuggestionDto[];
    model: string;
    generationDurationMs: number;
  }): Promise<Generation> {
    const { userId, sourceText, suggestions, model, generationDurationMs } = params;
    
    const sourceTextHash = crypto
      .createHash('sha256')
      .update(sourceText)
      .digest('hex');

    const { data, error } = await this.supabase
      .from('generations')
      .insert({
        user_id: userId,
        model,
        generated_count: suggestions.length,
        source_text_hash: sourceTextHash,
        source_text_length: sourceText.length,
        generation_duration: generationDurationMs,
        accepted_edited_count: 0,
        accepted_unedited_count: 0
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create generation: ${error.message}`);
    }

    return data;
  }

  async logGenerationError(params: {
    userId: string;
    sourceTextHash: string;
    sourceTextLength: number;
    model: string;
    errorCode: string;
    errorMessage: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('generation_error_logs')
      .insert(params);

    if (error) {
      console.error('Failed to log generation error:', error);
    }
  }
} 