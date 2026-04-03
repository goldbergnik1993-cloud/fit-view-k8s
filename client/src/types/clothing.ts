export type GenderType = 'male' | 'female' | 'unisex';

export type ItemType = 'dress' | 'skirt' | 't_shirt' | 'blouse' | 'pants' | 'shirt';

export interface UserProfile {
  heightCm: number;
  gender: GenderType;
  legLengthCm: number;
  waistLengthCm: number;
}

export interface ItemSize {
  id: string; 
  totalLengthCm: number;
  inseamCm: number;
  waistCm: number;
  breastCm: number;
  shouldersCm: number;
  sizeLabel: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  category: ItemType;
  imageUrl: string;
  sizes: ItemSize[];
}