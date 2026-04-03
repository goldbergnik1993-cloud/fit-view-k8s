export interface BodyProportions {
  waistFromFloor: number;
  kneeFromFloor: number;
  hipFromFloor: number;
  shoulderFromFloor: number;
}

export const getBodyProportions = (heightCm: number): BodyProportions => {
  return {
    shoulderFromFloor: heightCm * 0.81,
    waistFromFloor: heightCm * 0.62,
    hipFromFloor: heightCm * 0.52,
    kneeFromFloor: heightCm * 0.28,
  };
};

export const getFitPosition = (
  userHeight: number,
  itemLengthCm: number
): number => {
  const fromFloor = userHeight - itemLengthCm;
  const percentage = (fromFloor / userHeight) * 100;
  return Math.max(0, Math.min(100, percentage));
};

export const getFitLabel = (
  userHeight: number,
  itemLengthCm: number
): string => {
  const proportions = getBodyProportions(userHeight);
  const fromFloor = userHeight - itemLengthCm;

  if (fromFloor <= 0) return 'Floor length';
  if (fromFloor <= proportions.kneeFromFloor) return 'Below knee';
  if (fromFloor <= proportions.hipFromFloor) return 'Knee length';
  if (fromFloor <= proportions.waistFromFloor) return 'Midi';
  if (fromFloor <= proportions.shoulderFromFloor) return 'Mini';
  return 'Crop';
};