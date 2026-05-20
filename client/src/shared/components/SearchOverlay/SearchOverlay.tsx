import { useEffect, useRef } from 'react';
import { useSearch } from '../../../hooks/useSearch';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { mapItem } from '../../../hooks/useItems';
import ItemCard from '../ItemCard/ItemCard';
import { useFavorites } from '../../../providers/FavoritesContext';
import styles from './SearchOverlay.module.scss';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const { isMobile } = useBreakpoint();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    suggestions,
    recommendations,
    loading,
    handleSeeAll,
    handleSuggestionClick,
    handleItemClick,
    clearQuery,
  } = useSearch(onClose);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      clearQuery();
    }
  }, [isOpen, clearQuery]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const { isFavorite, toggleFavorite } = useFavorites();

  const topChoices = recommendations.slice(0, 5);
  const hasQuery = query.length >= 3;
  const activeSuggestions = hasQuery ? suggestions : [];
  const youMayAlsoLike = isMobile ? [] : recommendations.slice(0, 2);
  const resultCount = suggestions.length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Panel */}
      <div ref={panelRef} className={styles.panel}>
        {/* Input row */}
        <div className={styles.inputRow}>
          <div className={styles.inputWrap}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className={styles.input}
              aria-label="Search items"
            />
            {query && (
              <button
                className={styles.clear}
                onClick={clearQuery}
                aria-label="Clear"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
        </div>

        {/* Dropdown content */}
        <div className={styles.dropdownContent}>
          {/* Top choices — пока нет запроса */}
          {!hasQuery && topChoices.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Top choices</p>
              <ul>
                {topChoices.map((item) => (
                  <li key={item.id}>
                    <button
                      className={styles.suggestionItem}
                      onClick={() => handleItemClick(item.id)}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions при вводе */}
          {hasQuery && activeSuggestions.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Top choices</p>
              <ul>
                {activeSuggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      className={styles.suggestionItem}
                      onClick={() => handleSuggestionClick(s.name)}
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* You may also like — только планшет/десктоп */}
          {!isMobile && youMayAlsoLike.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>You may also like</p>
              <div className={styles.itemsRow}>
                {youMayAlsoLike.map((raw) => {
                  const item = mapItem(raw);
                  return (
                    <div key={item.id} className={styles.itemCardWrap}>
                      <ItemCard
                        item={item}
                        isFavorite={isFavorite(item.id)}
                        onFavoriteToggle={toggleFavorite}
                        variant="search"
                      />
                    </div>
                  );
                })}
              </div>

              {hasQuery && (
                <button className={styles.seeAll} onClick={handleSeeAll}>
                  See All Results ({resultCount})
                </button>
              )}
            </div>
          )}

          {/* See All Results — мобайл */}
          {isMobile && hasQuery && (
            <button className={styles.seeAll} onClick={handleSeeAll}>
              See All Results ({resultCount})
            </button>
          )}

          {loading && <p className={styles.loading}>Searching...</p>}
        </div>
      </div>
    </>
  );
};
