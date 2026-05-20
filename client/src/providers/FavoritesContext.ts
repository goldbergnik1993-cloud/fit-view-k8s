import { createContext, useContext } from 'react';

export interface FavoritesContextValue {
  favorites: Record<string, boolean>;
  count: number;
  toggleFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: {},
  count: 0,
  toggleFavorite: async () => {},
  isFavorite: () => false,
});

export const useFavorites = () => useContext(FavoritesContext);