import { useState } from 'react';
import styles from './PasswordInput.module.scss';
import EyeIcon from '../../../../assets/icons/eye.svg';
import EyeOffIcon from '../../../../assets/icons/eye-off.svg';

interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label: string;
  error?: string;
  success?: boolean;
}

export const PasswordInput = ({
  label,
  error,
  success,
  id,
  ...props
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={styles.wrapper}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div
        className={`${styles.field} ${error ? styles['field--error'] : ''} ${success ? styles['field--success'] : ''}`}
      >
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={styles.input}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-hint` : undefined}
          {...props}
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <img
            src={visible ? EyeOffIcon : EyeIcon}
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
          />
        </button>
      </div>
      {error && (
        <span id={`${inputId}-hint`} className={styles.hint} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
