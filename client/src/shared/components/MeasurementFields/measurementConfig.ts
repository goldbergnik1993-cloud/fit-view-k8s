export interface MeasurementValues {
  shoulders_length_cm: number;
  breast_length_cm: number;
  hips_length_cm: number;
  waist_length_cm: number;
  leg_length_cm: number;
}

export const MEASUREMENT_FIELDS: {
  key: keyof MeasurementValues;
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