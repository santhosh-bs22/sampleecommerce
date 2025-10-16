import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserState, User } from '../types';

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: (userData: User) => {
        set({ user: userData, isAuthenticated: true });
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'user-storage',
    }
  )
);