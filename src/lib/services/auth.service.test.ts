import { vi, describe, it, expect, beforeEach } from 'vitest';
import { authService } from './auth.service';
import { supabaseClient } from '../../db/supabase.client';

// Mock supabaseClient
vi.mock('../../db/supabase.client', () => ({
  supabaseClient: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn()
    }
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockSession = { access_token: 'token' };
      
      // Konfiguracja mocka
      (supabaseClient.auth.signUp as any).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });
      
      // Wywołanie metody
      const result = await authService.register('test@example.com', 'Password123!');
      
      // Sprawdzenie wyniku
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      
      // Weryfikacja wywołania supabase
      expect(supabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!'
      });
    });
    
    it('should handle registration error', async () => {
      const mockError = { message: 'Email already registered' };
      
      // Konfiguracja mocka
      (supabaseClient.auth.signUp as any).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      });
      
      // Wywołanie metody
      const result = await authService.register('existing@example.com', 'Password123!');
      
      // Sprawdzenie wyniku
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
    
    it('should handle unexpected errors during registration', async () => {
      const mockError = new Error('Network error');
      
      // Konfiguracja mocka
      (supabaseClient.auth.signUp as any).mockRejectedValue(mockError);
      
      // Wywołanie metody
      const result = await authService.register('test@example.com', 'Password123!');
      
      // Sprawdzenie wyniku
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });
  
  describe('login', () => {
    it('should login a user successfully', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockSession = { access_token: 'token' };
      
      // Konfiguracja mocka
      (supabaseClient.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });
      
      // Wywołanie metody
      const result = await authService.login('test@example.com', 'Password123!');
      
      // Sprawdzenie wyniku
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      
      // Weryfikacja wywołania supabase
      expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!'
      });
    });
    
    it('should handle login failure with invalid credentials', async () => {
      const mockError = { message: 'Invalid login credentials' };
      
      // Konfiguracja mocka
      (supabaseClient.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      });
      
      // Wywołanie metody
      const result = await authService.login('test@example.com', 'WrongPassword');
      
      // Sprawdzenie wyniku
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
    
    it('should handle unexpected errors during login', async () => {
      const mockError = new Error('Network error');
      
      // Konfiguracja mocka
      (supabaseClient.auth.signInWithPassword as any).mockRejectedValue(mockError);
      
      // Wywołanie metody
      const result = await authService.login('test@example.com', 'Password123!');
      
      // Sprawdzenie wyniku
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });
  
  describe('logout', () => {
    it('should logout a user successfully', async () => {
      // Konfiguracja mocka
      (supabaseClient.auth.signOut as any).mockResolvedValue({
        error: null
      });
      
      // Wywołanie metody
      const result = await authService.logout();
      
      // Sprawdzenie wyniku
      expect(result.error).toBeNull();
      
      // Weryfikacja wywołania supabase
      expect(supabaseClient.auth.signOut).toHaveBeenCalled();
    });
    
    it('should handle errors during logout', async () => {
      const mockError = { message: 'Session not found' };
      
      // Konfiguracja mocka
      (supabaseClient.auth.signOut as any).mockResolvedValue({
        error: mockError
      });
      
      // Wywołanie metody
      const result = await authService.logout();
      
      // Sprawdzenie wyniku
      expect(result.error).toEqual(mockError);
    });
    
    it('should handle unexpected errors during logout', async () => {
      const mockError = new Error('Network error');
      
      // Konfiguracja mocka
      (supabaseClient.auth.signOut as any).mockRejectedValue(mockError);
      
      // Wywołanie metody
      const result = await authService.logout();
      
      // Sprawdzenie wyniku
      expect(result.error).toEqual(mockError);
    });
  });
  
  describe('getSession', () => {
    it('should retrieve active session successfully', async () => {
      const mockSession = { access_token: 'token' };
      
      // Konfiguracja mocka
      (supabaseClient.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
        error: null
      });
      
      // Wywołanie metody
      const result = await authService.getSession();
      
      // Sprawdzenie wyniku
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      
      // Weryfikacja wywołania supabase
      expect(supabaseClient.auth.getSession).toHaveBeenCalled();
    });
    
    it('should handle no active session', async () => {
      // Konfiguracja mocka
      (supabaseClient.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      // Wywołanie metody
      const result = await authService.getSession();
      
      // Sprawdzenie wyniku
      expect(result.session).toBeNull();
      expect(result.error).toBeNull();
    });
  });
  
  describe('getUser', () => {
    it('should retrieve user data successfully', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      
      // Konfiguracja mocka
      (supabaseClient.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      
      // Wywołanie metody
      const result = await authService.getUser();
      
      // Sprawdzenie wyniku
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      
      // Weryfikacja wywołania supabase
      expect(supabaseClient.auth.getUser).toHaveBeenCalled();
    });
    
    it('should handle no authenticated user', async () => {
      const mockError = { message: 'Not authenticated' };
      
      // Konfiguracja mocka
      (supabaseClient.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: mockError
      });
      
      // Wywołanie metody
      const result = await authService.getUser();
      
      // Sprawdzenie wyniku
      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });
}); 