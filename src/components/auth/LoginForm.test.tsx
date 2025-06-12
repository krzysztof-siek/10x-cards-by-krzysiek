import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { LoginForm } from "./LoginForm";
import { toast } from "sonner";
import { authService } from "@/services/auth";

// Mocki
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/services/auth", () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mock fetch API
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock window.location
const mockLocation = { href: "" };
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";
  });

  it("renders login form correctly", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zaloguj/i })).toBeInTheDocument();
    expect(screen.getByText(/nie masz jeszcze konta/i)).toBeInTheDocument();
  });

  it("prevents submission with invalid email", async () => {
    const { container } = render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    if (form) {
      fireEvent.submit(form);
    }

    // Sprawdzamy, czy funkcja login nie została wywołana, co oznacza że formularz nie przeszedł walidacji
    await waitFor(() => {
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  it("prevents submission with empty password", async () => {
    const { container } = render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    if (form) {
      fireEvent.submit(form);
    }

    // Sprawdzamy, czy funkcja login nie została wywołana, co oznacza że formularz nie przeszedł walidacji
    await waitFor(() => {
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  it("submits form with valid data and handles success response", async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      success: true,
      redirectTo: "/flashcards",
    });

    const { container } = render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/hasło/i);
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123!",
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Zalogowano pomyślnie");
    });
  });

  it("handles failed login attempts", async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      success: false,
      message: "Nieprawidłowe dane logowania",
    });

    const { container } = render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/hasło/i);
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Nieprawidłowe dane logowania");
    });
  });

  it("handles network errors during login", async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(new Error("Wystąpił błąd podczas logowania"));

    const { container } = render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/hasło/i);
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Wystąpił błąd podczas logowania");
    });
  });

  it("disables form during submission", async () => {
    vi.mocked(authService.login).mockImplementationOnce(
      () =>
        new Promise(() => {
          // Never resolves
        })
    );

    const { container } = render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/hasło/i);
    const submitButton = screen.getByRole("button", { name: /zaloguj/i });
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });
});
