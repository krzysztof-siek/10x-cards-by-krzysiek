import { useState, useEffect, useCallback, useRef } from "react";
import type { FlashcardDto, FlashcardCreateDto, FlashcardUpdateDto, FlashcardsListResponseDto } from "../../../types";

// Custom view model for frontend use
export interface FlashcardViewModel extends FlashcardDto {
  isDeleting?: boolean;
}

// API filters type
export interface ApiFilters {
  page: number;
  limit: number;
  search: string;
}

// Dialog state type
interface DialogState {
  isFlashcardFormOpen: boolean;
  isDeleteConfirmationOpen: boolean;
  flashcardToEdit: FlashcardViewModel | null;
  itemToDelete: FlashcardViewModel | null;
}

export function useFlashcards() {
  // Ref do śledzenia pierwszego ładowania
  const isInitialLoad = useRef(true);
  // State
  const [flashcards, setFlashcards] = useState<FlashcardViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<ApiFilters>({
    page: 1,
    limit: 10,
    search: "",
  });
  const [dialogState, setDialogState] = useState<DialogState>({
    isFlashcardFormOpen: false,
    isDeleteConfirmationOpen: false,
    flashcardToEdit: null,
    itemToDelete: null,
  });

  // Load flashcards from API
  const loadFlashcards = useCallback(
    async (reset = true) => {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        // Build query params
        const queryParams = new URLSearchParams();
        queryParams.append("page", filters.page.toString());
        queryParams.append("limit", filters.limit.toString());

        if (filters.search) {
          queryParams.append("search", filters.search);
        }

        const response = await fetch(`/api/flashcards?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data: FlashcardsListResponseDto = await response.json();

        if (reset) {
          setFlashcards(data.data);
        } else {
          setFlashcards((prev) => [...prev, ...data.data]);
        }

        setPagination(data.meta);

        // Determine if there are more items to load
        setHasMore(data.meta.page * data.meta.limit < data.meta.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      } finally {
        if (reset) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [filters]
  );

  // Load more flashcards
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setFilters((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  }, [isLoadingMore, hasMore]);

  // Obsługa zmiany filtrów
  const handleSearchChange = useCallback(
    (searchValue: string) => {
      setFilters({
        page: 1,
        limit: filters.limit,
        search: searchValue,
      });
    },
    [filters.limit]
  );

  // Load data on mount and when filters change
  useEffect(() => {
    // Przy pierwszym renderze lub gdy zmienia się search, ładujemy dane
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadFlashcards(true);
    } else if (filters.page === 1) {
      // Jeśli resetujemy do strony 1 (np. przy zmianie search), ładujemy dane
      loadFlashcards(true);
    } else {
      // Jeśli zmienił się numer strony na większy niż 1, ładujemy więcej
      loadFlashcards(false);
    }
  }, [filters, loadFlashcards]);

  // Dialog actions
  const openCreateDialog = useCallback(() => {
    setDialogState({
      isFlashcardFormOpen: true,
      isDeleteConfirmationOpen: false,
      flashcardToEdit: null,
      itemToDelete: null,
    });
  }, []);

  const openEditDialog = useCallback((flashcard: FlashcardViewModel) => {
    setDialogState({
      isFlashcardFormOpen: true,
      isDeleteConfirmationOpen: false,
      flashcardToEdit: flashcard,
      itemToDelete: null,
    });
  }, []);

  const openDeleteDialog = useCallback((flashcard: FlashcardViewModel) => {
    setDialogState({
      isFlashcardFormOpen: false,
      isDeleteConfirmationOpen: true,
      flashcardToEdit: null,
      itemToDelete: flashcard,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState({
      isFlashcardFormOpen: false,
      isDeleteConfirmationOpen: false,
      flashcardToEdit: null,
      itemToDelete: null,
    });
  }, []);

  // CRUD operations
  const createFlashcard = useCallback(
    async (data: FlashcardCreateDto) => {
      try {
        const response = await fetch("/api/flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ flashcards: [data] }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        // Reset to page 1 and reload
        setFilters((prev) => ({
          ...prev,
          page: 1,
        }));
        await loadFlashcards(true);
        closeDialog();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd podczas tworzenia fiszki");
      }
    },
    [loadFlashcards, closeDialog]
  );

  const updateFlashcard = useCallback(
    async (data: FlashcardUpdateDto) => {
      if (!dialogState.flashcardToEdit) return;

      try {
        // Jeśli edytujemy fiszkę, która była stworzona przez AI, zmień jej typ na ai-edited
        const updatedData = { ...data };
        const isAiSource =
          dialogState.flashcardToEdit.source === "ai-full" || dialogState.flashcardToEdit.source === "ai-edited";

        if (isAiSource) {
          updatedData.source = "ai-edited";
        }

        const response = await fetch(`/api/flashcards/${dialogState.flashcardToEdit.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        // Update the flashcard in the current list
        const responseData = await response.json();
        setFlashcards((current) =>
          current.map((f) => (f.id === dialogState.flashcardToEdit?.id ? responseData.flashcard : f))
        );

        closeDialog();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd podczas aktualizacji fiszki");
      }
    },
    [dialogState.flashcardToEdit, closeDialog]
  );

  const deleteFlashcard = useCallback(
    async (id: number) => {
      try {
        // Optimistic UI update
        setFlashcards((current) => current.map((f) => (f.id === id ? { ...f, isDeleting: true } : f)));

        const response = await fetch(`/api/flashcards/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        // If successful, remove from list
        setFlashcards((current) => current.filter((f) => f.id !== id));
        closeDialog();

        // Update total count
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd podczas usuwania fiszki");
        // Reset deleting state
        setFlashcards((current) => current.map((f) => (f.id === id ? { ...f, isDeleting: false } : f)));
      }
    },
    [closeDialog]
  );

  // Return state and actions
  return {
    state: {
      flashcards,
      pagination,
      filters,
      isLoading,
      isLoadingMore,
      hasMore,
      error,
      dialogState,
    },
    actions: {
      loadFlashcards,
      loadMore,
      createFlashcard,
      updateFlashcard,
      deleteFlashcard,
      setFilters,
      handleSearchChange,
      openCreateDialog,
      openEditDialog,
      openDeleteDialog,
      closeDialog,
    },
  };
}
