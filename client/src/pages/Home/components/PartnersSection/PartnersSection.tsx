import styles from './PartnersSection.module.scss';

const PARTNERS = [
  { id: 1, name: 'Zara' },
  { id: 2, name: 'Patagonia' },
  { id: 3, name: 'The North Face' },
  { id: 4, name: 'Mango' },
  { id: 5, name: "Levi's" },
  { id: 6, name: 'Ralph Lauren' },
  { id: 7, name: 'Cos' },
  { id: 8, name: 'Superdry' },
];

export const PartnersSection = () => (
  <section className={styles.section} aria-labelledby="partners-heading">
    <div className={styles['section__header']}>
      <h2 id="partners-heading" className={styles['section__title']}>
        Our partners
      </h2>
    </div>

    <ul className={styles['items-grid']} role="list">
      {PARTNERS.map(partner => (
        <li key={partner.id}>
          <button
            className={styles['partner-card']}
            aria-label={`View ${partner.name} collection`}
          >
            <span className={styles['partner-card__name']}>{partner.name}</span>
          </button>
        </li>
      ))}
    </ul>
  </section>
);