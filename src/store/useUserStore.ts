// src/store/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserState, User } from '../types';

// Define the shape of the state plus actions
interface UserStore extends UserState {
  updateUser: (updatedData: Partial<User>) => void; // Add updateUser action
}


export const useUserStore = create<UserStore>()( // Use the extended UserStore type
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

      // New function to update user details
      updateUser: (updatedData: Partial<User>) => {
        set((state) => {
          if (state.user) {
            // Merge existing user data with the updated data
            return { user: { ...state.user, ...updatedData } };
          }
          return state; // Return current state if no user is logged in
        });
      },
    }),
    {
      name: 'user-storage',
    }
  )
);