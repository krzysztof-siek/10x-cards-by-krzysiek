import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { RegisterForm } from "./RegisterForm";
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
    register: vi.fn(),
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

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";
  });

  it("renders register form correctly", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^hasło$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/powtórz hasło/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zarejestruj/i })).toBeInTheDocument();
    expect(screen.getByText(/masz już konto/i)).toBeInTheDocument();
  });

  it("prevents submission with invalid email", async () => {
    const { container } = render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^hasło$/i);
    const confirmPasswordInput = screen.getByLabelText(/powtórz hasło/i);
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "Password123!" } });

    if (form) {
      fireEvent.submit(form);
    }

    // Sprawdzamy, czy funkcja register nie została wywołana, co oznacza że formularz nie przeszedł walidacji
    await waitFor(() => {
      expect(authService.register).not.toHaveBeenCalled();
    });
  });

  it("validates password requirements on submission", async () => {
    const { container } = render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^hasło$/i);
    const confirmPasswordInput = screen.getByLabelText(/powtórz hasło/i);
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "weak" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "weak" } });

    if (form) {
      fireEvent.submit(form);
    }

    // Sprawdzamy, czy funkcja register nie została wywołana, co oznacza że formularz nie przeszedł walidacji
    await waitFor(() => {
      expect(authService.register).not.toHaveBeenCalled();
    });
  });

  it("validates password confirmation matching on submission", async () => {
    const { container } = render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^hasło$/i);
    const confirmPasswordInput = screen.getByLabelText(/powtórz hasło/i);
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "DifferentPassword123!" } });

    if (form) {
      fireEvent.submit(form);
    }

    // Sprawdzamy, czy funkcja register nie została wywołana, co oznacza że formularz nie przeszedł walidacji
    await waitFor(() => {
      expect(authService.register).not.toHaveBeenCalled();
    });
  });

  it("submits form with valid data and handles success response", async () => {
    vi.mocked(authService.register).mockResolvedValueOnce({
      success: true,
      redirectTo: "/flashcards",
    });

    const { container } = render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^hasło$/i);
    const confirmPasswordInput = screen.getByLabelText(/powtórz hasło/i);
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "Password123!" } });

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Zarejestrowano pomyślnie");
    });
  });

  it("handles user already exists error", async () => {
    vi.mocked(authService.register).mockRejectedValueOnce(new Error("Użytkownik o podanym adresie email już istnieje"));

    const { container } = render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^hasło$/i);
    const confirmPasswordInput = screen.getByLabelText(/powtórz hasło/i);
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "Password123!" } });

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Użytkownik o podanym adresie email już istnieje");
    });
  });

  it("handles network errors during registration", async () => {
    vi.mocked(authService.register).mockRejectedValueOnce(new Error("Wystąpił błąd podczas rejestracji"));

    const { container } = render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^hasło$/i);
    const confirmPasswordInput = screen.getByLabelText(/powtórz hasło/i);
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "Password123!" } });

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Wystąpił błąd podczas rejestracji");
    });
  });

  it("disables form during submission", async () => {
    vi.mocked(authService.register).mockImplementationOnce(
      () =>
        new Promise(() => {
          // Never resolves
        })
    );

    const { container } = render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^hasło$/i);
    const confirmPasswordInput = screen.getByLabelText(/powtórz hasło/i);
    const submitButton = screen.getByRole("button", { name: /zarejestruj/i });
    const form = container.querySelector("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "Password123!" } });

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
    });
  });
});
