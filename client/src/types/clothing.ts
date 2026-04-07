export type ItemCategory = 
  'dress' | 't_shirt' | 'blouse' | 'shirt' | 'skirt' | 'pants';

export type GenderType = 'male' | 'female' | 'unisex';

export interface SizeChart {
  id: string;
  itemId: string;
  sizeLabel: string;
}

export interface Measurement {
  id: string;
  itemId: string;
  sizeLabel: string;
  totalLengthCm?: number;
  inseamCm?: number;
}

export interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  category: ItemCategory;
  imageUrl: string;
  price: number;
  availableSizes: string[];
  sizeCharts: SizeChart[];
  measurements: Measurement[];
}

export interface UserProfile {
  heightCm: number;
  gender: GenderType;
}

export interface FittingRoomResult {
  hEndCm: number;
  linePositionPct: number;
  resultLabel: string;
  resultText: string;
}

export interface PaginatedItems {
  totalItems: number;
  totalPages: number;
  nextPage: string | null;
  prevPage: string | null;
  items: ClothingItem[];
}