import { useState, useEffect } from 'react';
import styles from './OnboardingModal.module.scss';
import Step1 from '../../../../assets/images/onboarding/step-1.png';
import Step2 from '../../../../assets/images/onboarding/step-2.png';
import Step3 from '../../../../assets/images/onboarding/step-3.png';
import Step4 from '../../../../assets/images/onboarding/step-4.png';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    image: Step1,
    text: 'Click "Start Virtual Try On" on the Home page to browse our collection',
  },
  {
    image: Step2,
    text: 'Pick your favorite item from the catalog to open its details',
  },
  {
    image: Step3,
    text: 'Select your size, click "Virtual Try On" and enter your measurements for a perfect fit',
  },
  {
    image: Step4,
    text: 'Adjust your height to see the length. If you love the look, just click "Add To My Bag"',
  },
];

export const OnboardingModal = ({ isOpen, onClose }: Props) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLast = step === STEPS.length - 1;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Instructions"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles['modal__header']}>
          <h2 className={styles['modal__title']}>Instructions</h2>
          <button
            className={styles['modal__close']}
            onClick={onClose}
            aria-label="Close instructions"
          >
            ✕
          </button>
        </div>

        <div className={styles['modal__preview']}>
          <img
            src={STEPS[step].image}
            alt={`Step ${step + 1}`}
            className={styles['modal__preview-img']}
          />
        </div>

        <p className={styles['modal__text']}>{STEPS[step].text}</p>

        <div className={styles['modal__dots']}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`${styles['modal__dot']} ${i === step ? styles['modal__dot--active'] : ''}`}
            />
          ))}
        </div>

        <div className={styles['modal__actions']}>
          <button className={styles['modal__btn-skip']} onClick={onClose}>
            Skip
          </button>
          <button
            className={styles['modal__btn-next']}
            onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
          >
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
