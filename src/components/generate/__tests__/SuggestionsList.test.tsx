import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SuggestionsList } from "../SuggestionsList";
import type { SuggestionViewModel } from "../useFlashcardGenerator";

// Mock the SuggestionItem component
vi.mock("../SuggestionItem", () => ({
  SuggestionItem: ({ suggestion, onToggle, onDelete, onUpdate }: any) => (
    <div data-testid={`suggestion-item-${suggestion.id}`}>
      <span>{suggestion.front}</span>
      <button data-testid={`toggle-${suggestion.id}`} onClick={() => onToggle(suggestion.id)}>
        Toggle
      </button>
      <button data-testid={`delete-${suggestion.id}`} onClick={() => onDelete(suggestion.id)}>
        Delete
      </button>
      <button
        data-testid={`update-${suggestion.id}`}
        onClick={() => onUpdate(suggestion.id, "updated front", "updated back")}
      >
        Update
      </button>
    </div>
  ),
}));

describe("SuggestionsList", () => {
  const mockSave = vi.fn();
  const mockChange = vi.fn();
  const mockToggle = vi.fn();
  const mockDelete = vi.fn();

  const mockSuggestions: SuggestionViewModel[] = [
    {
      id: "test-id-1",
      front: "Question 1",
      back: "Answer 1",
      isSelected: true,
      isEdited: false,
      originalFront: "Question 1",
      originalBack: "Answer 1",
    },
    {
      id: "test-id-2",
      front: "Question 2",
      back: "Answer 2",
      isSelected: false,
      isEdited: true,
      originalFront: "Original Question 2",
      originalBack: "Original Answer 2",
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders a message when there are no suggestions", () => {
    render(
      <SuggestionsList
        suggestions={[]}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );

    expect(screen.getByText(/brak dostępnych propozycji/i)).toBeInTheDocument();
  });

  it("renders the correct number of suggestion items", () => {
    render(
      <SuggestionsList
        suggestions={mockSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );

    expect(screen.getByTestId("suggestion-item-test-id-1")).toBeInTheDocument();
    expect(screen.getByTestId("suggestion-item-test-id-2")).toBeInTheDocument();
  });

  it("displays the correct count of selected suggestions", () => {
    render(
      <SuggestionsList
        suggestions={mockSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );

    // Get the span element with the selected count
    const countText = screen.getByText(/propozycji wybranych$/i);
    expect(countText).toBeInTheDocument();
    expect(countText.textContent).toContain("1 z 2 propozycji wybranych");
  });

  it("calls onSave when the save button is clicked", async () => {
    render(
      <SuggestionsList
        suggestions={mockSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );

    const saveButton = screen.getByRole("button", { name: /zapisz wybrane/i });
    await userEvent.click(saveButton);

    expect(mockSave).toHaveBeenCalled();
  });

  it("disables the save button when isSaving is true", () => {
    render(
      <SuggestionsList
        suggestions={mockSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={true}
      />
    );

    const saveButton = screen.getByRole("button", { name: /zapisywanie/i });
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveTextContent("Zapisywanie...");
  });

  it("disables the save button when no suggestions are selected", () => {
    const noSelectedSuggestions = mockSuggestions.map((s) => ({
      ...s,
      isSelected: false,
    }));

    render(
      <SuggestionsList
        suggestions={noSelectedSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );

    const saveButton = screen.getByRole("button", { name: /zapisz wybrane/i });
    expect(saveButton).toBeDisabled();
  });

  it("passes the correct handlers to suggestion items", async () => {
    render(
      <SuggestionsList
        suggestions={mockSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );

    // Test toggle
    await userEvent.click(screen.getByTestId("toggle-test-id-1"));
    expect(mockToggle).toHaveBeenCalledWith("test-id-1");

    // Test delete
    await userEvent.click(screen.getByTestId("delete-test-id-2"));
    expect(mockDelete).toHaveBeenCalledWith("test-id-2");

    // Test update
    await userEvent.click(screen.getByTestId("update-test-id-1"));
    expect(mockChange).toHaveBeenCalledWith("test-id-1", "updated front", "updated back");
  });

  it("should render with the correct structure", () => {
    const { container } = render(
      <SuggestionsList
        suggestions={mockSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );

    // Check that the container has a div as its first child
    expect(container.firstChild).not.toBeNull();
    if (container.firstChild) {
      expect(container.firstChild.nodeName).toBe("DIV");
    }

    // Check that the suggestions are rendered
    expect(screen.getByTestId("suggestion-item-test-id-1")).toBeInTheDocument();
    expect(screen.getByTestId("suggestion-item-test-id-2")).toBeInTheDocument();

    // Check that the count text is correct
    const countText = screen.getByText(/propozycji wybranych$/i);
    expect(countText).toBeInTheDocument();
    expect(countText.textContent).toContain("1 z 2 propozycji wybranych");

    // Check that the save button is present
    const saveButton = screen.getByRole("button", { name: /zapisz wybrane/i });
    expect(saveButton).toBeInTheDocument();
  });
});
