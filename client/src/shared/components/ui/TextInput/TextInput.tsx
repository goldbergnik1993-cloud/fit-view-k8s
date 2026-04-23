import styles from './TextInput.module.scss';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
}

export const TextInput = ({ label, error, success, id, ...props }: TextInputProps) => {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={styles.wrapper}>
      <label htmlFor={inputId} className={styles.label}>{label}</label>
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles['input--error'] : ''} ${success ? styles['input--success'] : ''}`}
        {...props}
      />
      {error && <span className={styles.hint}>{error}</span>}
    </div>
  );
};