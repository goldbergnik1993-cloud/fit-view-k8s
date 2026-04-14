import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { request } from '../../services/api';
import { itemsApi } from '../../services/api';
import { useParams } from 'react-router-dom';
import Silhouette from '../../shared/components/Silhouette/Silhouette';
import { useItem } from '../../hooks/useItems';
import {
  calculateHEnd,
  getResultLabel,
  getLinePositionPct,
} from '../../utils/fitCalculator';

const Item = () => {
  const { id } = useParams<{ id: string }>();
  const { item, loading, error } = useItem(id);
  const { user } = useAuth();
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!user || profileLoaded) return;
    request<{ height_cm: number }>('/user/profile', {}, true)
      .then((profile) => {
        setHeight(profile.height_cm);
        setProfileLoaded(true);
      })
      .catch(() => {});
  }, [user, profileLoaded]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const handleToggleFavorite = async () => {
    if (!id) return;
    setFavoriteLoading(true);
    try {
      await itemsApi.toggleFavorite(id);
      setIsFavorite((prev) => !prev);
    } catch (err) {
      console.error(err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const [height, setHeight] = useState(165);
  const firstSize = item?.availableSizes?.[0] ?? 'M';
  const [selectedSize, setSelectedSize] = useState(firstSize);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
        Loading...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ padding: '24px', color: '#cc0000' }}>
        Error: {error || 'Item not found'}
      </div>
    );
  }

  const measurement = item.measurements.find(
    (m: { sizeLabel: string }) => m.sizeLabel === selectedSize
  );
  const lengthCm = measurement?.totalLengthCm ?? measurement?.inseamCm ?? 0;
  const hEnd = calculateHEnd(height, item.category, lengthCm);
  const linePositionPct = Math.min(
    100,
    Math.max(0, getLinePositionPct(hEnd, height))
  );
  const { text } = getResultLabel(hEnd);

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>{item.name}</h1>
      <p>{item.brand}</p>
      <p style={{ fontSize: '20px', fontWeight: 'bold' }}>${item.price}</p>
      <button
        onClick={handleToggleFavorite}
        disabled={favoriteLoading}
        style={{
          padding: '8px 20px',
          borderRadius: '8px',
          border: '1px solid #D4537E',
          background: isFavorite ? '#D4537E' : 'white',
          color: isFavorite ? 'white' : '#D4537E',
          cursor: favoriteLoading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          marginTop: '8px',
        }}
      >
        {isFavorite ? '♥ Saved' : '♡ Save'}
      </button>

      <div style={{ margin: '16px 0' }}>
        <p>Size:</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {item.availableSizes.map((size: string) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              style={{
                padding: '8px 16px',
                background: selectedSize === size ? '#534AB7' : 'white',
                color: selectedSize === size ? 'white' : '#333',
                border: '1px solid #534AB7',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div style={{ margin: '24px 0' }}>
        {user ? (
          <p style={{ color: '#666', fontSize: '13px' }}>
            Your height from profile: <strong>{height}cm</strong>
          </p>
        ) : (
          <label>
            Your height: {height}cm
            <input
              type="range"
              min={150}
              max={200}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              style={{ display: 'block', width: '200px', marginTop: '8px' }}
            />
          </label>
        )}
      </div>

      <Silhouette linePositionPct={linePositionPct} label={text} />
      <p>Item ends {Math.round(hEnd)}cm from floor</p>
    </div>
  );
};

export default Item;
