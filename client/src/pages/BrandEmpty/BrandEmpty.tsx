import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import { SimilarItems } from '../../shared/components/SimilarItems/SimilarItems';
import styles from './BrandEmpty.module.scss';

const BRAND_DISPLAY_NAMES: Record<string, string> = {
  balenciaga: 'Balenciaga',
};

const BrandEmpty = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const brandName = BRAND_DISPLAY_NAMES[slug ?? ''] ?? slug ?? 'this brand';

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.page__main}>
        <nav className={styles.page__breadcrumbs} aria-label="Breadcrumb">
          <a href="/" className={styles.page__breadcrumbLink}>Home</a>
          <span className={styles.page__breadcrumbSep}>/</span>
          <a href="/catalog" className={styles.page__breadcrumbLink}>Catalog</a>
          <span className={styles.page__breadcrumbSep}>/</span>
          <span>{brandName}</span>
        </nav>

        <div className={styles.page__empty}>
          <img
            src="/icons/hangers.png"
            alt=""
            aria-hidden="true"
            className={styles.page__emptyIcon}
          />
          <h2 className={styles.page__emptyTitle}>Coming back soon</h2>
          <p className={styles.page__emptyText}>
            We're currently out of stock for {brandName}
          </p>
          <button
            type="button"
            className={styles.page__emptyBtn}
            onClick={() => navigate('/catalog')}
          >
            Browse Items
          </button>
        </div>

        <SimilarItems />
      </main>
      <Footer />
    </div>
  );
};

export default BrandEmpty;