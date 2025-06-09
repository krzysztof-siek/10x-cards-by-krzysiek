import { supabaseClient } from '../../db/supabase.client';
import type { AuthError, Session, User } from '@supabase/supabase-js';

class AuthService {
  async login(email: string, password: string): Promise<{ 
    user: User | null; 
    session: Session | null; 
    error: AuthError | null;
  }> {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      return {
        user: data?.user || null,
        session: data?.session || null,
        error,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  async logout(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabaseClient.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Logout error:', error);
      return { error: error as AuthError };
    }
  }

  async getSession(): Promise<{ 
    session: Session | null; 
    error: AuthError | null;
  }> {
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      return {
        session: data?.session || null,
        error,
      };
    } catch (error) {
      console.error('Get session error:', error);
      return {
        session: null,
        error: error as AuthError,
      };
    }
  }

  async getUser(): Promise<{ 
    user: User | null; 
    error: AuthError | null;
  }> {
    try {
      const { data, error } = await supabaseClient.auth.getUser();
      return {
        user: data?.user || null,
        error,
      };
    } catch (error) {
      console.error('Get user error:', error);
      return {
        user: null,
        error: error as AuthError,
      };
    }
  }
}

export const authService = new AuthService(); 