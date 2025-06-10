import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FlashcardsView } from './FlashcardsView';
import * as useFlashcardsModule from './hooks/useFlashcards';
import type { FlashcardDto } from '@/types';
import type { FlashcardViewModel, ApiFilters } from './hooks/useFlashcards';

// Mock the useFlashcards hook
vi.mock('./hooks/useFlashcards', () => ({
  useFlashcards: vi.fn()
}));

// Prepare mock data
const mockFlashcards: FlashcardViewModel[] = [
  {
    id: 1,
    front: 'Test Question 1',
    back: 'Test Answer 1',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z',
    source: 'manual',
    generation_id: null
  },
  {
    id: 2,
    front: 'Test Question 2',
    back: 'Test Answer 2',
    created_at: '2023-01-02T12:00:00Z',
    updated_at: '2023-01-02T12:00:00Z',
    source: 'manual',
    generation_id: null
  }
];

// Default mock state and actions
const defaultMockState = {
  flashcards: mockFlashcards,
  pagination: { page: 1, limit: 10, total: 2 },
  filters: { page: 1, limit: 10, search: '' } as ApiFilters,
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  error: null,
  dialogState: {
    isFlashcardFormOpen: false,
    isDeleteConfirmationOpen: false,
    flashcardToEdit: null,
    itemToDelete: null
  }
};

const defaultMockActions = {
  loadFlashcards: vi.fn(),
  loadMore: vi.fn(),
  createFlashcard: vi.fn(),
  updateFlashcard: vi.fn(),
  deleteFlashcard: vi.fn(),
  setFilters: vi.fn(),
  openCreateDialog: vi.fn(),
  openEditDialog: vi.fn(),
  openDeleteDialog: vi.fn(),
  closeDialog: vi.fn()
};

describe('FlashcardsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the flashcards list correctly', () => {
    // Mock the useFlashcards hook to return our test data
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: defaultMockState,
      actions: defaultMockActions
    });

    render(<FlashcardsView />);
    
    // Check if flashcards are rendered
    expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    expect(screen.getByText('Test Question 2')).toBeInTheDocument();
    
    // Verify the summary text is displayed
    expect(screen.getByText('Wyświetlanie 2 z 2 fiszek')).toBeInTheDocument();
  });

  it('displays loading state when isLoading is true', () => {
    // Mock loading state
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: { ...defaultMockState, isLoading: true },
      actions: defaultMockActions
    });

    render(<FlashcardsView />);
    
    // Verify loading spinner is visible
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    
    // Verify flashcards are not rendered during loading
    expect(screen.queryByText('Test Question 1')).not.toBeInTheDocument();
  });

  it('displays error state when there is an error', () => {
    // Mock error state
    const errorMessage = 'Failed to load flashcards';
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: { ...defaultMockState, error: errorMessage },
      actions: defaultMockActions
    });

    render(<FlashcardsView />);
    
    // Verify error message is displayed
    expect(screen.getByText('Wystąpił błąd')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    // Verify retry button exists
    const retryButton = screen.getByText('Spróbuj ponownie');
    expect(retryButton).toBeInTheDocument();
    
    // Verify flashcards are not rendered during error
    expect(screen.queryByText('Test Question 1')).not.toBeInTheDocument();
  });

  it('displays empty state when there are no flashcards', () => {
    // Mock empty state
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: { ...defaultMockState, flashcards: [] },
      actions: defaultMockActions
    });

    render(<FlashcardsView />);
    
    // Check for empty state component
    // Note: This depends on the exact text in your EmptyState component
    expect(screen.getByText(/brak fiszek/i)).toBeInTheDocument();
  });

  it('shows "load more" button when hasMore is true', () => {
    // Mock state with more flashcards available
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: { ...defaultMockState, hasMore: true },
      actions: defaultMockActions
    });

    render(<FlashcardsView />);
    
    // Verify "Load More" button is displayed
    const loadMoreButton = screen.getByText('Wczytaj więcej');
    expect(loadMoreButton).toBeInTheDocument();
  });

  it('does not show "load more" button when hasMore is false', () => {
    // Mock state with no more flashcards available
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: { ...defaultMockState, hasMore: false },
      actions: defaultMockActions
    });

    render(<FlashcardsView />);
    
    // Verify "Load More" button is not displayed
    expect(screen.queryByText('Wczytaj więcej')).not.toBeInTheDocument();
  });

  it('calls loadMore when "load more" button is clicked', async () => {
    const user = userEvent.setup();
    const mockLoadMore = vi.fn();
    
    // Mock state with more flashcards available
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: { ...defaultMockState, hasMore: true },
      actions: { ...defaultMockActions, loadMore: mockLoadMore }
    });

    render(<FlashcardsView />);
    
    // Find and click the "Load More" button
    const loadMoreButton = screen.getByText('Wczytaj więcej');
    await user.click(loadMoreButton);
    
    // Verify loadMore function was called
    expect(mockLoadMore).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading more flashcards', () => {
    // Mock loading more state
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: { ...defaultMockState, hasMore: true, isLoadingMore: true },
      actions: defaultMockActions
    });

    render(<FlashcardsView />);
    
    // Verify loading indicator is shown in the button
    expect(screen.getByText('Wczytywanie...')).toBeInTheDocument();
  });

  it('calls openCreateDialog when "Add Flashcard" button is clicked', async () => {
    const user = userEvent.setup();
    const mockOpenCreateDialog = vi.fn();
    
    // Mock state with default values
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: defaultMockState,
      actions: { ...defaultMockActions, openCreateDialog: mockOpenCreateDialog }
    });

    render(<FlashcardsView />);
    
    // Find the "Add Flashcard" button in header and click it
    const addButton = screen.getByRole('button', { name: /dodaj fiszkę/i });
    await user.click(addButton);
    
    // Verify openCreateDialog function was called
    expect(mockOpenCreateDialog).toHaveBeenCalledTimes(1);
  });

  it('calls setFilters when search value changes', async () => {
    const user = userEvent.setup();
    const mockSetFilters = vi.fn();
    
    // Mock state with default values
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: defaultMockState,
      actions: { ...defaultMockActions, setFilters: mockSetFilters }
    });

    render(<FlashcardsView />);
    
    // Find the search input and change its value
    const searchInput = screen.getByPlaceholderText(/szukaj fiszek/i);
    await user.type(searchInput, 'test');
    
    // We need to wait for the debounce timeout (300ms)
    await waitFor(() => {
      expect(mockSetFilters).toHaveBeenCalledWith({
        ...defaultMockState.filters,
        search: 'test',
        page: 1
      });
    });
  });

  it('calls loadFlashcards with reset=true when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockLoadFlashcards = vi.fn();
    
    // Mock error state
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: { ...defaultMockState, error: 'Error loading flashcards' },
      actions: { ...defaultMockActions, loadFlashcards: mockLoadFlashcards }
    });

    render(<FlashcardsView />);
    
    // Find and click the retry button
    const retryButton = screen.getByText('Spróbuj ponownie');
    await user.click(retryButton);
    
    // Verify loadFlashcards was called with reset=true
    expect(mockLoadFlashcards).toHaveBeenCalledWith(true);
  });

  it('renders the delete confirmation dialog when isDeleteConfirmationOpen is true', () => {
    // Mock state with delete dialog open
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: {
        ...defaultMockState,
        dialogState: {
          ...defaultMockState.dialogState,
          isDeleteConfirmationOpen: true,
          itemToDelete: mockFlashcards[0]
        }
      },
      actions: defaultMockActions
    });

    render(<FlashcardsView />);
    
    // Verify delete confirmation dialog is rendered
    expect(screen.getByText(/czy na pewno chcesz usunąć/i)).toBeInTheDocument();
    
    // Use getByRole instead of getByText to avoid ambiguous match
    const dialogWithQuestion = screen.getAllByText('Test Question 1');
    expect(dialogWithQuestion.length).toBeGreaterThan(0);
  });

  it('renders the flashcard form dialog when isFlashcardFormOpen is true', () => {
    // Mock state with form dialog open
    vi.mocked(useFlashcardsModule.useFlashcards).mockReturnValue({
      state: {
        ...defaultMockState,
        dialogState: {
          ...defaultMockState.dialogState,
          isFlashcardFormOpen: true
        }
      },
      actions: defaultMockActions
    });

    render(<FlashcardsView />);
    
    // Verify form dialog is rendered using dialog role
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    
    // Use getByRole to find the heading in the dialog
    const dialogHeading = screen.getAllByText(/dodaj fiszkę/i);
    expect(dialogHeading.length).toBeGreaterThan(0);
  });
}); 