// src/store/useRecentlyViewedStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, RecentlyViewedState } from '../types'; // Make sure RecentlyViewedState is in types

const MAX_RECENTLY_VIEWED = 8; // Limit the number of items stored

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        set((state) => {
          // Check if product already exists
          const existingIndex = state.items.findIndex(
            (item) => item.id === product.id && item.source === product.source
          );

          let newItems = [...state.items];

          if (existingIndex > -1) {
            // Remove existing item to move it to the front
            newItems.splice(existingIndex, 1);
          }

          // Add the new product to the beginning of the array
          newItems.unshift(product);

          // Limit the array size
          if (newItems.length > MAX_RECENTLY_VIEWED) {
            newItems = newItems.slice(0, MAX_RECENTLY_VIEWED);
          }

          return { items: newItems };
        });
      },

      clearItems: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'recently-viewed-storage', // Name for localStorage key
    }
  )
);