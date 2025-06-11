import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FeedbackDisplay from "../FeedbackDisplay";

describe("FeedbackDisplay", () => {
  it("nie powinien nic renderować, gdy isVisible jest false", () => {
    const { container } = render(
      <FeedbackDisplay
        isCorrect={true}
        userAnswer="Odpowiedź użytkownika"
        correctAnswer="Prawidłowa odpowiedź"
        isVisible={false}
      />
    );

    // Sprawdzamy czy komponent nie wyrenderował żadnej zawartości
    expect(container.firstChild).toBeNull();
  });

  it("powinien wyświetlić komunikat o poprawnej odpowiedzi", () => {
    render(
      <FeedbackDisplay
        isCorrect={true}
        userAnswer="Prawidłowa odpowiedź"
        correctAnswer="Prawidłowa odpowiedź"
        isVisible={true}
      />
    );

    // Sprawdzamy czy komunikat o poprawnej odpowiedzi jest wyświetlany
    expect(screen.getByText("Poprawna odpowiedź!")).toBeInTheDocument();

    // Upewniamy się, że informacja o błędnej odpowiedzi nie jest wyświetlana
    expect(screen.queryByText("Niepoprawna odpowiedź")).not.toBeInTheDocument();

    // Sprawdzamy czy nie są wyświetlane odpowiedzi (tylko dla niepoprawnych)
    expect(screen.queryByText("Twoja odpowiedź:")).not.toBeInTheDocument();
    expect(screen.queryByText("Poprawna odpowiedź:")).not.toBeInTheDocument();
  });

  it("powinien wyświetlić komunikat o niepoprawnej odpowiedzi z porównaniem", () => {
    const userAnswer = "Błędna odpowiedź";
    const correctAnswer = "Prawidłowa odpowiedź";

    render(
      <FeedbackDisplay isCorrect={false} userAnswer={userAnswer} correctAnswer={correctAnswer} isVisible={true} />
    );

    // Sprawdzamy czy komunikat o niepoprawnej odpowiedzi jest wyświetlany
    expect(screen.getByText("Niepoprawna odpowiedź")).toBeInTheDocument();

    // Sprawdzamy czy są wyświetlane oba rodzaje odpowiedzi
    expect(screen.getByText("Twoja odpowiedź:")).toBeInTheDocument();
    expect(screen.getByText("Poprawna odpowiedź:")).toBeInTheDocument();
    expect(screen.getByText(userAnswer)).toBeInTheDocument();
    expect(screen.getByText(correctAnswer)).toBeInTheDocument();
  });

  it("powinien stosować odpowiednie klasy kolorów dla poprawnej odpowiedzi", () => {
    const { container } = render(
      <FeedbackDisplay
        isCorrect={true}
        userAnswer="Prawidłowa odpowiedź"
        correctAnswer="Prawidłowa odpowiedź"
        isVisible={true}
      />
    );

    // Sprawdzamy zastosowanie klas dla poprawnej odpowiedzi
    const feedbackElement = container.firstChild as HTMLElement;
    expect(feedbackElement).toHaveClass("bg-green-100");
    expect(feedbackElement).toHaveClass("border-green-300");

    // Sprawdzamy kolor tekstu
    const textElement = screen.getByText("Poprawna odpowiedź!");
    expect(textElement).toHaveClass("text-green-700");
  });

  it("powinien stosować odpowiednie klasy kolorów dla niepoprawnej odpowiedzi", () => {
    const { container } = render(
      <FeedbackDisplay
        isCorrect={false}
        userAnswer="Błędna odpowiedź"
        correctAnswer="Prawidłowa odpowiedź"
        isVisible={true}
      />
    );

    // Sprawdzamy zastosowanie klas dla niepoprawnej odpowiedzi
    const feedbackElement = container.firstChild as HTMLElement;
    expect(feedbackElement).toHaveClass("bg-red-100");
    expect(feedbackElement).toHaveClass("border-red-300");

    // Sprawdzamy kolor tekstu
    const textElement = screen.getByText("Niepoprawna odpowiedź");
    expect(textElement).toHaveClass("text-red-700");
  });
});
