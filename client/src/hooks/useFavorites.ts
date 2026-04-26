import { useState } from 'react';
import { itemsApi } from '../services/api';

const STORAGE_KEY = 'guest_favorites';

const getGuestFavorites = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const setGuestFavorites = (favorites: Record<string, boolean>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
};

export function useFavorites(isLoggedIn: boolean) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() =>
    isLoggedIn ? {} : getGuestFavorites()
  );

  const toggleFavorite = async (id: string) => {
    const current = favorites[id] ?? false;
    const updated = { ...favorites, [id]: !current };

    setFavorites(updated);

    if (!isLoggedIn) {
      setGuestFavorites(updated);
      return;
    }

    try {
      await itemsApi.toggleFavorite(id);
    } catch {
      setFavorites(favorites);
    }
  };

  const isFavorite = (id: string) => favorites[id] ?? false;

  return { favorites, toggleFavorite, isFavorite };
}