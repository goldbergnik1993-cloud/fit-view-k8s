import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { cartApi, type Cart, type CartItem } from '../services/api';
import { CartContext } from './CartContext';
import { useAuth } from '../hooks/useAuth';

const GUEST_CART_KEY = 'guest_cart';

type GuestCartItem = {
  id: number;
  size_label: string;
  quantity: number;
  item: CartItem['item'];
};

function loadGuestCart(): GuestCartItem[] {
  try {
    const data = localStorage.getItem(GUEST_CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function guestItemsToCart(items: GuestCartItem[]): Cart {
  return {
    user_id: 0,
    id: 0,
    status: 'Active',
    cart_items: items,
    created_at: '',
    updated_at: '',
    total_items: items.reduce((s, i) => s + i.quantity, 0),
    total_price: items.reduce((s, i) => s + Number(i.item.price) * i.quantity, 0),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAuth = !!user;

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuth) {
        const data = await cartApi.getCart();
        setCart(data);
      } else {
        setCart(guestItemsToCart(loadGuestCart()));
      }
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuth]);

  useEffect(() => {
    const initializeCart = async () => {
      setLoading(true);

      if (isAuth) {
        const guestItems = loadGuestCart();

        if (guestItems.length > 0) {
          try {
            await Promise.all(
              guestItems.map((i) =>
                cartApi.addItem(i.id, i.size_label, i.quantity)
              )
            );
            saveGuestCart([]);
          } catch (error) {
            console.error('Merge failed', error);
          }
        }

        try {
          const data = await cartApi.getCart();
          setCart(data);
        } catch {
          setCart(null);
        }
      } else {
        setCart(guestItemsToCart(loadGuestCart()));
      }

      setLoading(false);
    };

    initializeCart();
  }, [isAuth]);

  const addItem = async (
    item_id: number,
    size_label: string,
    quantity = 1,
    price = 0
  ) => {
    if (isAuth) {
      const data = await cartApi.addItem(item_id, size_label, quantity);
      setCart(data);
    } else {
      const items = loadGuestCart();
      const idx = items.findIndex(
        (i) => i.id === item_id && i.size_label === size_label
      );
      if (idx >= 0) {
        items[idx].quantity += quantity;
      } else {
        items.push({
          id: item_id,
          size_label,
          quantity,
          item: {
            id: item_id,
            name: '',
            brand: { id: 0, name: '' },
            category: '',
            gender: '',
            image_url: '',
            price: String(price), // ← было '0'
            is_favorite: false,
          },
        });
      }
      saveGuestCart(items);
      setCart(guestItemsToCart(items));
    }
  };

  const updateQuantity = async (item_id: number, quantity: number) => {
    if (quantity < 1) return removeItem(item_id);
    if (isAuth) {
      const data = await cartApi.updateQuantity(item_id, quantity);
      setCart(data);
    } else {
      const items = loadGuestCart().map((i) =>
        i.id === item_id ? { ...i, quantity } : i
      );
      saveGuestCart(items);
      setCart(guestItemsToCart(items));
    }
  };

  const removeItem = async (item_id: number) => {
    if (isAuth) {
      const data = await cartApi.removeItem(item_id);
      setCart(data);
    } else {
      const items = loadGuestCart().filter((i) => i.id !== item_id);
      saveGuestCart(items);
      setCart(guestItemsToCart(items));
    }
  };

  const clearCart = async () => {
    if (isAuth) {
      const data = await cartApi.clearCart();
      setCart(data);
    } else {
      saveGuestCart([]);
      setCart(guestItemsToCart([]));
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
