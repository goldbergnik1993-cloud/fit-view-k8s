import { useState, useEffect, useCallback } from 'react';
import { itemsApi, type BackendItem } from '../services/api';
import type { ClothingItem } from '../types/clothing';

export function mapItem(item: BackendItem): ClothingItem {
  const brandName = typeof item.brand === 'object' && item.brand !== null
    ? item.brand.name
    : String(item.brand);

  return {
    id: String(item.id),
    name: item.name,
    brand: brandName,
    category: item.category as ClothingItem['category'],
    imageUrl: item.image_url,
    price: Number(item.price),
    availableSizes: item.available_sizes ?? [],
    sizeCharts: (item.available_sizes ?? []).map((s: string) => ({
      id: s,
      itemId: String(item.id),
      sizeLabel: s,
    })),
    measurements: (item.available_measurements ?? []).map((s: string) => ({
      id: s,
      itemId: String(item.id),
      sizeLabel: s,
    })),
  };
}

// ─── useItems (catalog list) ──────────────────────────────────────────────────

interface UseItemsOptions {
  category?: string;
  page?: number;
}

export function useItems({ category, page = 1 }: UseItemsOptions = {}) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12, ...(category && category !== 'All' ? { category } : {}) };
      const data = await itemsApi.getAll(params);
      setItems(data.items.map(mapItem));
      setTotalPages(data.total_pages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  return { items, loading, error, totalPages };
}

// ─── useItem (single item) ────────────────────────────────────────────────────

export function useItem(id: string | undefined) {
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!id) { setLoading(false); return; }
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

  useEffect(() => { fetchItem(); }, [fetchItem]);

  return { item, loading, error };
}