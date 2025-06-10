import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import type { GenerateFlashcardsCommand } from '../../types';

interface SourceTextFormProps {
  isLoading: boolean;
  onSubmit: (data: GenerateFlashcardsCommand) => void;
}

export const SourceTextForm = ({ 
  isLoading, 
  onSubmit 
}: SourceTextFormProps) => {
  const [sourceText, setSourceText] = useState('');
  
  // Validation constraints
  const MIN_LENGTH = 1000;
  const MAX_LENGTH = 10000;
  const textLength = sourceText.length;
  const isTextValid = textLength >= MIN_LENGTH && textLength <= MAX_LENGTH;
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isTextValid && !isLoading) {
      onSubmit({ source_text: sourceText });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          placeholder="Wklej swój tekst tutaj (1 000-10 000 znaków)..."
          value={sourceText}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSourceText(e.target.value)}
          rows={10}
          className="w-full resize-none font-mono text-sm"
          disabled={isLoading}
        />
        
        <div className="flex justify-between text-sm mt-1">
          <div className={textLength > 0 && !isTextValid ? "text-red-500" : "text-gray-500"}>
            {textLength} / {MAX_LENGTH} znaków
          </div>
          {textLength > 0 && textLength < MIN_LENGTH && (
            <div className="text-amber-600">
              Wymagane minimum {MIN_LENGTH} znaków
            </div>
          )}
          {textLength > MAX_LENGTH && (
            <div className="text-red-600">
              Tekst jest zbyt długi
            </div>
          )}
        </div>
      </div>
      
      <Button 
        type="submit"
        disabled={!isTextValid || isLoading}
        className="w-full"
      >
        {isLoading ? 'Generowanie...' : 'Generuj fiszki'}
      </Button>
    </form>
  );
}; 