import { useState, useEffect } from 'react';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { PrimaryButton } from '../ui/PrimaryButton/PrimaryButton';
import styles from './EditMeasurementsModal.module.scss';
import {
  MeasurementFields,
  type MeasurementValues,
} from '../MeasurementFields/MeasurementFields';
import BurgerCloseIcon from '../../../assets/icons/burger-close.svg';

type Measurements = MeasurementValues;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (measurements: Measurements) => void;
  initialValues?: Partial<Measurements>;
  mode?: 'edit' | 'enter';
}

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
  const [saving, setSaving] = useState(false);

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
            <MeasurementFields
              values={values}
              onChange={handleChange}
              fieldClassName={styles.field}
              fieldLabelClassName={styles.fieldLabel}
              infoBtnClassName={styles.infoBtn}
              tooltipClassName={styles.tooltip}
              inputClassName={styles.input}
            />
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
