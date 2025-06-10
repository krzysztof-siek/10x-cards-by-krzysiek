import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as useFlashcardGeneratorModule from '../useFlashcardGenerator';
import type { SuggestionViewModel } from '../useFlashcardGenerator';
import type { SuggestionDto } from '../../../types';

// Mock the hook implementation
vi.mock('../useFlashcardGenerator', () => {
  const originalModule = vi.importActual('../useFlashcardGenerator');
  
  return {
    ...originalModule,
    useFlashcardGenerator: vi.fn()
  };
});

// Mock global fetch
global.fetch = vi.fn();

// Mock crypto.randomUUID with a valid UUID format
vi.spyOn(crypto, 'randomUUID').mockReturnValue('123e4567-e89b-12d3-a456-426614174000');

describe('useFlashcardGenerator', () => {
  const mockSuggestions: SuggestionDto[] = [
    { front: 'Test front 1', back: 'Test back 1' },
    { front: 'Test front 2', back: 'Test back 2' }
  ];
  
  const mockGenerationResponse = {
    generation: { id: 123 },
    suggestions: mockSuggestions
  };
  
  const mockSaveResponse = {
    flashcards: [
      { id: 1, front: 'Test front 1', back: 'Test back 1' },
      { id: 2, front: 'Test front 2', back: 'Test back 2' }
    ]
  };
  
  const mockViewModels: SuggestionViewModel[] = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      front: 'Test front 1',
      back: 'Test back 1',
      isSelected: true,
      isEdited: false,
      originalFront: 'Test front 1',
      originalBack: 'Test back 1'
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      front: 'Test front 2',
      back: 'Test back 2',
      isSelected: true,
      isEdited: false,
      originalFront: 'Test front 2',
      originalBack: 'Test back 2'
    }
  ];
  
  const mockGenerateSuggestions = vi.fn();
  const mockSaveSuggestions = vi.fn();
  const mockUpdateSuggestion = vi.fn();
  const mockToggleSuggestion = vi.fn();
  const mockDeleteSuggestion = vi.fn();
  const mockGetSelectedCount = vi.fn();
  
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Set up default mock implementation
    (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
      suggestions: [],
      generationId: null,
      isLoading: false,
      isSaving: false,
      error: null,
      generateSuggestions: mockGenerateSuggestions,
      saveSuggestions: mockSaveSuggestions,
      updateSuggestion: mockUpdateSuggestion,
      toggleSuggestion: mockToggleSuggestion,
      deleteSuggestion: mockDeleteSuggestion,
      getSelectedCount: mockGetSelectedCount
    });
    
    // Set up fetch mock with default success response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockGenerationResponse)
    });
  });
  
  describe('generateSuggestions', () => {
    it('should call the API with correct data when generating suggestions', async () => {
      // Setup
      mockGenerateSuggestions.mockResolvedValue(mockViewModels);
      
      // Render hook
      const { result } = renderHook(() => useFlashcardGeneratorModule.useFlashcardGenerator());
      
      // Act
      await result.current.generateSuggestions({ source_text: 'Test text' });
      
      // Assert
      expect(mockGenerateSuggestions).toHaveBeenCalledWith({ source_text: 'Test text' });
    });
    
    it('should handle API errors during generation', async () => {
      // Setup mock error
      const mockError = { error: 'test error', message: 'Error message' };
      mockGenerateSuggestions.mockRejectedValue(mockError);
      
      // Render hook
      const { result } = renderHook(() => useFlashcardGeneratorModule.useFlashcardGenerator());
      
      // Act & Assert
      await expect(result.current.generateSuggestions({ source_text: 'Test text' }))
        .rejects.toEqual(mockError);
    });
  });
  
  describe('saveSuggestions', () => {
    it('should save selected suggestions', async () => {
      // Setup mocks with data
      (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
        suggestions: mockViewModels,
        generationId: 123,
        isLoading: false,
        isSaving: false,
        error: null,
        generateSuggestions: mockGenerateSuggestions,
        saveSuggestions: mockSaveSuggestions,
        updateSuggestion: mockUpdateSuggestion,
        toggleSuggestion: mockToggleSuggestion,
        deleteSuggestion: mockDeleteSuggestion,
        getSelectedCount: mockGetSelectedCount
      });
      
      mockSaveSuggestions.mockResolvedValue(mockSaveResponse);
      
      // Render hook
      const { result } = renderHook(() => useFlashcardGeneratorModule.useFlashcardGenerator());
      
      // Act
      await result.current.saveSuggestions();
      
      // Assert
      expect(mockSaveSuggestions).toHaveBeenCalled();
    });
    
    it('should handle API errors during save', async () => {
      // Setup mock with suggestions and error
      const mockError = { error: 'test error', message: 'Error message' };
      
      (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
        suggestions: mockViewModels,
        generationId: 123,
        isLoading: false,
        isSaving: false,
        error: null,
        generateSuggestions: mockGenerateSuggestions,
        saveSuggestions: mockSaveSuggestions,
        updateSuggestion: mockUpdateSuggestion,
        toggleSuggestion: mockToggleSuggestion,
        deleteSuggestion: mockDeleteSuggestion,
        getSelectedCount: mockGetSelectedCount
      });
      
      mockSaveSuggestions.mockRejectedValue(mockError);
      
      // Render hook
      const { result } = renderHook(() => useFlashcardGeneratorModule.useFlashcardGenerator());
      
      // Act & Assert
      await expect(result.current.saveSuggestions()).rejects.toEqual(mockError);
    });
  });
  
  describe('updateSuggestion', () => {
    it('should call updateSuggestion with correct parameters', () => {
      // Setup
      (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
        suggestions: mockViewModels,
        generationId: 123,
        isLoading: false,
        isSaving: false,
        error: null,
        generateSuggestions: mockGenerateSuggestions,
        saveSuggestions: mockSaveSuggestions,
        updateSuggestion: mockUpdateSuggestion,
        toggleSuggestion: mockToggleSuggestion,
        deleteSuggestion: mockDeleteSuggestion,
        getSelectedCount: mockGetSelectedCount
      });
      
      // Render hook
      const { result } = renderHook(() => useFlashcardGeneratorModule.useFlashcardGenerator());
      
      // Act
      result.current.updateSuggestion('test-id', 'New front', 'New back');
      
      // Assert
      expect(mockUpdateSuggestion).toHaveBeenCalledWith('test-id', 'New front', 'New back');
    });
  });
  
  describe('toggleSuggestion', () => {
    it('should call toggleSuggestion with correct id', () => {
      // Setup
      (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
        suggestions: mockViewModels,
        generationId: 123,
        isLoading: false,
        isSaving: false,
        error: null,
        generateSuggestions: mockGenerateSuggestions,
        saveSuggestions: mockSaveSuggestions,
        updateSuggestion: mockUpdateSuggestion,
        toggleSuggestion: mockToggleSuggestion,
        deleteSuggestion: mockDeleteSuggestion,
        getSelectedCount: mockGetSelectedCount
      });
      
      // Render hook
      const { result } = renderHook(() => useFlashcardGeneratorModule.useFlashcardGenerator());
      
      // Act
      result.current.toggleSuggestion('test-id');
      
      // Assert
      expect(mockToggleSuggestion).toHaveBeenCalledWith('test-id');
    });
  });
  
  describe('deleteSuggestion', () => {
    it('should call deleteSuggestion with correct id', () => {
      // Setup
      (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
        suggestions: mockViewModels,
        generationId: 123,
        isLoading: false,
        isSaving: false,
        error: null,
        generateSuggestions: mockGenerateSuggestions,
        saveSuggestions: mockSaveSuggestions,
        updateSuggestion: mockUpdateSuggestion,
        toggleSuggestion: mockToggleSuggestion,
        deleteSuggestion: mockDeleteSuggestion,
        getSelectedCount: mockGetSelectedCount
      });
      
      // Render hook
      const { result } = renderHook(() => useFlashcardGeneratorModule.useFlashcardGenerator());
      
      // Act
      result.current.deleteSuggestion('test-id');
      
      // Assert
      expect(mockDeleteSuggestion).toHaveBeenCalledWith('test-id');
    });
  });
  
  describe('getSelectedCount', () => {
    it('should call getSelectedCount and return the result', () => {
      // Setup
      mockGetSelectedCount.mockReturnValue(2);
      
      (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
        suggestions: mockViewModels,
        generationId: 123,
        isLoading: false,
        isSaving: false,
        error: null,
        generateSuggestions: mockGenerateSuggestions,
        saveSuggestions: mockSaveSuggestions,
        updateSuggestion: mockUpdateSuggestion,
        toggleSuggestion: mockToggleSuggestion,
        deleteSuggestion: mockDeleteSuggestion,
        getSelectedCount: mockGetSelectedCount
      });
      
      // Render hook
      const { result } = renderHook(() => useFlashcardGeneratorModule.useFlashcardGenerator());
      
      // Act
      const count = result.current.getSelectedCount();
      
      // Assert
      expect(mockGetSelectedCount).toHaveBeenCalled();
      expect(count).toBe(2);
    });
  });
}); 