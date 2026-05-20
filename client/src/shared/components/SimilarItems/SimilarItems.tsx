import { useEffect, useState, useRef } from 'react';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { itemsApi, type RecommendationItem } from '../../../services/api';
import { useFavorites } from '../../../providers/FavoritesContext';
import type { ClothingItem } from '../../../types/clothing';
import ItemCard from '../ItemCard/ItemCard';
import ChevronLeftIcon from '../../../assets/icons/chevron-left.svg';
import ChevronRightIcon from '../../../assets/icons/chevron-right.svg';
import styles from './SimilarItems.module.scss';

interface SimilarItemsProps {
  excludeId?: string;
}

const mapRecommendation = (i: RecommendationItem): ClothingItem => ({
  id: String(i.id),
  name: i.name,
  brand: typeof i.brand === 'object' ? i.brand.name : String(i.brand),
  category: i.category as ClothingItem['category'],
  imageUrl: i.image_url,
  price: Number(i.price),
  isFavorite: i.is_favorite ?? false,
  gender: i.gender,
  availableSizes: [],
  sizeCharts: [],
  measurements: [],
});

export const SimilarItems = ({ excludeId }: SimilarItemsProps) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const { isFavorite, toggleFavorite } = useFavorites();
  const listRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    itemsApi
      .getPersonalizedRecommendations()
      .then((data) => {
        const mapped = data
          .filter((i) => String(i.id) !== excludeId)
          .slice(0, 8)
          .map(mapRecommendation);
        setItems(mapped);
      })
      .catch(() => {});
  }, [excludeId]);

  const scroll = (dir: 'left' | 'right') => {
    if (!listRef.current) return;
    const cardWidth = listRef.current.firstElementChild?.clientWidth ?? 200;
    listRef.current.scrollBy({
      left: dir === 'left' ? -(cardWidth + 16) : cardWidth + 16,
      behavior: 'smooth',
    });
  };

  if (items.length === 0) return null;

  return (
    <section className={styles.similar}>
      <div className={styles.similar__header}>
        <h2 className={styles.similar__title}>You may also like</h2>
        <div className={styles.similar__nav}>
          <button
            className={styles.similar__navBtn}
            aria-label="Previous"
            onClick={() => scroll('left')}
          >
            <img src={ChevronLeftIcon} alt="" width={20} height={20} />
          </button>
          <button
            className={styles.similar__navBtn}
            aria-label="Next"
            onClick={() => scroll('right')}
          >
            <img src={ChevronRightIcon} alt="" width={20} height={20} />
          </button>
        </div>
      </div>

      <div className={styles.similar__list} ref={listRef}>
        {items.map((item) => (
          <div key={item.id} className={styles.similar__item}>
            <ItemCard
              item={item}
              isFavorite={isFavorite(item.id)}
              onFavoriteToggle={toggleFavorite}
              variant={isMobile ? 'mini' : 'default'}
            />
          </div>
        ))}
      </div>
    </section>
  );
};