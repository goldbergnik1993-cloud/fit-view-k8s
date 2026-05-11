import { useState, useEffect } from 'react';
import InfoIcon from '../../../assets/icons/info.svg';
import InfoFilledIcon from '../../../assets/icons/info-filled.svg';
import {
  MEASUREMENT_FIELDS,
  type MeasurementValues,
} from './measurementConfig';

export type { MeasurementValues };

interface Props {
  values: MeasurementValues;
  onChange: (key: keyof MeasurementValues, raw: string) => void;
  fieldClassName: string;
  fieldLabelClassName: string;
  infoBtnClassName: string;
  tooltipClassName: string;
  inputClassName: string;
}

export const MeasurementFields = ({
  values,
  onChange,
  fieldClassName,
  fieldLabelClassName,
  infoBtnClassName,
  tooltipClassName,
  inputClassName,
}: Props) => {
  const [tooltip, setTooltip] = useState<keyof MeasurementValues | null>(null);

  useEffect(() => {
    if (!tooltip) return;
    const handleClick = () => setTooltip(null);
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [tooltip]);

  return (
    <>
      {MEASUREMENT_FIELDS.map(({ key, label, tip }) => (
        <div key={key} className={fieldClassName}>
          <div className={fieldLabelClassName}>
            <span>{label}</span>
            <button
              className={infoBtnClassName}
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

          {tooltip === key && <div className={tooltipClassName}>{tip}</div>}

          <input
            className={inputClassName}
            type="number"
            min={0}
            max={200}
            value={values[key] || ''}
            placeholder="0 cm"
            onChange={(e) => onChange(key, e.target.value)}
          />
        </div>
      ))}
    </>
  );
};
