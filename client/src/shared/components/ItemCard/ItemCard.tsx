import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ClothingItem } from '../../../types/clothing';
import styles from './ItemCard.module.scss';

interface ItemCardProps {
  item: ClothingItem;
  isActive?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onAddToBag?: (id: string) => void;
  variant?: 'default' | 'large' | 'small' | 'mini' | 'search' | 'saved';
}

const ItemCard = ({
  item,
  isActive = false,
  isFavorite = false,
  onFavoriteToggle,
  onAddToBag,
  variant = 'default',
}: ItemCardProps) => {
  const navigate = useNavigate();
  const [isPopping, setIsPopping] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPopping(true);
    onFavoriteToggle?.(item.id);
  };

  return (
    <article
      className={[
        styles.card,
        styles[`card--${variant}`],
        isActive ? styles['card--active'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => navigate(`/item/${item.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/item/${item.id}`);
      }}
      aria-label={`${item.name}, ${item.price}$`}
    >
      <div className={styles.card__image}>
        <img
          src={item.imageUrl}
          alt={item.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x300?text=No+Image';
          }}
        />
      </div>

      <div className={styles.card__info}>
        <div className={styles.card__text}>
          <h3 className={styles.card__name}>{item.name}</h3>
          <p className={styles.card__meta}>{item.brand}</p>
          <p className={styles.card__price}>{item.price}$</p>
        </div>

        {variant === 'saved' ? (
          <button
            className={styles.card__bag}
            onClick={(e) => {
              e.stopPropagation();
              onAddToBag?.(item.id);
            }}
            type="button"
            aria-label="Add to bag"
          >
            <img
              src="/src/assets/icons/bag.svg"
              alt=""
              width={24}
              height={24}
            />
          </button>
        ) : (
          <button
            className={[
              styles.card__favorite,
              isFavorite ? styles['card__favorite--active'] : '',
              isPopping ? styles['card__favorite--pop'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={handleFavoriteClick}
            onAnimationEnd={() => setIsPopping(false)}
            type="button"
            aria-label={isFavorite ? 'Remove from saved' : 'Save item'}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 20 20"
              fill={isFavorite ? 'currentColor' : 'none'}
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 17C10 17 2 12.5 2 7C2 4.79 3.79 3 6 3C7.5 3 8.8 3.8 9.5 5C9.8 5.5 10.2 5.5 10.5 5C11.2 3.8 12.5 3 14 3C16.21 3 18 4.79 18 7C18 12.5 10 17 10 17Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </article>
  );
};

export default ItemCard;
