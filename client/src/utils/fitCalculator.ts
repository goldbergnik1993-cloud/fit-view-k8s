export type ItemCategory = 
  'dress' | 't_shirt' | 'blouse' | 'shirt' | 'skirt' | 'pants';

export const REF_COEFFICIENTS: Record<ItemCategory, number> = {
  dress: 0.818,
  t_shirt: 0.818,
  blouse: 0.818,
  shirt: 0.818,
  skirt: 0.618,
  pants: 0.470,
};

export const RESULT_LABELS: { min: number; max: number; label: string; text: string }[] = [
  { min: 70, max: Infinity, label: 'mid_thigh', text: 'Mid-thigh' },
  { min: 60, max: 70, label: 'at_hip', text: 'At the hip' },
  { min: 50, max: 60, label: 'below_hip', text: 'Below the hip' },
  { min: 42, max: 50, label: 'above_knee', text: 'Above the knee' },
  { min: 38, max: 42, label: 'at_knee', text: 'At the knee' },
  { min: 20, max: 38, label: 'midi', text: 'Midi' },
  { min: 0, max: 20, label: 'maxi', text: 'Maxi' },
];

export const calculateHEnd = (
  heightCm: number,
  category: ItemCategory,
  lengthCm: number
): number => {
  const refCoef = REF_COEFFICIENTS[category];
  return refCoef * heightCm - lengthCm;
};

export const getResultLabel = (hEnd: number): { label: string; text: string } => {
  const result = RESULT_LABELS.find(r => hEnd >= r.min && hEnd < r.max);
  return result ?? { label: 'maxi', text: 'Maxi' };
};

export const getLinePositionPct = (hEnd: number, heightCm: number): number => {
  return (hEnd / heightCm) * 100;
};