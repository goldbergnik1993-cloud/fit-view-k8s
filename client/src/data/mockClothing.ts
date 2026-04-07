import type { ClothingItem } from '../types/clothing';

export const mockClothingItems: ClothingItem[] = [
  {
    id: '1',
    name: 'A-Line Summer Breeze',
    brand: 'Azure Mode',
    category: 'dress',
    imageUrl: 'https://placehold.co/400x500?text=Dress',
    price: 80,
    availableSizes: ['S', 'M', 'L'],
    sizeCharts: [
      { id: '1', itemId: '1', sizeLabel: 'S' },
      { id: '2', itemId: '1', sizeLabel: 'M' },
      { id: '3', itemId: '1', sizeLabel: 'L' },
    ],
    measurements: [
      { id: '1', itemId: '1', sizeLabel: 'S', totalLengthCm: 100 },
      { id: '2', itemId: '1', sizeLabel: 'M', totalLengthCm: 105 },
      { id: '3', itemId: '1', sizeLabel: 'L', totalLengthCm: 110 },
    ],
  },
  {
    id: '2',
    name: 'Classic Jeans',
    brand: 'Levis',
    category: 'pants',
    imageUrl: 'https://placehold.co/400x500?text=Jeans',
    price: 50,
    availableSizes: ['S', 'M', 'L'],
    sizeCharts: [
      { id: '4', itemId: '2', sizeLabel: 'S' },
      { id: '5', itemId: '2', sizeLabel: 'M' },
      { id: '6', itemId: '2', sizeLabel: 'L' },
    ],
    measurements: [
      { id: '4', itemId: '2', sizeLabel: 'S', inseamCm: 76 },
      { id: '5', itemId: '2', sizeLabel: 'M', inseamCm: 78 },
      { id: '6', itemId: '2', sizeLabel: 'L', inseamCm: 80 },
    ],
  },
  {
    id: '3',
    name: 'Cozy Sweater',
    brand: 'Patagonia',
    category: 't_shirt',
    imageUrl: 'https://placehold.co/400x500?text=Sweater',
    price: 60,
    availableSizes: ['S', 'M', 'L'],
    sizeCharts: [
      { id: '7', itemId: '3', sizeLabel: 'S' },
      { id: '8', itemId: '3', sizeLabel: 'M' },
      { id: '9', itemId: '3', sizeLabel: 'L' },
    ],
    measurements: [
      { id: '7', itemId: '3', sizeLabel: 'S', totalLengthCm: 65 },
      { id: '8', itemId: '3', sizeLabel: 'M', totalLengthCm: 68 },
      { id: '9', itemId: '3', sizeLabel: 'L', totalLengthCm: 70 },
    ],
  },
];