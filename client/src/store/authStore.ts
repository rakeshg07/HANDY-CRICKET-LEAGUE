'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';

export interface AuthUser {
  id: string; // MongoDB _id
  userId: string;
  fullName: string;
  email: string;
  country: string;
  avatar: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  totalRuns: number;
  highestScore: number;
  rank: number;
  isOnline: boolean;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: AuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await api.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
