// src/store/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserState, User } from '../types';

// Define the shape of the state plus actions
interface UserStore extends UserState {
  updateUser: (updatedData: Partial<User>) => void;
}


export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false, // <-- Initialize isAdmin

      login: (userData: User) => {
        // <-- Set isAdmin based on userData.role
        set({
          user: userData,
          isAuthenticated: true,
          isAdmin: userData.role === 'admin' // Check if role is admin
        });
      },

      logout: () => {
        // <-- Reset isAdmin on logout
        set({ user: null, isAuthenticated: false, isAdmin: false });
      },

      updateUser: (updatedData: Partial<User>) => {
        set((state) => {
          if (state.user) {
            const updatedUser = { ...state.user, ...updatedData };
            // <-- Update isAdmin if role changes
            const isAdmin = updatedUser.role === 'admin';
            return { user: updatedUser, isAdmin };
          }
          return state;
        });
      },
    }),
    {
      name: 'user-storage',
    }
  )
);