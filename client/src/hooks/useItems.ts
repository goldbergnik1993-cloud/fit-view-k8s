import { useState, useEffect, useCallback } from 'react';
import { itemsApi, type BackendItem } from '../services/api';
import type { ClothingItem } from '../types/clothing';

export function mapItem(item: BackendItem): ClothingItem {
  return {
    id: String(item.id),
    name: item.name,
    brand: item.brand,
    category: item.category as ClothingItem['category'],
    imageUrl: item.image_url,
    price: item.price,
    availableSizes: item.size_charts.map((s) => s.size_label),
    sizeCharts: item.size_charts.map((s) => ({
      id: String(s.id),
      itemId: String(s.item_id),
      sizeLabel: s.size_label,
    })),
    measurements: item.measurements.map((m) => ({
      id: String(m.id),
      itemId: String(m.item_id),
      sizeLabel: m.size_label,
      totalLengthCm: m.total_length_cm,
      inseamCm: m.inseam_cm,
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