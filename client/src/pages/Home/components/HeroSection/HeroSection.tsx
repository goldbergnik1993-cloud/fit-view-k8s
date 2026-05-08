import { useState } from 'react';
import styles from './HeroSection.module.scss';
import SilhouetteManImg from '../../../../assets/images/home-male-silhouette.png';
import SilhouetteWomanImg from '../../../../assets/images/home-female-silhouette.png';
import { OnboardingModal } from '../OnboardingModal/OnboardingModal';

export const HeroSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const description = (
    <>
      Browse, measure, and virtually try on in seconds. Check out these brief{' '}
      <button
        className={styles['hero__instructions-link']}
        onClick={() => setIsModalOpen(true)}
        aria-haspopup="dialog"
      >
        instructions
      </button>{' '}
      before you get started
    </>
  );

  return (
    <>
      <section className={styles.hero} aria-label="Welcome section">
        <div className={styles['hero__top']}>
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

          {/* Mobile only */}
          <h1 className={styles['hero__title']}>
            Find your new favorite style without the hassle
          </h1>

          {/* Tablet/Desktop only */}
          <div className={styles['hero__text']}>
            <h1 className={styles['hero__title--large']}>
              Find your new favorite style without the hassle
            </h1>
            <p className={styles['hero__description--inline']}>{description}</p>
          </div>
        </div>

        {/* Mobile only */}
        <p className={styles['hero__description']}>{description}</p>

        <a
          href="/catalog"
          className={styles['hero__cta']}
          aria-label="Start virtual try-on, go to catalog"
        >
          Start Virtual Try-On
        </a>
      </section>

      <OnboardingModal
        key={isModalOpen ? 'open' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
