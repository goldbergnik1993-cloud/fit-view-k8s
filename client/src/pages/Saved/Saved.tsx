import { useState, useCallback, useEffect } from 'react';
import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import EmptyState from '../../shared/components/EmptyState/EmptyState';
import ItemCard from '../../shared/components/ItemCard/ItemCard';
import { userApi, itemsApi } from '../../services/api';
import { mapItem } from '../../hooks/useItems';
import type { ClothingItem } from '../../types/clothing';
import styles from './Saved.module.scss';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites } from '../../providers/FavoritesContext';
import EmptySavedIllustration from '../../assets/illustrations/empty-saved.png';

const Saved = () => {
  const { user, loading: authLoading } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [savedItems, setSavedItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      const guestIds = Object.entries(favorites)
        .filter(([, v]) => v)
        .map(([id]) => id);

      if (guestIds.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await Promise.all(
          guestIds.map((id) => itemsApi.getById(id))
        );
        setSavedItems(results.map(mapItem));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getFavorites();
      setSavedItems(data.items.map(mapItem));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user, favorites]);

  useEffect(() => {
    if (!authLoading) fetchFavorites();
  }, [fetchFavorites, authLoading]);

  const isEmpty = !loading && !error && savedItems.length === 0;

  return (
    <div className={styles.saved}>
      <Header />

      <main className={styles.saved__main}>
        {loading && (
          <div className={styles.saved__skeletonWrap}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.saved__skeleton} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className={styles.saved__error}>
            <p>Something went wrong.</p>
            <button type="button" onClick={fetchFavorites}>
              Retry
            </button>
          </div>
        )}

        {isEmpty && (
          <EmptyState
            title="You haven't saved any items yet!"
            subtitle="Discover jackets and save your top picks for later"
            buttonText="Browse All Items"
            buttonPath="/catalog"
            illustration={EmptySavedIllustration}
          />
        )}

        {!loading && !error && savedItems.length > 0 && (
          <div className={styles.saved__content}>
            <div className={styles.saved__heading}>
              <h1 className={styles.saved__title}>Saved</h1>
              <p className={styles.saved__count}>{savedItems.length} items</p>
            </div>

            <div className={styles.saved__grid}>
              {savedItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isFavorite={isFavorite(item.id)}
                  onFavoriteToggle={toggleFavorite}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Saved;