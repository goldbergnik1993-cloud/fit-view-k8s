import { useEffect, useRef } from 'react';
import { useSearch } from '../../../hooks/useSearch';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { mapItem } from '../../../hooks/useItems';
import CloseIcon from '../../../assets/icons/burger-close.svg';
import styles from './SearchBar.module.scss';

interface SearchBarProps {
  onClose: () => void;
}

export const SearchBar = ({ onClose }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDesktop } = useBreakpoint();

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
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const hasQuery = query.length >= 3;
  const topChoices = recommendations.slice(0, 5);
  // Планшет — 2 карточки, десктоп — 3 карточки
  const cardCount = isDesktop ? 3 : 2;
  const youMayAlsoLike = recommendations.slice(0, cardCount);
  const resultCount = suggestions.length;

  return (
    <div ref={containerRef} className={styles.searchBar}>
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
              <img
                src={CloseIcon}
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
              />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      <div className={styles.dropdown}>
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
        {hasQuery && suggestions.length > 0 && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Top choices</p>
            <ul>
              {suggestions.map((s) => (
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

        {/* You may also like + See All Results */}
        {youMayAlsoLike.length > 0 && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>You may also like</p>
            <div className={styles.itemsRow}>
              {youMayAlsoLike.map((raw) => {
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
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemBrand}>{item.brand}</p>
                      <div className={styles.itemPriceRow}>
                        <p className={styles.itemPrice}>${item.price}</p>
                        <span className={styles.itemLike} onClick={(e) => e.stopPropagation()}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </button>
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

        {loading && <p className={styles.loading}>Searching...</p>}
      </div>
    </div>
  );
};