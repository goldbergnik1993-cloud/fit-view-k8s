import { useRef } from 'react';
import styles from './OtpInput.module.scss';

interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  error?: boolean;
  success?: boolean;
}

export const OtpInput = ({
  length = 4,
  value,
  onChange,
  error,
  success,
}: OtpInputProps) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);
    const next = [...value];
    pasted.split('').forEach((d, i) => {
      next[i] = d;
    });
    onChange(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div className={styles.wrapper} onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`${styles.cell} ${error ? styles['cell--error'] : ''} ${success ? styles['cell--success'] : ''}`}
          type="number"
          inputMode="numeric"
          min={0}
          max={9}
          placeholder="0"
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  );
};
