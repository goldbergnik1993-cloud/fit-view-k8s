import { useNavigate } from 'react-router-dom';
import styles from './ItemsSection.module.scss';

const POPULAR_ITEMS = [
  { id: 1, name: 'Midi dress', icon: 'icon-dress' },
  { id: 2, name: 'Classic Jeans', icon: 'icon-jeans' },
  { id: 3, name: 'Sweater', icon: 'icon-sweater' },
  { id: 4, name: 'Jacket', icon: 'icon-jacket' },
  { id: 5, name: 'Winter Coat', icon: 'icon-coat' },
  { id: 6, name: 'Lightweight Jacket', icon: 'icon-lightweight-jacket' },
  { id: 7, name: 'Overcoat', icon: 'icon-overcoat' },
  { id: 8, name: 'Windbreaker', icon: 'icon-windbreacker' },
];

export const ItemsSection = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.section} aria-labelledby="popular-items-heading">
      <div className={styles['section__header']}>
        <h2 id="popular-items-heading" className={styles['section__title']}>
          Popular Items
        </h2>
        <a href="/catalog" className={styles['section__see-all']} aria-label="See all popular items">
          See all
        </a>
      </div>

      <ul className={styles['items-grid']} role="list">
        {POPULAR_ITEMS.map(item => (
          <li key={item.id}>
            <button
              className={styles['item-card']}
              onClick={() => navigate(`/item/${item.id}`)}
              aria-label={`View ${item.name}`}
            >
              <div className={styles['item-card__placeholder']}>
                <img
                  src={`/src/assets/icons/icon-clothes/${item.icon}.svg`}
                  alt=""
                  aria-hidden="true"
                  className={styles['item-card__icon']}
                  width={16}
                  height={16}
                />
                <span className={styles['item-card__name']}>{item.name}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};