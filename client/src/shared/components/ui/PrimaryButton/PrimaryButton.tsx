import styles from './PrimaryButton.module.scss';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const PrimaryButton = ({ children, loading, disabled, ...props }: PrimaryButtonProps) => (
  <button
    className={styles.btn}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? 'Loading...' : children}
  </button>
);