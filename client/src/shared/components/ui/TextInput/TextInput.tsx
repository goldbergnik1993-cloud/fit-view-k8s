import styles from './TextInput.module.scss';
import HintErrorIcon from '../../../../assets/icons/hint-error.svg';
import HintSuccessIcon from '../../../../assets/icons/hint-success.svg';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  successText?: string;
}

export const TextInput = ({
  label,
  error,
  success,
  successText,
  id,
  ...props
}: TextInputProps) => {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={styles.wrapper}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles['input--error'] : ''} ${success ? styles['input--success'] : ''}`}
        {...props}
      />
      {error && (
        <span className={styles.hint}>
          <img
            src={HintErrorIcon}
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
          {error}
        </span>
      )}
      {!error && success && successText && (
        <span className={styles['hint--success']}>
          <img
            src={HintSuccessIcon}
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
          {successText}
        </span>
      )}
    </div>
  );
};
