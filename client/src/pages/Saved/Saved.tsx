import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../services/api';
import { mapItem } from '../../hooks/useItems';
import type { ClothingItem } from '../../types/clothing';
 
const Saved = () => {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getFavorites();
      setSavedItems(data.map(mapItem));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);
 
  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
        Loading...
      </div>
    );
  }
 
  if (error) {
    return (
      <div style={{ padding: '24px', color: '#cc0000' }}>
        Error: {error}
      </div>
    );
  }
 
  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Saved items ({savedItems.length})</h1>
 
      {savedItems.length === 0 ? (
        <p style={{ color: '#999', marginTop: '24px' }}>No saved items yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {savedItems.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(`/item/${item.id}`)}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{ width: '60px', height: '75px', objectFit: 'cover', borderRadius: '8px' }}
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/60x75?text=No+Image'; }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 4px' }}>{item.name}</p>
                <p style={{ color: '#666', fontSize: '13px', margin: '0 0 4px' }}>{item.brand}</p>
                <p style={{ color: '#534AB7', fontWeight: 'bold', margin: 0 }}>${item.price}</p>
              </div>
              <span style={{ color: '#D4537E', fontSize: '20px' }}>♥</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
 
export default Saved;