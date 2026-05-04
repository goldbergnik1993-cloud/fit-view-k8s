import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { cartApi, type Cart } from '../services/api';
import { CartContext } from './CartContext';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      console.warn('Failed to fetch cart:', err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (item_id: number, size_label: string, quantity = 1) => {
    const data = await cartApi.addItem(item_id, size_label, quantity);
    setCart(data);
  };

  const updateQuantity = async (item_id: number, quantity: number) => {
    if (quantity < 1) return removeItem(item_id);
    try {
      const data = await cartApi.updateQuantity(item_id, quantity);
      setCart(data);
    } catch (err) {
      console.warn('Failed to update quantity:', err);
    }
  };

  const removeItem = async (item_id: number) => {
    try {
      const data = await cartApi.removeItem(item_id);
      setCart(data);
    } catch (err) {
      console.warn('Failed to remove item:', err);
    }
  };

  const clearCart = async () => {
    try {
      const data = await cartApi.clearCart();
      setCart(data);
    } catch (err) {
      console.warn('Failed to clear cart:', err);
    }
  };

  const count = cart?.total_items ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        loading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refetch: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
