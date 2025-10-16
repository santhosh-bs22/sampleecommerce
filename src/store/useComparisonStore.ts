import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ComparisonState, Product } from '../types';

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      products: [],
      
      addProduct: (product: Product) => {
        set((state) => {
          // Check for max limit (4)
          if (state.products.length >= 4) {
            // In a real app, this should trigger a toast notification
            return state; 
          }
          // Check if product is already in the list
          if (state.products.find(p => p.id === product.id)) {
            return state;
          }
          return { products: [...state.products, product] };
        });
      },
      
      removeProduct: (productId: number) => {
        set((state) => ({
          products: state.products.filter(p => p.id !== productId),
        }));
      },
      
      clearComparison: () => {
        set({ products: [] });
      },
      
      isInComparison: (productId: number) => {
        return get().products.some(p => p.id === productId);
      },
    }),
    {
      name: 'comparison-storage',
    }
  )
);