import { useEffect, useRef } from 'react';
import { useSearch } from '../../../hooks/useSearch';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { mapItem } from '../../../hooks/useItems';
import styles from './SearchOverlay.module.scss';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const { isMobile } = useBreakpoint();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Фокус на input при открытии
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      clearQuery();
    }
  }, [isOpen, clearQuery]);

  // Закрыть при клике вне (только десктоп/планшет)
  useEffect(() => {
    if (isMobile || !isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen, onClose]);

  if (!isOpen) return null;

  const topChoices = recommendations.slice(0, 5);
  const youMayAlsoLike = recommendations.slice(0, 3);
  const hasQuery = query.length >= 3;

  const inputEl = (
    <div className={styles.inputWrap}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search"
        className={styles.input}
        aria-label="Search items"
      />
      {query && (
        <button className={styles.clear} onClick={clearQuery} aria-label="Clear">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      <button className={styles.cancel} onClick={onClose}>Cancel</button>
    </div>
  );

  const dropdownContent = (
    <>
      {/* Top choices */}
      {!hasQuery && topChoices.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Top choices</p>
          <ul>
            {topChoices.map(item => (
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
      {hasQuery && suggestions.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Top choices</p>
          <ul>
            {suggestions.map(s => (
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
            {youMayAlsoLike.map(raw => {
              const item = mapItem(raw);
              return (
                <button
                  key={item.id}
                  className={styles.itemCard}
                  onClick={() => handleItemClick(Number(item.id))}
                >
                  <div className={styles.itemImg}>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} />
                    )}
                  </div>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemBrand}>{item.brand}</p>
                  <p className={styles.itemPrice}>${item.price}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* See all results */}
      {hasQuery && (
        <button className={styles.seeAll} onClick={handleSeeAll}>
          See all results
        </button>
      )}

      {loading && <p className={styles.loading}>Searching...</p>}
    </>
  );

  // ─── Mobile: fullscreen ───────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className={styles.mobileOverlay}>
        <div className={styles.mobilePanel}>
          {inputEl}
          {dropdownContent}
        </div>
      </div>
    );
  }

 // ─── Tablet/Desktop: dropdown ─────────────────────────────────────────────────
return (
  <>
    <div className={styles.backdropOverlay} onClick={onClose} />
    <div ref={dropdownRef} className={styles.dropdown}>
      {inputEl}
      <div className={styles.dropdownContent}>
        {dropdownContent}
      </div>
    </div>
  </>
);
};