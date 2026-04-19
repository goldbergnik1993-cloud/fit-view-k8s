import { useState, useEffect, useCallback } from 'react';
import { itemsApi, type SearchSuggestion, type BackendItem } from '../services/api';

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  suggestions: SearchSuggestion[];
  recommendations: BackendItem[];
  loading: boolean;
  handleSeeAll: () => void;
  handleSuggestionClick: (name: string) => void;
  handleItemClick: (id: number) => void;
  clearQuery: () => void;
}

export function useSearch(onClose: () => void): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recommendations, setRecommendations] = useState<BackendItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузить recommendations один раз
  useEffect(() => {
    itemsApi.getPersonalizedRecommendations()
      .then(setRecommendations)
      .catch(() => {});
  }, []);

  // Search suggestions с дебаунсом 300ms
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await itemsApi.getSearchSuggestions(query);
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSeeAll = useCallback(() => {
    window.location.href = `/catalog?name=${encodeURIComponent(query)}`;
    onClose();
  }, [query, onClose]);

  const handleSuggestionClick = useCallback((name: string) => {
    window.location.href = `/catalog?name=${encodeURIComponent(name)}`;
    onClose();
  }, [onClose]);

  const handleItemClick = useCallback((id: number) => {
    window.location.href = `/item/${id}`;
    onClose();
  }, [onClose]);

  const clearQuery = useCallback(() => setQuery(''), []);

  return {
    query,
    setQuery,
    suggestions,
    recommendations,
    loading,
    handleSeeAll,
    handleSuggestionClick,
    handleItemClick,
    clearQuery,
  };
}