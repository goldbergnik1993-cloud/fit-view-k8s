import styles from './HeroSection.module.scss';
import SilhouetteManImg from '../../../../assets/images/silhouette-man.svg';
import SilhouetteWomanImg from '../../../../assets/images/silhouette-woman.svg';

export const HeroSection = () => {

  return (
    <>
      <section className={styles.hero} aria-label="Welcome section">
        <div className={styles['hero__content']}>
          <div className={styles['hero__media']} aria-hidden="true">
            <div className={styles['hero__silhouette']}>
              <img src={SilhouetteManImg} alt="" aria-hidden="true" className={styles['hero__silhouette-img']} />
            </div>
            <div className={styles['hero__silhouette']}>
              <img src={SilhouetteWomanImg} alt="" aria-hidden="true" className={styles['hero__silhouette-img']} />
            </div>
          </div>

          <div className={styles['hero__text']}>
            <h1 className={styles['hero__title']}>
              Find your new favorite style without the hassle
            </h1>
            <p className={styles['hero__description']}>
              Browse, measure, and virtually try on in seconds.{' '}
              Check out these brief{' '}
              <button
                className={styles['hero__instructions-link']}

                aria-haspopup="dialog"
              >
                instructions
              </button>
              {' '}before you get started
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
    </>
  );
};