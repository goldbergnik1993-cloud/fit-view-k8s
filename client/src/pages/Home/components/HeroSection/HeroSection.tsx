import styles from './HeroSection.module.scss';
import SilhouetteManImg from '../../../../assets/images/silhouette-man.svg';
import SilhouetteWomanImg from '../../../../assets/images/silhouette-woman.svg';

export const HeroSection = () => (
  <section className={styles.hero} aria-label="Welcome section">
    <div className={styles['hero__content']}>
      <div className={styles['hero__media']} aria-hidden="true">
        <div className={styles['hero__silhouette']}>
          <img
            src={SilhouetteManImg}
            alt=""
            aria-hidden="true"
            className={styles['hero__silhouette-img']}
          />
        </div>
        <div className={styles['hero__silhouette']}>
          <img
            src={SilhouetteWomanImg}
            alt=""
            aria-hidden="true"
            className={styles['hero__silhouette-img']}
          />
        </div>
      </div>

      <div className={styles['hero__text']}>
        <h1 className={styles['hero__title']}>
          Find your new favorite style without the hassle
        </h1>
        <p className={styles['hero__description']}>
          Browse our stylish outerwear, enter your body measurements, and try
          items on virtually in seconds. Love the look? Buy with confidence.
        </p>
        <a
          href="/catalog"
          className={styles['hero__cta']}
          aria-label="Start virtual try-on, go to catalog"
        >
          Start Virtual Try-On
        </a>
      </div>
    </div>
  </section>
);