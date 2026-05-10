import { useState, useEffect } from 'react';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { PrimaryButton } from '../ui/PrimaryButton/PrimaryButton';
import styles from './EditMeasurementsModal.module.scss';
import InfoIcon from '../../../assets/icons/info.svg';
import InfoFilledIcon from '../../../assets/icons/info-filled.svg';
import BurgerCloseIcon from '../../../assets/icons/burger-close.svg';

interface Measurements {
  shoulders_length_cm: number;
  breast_length_cm: number;
  hips_length_cm: number;
  waist_length_cm: number;
  leg_length_cm: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (measurements: Measurements) => void;
  initialValues?: Partial<Measurements>;
  mode?: 'edit' | 'enter';
}

const FIELDS: {
  key: keyof Measurements;
  label: string;
  tip: string;
}[] = [
  {
    key: 'shoulders_length_cm',
    label: 'Enter shoulder width (cm)',
    tip: 'Measure across the back from the edge of one shoulder to the other.',
  },
  {
    key: 'breast_length_cm',
    label: 'Enter chest girth (cm)',
    tip: 'Measure horizontally around the fullest part of the chest.',
  },
  {
    key: 'hips_length_cm',
    label: 'Enter hip girth (cm)',
    tip: 'Measure horizontally around the widest part of the hips.',
  },
  {
    key: 'waist_length_cm',
    label: 'Enter waist girth (cm)',
    tip: 'Measure horizontally around the narrowest part of the waistline (typically just above the belly button).',
  },
  {
    key: 'leg_length_cm',
    label: 'Enter inseam length (cm)',
    tip: 'Measure from the crotch to the bottom of the leg.',
  },
];

const EditMeasurementsModal = ({
  isOpen,
  onClose,
  onSave,
  initialValues,
  mode = 'edit',
}: Props) => {
  const { profile, updateProfile } = useUserProfile();

  const [values, setValues] = useState<Measurements>({
    shoulders_length_cm: 0,
    breast_length_cm: 0,
    hips_length_cm: 0,
    waist_length_cm: 0,
    leg_length_cm: 0,
  });
  const [tooltip, setTooltip] = useState<keyof Measurements | null>(null);
  const [saving, setSaving] = useState(false);

  // ─── Подставляем мерки из профиля (авторизованный или гость из localStorage)
  useEffect(() => {
    if (!isOpen) return;
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
      return;
    }
    if (!profile) return;
    setValues({
      shoulders_length_cm: profile.shoulders_length_cm ?? 0,
      breast_length_cm: profile.breast_length_cm ?? 0,
      hips_length_cm: profile.hips_length_cm ?? 0,
      waist_length_cm: profile.waist_length_cm ?? 0,
      leg_length_cm: profile.leg_length_cm ?? 0,
    });
  }, [isOpen, profile, initialValues]);

  const handleChange = (key: keyof Measurements, raw: string) => {
    const num = parseInt(raw.replace(/\D/g, ''), 10);
    setValues((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Для авторизованного → бэкенд, для гостя → localStorage
      // Логика внутри updateProfile в UserProfileProvider
      await updateProfile({
        shoulders_length_cm: values.shoulders_length_cm || null,
        breast_length_cm: values.breast_length_cm || null,
        hips_length_cm: values.hips_length_cm || null,
        waist_length_cm: values.waist_length_cm || null,
        leg_length_cm: values.leg_length_cm || null,
      });
      onSave(values);
      onClose();
    } catch {
      onSave(values);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Measurements"
      >
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              {mode === 'enter'
                ? 'Enter Your Measurements'
                : 'Edit Measurements'}
            </h2>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              <img src={BurgerCloseIcon} alt="" width={24} height={24} />
            </button>
          </div>

          <div className={styles.fields}>
            {FIELDS.map(({ key, label, tip }) => (
              <div key={key} className={styles.field}>
                <div className={styles.fieldLabel}>
                  <span>{label}</span>
                  <button
                    className={styles.infoBtn}
                    onClick={() => setTooltip(tooltip === key ? null : key)}
                    aria-label="More info"
                    type="button"
                  >
                    <img
                      src={tooltip === key ? InfoFilledIcon : InfoIcon}
                      alt=""
                      width={18}
                      height={18}
                    />
                  </button>
                </div>

                {tooltip === key && <div className={styles.tooltip}>{tip}</div>}

                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={200}
                  value={values[key] || ''}
                  placeholder="0 cm"
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <PrimaryButton onClick={handleSave} loading={saving}>
            {mode === 'enter' ? 'Continue' : 'Save Measurements'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default EditMeasurementsModal;
