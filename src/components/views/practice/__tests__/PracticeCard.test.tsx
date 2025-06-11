import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PracticeCard from "../PracticeCard";
import type { FlashcardDto } from "../../../../types";

describe("PracticeCard", () => {
  const mockFlashcard: FlashcardDto = {
    id: 1,
    front: "Pytanie testowe",
    back: "Odpowiedź testowa",
    source: "manual",
    generation_id: null,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
  };

  const mockSetUserAnswer = vi.fn();
  const mockOnAnswerSubmit = vi.fn();

  it("powinien renderować przednią stronę fiszki", () => {
    render(
      <PracticeCard
        flashcard={mockFlashcard}
        userAnswer=""
        setUserAnswer={mockSetUserAnswer}
        onAnswerSubmit={mockOnAnswerSubmit}
        isAnswerSubmitted={false}
      />
    );

    // Sprawdzamy czy pytanie jest wyświetlane
    expect(screen.getByText("Pytanie")).toBeInTheDocument();
    expect(screen.getByText("Pytanie testowe")).toBeInTheDocument();
  });

  it("powinien wywołać setUserAnswer przy wprowadzaniu tekstu", () => {
    render(
      <PracticeCard
        flashcard={mockFlashcard}
        userAnswer=""
        setUserAnswer={mockSetUserAnswer}
        onAnswerSubmit={mockOnAnswerSubmit}
        isAnswerSubmitted={false}
      />
    );

    // Znajdujemy pole tekstowe
    const answerInput = screen.getByPlaceholderText("Wpisz swoją odpowiedź...");

    // Wprowadzamy tekst
    fireEvent.change(answerInput, { target: { value: "Test odpowiedzi" } });

    // Sprawdzamy czy funkcja została wywołana z odpowiednim argumentem
    expect(mockSetUserAnswer).toHaveBeenCalledWith("Test odpowiedzi");
  });

  it("powinien wywołać onAnswerSubmit przy zatwierdzeniu formularza", () => {
    render(
      <PracticeCard
        flashcard={mockFlashcard}
        userAnswer="Test odpowiedzi"
        setUserAnswer={mockSetUserAnswer}
        onAnswerSubmit={mockOnAnswerSubmit}
        isAnswerSubmitted={false}
      />
    );

    // Znajdujemy przycisk sprawdzenia
    const submitButton = screen.getByText("Sprawdź");

    // Klikamy przycisk
    fireEvent.click(submitButton);

    // Sprawdzamy czy funkcja została wywołana z odpowiednim argumentem
    expect(mockOnAnswerSubmit).toHaveBeenCalledWith("Test odpowiedzi");
  });

  it("powinien wyłączyć formularz gdy odpowiedź została wysłana", () => {
    render(
      <PracticeCard
        flashcard={mockFlashcard}
        userAnswer="Test odpowiedzi"
        setUserAnswer={mockSetUserAnswer}
        onAnswerSubmit={mockOnAnswerSubmit}
        isAnswerSubmitted={true}
      />
    );

    // Znajdujemy pole tekstowe i przycisk
    const answerInput = screen.getByPlaceholderText("Wpisz swoją odpowiedź...") as HTMLTextAreaElement;
    const submitButton = screen.getByText("Sprawdź") as HTMLButtonElement;

    // Sprawdzamy czy są wyłączone
    expect(answerInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
  });
});
