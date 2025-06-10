import { useFlashcards } from "./hooks/useFlashcards";
import { FlashcardsHeader } from "./FlashcardsHeader";
import { FlashcardsTable } from "./FlashcardsTable";
import { FlashcardFormDialog } from "./FlashcardFormDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

export function FlashcardsView() {
  const {
    state: { flashcards, pagination, filters, isLoading, isLoadingMore, hasMore, error, dialogState },
    actions: {
      loadFlashcards,
      loadMore,
      createFlashcard,
      updateFlashcard,
      deleteFlashcard,
      setFilters,
      openCreateDialog,
      openEditDialog,
      openDeleteDialog,
      closeDialog,
    },
  } = useFlashcards();

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-6 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
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
                onClick={() => loadFlashcards(true)}
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
      <FlashcardsHeader
        searchQuery={filters.search}
        onSearchChange={(search: string) => setFilters({ ...filters, search, page: 1 })}
        onAddFlashcard={openCreateDialog}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : flashcards.length === 0 ? (
        <EmptyState onAddFlashcard={openCreateDialog} />
      ) : (
        <>
          <div className="shadow-sm">
            <FlashcardsTable flashcards={flashcards} onEdit={openEditDialog} onDelete={openDeleteDialog} />
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button onClick={loadMore} disabled={isLoadingMore} variant="outline" className="min-w-[200px] py-2">
                {isLoadingMore ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Wczytywanie...
                  </>
                ) : (
                  "Wczytaj więcej"
                )}
              </Button>
            </div>
          )}

          {/* Flashcards summary */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Wyświetlanie {flashcards.length} z {pagination.total} fiszek
          </div>
        </>
      )}

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
