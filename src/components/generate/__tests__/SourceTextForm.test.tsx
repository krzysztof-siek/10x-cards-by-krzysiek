import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SourceTextForm } from "../SourceTextForm";

describe("SourceTextForm", () => {
  const mockSubmit = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the form with textarea and button", () => {
    render(<SourceTextForm isLoading={false} onSubmit={mockSubmit} />);

    expect(screen.getByPlaceholderText(/wklej swój tekst tutaj/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generuj fiszki/i })).toBeInTheDocument();
  });

  it("disables the button when text is too short", async () => {
    render(<SourceTextForm isLoading={false} onSubmit={mockSubmit} />);

    const textarea = screen.getByPlaceholderText(/wklej swój tekst tutaj/i);
    const shortText = "This is a short text.";

    await userEvent.type(textarea, shortText);

    const submitButton = screen.getByRole("button", { name: /generuj fiszki/i });
    expect(submitButton).toBeDisabled();
  });

  it("disables the button when text is too long", async () => {
    render(<SourceTextForm isLoading={false} onSubmit={mockSubmit} />);

    const textarea = screen.getByPlaceholderText(/wklej swój tekst tutaj/i);
    // Use fireEvent instead of userEvent for large text to avoid timeouts
    fireEvent.change(textarea, { target: { value: "a".repeat(11000) } });

    const submitButton = screen.getByRole("button", { name: /generuj fiszki/i });
    expect(submitButton).toBeDisabled();
  });

  it("enables the button when text is within the valid range", async () => {
    render(<SourceTextForm isLoading={false} onSubmit={mockSubmit} />);

    const textarea = screen.getByPlaceholderText(/wklej swój tekst tutaj/i);
    // Use fireEvent instead of userEvent for large text to avoid timeouts
    fireEvent.change(textarea, { target: { value: "a".repeat(5000) } });

    const submitButton = screen.getByRole("button", { name: /generuj fiszki/i });
    expect(submitButton).not.toBeDisabled();
  });

  it("displays character count correctly", async () => {
    render(<SourceTextForm isLoading={false} onSubmit={mockSubmit} />);

    const textarea = screen.getByPlaceholderText(/wklej swój tekst tutaj/i);
    fireEvent.change(textarea, { target: { value: "Hello world" } });

    // Check if the character count text is updated
    expect(screen.getByText("11 / 10000 znaków")).toBeInTheDocument();
  });

  it("calls onSubmit with correct data when form is submitted", async () => {
    render(<SourceTextForm isLoading={false} onSubmit={mockSubmit} />);

    const textarea = screen.getByPlaceholderText(/wklej swój tekst tutaj/i);
    const validText = "a".repeat(1000);

    fireEvent.change(textarea, { target: { value: validText } });

    // Find the form element using container
    const form = document.querySelector("form");
    fireEvent.submit(form as HTMLElement);

    expect(mockSubmit).toHaveBeenCalledWith({ source_text: validText });
  });

  it("disables inputs and shows loading state when isLoading is true", () => {
    render(<SourceTextForm isLoading={true} onSubmit={mockSubmit} />);

    const textarea = screen.getByPlaceholderText(/wklej swój tekst tutaj/i);
    expect(textarea).toBeDisabled();

    const submitButton = screen.getByRole("button", { name: /generowanie/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Generowanie...");
  });

  it("prevents form submission when the form is invalid", async () => {
    render(<SourceTextForm isLoading={false} onSubmit={mockSubmit} />);

    // Form with too short text should not submit
    const textarea = screen.getByPlaceholderText(/wklej swój tekst tutaj/i);
    await userEvent.type(textarea, "short text");

    // Find the form element using container
    const form = document.querySelector("form");
    fireEvent.submit(form as HTMLElement);

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("should match snapshot", () => {
    const { container } = render(<SourceTextForm isLoading={false} onSubmit={mockSubmit} />);
    expect(container).toMatchSnapshot();
  });
});
