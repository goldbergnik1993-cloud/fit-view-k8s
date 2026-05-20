import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { itemsApi, userApi } from '../services/api';
import { mapItem } from '../hooks/useItems';
import { useAuth } from '../hooks/useAuth';
import { FavoritesContext } from './FavoritesContext';

const STORAGE_KEY = 'guest_favorites';

const getGuestFavorites = (): Record<string, boolean> => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
};

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [favorites, setFavorites] = useState<Record<string, boolean>>(getGuestFavorites);

  useEffect(() => {
    if (!isLoggedIn) return;
    userApi.getFavorites({ per_page: 100 })
      .then((data) => {
        const map: Record<string, boolean> = {};
        data.items.map(mapItem).forEach((item) => { map[item.id] = true; });
        setFavorites(map);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  const toggleFavorite = useCallback(async (id: string) => {
    const current = favorites[id] ?? false;
    const updated = { ...favorites, [id]: !current };
    setFavorites(updated);

    if (!isLoggedIn) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return;
    }
    try {
      await itemsApi.toggleFavorite(id);
    } catch {
      setFavorites(favorites);
    }
  }, [favorites, isLoggedIn]);

  const isFavorite = useCallback((id: string) => favorites[id] ?? false, [favorites]);
  const count = Object.values(favorites).filter(Boolean).length;

  return (
    <FavoritesContext.Provider value={{ favorites, count, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}