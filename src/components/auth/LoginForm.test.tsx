import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  it('renders login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zaloguj/i })).toBeInTheDocument();
    expect(screen.getByText(/zapomniałeś hasła/i)).toBeInTheDocument();
    expect(screen.getByText(/nie masz jeszcze konta/i)).toBeInTheDocument();
  });

  it('prevents submission with invalid email', async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn();
    
    const originalFetch = window.fetch;
    window.fetch = mockFetch;
    
    try {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole('button', { name: /zaloguj/i });
      
      // Wprowadzenie niepoprawnego emaila, ale poprawnego hasła
      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'Password123!');
      
      // Kliknięcie przycisku logowania
      await user.click(submitButton);
      
      // API nie powinno być wywołane, jeśli walidacja nie przechodzi
      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('prevents submission with empty password', async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn();
    
    const originalFetch = window.fetch;
    window.fetch = mockFetch;
    
    try {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /zaloguj/i });
      
      // Wprowadzenie poprawnego emaila, ale pustego hasła
      await user.type(emailInput, 'test@example.com');
      
      // Kliknięcie przycisku logowania
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
        redirectTo: '/flashcards'
      })
    });
    
    render(<LoginForm />);
    
    // Wypełnienie formularza
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/hasło/i), 'Password123!');
    
    // Kliknięcie przycisku logowania
    await user.click(screen.getByRole('button', { name: /zaloguj/i }));
    
    // Sprawdzenie, czy fetch został wywołany z poprawnymi danymi
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123!'
        })
      });
    });
    
    // Sprawdzenie, czy toast success został wywołany
    expect(toast.success).toHaveBeenCalledWith('Zalogowano pomyślnie');
    
    // Sprawdzenie, czy nastąpiło przekierowanie
    expect(mockLocation.href).toBe('/flashcards');
  });

  it('handles failed login attempts', async () => {
    const user = userEvent.setup();
    
    // Konfiguracja mocka fetch dla błędnej odpowiedzi
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        message: 'Nieprawidłowe dane logowania'
      })
    });
    
    render(<LoginForm />);
    
    // Wypełnienie formularza
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/hasło/i), 'WrongPassword123!');
    
    // Kliknięcie przycisku logowania
    await user.click(screen.getByRole('button', { name: /zaloguj/i }));
    
    // Sprawdzenie, czy fetch został wywołany
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    
    // Sprawdzenie, czy toast error został wywołany
    expect(toast.error).toHaveBeenCalledWith('Nieprawidłowe dane logowania');
    
    // Sprawdzenie, czy nie nastąpiło przekierowanie
    expect(mockLocation.href).toBe('');
  });
  
  it('handles network errors during login', async () => {
    const user = userEvent.setup();
    
    // Konfiguracja mocka fetch dla błędu sieciowego
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<LoginForm />);
    
    // Wypełnienie formularza
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/hasło/i), 'Password123!');
    
    // Kliknięcie przycisku logowania
    await user.click(screen.getByRole('button', { name: /zaloguj/i }));
    
    // Sprawdzenie, czy toast error został wywołany
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Wystąpił błąd podczas logowania');
    });
  });

  it('disables form during submission', async () => {
    const user = userEvent.setup();
    
    // Używamy opóźnienia, aby sprawdzić stan podczas ładowania
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => 
        resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, redirectTo: '/flashcards' })
        }), 100)
      )
    );
    
    render(<LoginForm />);
    
    // Wypełnienie formularza
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/hasło/i), 'Password123!');
    
    // Kliknięcie przycisku logowania
    await user.click(screen.getByRole('button', { name: /zaloguj/i }));
    
    // Sprawdzenie, czy przyciski są wyłączone podczas ładowania
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/hasło/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /logowanie/i })).toBeDisabled();
  });
}); 