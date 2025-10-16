import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeState } from '../types';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      
      toggleTheme: () => {
        set((state) => ({ isDark: !state.isDark }));
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);