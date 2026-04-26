import styles from './Silhouette.module.scss';
import womanSvg from '../../../assets/images/silhouette-woman.svg';
import manSvg from '../../../assets/images/silhouette-man.svg';

interface SilhouetteProps {
  linePositionPct: number; // % from bottom
  label: string; // e.g. "Ends 0 cm from floor"
  heightCm: number; // e.g. 170
  gender?: 'male' | 'female' | 'unisex';
  loading?: boolean;
}

const Silhouette = ({
  linePositionPct,
  label,
  heightCm,
  gender = 'female',
  loading = false,
}: SilhouetteProps) => {
  const src = gender === 'male' ? manSvg : womanSvg;

  return (
    <div className={styles.silhouette}>
      {/* Left label */}
      <div className={styles.silhouette__left}>
        <span className={styles.silhouette__endLabel}>
          {loading ? '...' : label}
        </span>
      </div>

      {/* Center: silhouette image + line */}
      <div className={styles.silhouette__center}>
        <div className={styles.silhouette__imageWrap}>
          <img
            src={src}
            alt={gender === 'male' ? 'Male silhouette' : 'Female silhouette'}
            className={styles.silhouette__image}
          />

          {/* Horizontal line */}
          <div
            className={styles.silhouette__line}
            style={{ bottom: `${linePositionPct}%` }}
            aria-hidden="true"
          />

          {/* Vertical ruler */}
          <div className={styles.silhouette__ruler} aria-hidden="true" />
        </div>
      </div>

      {/* Right labels */}
      <div className={styles.silhouette__right}>
        <span className={styles.silhouette__heightLabel}>{heightCm} cm</span>
        <span className={styles.silhouette__itemLabel}>Item length</span>
      </div>
    </div>
  );
};

export default Silhouette;
