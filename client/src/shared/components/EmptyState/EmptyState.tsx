import { useNavigate } from 'react-router-dom';
import { SimilarItems } from '../SimilarItems/SimilarItems';
import styles from './EmptyState.module.scss';
import EmptyIllustration from '../../../assets/illustrations/empty-catalog.svg';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonPath: string;
  onButtonClick?: () => void;
  showRecommendations?: boolean;
}

const EmptyState = ({
  title,
  subtitle,
  buttonText,
  buttonPath,
  onButtonClick,
  showRecommendations = true,
}: EmptyStateProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate(buttonPath);
    }
  };

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyState__inner}>
        <img
          src={EmptyIllustration}
          alt=""
          aria-hidden="true"
          className={styles.emptyState__illustration}
        />

        <h2 className={styles.emptyState__title}>{title}</h2>
        <p className={styles.emptyState__subtitle}>{subtitle}</p>

        <button
          className={styles.emptyState__button}
          onClick={handleClick}
          type="button"
        >
          {buttonText}
        </button>
      </div>

      {showRecommendations && (
        <div className={styles.emptyState__recommendations}>
          <SimilarItems />
        </div>
      )}
    </div>
  );
};

export default EmptyState;