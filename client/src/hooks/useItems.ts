import { useState, useEffect, useCallback } from 'react';
import {
  itemsApi,
  type BackendItem,
  type GetItemsParams,
} from '../services/api';
import type { ClothingItem } from '../types/clothing';

export function mapItem(item: BackendItem): ClothingItem {
  const brandName =
    typeof item.brand === 'object' && item.brand !== null
      ? item.brand.name
      : String(item.brand);

  const brandId =
    typeof item.brand === 'object' && item.brand !== null
      ? item.brand.id
      : undefined;

  const sizes = (item.available_sizes ?? []).map((s) => ({
    id: s.id,
    sizeLabel: s.size_label,
  }));

  const measurements = (item.available_measurements ?? []).map((s) => ({
    id: s.id,
    sizeLabel: s.size_label,
    totalLengthCm: s.total_length_cm,
    inseamCm: s.inseam_cm,
  }));

  return {
    id: String(item.id),
    name: item.name,
    brand: brandName,
    category: item.category as ClothingItem['category'],
    imageUrl:
      item.image_url?.replace('http://127.0.0.1', 'http://localhost') ?? '',
    fittingImageUrl: item.fitting_image_url ?? null,
    price: Number(item.price),
    isFavorite: item.is_favorite ?? false,
    brandId,
    gender: item.gender,
    description: item.description ?? null,
    mandatoryFields: item.mandatory_fields ?? [],
    availableSizes: sizes,
    sizeCharts: sizes.map((s) => ({
      id: String(s.id),
      itemId: String(item.id),
      sizeLabel: s.sizeLabel,
    })),
    measurements: measurements.map((s) => ({
      id: String(s.id),
      itemId: String(item.id),
      sizeLabel: s.sizeLabel,
      totalLengthCm: s.totalLengthCm,
      inseamCm: s.inseamCm,
    })),
  };
}

// ─── useItems (catalog list) ──────────────────────────────────────────────────

interface UseItemsOptions {
  category?: string;
  page?: number;
  per_page?: number;
  brands?: number[];
  name?: string;
  size?: string;
  gender?: 'male' | 'female';
  min_price?: number;
  max_price?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'new' | 'popular';
}

export function useItems({
  category,
  page = 1,
  per_page = 12,
  brands,
  name,
  size,
  gender,
  min_price,
  max_price,
  sort_by,
}: UseItemsOptions = {}) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const brandsKey = JSON.stringify(brands);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: GetItemsParams = {
        page,
        per_page,
        ...(category && category !== 'All' ? { category } : {}),
        ...(brands?.length ? { brands } : {}),
        ...(name ? { name } : {}),
        ...(size ? { size } : {}),
        ...(gender ? { gender } : {}),
        ...(min_price != null ? { min_price } : {}),
        ...(max_price != null ? { max_price } : {}),
        ...(sort_by ? { sort_by } : {}),
      };
      const data = await itemsApi.getAll(params);
      setItems(data.items.map(mapItem));
      setTotalPages(data.total_pages);
      setTotalItems(data.total_items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    category,
    page,
    per_page,
    brandsKey,
    name,
    size,
    gender,
    min_price,
    max_price,
    sort_by,
  ]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, totalPages, totalItems };
}
// ─── useItem (single item) ────────────────────────────────────────────────────

export function useItem(id: string | undefined) {
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await itemsApi.getById(id);
      setItem(mapItem(data));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return { item, loading, error };
}
