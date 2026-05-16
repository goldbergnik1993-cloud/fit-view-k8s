import styles from './Silhouette.module.scss';
import womanSvg from '../../../assets/images/silhouette-woman.svg';
import manSvg from '../../../assets/images/silhouette-man.svg';

interface SilhouetteProps {
  linePositionPct: number;
  label: string;
  heightCm: number;
  itemLengthCm?: number | null;
  gender?: 'male' | 'female';
  loading?: boolean;
  onHeightChange?: (height: number) => void;
  hasFittingImage?: boolean;
  fittingImageUrl?: string | null;
}

const Silhouette = ({
  linePositionPct,
  itemLengthCm,
  heightCm,
  label,
  gender = 'female',
  onHeightChange,
  hasFittingImage = false,
  fittingImageUrl,
}: SilhouetteProps) => {
  const src = gender === 'male' ? manSvg : womanSvg;

  return (
    <div className={styles.silhouette}>
      <div className={styles.silhouette__viewer}>
        <div className={styles.silhouette__sliderCol}>
          <div className={styles.silhouette__sliderLabels}>
            <span className={styles.silhouette__sliderTop}>{heightCm} cm</span>
            <span className={styles.silhouette__sliderBottom}>Your Height</span>
          </div>
          <div className={styles.silhouette__sliderTrack}>
            <input
              type="range"
              min={140}
              max={210}
              value={heightCm}
              onChange={(e) => onHeightChange?.(Number(e.target.value))}
              className={styles.silhouette__sliderInput}
              aria-label="Your height"
            />
          </div>
        </div>

        <div className={styles.silhouette__imageWrap}>
          <div className={styles.silhouette__stack}>
            <img
              src={src}
              alt={gender === 'male' ? 'Male silhouette' : 'Female silhouette'}
              className={`${styles.silhouette__image} ${hasFittingImage ? styles['silhouette__image--hidden'] : ''}`}
            />
            {fittingImageUrl && (
              <img
                src={fittingImageUrl}
                alt="Fitting"
                className={styles.silhouette__fittingImg}
              />
            )}
          </div>
          <div
            className={styles.silhouette__line}
            style={{ bottom: `${linePositionPct}%` }}
            aria-hidden="true"
          />
        </div>

        <div className={styles.silhouette__rulerCol}>
          <div className={styles.silhouette__ruler} aria-hidden="true" />
          <span
            className={styles.silhouette__itemLengthLabel}
            style={{ bottom: `${linePositionPct}%` }}
          >
            {itemLengthCm != null ? `${itemLengthCm} cm` : '— cm'}
          </span>
          <span className={styles.silhouette__itemLengthText}>Item length</span>
        </div>
      </div>

      <p className={styles.silhouette__endsLabel}>{label}</p>
    </div>
  );
};

export default Silhouette;