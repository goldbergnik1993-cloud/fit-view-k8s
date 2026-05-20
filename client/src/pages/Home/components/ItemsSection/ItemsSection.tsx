import { useItems } from '../../../../hooks/useItems';
import { useBreakpoint } from '../../../../hooks/useBreakpoint';
import ItemCard from '../../../../shared/components/ItemCard/ItemCard';
import { useFavorites } from '../../../../providers/FavoritesContext';
import styles from './ItemsSection.module.scss';

export const ItemsSection = () => {
  const { isMobile } = useBreakpoint();
  const { items, loading } = useItems({
    sort_by: 'popular',
    per_page: isMobile ? 4 : 8,
  });

  const {toggleFavorite, isFavorite } = useFavorites();

  return (
    <section className={styles.section} aria-labelledby="popular-items-heading">
      <div className={styles['section__header']}>
        <h2 id="popular-items-heading" className={styles['section__title']}>
          Popular Items
        </h2>
        <a
          href="/catalog"
          className={styles['section__see-all']}
          aria-label="See all popular items"
        >
          See all
        </a>
      </div>

      {loading && (
        <ul className={styles['items-grid']} role="list">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className={styles['item-skeleton']} />
          ))}
        </ul>
      )}

      {!loading && (
        <ul className={styles['items-grid']} role="list">
          {items.map((item) => (
            <li key={item.id}>
              <ItemCard
                item={item}
                isFavorite={isFavorite(item.id)}
                onFavoriteToggle={toggleFavorite}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
