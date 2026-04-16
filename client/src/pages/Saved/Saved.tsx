import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import EmptyState from '../../shared/components/EmptyState/EmptyState';
import ItemCard from '../../shared/components/ItemCard/ItemCard';
import { userApi } from '../../services/api';
import { mapItem } from '../../hooks/useItems';
import type { ClothingItem } from '../../types/clothing';
import styles from './Saved.module.scss';

const Saved = () => {
  const [savedItems, setSavedItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getFavorites();
      setSavedItems(data.map(mapItem));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const isEmpty = !loading && !error && savedItems.length === 0;

  return (
    <div className={styles.saved}>
      <Header />

      <main className={styles.saved__main}>

        {loading && (
          <div className={styles.saved__skeletonWrap}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.saved__skeleton} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className={styles.saved__error}>
            <p>Something went wrong.</p>
            <button type="button" onClick={fetchFavorites}>Retry</button>
          </div>
        )}

        {isEmpty && (
          <EmptyState
            title="You haven't saved any items yet!"
            subtitle="Discover jackets and save your top picks for later"
            buttonText="Browse items"
            buttonPath="/catalog"
          />
        )}

        {!loading && !error && savedItems.length > 0 && (
          <div className={styles.saved__content}>
            <Link to="/" className={styles.saved__back} aria-label="Go back">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <div className={styles.saved__heading}>
              <div className={styles.saved__headingRow}>
                <h1 className={styles.saved__title}>Saved</h1>
                <button type="button" className={styles.saved__moreBtn} aria-label="More options">
                  <span /><span /><span />
                </button>
              </div>
              <p className={styles.saved__count}>{savedItems.length} items</p>
            </div>

            <div className={styles.saved__grid}>
              {savedItems.map((item) => (
                <ItemCard key={item.id} item={item} />
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