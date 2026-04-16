import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import ItemCard from '../../shared/components/ItemCard/ItemCard';
import EmptyState from '../../shared/components/EmptyState/EmptyState';
import { useItems } from '../../hooks/useItems';
import styles from './Catalog.module.scss';

const FILTERS = [
  { label: 'All',     value: 'All' },
  { label: 'Dress',   value: 'dress' },
  { label: 'Pants',   value: 'pants' },
  { label: 'T-Shirt', value: 't_shirt' },
  { label: 'Skirt',   value: 'skirt' },
  { label: 'Blouse',  value: 'blouse' },
  { label: 'Shirt',   value: 'shirt' },
  { label: 'Coat',    value: 'coat' },
  { label: 'Sweater', value: 'sweater' },
];

type GridView = 'large' | 'small';

const Catalog = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage]                 = useState(1);
  const [gridView, setGridView]         = useState<GridView>('large');

  const { items, loading, error, totalPages } = useItems({ category: activeFilter, page });

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    setPage(1);
  };

  return (
    <div className={styles.catalog}>
      <Header />

      <main className={styles.catalog__main}>
        <Link to="/" className={styles.catalog__back} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <h1 className={styles.catalog__title}>Catalog</h1>

        {/* Controls */}
        <div className={styles.catalog__controls}>
          <div className={styles.catalog__filters}>
            {FILTERS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                className={`${styles.catalog__pill} ${activeFilter === value ? styles['catalog__pill--active'] : ''}`}
                onClick={() => handleFilterChange(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* View toggle + Filter — desktop only */}
          <div className={styles.catalog__viewControls}>
            <button
              type="button"
              className={`${styles.catalog__viewBtn} ${gridView === 'large' ? styles['catalog__viewBtn--active'] : ''}`}
              onClick={() => setGridView('large')}
              aria-label="Large grid"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="1"  y="1"  width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="11" y="1"  width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1"  y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            <button
              type="button"
              className={`${styles.catalog__viewBtn} ${gridView === 'small' ? styles['catalog__viewBtn--active'] : ''}`}
              onClick={() => setGridView('small')}
              aria-label="Small grid"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="1"  y="1"  width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="7"  y="1"  width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="13" y="1"  width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1"  y="7"  width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="7"  y="7"  width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="13" y="7"  width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1"  y="13" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="7"  y="13" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="13" y="13" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            <button type="button" className={styles.catalog__filterBtn}>
              <span>Filter</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className={`${styles.catalog__grid} ${styles[`catalog__grid--${gridView}`]}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.catalog__skeleton} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className={styles.catalog__error}>
            <p>Something went wrong. Please try again.</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <EmptyState
            title="No items found"
            subtitle="Try changing the filter or check back later"
            buttonText="Show all"
            buttonPath="/catalog"
          />
        )}

        {/* Grid */}
        {!loading && !error && items.length > 0 && (
          <div className={`${styles.catalog__grid} ${styles[`catalog__grid--${gridView}`]}`}>
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className={styles.catalog__pagination}>
            <button
              type="button"
              className={styles.catalog__pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.catalog__pageBtn} ${page === p ? styles['catalog__pageBtn--active'] : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              className={styles.catalog__pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              →
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;