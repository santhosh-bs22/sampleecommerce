import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WishlistState, Product } from '../types';

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product) => {
        set((state) => {
          if (state.items.find(item => item.id === product.id)) {
            return state;
          }
          return { items: [...state.items, product] };
        });
      },
      
      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== productId),
        }));
      },
      
      isInWishlist: (productId: number) => {
        return get().items.some(item => item.id === productId);
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);