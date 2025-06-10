import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { GenerateFlashcardsView } from "../GenerateFlashcardsView";
import * as useFlashcardGeneratorModule from "../useFlashcardGenerator";
import type { SuggestionViewModel } from "../useFlashcardGenerator";
import { toast } from "sonner";

// Mock the toast module
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the useFlashcardGenerator hook
vi.mock("../useFlashcardGenerator", () => ({
  useFlashcardGenerator: vi.fn(),
}));

// Mock the child components
vi.mock("../SourceTextForm", () => ({
  SourceTextForm: ({ onSubmit, isLoading }: any) => (
    <div data-testid="source-text-form">
      <button
        data-testid="form-submit-button"
        disabled={isLoading}
        onClick={() => onSubmit({ source_text: "Test source text" })}
      >
        Generate
      </button>
    </div>
  ),
}));

vi.mock("../SuggestionsList", () => ({
  SuggestionsList: ({
    suggestions,
    onSave,
    onSuggestionChange,
    onSuggestionToggle,
    onSuggestionDelete,
    isSaving,
  }: any) => (
    <div data-testid="suggestions-list">
      <span data-testid="suggestions-count">{suggestions.length}</span>
      <button data-testid="save-button" disabled={isSaving} onClick={onSave}>
        Save
      </button>
      <button data-testid="edit-suggestion-button" onClick={() => onSuggestionChange("123", "New front", "New back")}>
        Edit
      </button>
      <button data-testid="toggle-suggestion-button" onClick={() => onSuggestionToggle("123")}>
        Toggle
      </button>
      <button data-testid="delete-suggestion-button" onClick={() => onSuggestionDelete("123")}>
        Delete
      </button>
    </div>
  ),
}));

vi.mock("../GlobalSpinner", () => ({
  GlobalSpinner: () => <div data-testid="global-spinner">Loading...</div>,
}));

describe("GenerateFlashcardsView", () => {
  const mockSuggestions: SuggestionViewModel[] = [
    {
      id: "123",
      front: "Test front",
      back: "Test back",
      isSelected: true,
      isEdited: false,
      originalFront: "Test front",
      originalBack: "Test back",
    },
    {
      id: "456",
      front: "Test front 2",
      back: "Test back 2",
      isSelected: true,
      isEdited: false,
      originalFront: "Test front 2",
      originalBack: "Test back 2",
    },
  ];

  const mockGenerateFunction = vi.fn();
  const mockSaveFunction = vi.fn();
  const mockUpdateFunction = vi.fn();
  const mockToggleFunction = vi.fn();
  const mockDeleteFunction = vi.fn();
  const mockGetSelectedCountFunction = vi.fn().mockReturnValue(2);

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mock implementation
    (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
      suggestions: [],
      isLoading: false,
      isSaving: false,
      error: null,
      generateSuggestions: mockGenerateFunction,
      saveSuggestions: mockSaveFunction,
      updateSuggestion: mockUpdateFunction,
      toggleSuggestion: mockToggleFunction,
      deleteSuggestion: mockDeleteFunction,
      getSelectedCount: mockGetSelectedCountFunction,
    });
  });

  it("should render the form when there are no suggestions", () => {
    render(<GenerateFlashcardsView />);

    expect(screen.getByTestId("source-text-form")).toBeInTheDocument();
    expect(screen.queryByTestId("suggestions-list")).not.toBeInTheDocument();
  });

  it("should render the suggestions list when there are suggestions", () => {
    (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
      suggestions: mockSuggestions,
      isLoading: false,
      isSaving: false,
      error: null,
      generateSuggestions: mockGenerateFunction,
      saveSuggestions: mockSaveFunction,
      updateSuggestion: mockUpdateFunction,
      toggleSuggestion: mockToggleFunction,
      deleteSuggestion: mockDeleteFunction,
      getSelectedCount: mockGetSelectedCountFunction,
    });

    render(<GenerateFlashcardsView />);

    expect(screen.getByTestId("suggestions-list")).toBeInTheDocument();
    expect(screen.queryByTestId("source-text-form")).not.toBeInTheDocument();
    expect(screen.getByTestId("suggestions-count").textContent).toBe("2");
  });

  it("should show loading spinner when loading", () => {
    (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
      suggestions: [],
      isLoading: true,
      isSaving: false,
      error: null,
      generateSuggestions: mockGenerateFunction,
      saveSuggestions: mockSaveFunction,
      updateSuggestion: mockUpdateFunction,
      toggleSuggestion: mockToggleFunction,
      deleteSuggestion: mockDeleteFunction,
      getSelectedCount: mockGetSelectedCountFunction,
    });

    render(<GenerateFlashcardsView />);

    expect(screen.getByTestId("global-spinner")).toBeInTheDocument();
  });

  it("should call generateSuggestions when form is submitted", async () => {
    // Setup successful response
    mockGenerateFunction.mockResolvedValue(mockSuggestions);

    render(<GenerateFlashcardsView />);

    // Simulate form submission
    await userEvent.click(screen.getByTestId("form-submit-button"));

    // Verify the generate function was called with correct data
    expect(mockGenerateFunction).toHaveBeenCalledWith({ source_text: "Test source text" });
  });

  it("should call saveSuggestions when save button is clicked", async () => {
    // Setup mock with suggestions and successful save
    (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
      suggestions: mockSuggestions,
      isLoading: false,
      isSaving: false,
      error: null,
      generateSuggestions: mockGenerateFunction,
      saveSuggestions: mockSaveFunction.mockResolvedValue({
        flashcards: mockSuggestions,
      }),
      updateSuggestion: mockUpdateFunction,
      toggleSuggestion: mockToggleFunction,
      deleteSuggestion: mockDeleteFunction,
      getSelectedCount: mockGetSelectedCountFunction,
    });

    render(<GenerateFlashcardsView />);

    // Click save button
    await userEvent.click(screen.getByTestId("save-button"));

    // Verify save function was called
    expect(mockSaveFunction).toHaveBeenCalled();

    // Verify toast success was called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Sukces!", {
        description: expect.stringContaining("fiszek zostało zapisanych"),
      });
    });
  });

  it("should call the suggestion manipulation functions when corresponding buttons are clicked", async () => {
    (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
      suggestions: mockSuggestions,
      isLoading: false,
      isSaving: false,
      error: null,
      generateSuggestions: mockGenerateFunction,
      saveSuggestions: mockSaveFunction,
      updateSuggestion: mockUpdateFunction,
      toggleSuggestion: mockToggleFunction,
      deleteSuggestion: mockDeleteFunction,
      getSelectedCount: mockGetSelectedCountFunction,
    });

    render(<GenerateFlashcardsView />);

    // Test edit functionality
    await userEvent.click(screen.getByTestId("edit-suggestion-button"));
    expect(mockUpdateFunction).toHaveBeenCalledWith("123", "New front", "New back");

    // Test toggle functionality
    await userEvent.click(screen.getByTestId("toggle-suggestion-button"));
    expect(mockToggleFunction).toHaveBeenCalledWith("123");

    // Test delete functionality
    await userEvent.click(screen.getByTestId("delete-suggestion-button"));
    expect(mockDeleteFunction).toHaveBeenCalledWith("123");
  });

  it("should show toast error when there is an error", () => {
    const mockError = { message: "Test error message" };

    (useFlashcardGeneratorModule.useFlashcardGenerator as any).mockReturnValue({
      suggestions: [],
      isLoading: false,
      isSaving: false,
      error: mockError,
      generateSuggestions: mockGenerateFunction,
      saveSuggestions: mockSaveFunction,
      updateSuggestion: mockUpdateFunction,
      toggleSuggestion: mockToggleFunction,
      deleteSuggestion: mockDeleteFunction,
      getSelectedCount: mockGetSelectedCountFunction,
    });

    render(<GenerateFlashcardsView />);

    expect(toast.error).toHaveBeenCalledWith("Błąd", {
      description: "Test error message",
    });
  });
});
