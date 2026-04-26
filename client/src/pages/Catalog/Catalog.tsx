import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import ItemCard from '../../shared/components/ItemCard/ItemCard';
import EmptyState from '../../shared/components/EmptyState/EmptyState';
import {
  FilterPanel,
  type FilterState,
} from '../../shared/components/FilterPanel/FilterPanel';
import { useItems } from '../../hooks/useItems';
import FilterIcon from '../../assets/icons/filter.svg';
import GridLargeIcon from '../../assets/icons/grid-large.svg';
import GridSmallIcon from '../../assets/icons/grid-small.svg';
import styles from './Catalog.module.scss';

const CATEGORIES = [
  { label: 'All', value: 'All' },
  { label: 'Dress', value: 'dress' },
  { label: 'Pants', value: 'pants' },
  { label: 'T-Shirt', value: 't_shirt' },
  { label: 'Skirt', value: 'skirt' },
  { label: 'Blouse', value: 'blouse' },
  { label: 'Shirt', value: 'shirt' },
  { label: 'Coat', value: 'coat' },
  { label: 'Sweater', value: 'sweater' },
];

const GENDER_LABELS: Record<string, string> = {
  male: 'Man',
  female: 'Woman',
};

const BRAND_NAMES: Record<number, string> = {
  1: 'Zara',
  2: 'Mango',
  3: 'Cos',
  4: 'Uniqlo',
  5: 'H&M',
  6: 'Ralph Lauren',
  7: 'The North Face',
};

type GridView = 'large' | 'small';

const EMPTY_FILTERS: FilterState = {
  sort_by: '',
  gender: [],
  size: [],
  brands: [],
};

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [gridView, setGridView] = useState<GridView>('large');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const urlName = searchParams.get('name');
  const urlBrandId = searchParams.get('brands');
  const urlBrandName = searchParams.get('brand_name');
  const isEmptyBrand = searchParams.get('empty') === 'true';

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...EMPTY_FILTERS,
    brands: urlBrandId ? [Number(urlBrandId)] : [],
  }));

  const itemsParams = useMemo(
    () => ({
      category: activeCategory,
      page,
      per_page: 12,
      sort_by: filters.sort_by || undefined,
      gender: filters.gender[0] as 'male' | 'female' | undefined,
      size: filters.size[0] || undefined,
      brands: filters.brands.length > 0 ? filters.brands : undefined,
      name: urlName || undefined,
    }),
    [activeCategory, page, filters, urlName]
  );

  const { items, loading, error, totalPages, totalItems } = useItems(itemsParams);

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    setPage(1);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearAll = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const activeFiltersCount =
    filters.gender.length +
    filters.size.length +
    filters.brands.length +
    (filters.sort_by ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className={styles.catalog}>
      <Header />

      <main className={styles.catalog__main}>
        {/* Breadcrumbs + filter button mobile */}
        <div className={styles.catalog__titleRow}>
          <nav className={styles.catalog__breadcrumbs} aria-label="Breadcrumb">
            <a href="/" className={styles.catalog__breadcrumbLink}>Home</a>
            <span className={styles.catalog__breadcrumbSep}>/</span>
            {urlName ? (
              <>
                <a href="/catalog" className={styles.catalog__breadcrumbLink}>Catalog</a>
                <span className={styles.catalog__breadcrumbSep}>/</span>
                <span>Search results for "{urlName}"</span>
              </>
            ) : urlBrandName ? (
              <>
                <a href="/catalog" className={styles.catalog__breadcrumbLink}>Catalog</a>
                <span className={styles.catalog__breadcrumbSep}>/</span>
                <span>{urlBrandName}</span>
              </>
            ) : (
              <span>Catalog</span>
            )}
          </nav>

          <button
            type="button"
            className={styles.catalog__filterBtnMobile}
            onClick={() => setIsFilterOpen(true)}
            aria-label="Filter"
          >
            <img src={FilterIcon} alt="" aria-hidden="true" width={20} height={20} />
            {activeFiltersCount > 0 && (
              <span className={styles.catalog__filterCount}>{activeFiltersCount}</span>
            )}
          </button>
        </div>

        {/* Controls */}
        <div className={styles.catalog__controls}>
          {/* Category pills */}
          <div className={styles.catalog__filters}>
            {CATEGORIES.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                className={`${styles.catalog__pill} ${activeCategory === value ? styles['catalog__pill--active'] : ''}`}
                onClick={() => handleCategoryChange(value)}
              >
                {value === 'All' ? `All (${totalItems})` : label}
              </button>
            ))}
          </div>

          {/* Filter only — tablet */}
          <div className={styles.catalog__viewControlsTablet}>
            <button
              type="button"
              className={styles.catalog__filterBtn}
              onClick={() => setIsFilterOpen((prev) => !prev)}
            >
              <span>Filter</span>
              <img src={FilterIcon} alt="" aria-hidden="true" width={16} height={16} />
              {activeFiltersCount > 0 && (
                <span className={styles.catalog__filterCount}>{activeFiltersCount}</span>
              )}
            </button>
          </div>

          {/* Grid + Filter — desktop */}
          <div className={styles.catalog__viewControlsDesktop}>
            <button
              type="button"
              className={`${styles.catalog__viewBtn} ${gridView === 'small' ? styles['catalog__viewBtn--active'] : ''}`}
              onClick={() => setGridView('small')}
              aria-label="Small grid"
            >
              <img src={GridSmallIcon} alt="" aria-hidden="true" width={18} height={18} />
            </button>

            <button
              type="button"
              className={`${styles.catalog__viewBtn} ${gridView === 'large' ? styles['catalog__viewBtn--active'] : ''}`}
              onClick={() => setGridView('large')}
              aria-label="Large grid"
            >
              <img src={GridLargeIcon} alt="" aria-hidden="true" width={18} height={18} />
            </button>

            <button
              type="button"
              className={styles.catalog__filterBtn}
              onClick={() => setIsFilterOpen((prev) => !prev)}
            >
              <span>Filter</span>
              <img src={FilterIcon} alt="" aria-hidden="true" width={16} height={16} />
              {activeFiltersCount > 0 && (
                <span className={styles.catalog__filterCount}>{activeFiltersCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Active filters tags */}
        {hasActiveFilters && (
          <div className={styles.catalog__activeTags}>
            {filters.gender.map((g) => (
              <button
                key={g}
                className={styles.catalog__activeTag}
                onClick={() => {
                  setFilters((prev) => ({ ...prev, gender: prev.gender.filter((x) => x !== g) }));
                  setPage(1);
                }}
              >
                × {GENDER_LABELS[g]}
              </button>
            ))}
            {filters.size.map((s) => (
              <button
                key={s}
                className={styles.catalog__activeTag}
                onClick={() => {
                  setFilters((prev) => ({ ...prev, size: prev.size.filter((x) => x !== s) }));
                  setPage(1);
                }}
              >
                × {s}
              </button>
            ))}
            {filters.brands.map((b) => (
              <button
                key={b}
                className={styles.catalog__activeTag}
                onClick={() => {
                  setFilters((prev) => ({ ...prev, brands: prev.brands.filter((x) => x !== b) }));
                  setPage(1);
                }}
              >
                × {BRAND_NAMES[b]}
              </button>
            ))}
            {filters.sort_by && (
              <button
                className={styles.catalog__activeTag}
                onClick={() => {
                  setFilters((prev) => ({ ...prev, sort_by: '' }));
                  setPage(1);
                }}
              >
                × {filters.sort_by === 'price_asc' ? 'Price (Low - High)' : filters.sort_by === 'price_desc' ? 'Price (High - Low)' : filters.sort_by === 'new' ? 'New' : 'Popular'}
              </button>
            )}
            <button className={styles.catalog__activeTag} onClick={handleClearAll}>
              × Clear All
            </button>
          </div>
        )}

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

        {/* Empty — without items (Balenciaga) */}
        {isEmptyBrand && !loading && (
          <div className={styles.catalog__brandEmpty}>
            <img src="/icons/hangers.svg" alt="" aria-hidden="true" className={styles.catalog__brandEmptyIcon} />
            <h2 className={styles.catalog__brandEmptyTitle}>Coming back soon</h2>
            <p className={styles.catalog__brandEmptyText}>
              We're currently out of stock for {urlBrandName ?? 'this brand'}
            </p>
            <button
              type="button"
              className={styles.catalog__brandEmptyBtn}
              onClick={() => navigate('/catalog')}
            >
              Browse All Items
            </button>
          </div>
        )}

        {/* Empty */}
        {!isEmptyBrand && !loading && !error && items.length === 0 && (
          <EmptyState
            title="No items found"
            subtitle="Try changing the filter or check back later"
            buttonText="Show all"
            buttonPath="/catalog"
          />
        )}

        {/* Grid */}
        {!isEmptyBrand && !loading && !error && items.length > 0 && (
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

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />

      <Footer />
    </div>
  );
};

export default Catalog;