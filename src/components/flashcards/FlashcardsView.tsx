import { useState } from "react";
import { useFlashcards } from "./hooks/useFlashcards";
import { CollectionsManager } from "./CollectionsManager";
import { FlashcardsHeader } from "./FlashcardsHeader";
import { FlashcardsTable } from "./FlashcardsTable";
import { PaginationControls } from "./PaginationControls";
import { FlashcardFormDialog } from "./FlashcardFormDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { EmptyState } from "./EmptyState";

export function FlashcardsView() {
  const {
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
  } = useFlashcards();

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-destructive">Wystąpił błąd</h3>
            <div className="mt-2 text-sm text-destructive/80">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="rounded-md bg-destructive/10 px-2 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-destructive"
                onClick={() => loadFlashcards()}
              >
                Spróbuj ponownie
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <CollectionsManager
            collections={collections}
            selectedCollectionId={filters.collectionId}
            onSelectCollection={selectCollection}
            onCreate={createCollection}
            onDelete={deleteCollection}
          />
        </div>
        <div className="md:col-span-3">
          <FlashcardsHeader
            searchQuery={filters.search}
            onSearchChange={(search: string) => setFilters({ ...filters, search })}
            onAddFlashcard={openCreateDialog}
          />

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : flashcards.length === 0 ? (
            <EmptyState onAddFlashcard={openCreateDialog} />
          ) : (
            <>
              <FlashcardsTable
                flashcards={flashcards}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
              />
              <div className="mt-4">
                <PaginationControls
                  currentPage={pagination.page}
                  totalPages={Math.ceil(pagination.total / pagination.limit)}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <FlashcardFormDialog
        isOpen={dialogState.isFlashcardFormOpen}
        onClose={closeDialog}
        onSave={dialogState.flashcardToEdit ? updateFlashcard : createFlashcard}
        flashcardToEdit={dialogState.flashcardToEdit}
      />

      <DeleteConfirmationDialog
        isOpen={dialogState.isDeleteConfirmationOpen}
        onClose={closeDialog}
        onConfirm={() => {
          if (dialogState.itemToDelete) {
            deleteFlashcard(dialogState.itemToDelete.id);
          }
        }}
        itemType="flashcard"
        itemName={dialogState.itemToDelete?.front || ""}
      />
    </div>
  );
} 