import { useState, useEffect, useCallback } from "react";
import type { 
  FlashcardDto, 
  FlashcardCreateDto, 
  FlashcardUpdateDto,
  FlashcardsListResponseDto
} from "../../../types";

// Custom view model for frontend use
export interface FlashcardViewModel extends FlashcardDto {
  isDeleting?: boolean;
}

// Collection type
export interface Collection {
  id: number;
  name: string;
  flashcard_count?: number;
}

// API filters type
export interface ApiFilters {
  page: number;
  limit: number;
  search: string;
  collectionId: number | null;
}

// Dialog state type
interface DialogState {
  isFlashcardFormOpen: boolean;
  isDeleteConfirmationOpen: boolean;
  flashcardToEdit: FlashcardViewModel | null;
  itemToDelete: FlashcardViewModel | null;
}

export function useFlashcards() {
  // State
  const [flashcards, setFlashcards] = useState<FlashcardViewModel[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    collectionId: null,
  });
  const [dialogState, setDialogState] = useState<DialogState>({
    isFlashcardFormOpen: false,
    isDeleteConfirmationOpen: false,
    flashcardToEdit: null,
    itemToDelete: null,
  });

  // Load flashcards from API
  const loadFlashcards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.append("page", filters.page.toString());
      queryParams.append("limit", filters.limit.toString());
      
      if (filters.search) {
        queryParams.append("search", filters.search);
      }
      
      if (filters.collectionId !== null) {
        queryParams.append("collectionId", filters.collectionId.toString());
      }
      
      const response = await fetch(`/api/flashcards?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data: FlashcardsListResponseDto = await response.json();
      
      setFlashcards(data.data);
      setPagination(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Load collections
  const loadCollections = useCallback(async () => {
    try {
      // This is a placeholder. API for collections is not defined yet.
      // Will be implemented when the collections API is ready.
      const mockCollections: Collection[] = [
        { id: 1, name: "Wszystkie", flashcard_count: 42 },
        { id: 2, name: "Języki obce", flashcard_count: 15 },
        { id: 3, name: "Programowanie", flashcard_count: 27 }
      ];
      setCollections(mockCollections);
    } catch (err) {
      console.error("Failed to load collections:", err);
    }
  }, []);

  // Load data on mount and when filters change
  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

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

        await loadFlashcards();
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
        const response = await fetch(`/api/flashcards/${dialogState.flashcardToEdit.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        await loadFlashcards();
        closeDialog();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd podczas aktualizacji fiszki");
      }
    },
    [dialogState.flashcardToEdit, loadFlashcards, closeDialog]
  );

  const deleteFlashcard = useCallback(
    async (id: number) => {
      try {
        // Optimistic UI update
        setFlashcards((current) =>
          current.map((f) => (f.id === id ? { ...f, isDeleting: true } : f))
        );
        
        const response = await fetch(`/api/flashcards/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        // If successful, remove from list
        setFlashcards((current) => current.filter((f) => f.id !== id));
        closeDialog();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd podczas usuwania fiszki");
        // Reset deleting state
        setFlashcards((current) =>
          current.map((f) => (f.id === id ? { ...f, isDeleting: false } : f))
        );
      }
    },
    [closeDialog]
  );

  // Collection actions
  const selectCollection = useCallback((collectionId: number | null) => {
    setFilters((prev) => ({
      ...prev,
      collectionId,
      page: 1, // Reset to first page when changing collection
    }));
  }, []);

  const createCollection = useCallback(async (name: string) => {
    // This is a placeholder. Will be implemented when the collections API is ready.
    console.log("Creating collection:", name);
    // For now, just add a mock collection to the state
    const newCollection: Collection = {
      id: Math.max(0, ...collections.map((c) => c.id)) + 1,
      name,
      flashcard_count: 0,
    };
    setCollections((prev) => [...prev, newCollection]);
  }, [collections]);

  const deleteCollection = useCallback(async (id: number) => {
    // This is a placeholder. Will be implemented when the collections API is ready.
    console.log("Deleting collection:", id);
    // For now, just remove from state
    setCollections((prev) => prev.filter((c) => c.id !== id));
    
    // If the deleted collection was selected, reset to null
    if (filters.collectionId === id) {
      selectCollection(null);
    }
  }, [filters.collectionId, selectCollection]);

  // Pagination action
  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  // Return state and actions
  return {
    state: {
      flashcards,
      collections,
      pagination,
      filters,
      isLoading,
      error,
      dialogState,
    },
    actions: {
      loadFlashcards,
      createFlashcard,
      updateFlashcard,
      deleteFlashcard,
      setFilters,
      setPage,
      openCreateDialog,
      openEditDialog,
      openDeleteDialog,
      closeDialog,
      selectCollection,
      createCollection,
      deleteCollection,
    },
  };
} 