import { useRef, useState, useEffect } from 'react';
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
}

const Silhouette = ({
  linePositionPct,
  itemLengthCm,
  heightCm,
  gender = 'female',
  onHeightChange,
}: SilhouetteProps) => {
  const src = gender === 'male' ? manSvg : womanSvg;
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgWidth, setImgWidth] = useState<number | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const update = () => setImgWidth(img.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(img);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={styles.silhouette}>
      {/* Вертикальный слайдер — tablet + desktop */}
      <div className={styles.silhouette__vslider}>
        <span className={styles.silhouette__vslider_top}>{heightCm} cm</span>
        <div className={styles.silhouette__vslider_track}>
          <input
            type="range"
            min={140}
            max={210}
            value={heightCm}
            onChange={(e) => onHeightChange?.(Number(e.target.value))}
            className={styles.silhouette__vslider_input}
            aria-label="Your height"
          />
        </div>
        <span className={styles.silhouette__vslider_bottom}>Your Height</span>
      </div>

      {/* Силуэт */}
      <div className={styles.silhouette__center}>
        <div className={styles.silhouette__imageWrap}>
          <img
            ref={imgRef}
            src={src}
            alt={gender === 'male' ? 'Male silhouette' : 'Female silhouette'}
            className={styles.silhouette__image}
          />
          <div
            className={styles.silhouette__line}
            style={{
              bottom: `${linePositionPct}%`,
              width: imgWidth ? `${imgWidth}px` : '100%',
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Ruler + item length */}
      <div className={styles.silhouette__right}>
        <div className={styles.silhouette__ruler} aria-hidden="true" />
        <span
          className={styles.silhouette__itemLengthLabel}
          style={{ bottom: `${linePositionPct}%` }}
        >
          {itemLengthCm != null ? `${itemLengthCm} cm` : '— cm'}
        </span>
      </div>
    </div>
  );
};

export default Silhouette;