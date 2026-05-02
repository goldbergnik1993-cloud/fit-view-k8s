import { useState, useEffect, useCallback } from 'react';
import { cartApi, type Cart } from '../services/api';

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (item_id: number, size_label: string, quantity = 1) => {
    try {
      const data = await cartApi.addItem(item_id, size_label, quantity);
      setCart(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const updateQuantity = async (item_id: number, quantity: number) => {
    if (quantity < 1) return removeItem(item_id);
    try {
      const data = await cartApi.updateQuantity(item_id, quantity);
      setCart(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const removeItem = async (item_id: number) => {
    try {
      const data = await cartApi.removeItem(item_id);
      setCart(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const clearCart = async () => {
    try {
      const data = await cartApi.clearCart();
      setCart(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return {
    cart,
    loading,
    error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refetch: fetchCart,
  };
}