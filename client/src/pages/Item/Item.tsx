import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { request, itemsApi, cartApi, type FittingRoomResponse } from '../../services/api';
import { useParams } from 'react-router-dom';
import Silhouette from '../../shared/components/Silhouette/Silhouette';
import { useItem } from '../../hooks/useItems';

const Item = () => {
  const { id } = useParams<{ id: string }>();
  const { item, loading, error } = useItem(id);
  const { user } = useAuth();

  const [height, setHeight] = useState(165);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [cartLoading, setCartLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  const [fitResult, setFitResult] = useState<FittingRoomResponse | null>(null);
  const [fitLoading, setFitLoading] = useState(false);

  // Sync item data on load
  useEffect(() => {
    if (!item) return;
    setIsFavorite(item.isFavorite);
    setSelectedSizeId(item.availableSizes?.[0]?.id ?? null);
  }, [item]);

  // Load height from profile
  useEffect(() => {
    if (!user || profileLoaded) return;
    request<{ height_cm: number }>('/user/profile', {}, true)
      .then((profile) => {
        setHeight(profile.height_cm);
        setProfileLoaded(true);
      })
      .catch(() => {});
  }, [user, profileLoaded]);

  // Call fitting-room when height or size changes
  const runFitting = useCallback(async () => {
    if (!item || !id || selectedSizeId === null) return;
    setFitLoading(true);
    try {
      const result = await itemsApi.fitItem(Number(id), {
        height_cm: height,
        size_chart_id: selectedSizeId,
      });
      setFitResult(result);
    } catch {
      setFitResult(null);
    } finally {
      setFitLoading(false);
    }
  }, [id, item, height, selectedSizeId]);

  useEffect(() => {
    runFitting();
  }, [runFitting]);

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

  const handleAddToCart = async () => {
    if (!item) return;
    setCartLoading(true);
    try {
      await cartApi.addItem(Number(item.id));
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setCartLoading(false);
    }
  };

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

  const linePositionPct = fitResult?.visual_markers.line_position_pct ?? 50;
  const hEndCm = fitResult?.visual_markers.h_end_cm ?? 0;
  const fitLabel = fitResult ? `Ends ${Math.round(hEndCm)}cm from floor` : '...';

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

      {/* Size selector */}
      <div style={{ margin: '16px 0' }}>
        <p>Size:</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {item.availableSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => setSelectedSizeId(size.id)}
              style={{
                padding: '8px 16px',
                background: selectedSizeId === size.id ? '#534AB7' : 'white',
                color: selectedSizeId === size.id ? 'white' : '#333',
                border: '1px solid #534AB7',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              {size.sizeLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Height */}
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

      {/* Silhouette */}
      <Silhouette
        linePositionPct={fitLoading ? 50 : linePositionPct}
        label={fitLoading ? 'Calculating...' : fitLabel}
      />

      {/* Add to bag */}
      <button
        onClick={handleAddToCart}
        disabled={cartLoading || cartAdded}
        style={{
          marginTop: '16px',
          padding: '12px 32px',
          borderRadius: '8px',
          border: 'none',
          background: cartAdded ? '#1D9E75' : '#222',
          color: 'white',
          cursor: cartLoading ? 'not-allowed' : 'pointer',
          fontSize: '15px',
          width: '100%',
        }}
      >
        {cartAdded ? '✓ Added' : cartLoading ? 'Adding...' : 'Add to My Bag'}
      </button>
    </div>
  );
};

export default Item;