import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PracticeControls from "../PracticeControls";

describe("PracticeControls", () => {
  const mockOnNext = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("powinien renderować aktualny postęp sesji", () => {
    render(<PracticeControls currentIndex={2} totalCount={10} onNext={mockOnNext} isAnswerSubmitted={false} />);

    // Sprawdzamy czy informacja o postępie jest wyświetlana
    expect(screen.getByText("Fiszka 3 z 10")).toBeInTheDocument();
  });

  it("powinien wyświetlać 'Następna' dla fiszek pośrednich", () => {
    render(<PracticeControls currentIndex={2} totalCount={10} onNext={mockOnNext} isAnswerSubmitted={true} />);

    // Sprawdzamy czy przycisk ma odpowiedni tekst
    const button = screen.getByText("Następna");
    expect(button).toBeInTheDocument();
  });

  it("powinien wyświetlać 'Zakończ' dla ostatniej fiszki", () => {
    render(<PracticeControls currentIndex={9} totalCount={10} onNext={mockOnNext} isAnswerSubmitted={true} />);

    // Sprawdzamy czy przycisk ma odpowiedni tekst
    const button = screen.getByText("Zakończ");
    expect(button).toBeInTheDocument();
  });

  it("powinien wyłączyć przycisk gdy odpowiedź nie została wysłana", () => {
    render(<PracticeControls currentIndex={2} totalCount={10} onNext={mockOnNext} isAnswerSubmitted={false} />);

    // Znajdujemy przycisk
    const button = screen.getByText("Następna") as HTMLButtonElement;

    // Sprawdzamy czy jest wyłączony
    expect(button.disabled).toBe(true);

    // Sprawdzamy klasy stylów
    expect(button).toHaveClass("bg-gray-300");
    expect(button).toHaveClass("cursor-not-allowed");
  });

  it("powinien włączyć przycisk gdy odpowiedź została wysłana", () => {
    render(<PracticeControls currentIndex={2} totalCount={10} onNext={mockOnNext} isAnswerSubmitted={true} />);

    // Znajdujemy przycisk
    const button = screen.getByText("Następna") as HTMLButtonElement;

    // Sprawdzamy czy jest włączony
    expect(button.disabled).toBe(false);

    // Sprawdzamy klasy stylów
    expect(button).toHaveClass("bg-blue-600");
    expect(button).not.toHaveClass("cursor-not-allowed");
  });

  it("powinien wywołać onNext po kliknięciu przycisku", () => {
    render(<PracticeControls currentIndex={2} totalCount={10} onNext={mockOnNext} isAnswerSubmitted={true} />);

    // Znajdujemy przycisk
    const button = screen.getByText("Następna");

    // Klikamy przycisk
    fireEvent.click(button);

    // Sprawdzamy czy funkcja została wywołana
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });
});
