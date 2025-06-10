import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RegisterForm } from './RegisterForm';
import { toast } from 'sonner';

// Mocki
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock fetch API
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock window.location
const mockLocation = { href: '' };
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  it('renders register form correctly', () => {
    render(<RegisterForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^hasło$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/powtórz hasło/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zarejestruj/i })).toBeInTheDocument();
    expect(screen.getByText(/masz już konto/i)).toBeInTheDocument();
  });

  it('prevents submission with invalid email', async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn(); // Lokalny mock dla kontroli wywołań
    
    // Zastępujemy globalny mock dla tego testu
    const originalFetch = window.fetch;
    window.fetch = mockFetch;
    
    try {
      render(<RegisterForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/powtórz hasło/i);
      const submitButton = screen.getByRole('button', { name: /zarejestruj/i });
      
      // Wprowadzenie niepoprawnego emaila, ale poprawnych haseł
      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'Password123!');
      
      // Kliknięcie przycisku rejestracji
      await user.click(submitButton);
      
      // API nie powinno być wywołane, jeśli walidacja nie przechodzi
      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    } finally {
      // Przywracamy oryginalny fetch
      window.fetch = originalFetch;
    }
  });
  
  it('validates password requirements on submission', async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn();
    
    const originalFetch = window.fetch;
    window.fetch = mockFetch;
    
    try {
      render(<RegisterForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/powtórz hasło/i);
      const submitButton = screen.getByRole('button', { name: /zarejestruj/i });
      
      // Wprowadzenie poprawnego emaila, ale za krótkiego hasła
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'short');
      await user.type(confirmPasswordInput, 'short');
      
      // Kliknięcie przycisku rejestracji
      await user.click(submitButton);
      
      // API nie powinno być wywołane, jeśli walidacja nie przechodzi
      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('validates password confirmation matching on submission', async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn();
    
    const originalFetch = window.fetch;
    window.fetch = mockFetch;
    
    try {
      render(<RegisterForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/powtórz hasło/i);
      const submitButton = screen.getByRole('button', { name: /zarejestruj/i });
      
      // Wprowadzenie poprawnych danych dla email i hasło, ale różnych haseł
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'DifferentPassword123!');
      
      // Kliknięcie przycisku rejestracji
      await user.click(submitButton);
      
      // API nie powinno być wywołane, jeśli walidacja nie przechodzi
      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('submits form with valid data and handles success response', async () => {
    const user = userEvent.setup();
    
    // Konfiguracja mocka fetch dla poprawnej odpowiedzi
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        success: true,
        message: 'Zarejestrowano pomyślnie',
        redirectTo: '/flashcards'
      })
    });
    
    render(<RegisterForm />);
    
    // Wypełnienie formularza poprawnymi danymi
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^hasło$/i), 'Password123!');
    await user.type(screen.getByLabelText(/powtórz hasło/i), 'Password123!');
    
    // Kliknięcie przycisku rejestracji
    await user.click(screen.getByRole('button', { name: /zarejestruj/i }));
    
    // Sprawdzenie, czy fetch został wywołany z poprawnymi danymi
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        })
      });
    });
    
    // Sprawdzenie, czy toast success został wywołany
    expect(toast.success).toHaveBeenCalledWith('Zarejestrowano pomyślnie');
    
    // Sprawdzenie, czy nastąpiło przekierowanie
    expect(mockLocation.href).toBe('/flashcards');
  });

  it('handles user already exists error', async () => {
    const user = userEvent.setup();
    
    // Konfiguracja mocka fetch dla błędu "użytkownik już istnieje"
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        message: 'Użytkownik o podanym adresie email już istnieje'
      })
    });
    
    render(<RegisterForm />);
    
    // Wypełnienie formularza
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^hasło$/i), 'Password123!');
    await user.type(screen.getByLabelText(/powtórz hasło/i), 'Password123!');
    
    // Kliknięcie przycisku rejestracji
    await user.click(screen.getByRole('button', { name: /zarejestruj/i }));
    
    // Sprawdzenie, czy fetch został wywołany
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    
    // Sprawdzenie, czy toast error został wywołany z odpowiednim komunikatem
    expect(toast.error).toHaveBeenCalledWith('Użytkownik o podanym adresie email już istnieje');
  });
  
  it('handles network errors during registration', async () => {
    const user = userEvent.setup();
    
    // Konfiguracja mocka fetch dla błędu sieciowego
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<RegisterForm />);
    
    // Wypełnienie formularza
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^hasło$/i), 'Password123!');
    await user.type(screen.getByLabelText(/powtórz hasło/i), 'Password123!');
    
    // Kliknięcie przycisku rejestracji
    await user.click(screen.getByRole('button', { name: /zarejestruj/i }));
    
    // Sprawdzenie, czy toast error został wywołany
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Wystąpił błąd podczas rejestracji');
    });
  });

  it('disables form during submission', async () => {
    const user = userEvent.setup();
    
    // Używamy opóźnienia, aby sprawdzić stan podczas ładowania
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => 
        resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            message: 'Zarejestrowano pomyślnie',
            redirectTo: '/flashcards'
          })
        }), 100)
      )
    );
    
    render(<RegisterForm />);
    
    // Wypełnienie formularza
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^hasło$/i), 'Password123!');
    await user.type(screen.getByLabelText(/powtórz hasło/i), 'Password123!');
    
    // Kliknięcie przycisku rejestracji
    await user.click(screen.getByRole('button', { name: /zarejestruj/i }));
    
    // Sprawdzenie, czy przyciski są wyłączone podczas ładowania
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/^hasło$/i)).toBeDisabled();
    expect(screen.getByLabelText(/powtórz hasło/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /rejestracja/i })).toBeDisabled();
  });
}); 