import { createContext, useContext } from 'react';
import type { Cart } from '../services/api';

export interface CartContextValue {
  cart: Cart | null;
  count: number;
  loading: boolean;
  addItem: (
    item_id: number,
    size_label: string,
    quantity?: number,
    price?: number,
    itemData?: {
      name: string;
      brand: { id: number; name: string };
      category: string;
      gender: string;
      image_url: string;
      is_favorite: boolean;
    }
  ) => Promise<void>;
  updateQuantity: (item_id: number, quantity: number) => Promise<void>;
  removeItem: (item_id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const CartContext = createContext<CartContextValue>({
  cart: null,
  count: 0,
  loading: true,
  addItem: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  refetch: async () => {},
});

export const useCart = () => useContext(CartContext);
