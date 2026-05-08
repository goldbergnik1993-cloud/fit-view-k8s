import { useState, useEffect, useCallback } from 'react';
// Mobile
import Step1 from '../../../../assets/images/onboarding/step-1-mobile@2x.webp';
import Step2 from '../../../../assets/images/onboarding/step-2-mobile@2x.webp';
import Step3 from '../../../../assets/images/onboarding/step-3-mobile@2x.webp';
import Step4 from '../../../../assets/images/onboarding/step-4-mobile@2x.webp';

// Tablet
import Step1Tablet from '../../../../assets/images/onboarding/step-1-tablet@2x.webp';
import Step2Tablet from '../../../../assets/images/onboarding/step-2-tablet@2x.webp';
import Step3Tablet from '../../../../assets/images/onboarding/step-3-tablet@2x.webp';
import Step4Tablet from '../../../../assets/images/onboarding/step-4-tablet@2x.webp';

// Desktop
import Step1Desktop from '../../../../assets/images/onboarding/step-1-desktop@2x.webp';
import Step2Desktop from '../../../../assets/images/onboarding/step-2-desktop@2x.webp';
import Step3Desktop from '../../../../assets/images/onboarding/step-3-desktop@2x.webp';
import Step4Desktop from '../../../../assets/images/onboarding/step-4-desktop@2x.webp';

import styles from './OnboardingModal.module.scss';
import { useBreakpoint } from '../../../../hooks/useBreakpoint';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS_MOBILE = [
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

const STEPS_TABLET = [
  {
    image: Step1Tablet,
    text: 'Click "Start Virtual Try On" on the Home page to browse our collection',
  },
  {
    image: Step2Tablet,
    text: 'Pick your favorite item from the catalog to open its details',
  },
  {
    image: Step3Tablet,
    text: 'Select your size, click "Virtual Try On" and enter your measurements for a perfect fit',
  },
  {
    image: Step4Tablet,
    text: 'Adjust your height to see the length. If you love the look, just click "Add To My Bag"',
  },
];

const STEPS_DESKTOP = [
  {
    image: Step1Desktop,
    text: 'Click "Start Virtual Try On" on the Home page to browse our collection',
  },
  {
    image: Step2Desktop,
    text: 'Pick your favorite item from the catalog to open its details',
  },
  {
    image: Step3Desktop,
    text: 'Select your size, click "Virtual Try On" and enter your measurements for a perfect fit',
  },
  {
    image: Step4Desktop,
    text: 'Adjust your height to see the length. If you love the look, just click "Add To My Bag"',
  },
];

export const OnboardingModal = ({ isOpen, onClose }: Props) => {
  const [step, setStep] = useState(0);
  const { isMobile, isDesktop } = useBreakpoint();

  const STEPS = isMobile
    ? STEPS_MOBILE
    : isDesktop
      ? STEPS_DESKTOP
      : STEPS_TABLET;
  const isLast = step === STEPS.length - 1;

  const handleClose = useCallback(() => {
    setStep(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Instructions"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles['modal__header']}>
          <h2 className={styles['modal__title']}>Instructions</h2>
          <button
            className={styles['modal__close']}
            onClick={handleClose}
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

        <div className={styles['modal__actions']}>
          <button className={styles['modal__btn-skip']} onClick={handleClose}>
            Skip
          </button>
          <button
            className={styles['modal__btn-next']}
            onClick={() => (isLast ? handleClose() : setStep((s) => s + 1))}
          >
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>

        <div className={styles['modal__dots']}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`${styles['modal__dot']} ${i === step ? styles['modal__dot--active'] : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
