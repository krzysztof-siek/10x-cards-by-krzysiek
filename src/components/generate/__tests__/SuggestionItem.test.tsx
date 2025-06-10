import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SuggestionItem } from "../SuggestionItem";
import type { SuggestionViewModel } from "../useFlashcardGenerator";

describe("SuggestionItem", () => {
  const mockToggle = vi.fn();
  const mockDelete = vi.fn();
  const mockUpdate = vi.fn();

  const mockSuggestion: SuggestionViewModel = {
    id: "test-id-123",
    front: "Test question",
    back: "Test answer",
    isSelected: true,
    isEdited: false,
    originalFront: "Test question",
    originalBack: "Test answer",
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the suggestion correctly", () => {
    render(
      <SuggestionItem suggestion={mockSuggestion} onToggle={mockToggle} onDelete={mockDelete} onUpdate={mockUpdate} />
    );

    // Check for content
    expect(screen.getByText("Test question")).toBeInTheDocument();
    expect(screen.getByText("Test answer")).toBeInTheDocument();

    // Check for edit and delete buttons
    expect(screen.getByRole("button", { name: /edytuj/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /usuń/i })).toBeInTheDocument();
  });

  it('shows "Edytowane" badge when suggestion is edited', () => {
    const editedSuggestion = {
      ...mockSuggestion,
      isEdited: true,
      front: "Edited question",
      back: "Edited answer",
    };

    render(
      <SuggestionItem suggestion={editedSuggestion} onToggle={mockToggle} onDelete={mockDelete} onUpdate={mockUpdate} />
    );

    expect(screen.getByText("Edytowane")).toBeInTheDocument();
  });

  it("calls onToggle when checkbox is clicked", async () => {
    render(
      <SuggestionItem suggestion={mockSuggestion} onToggle={mockToggle} onDelete={mockDelete} onUpdate={mockUpdate} />
    );

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    expect(mockToggle).toHaveBeenCalledWith("test-id-123");
  });

  it("calls onDelete when delete button is clicked", async () => {
    render(
      <SuggestionItem suggestion={mockSuggestion} onToggle={mockToggle} onDelete={mockDelete} onUpdate={mockUpdate} />
    );

    const deleteButton = screen.getByRole("button", { name: /usuń/i });
    await userEvent.click(deleteButton);

    expect(mockDelete).toHaveBeenCalledWith("test-id-123");
  });

  it("enters edit mode when edit button is clicked", async () => {
    render(
      <SuggestionItem suggestion={mockSuggestion} onToggle={mockToggle} onDelete={mockDelete} onUpdate={mockUpdate} />
    );

    // Initial state should show the text, not input fields
    expect(screen.getByText("Test question")).toBeInTheDocument();
    expect(screen.getByText("Test answer")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    // Click the edit button
    const editButton = screen.getByRole("button", { name: /edytuj/i });
    await userEvent.click(editButton);

    // Edit mode should show input fields
    expect(screen.queryByText("Test question")).not.toBeInTheDocument();
    expect(screen.queryByText("Test answer")).not.toBeInTheDocument();
    expect(screen.getAllByRole("textbox").length).toBe(2);
  });

  it("shows original values in input fields when editing starts", async () => {
    render(
      <SuggestionItem suggestion={mockSuggestion} onToggle={mockToggle} onDelete={mockDelete} onUpdate={mockUpdate} />
    );

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edytuj/i });
    await userEvent.click(editButton);

    // Get input fields
    const inputFields = screen.getAllByRole("textbox");
    const frontInput = inputFields[0]; // First input is for front
    const backInput = inputFields[1]; // Second input is for back

    // Check if original values are shown in inputs
    expect(frontInput).toHaveValue("Test question");
    expect(backInput).toHaveValue("Test answer");
  });

  it("allows updating input values", async () => {
    render(
      <SuggestionItem suggestion={mockSuggestion} onToggle={mockToggle} onDelete={mockDelete} onUpdate={mockUpdate} />
    );

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edytuj/i });
    await userEvent.click(editButton);

    // Get input fields
    const inputFields = screen.getAllByRole("textbox");
    const frontInput = inputFields[0]; // First input is for front
    const backInput = inputFields[1]; // Second input is for back

    // Clear and type new values
    await userEvent.clear(frontInput);
    await userEvent.type(frontInput, "New question");
    await userEvent.clear(backInput);
    await userEvent.type(backInput, "New answer");

    // Check if input values were updated
    expect(frontInput).toHaveValue("New question");
    expect(backInput).toHaveValue("New answer");
  });

  it("calls onUpdate with new values when Save Changes is clicked", async () => {
    render(
      <SuggestionItem suggestion={mockSuggestion} onToggle={mockToggle} onDelete={mockDelete} onUpdate={mockUpdate} />
    );

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edytuj/i });
    await userEvent.click(editButton);

    // Get input fields
    const inputFields = screen.getAllByRole("textbox");
    const frontInput = inputFields[0];
    const backInput = inputFields[1];

    // Update input values
    await userEvent.clear(frontInput);
    await userEvent.type(frontInput, "New question");
    await userEvent.clear(backInput);
    await userEvent.type(backInput, "New answer");

    // Click Save Changes
    const saveButton = screen.getByRole("button", { name: /zapisz zmiany/i });
    await userEvent.click(saveButton);

    // Verify onUpdate was called with correct parameters
    expect(mockUpdate).toHaveBeenCalledWith("test-id-123", "New question", "New answer");

    // Should exit edit mode
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("discards changes when Cancel is clicked", async () => {
    render(
      <SuggestionItem suggestion={mockSuggestion} onToggle={mockToggle} onDelete={mockDelete} onUpdate={mockUpdate} />
    );

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edytuj/i });
    await userEvent.click(editButton);

    // Get input fields and update them
    const inputFields = screen.getAllByRole("textbox");
    const frontInput = inputFields[0];
    const backInput = inputFields[1];

    await userEvent.clear(frontInput);
    await userEvent.type(frontInput, "Discarded question");
    await userEvent.clear(backInput);
    await userEvent.type(backInput, "Discarded answer");

    // Click Cancel
    const cancelButton = screen.getByRole("button", { name: /anuluj/i });
    await userEvent.click(cancelButton);

    // Verify onUpdate was NOT called
    expect(mockUpdate).not.toHaveBeenCalled();

    // Should exit edit mode and display original values
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Test question")).toBeInTheDocument();
    expect(screen.getByText("Test answer")).toBeInTheDocument();
  });

  it("should match snapshot", () => {
    const { container } = render(
      <SuggestionItem suggestion={mockSuggestion} onToggle={mockToggle} onDelete={mockDelete} onUpdate={mockUpdate} />
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <li
          class="flex flex-col gap-3 p-4 border rounded-lg"
        >
          <div
            class="flex items-start justify-between"
          >
            <div
              class="flex items-center gap-2"
            >
              <button
                aria-checked="true"
                class="peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                data-slot="checkbox"
                data-state="checked"
                id="suggestion-test-id-123"
                role="checkbox"
                type="button"
                value="on"
              >
                <span
                  class="flex items-center justify-center text-current transition-none"
                  data-slot="checkbox-indicator"
                  data-state="checked"
                  style="pointer-events: none;"
                >
                  <svg
                    class="lucide lucide-check size-3.5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6 9 17l-5-5"
                    />
                  </svg>
                </span>
              </button>
              <label
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="suggestion-test-id-123"
              />
            </div>
            <div
              class="flex gap-2"
            >
              <button
                class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"
                data-slot="button"
              >
                Edytuj
              </button>
              <button
                class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"
                data-slot="button"
              >
                Usuń
              </button>
            </div>
          </div>
          <div
            class="grid gap-4"
          >
            <div>
              <div
                class="text-sm font-medium mb-1"
              >
                Przód:
              </div>
              <div
                class="p-3 bg-gray-50 rounded-md"
              >
                Test question
              </div>
            </div>
            <div>
              <div
                class="text-sm font-medium mb-1"
              >
                Tył:
              </div>
              <div
                class="p-3 bg-gray-50 rounded-md"
              >
                Test answer
              </div>
            </div>
          </div>
        </li>
      </div>
    `);
  });
});
