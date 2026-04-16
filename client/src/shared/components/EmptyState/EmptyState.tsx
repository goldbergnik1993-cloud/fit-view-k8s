import { useNavigate } from 'react-router-dom';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonPath: string;
}

const EmptyState = ({ title, subtitle, buttonText, buttonPath }: EmptyStateProps) => {
  const navigate = useNavigate();

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyState__illustration}>
        <svg
          width="180"
          height="160"
          viewBox="0 0 180 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Hanger hook */}
          <path
            d="M90 8 C90 8 90 2 96 2 C102 2 102 8 102 14 C102 18 90 24 75 34"
            stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none"
          />
          {/* Hanger arms */}
          <path
            d="M75 34 L38 58 M75 34 L140 58"
            stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none"
          />
          {/* Cart body */}
          <rect x="28" y="60" width="116" height="72" rx="3" stroke="#1A1A1A" strokeWidth="2" fill="none" />
          {/* Cart grid vertical */}
          <line x1="57"  y1="60" x2="57"  y2="132" stroke="#1A1A1A" strokeWidth="1.5" />
          <line x1="86"  y1="60" x2="86"  y2="132" stroke="#1A1A1A" strokeWidth="1.5" />
          <line x1="115" y1="60" x2="115" y2="132" stroke="#1A1A1A" strokeWidth="1.5" />
          {/* Cart grid horizontal */}
          <line x1="28" y1="84"  x2="144" y2="84"  stroke="#1A1A1A" strokeWidth="1.5" />
          <line x1="28" y1="108" x2="144" y2="108" stroke="#1A1A1A" strokeWidth="1.5" />
          {/* Cart handle */}
          <path
            d="M14 40 Q14 60 28 60"
            stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none"
          />
          <line x1="4" y1="40" x2="14" y2="40" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
          {/* Wheels */}
          <circle cx="55"  cy="148" r="9" stroke="#1A1A1A" strokeWidth="2" fill="none" />
          <circle cx="117" cy="148" r="9" stroke="#1A1A1A" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <h2 className={styles.emptyState__title}>{title}</h2>
      <p className={styles.emptyState__subtitle}>{subtitle}</p>

      <button
        className={styles.emptyState__button}
        onClick={() => navigate(buttonPath)}
        type="button"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default EmptyState;