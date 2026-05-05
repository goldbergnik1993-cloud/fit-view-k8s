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
}

const Silhouette = ({
  linePositionPct,
  itemLengthCm,
  gender = 'female',
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

      <div className={styles.silhouette__right}>
        <div className={styles.silhouette__ruler} aria-hidden="true" />
        <span
          className={styles.silhouette__itemLengthLabel}
          style={{ bottom: `${linePositionPct}%` }}
        >
          {itemLengthCm != null ? `${itemLengthCm} cm` : '— cm'}
        </span>
        <span className={styles.silhouette__bottomLabel}>Item length</span>
      </div>
    </div>
  );
};

export default Silhouette;
