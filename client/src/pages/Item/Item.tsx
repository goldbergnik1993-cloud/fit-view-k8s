import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  request,
  itemsApi,
  cartApi,
  type FittingRoomResponse,
} from '../../services/api';
import { useItem, useItems } from '../../hooks/useItems';
import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import Silhouette from '../../shared/components/Silhouette/Silhouette';
import ItemCard from '../../shared/components/ItemCard/ItemCard';
import { PrimaryButton } from '../../shared/components/ui/PrimaryButton/PrimaryButton';
import styles from './Item.module.scss';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import SavedIcon from '../../assets/icons/saved.svg';
import InfoIcon from '../../assets/icons/info.svg';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
import EditMeasurementsModal from '../../shared/components/EditMeasurementsModal/EditMeasurementsModal';
import { calculateHEnd, getLinePositionPct, getResultLabel } from '../../utils/fitCalculator';

// Mock colors — not in DB, display only
const MOCK_COLORS = ['#A0522D', '#4A5240', '#ADD8E6', '#D2B48C'];

type View = 'card' | 'fitting';

const GENDER_TOGGLE: { value: 'male' | 'female'; label: string }[] = [
  { value: 'male', label: 'M' },
  { value: 'female', label: 'F' },
];

const Item = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { item, loading, error } = useItem(id);
  const { items: similarItems } = useItems({
    category: item?.category,
    per_page: 4,
  });

  const [view, setView] = useState<View>('card');
  const [isMeasurementsOpen, setIsMeasurementsOpen] = useState(false);

  // Card state
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [selectedSizeLabel, setSelectedSizeLabel] = useState<string | null>(
    null
  );
  const [cartLoading, setCartLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  // Fitting room state
  const [height, setHeight] = useState(170);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [fitResult, setFitResult] = useState<FittingRoomResponse | null>(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [debouncedHeight, setDebouncedHeight] = useState(height);

  useEffect(() => {
    if (!item) return;
    setIsFavorite(item.isFavorite);
    setSelectedSizeLabel(item.availableSizes?.[0]?.sizeLabel ?? null);
    if (item.gender === 'male') setGender('male');
  }, [item]);

  useEffect(() => {
    if (!user || profileLoaded) return;
    request<{ height_cm: number; gender: string }>('/user/profile', {}, true)
      .then((profile) => {
        if (profile.height_cm) setHeight(profile.height_cm);
        if (profile.gender === 'male') setGender('male');
        setProfileLoaded(true);
      })
      .catch(() => {});
  }, [user, profileLoaded]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedHeight(height), 400);
    return () => clearTimeout(timer);
  }, [height]);


const runFitting = useCallback(async () => {
  if (!item || !id || !selectedSizeLabel) return;
  setFitLoading(true);
  try {
    const result = await itemsApi.fitItem(Number(id), {
      size_label: selectedSizeLabel,
      height_cm: debouncedHeight,
    });
    setFitResult(result);
  } catch {
    const measurement = item.measurements.find(
      (m) => m.sizeLabel === selectedSizeLabel
    );
    const lengthCm = measurement?.totalLengthCm ?? measurement?.inseamCm ?? 0;

    if (lengthCm && item.category) {
      const hEnd = calculateHEnd(debouncedHeight, item.category, lengthCm);
      const linePct = getLinePositionPct(hEnd, debouncedHeight);
      const { label: resultLabel } = getResultLabel(hEnd);

      setFitResult({
        item_id: Number(id),
        size_label: selectedSizeLabel,
        gender: gender,
        visual_markers: {
          h_end_cm: hEnd,
          line_position_pct: linePct,
          reference_point: resultLabel,
        },
        fit_analysis: {
          waist_fit: '',
          breast_fit: '',
          hips_fit: '',
          shoulders_fit: '',
        },
        user_body: {
          gender: gender,
          height_cm: debouncedHeight,
          leg_length_cm: 0,
          hips_length_cm: 0,
          waist_length_cm: 0,
          breast_length_cm: 0,
          shoulders_length_cm: 0,
        },
      });
    } else {
      setFitResult(null);
    }
  } finally {
    setFitLoading(false);
  }
}, [id, item, debouncedHeight, selectedSizeLabel, gender]);

  useEffect(() => {
    if (view === 'fitting') runFitting();
  }, [view, runFitting]);

  const handleToggleFavorite = async () => {
    if (!id) return;
    setFavoriteLoading(true);
    try {
      await itemsApi.toggleFavorite(id);
      setIsFavorite((prev) => !prev);
    } catch {
      // ignore
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
    } catch {
      // ignore
    } finally {
      setCartLoading(false);
    }
  };

  const linePositionPct = fitResult?.visual_markers.line_position_pct ?? 50;
  const hEndCm = fitResult?.visual_markers.h_end_cm ?? 0;
  const fitLabel = fitResult
    ? `Ends ${Math.round(hEndCm)} cm from floor`
    : 'Ends 0 cm from floor';

  if (loading) return <div className={styles.state}>Loading...</div>;
  if (error || !item) return <div className={styles.state}>Item not found</div>;

  // ─── Card View ──────────────────────────────────────────────────────────────

  if (view === 'card') {
    return (
      <>
        <Header />
        <main className={styles.page}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <a href="/" className={styles.breadcrumb__link}>
              Home
            </a>
            <span className={styles.breadcrumb__sep}>/</span>
            <a href="/catalog" className={styles.breadcrumb__link}>
              Catalog
            </a>
            <span className={styles.breadcrumb__sep}>/</span>
            <a
              href={`/catalog?brands=${item.brand}`}
              className={styles.breadcrumb__link}
            >
              {item.brand}
            </a>
            <span className={styles.breadcrumb__sep}>/</span>
          </nav>

          <h1 className={styles.title}>{item.name}</h1>

          {/* Image */}
          <div className={styles.imageWrap}>
            <img
              src={item.imageUrl}
              alt={item.name}
              className={styles.image}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/400x500?text=No+Image';
              }}
            />
            <button
              className={`${styles.favoriteBtn} ${isFavorite ? styles['favoriteBtn--active'] : ''}`}
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              aria-label={isFavorite ? 'Remove from saved' : 'Save item'}
            >
              <img
                src={SavedIcon}
                alt=""
                aria-hidden="true"
                width={22}
                height={22}
              />
            </button>
          </div>

          {/* Description */}
          <p className={styles.description}>
            Elegant wrap dress with a flattering V-neck and adjustable waist tie
            — perfect for evenings and special occasions.
          </p>
          <p className={styles.material}>Material: 100% Viscose</p>
          <p className={styles.material}>Lining: 100% Polyester</p>

          {/* Size */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Choose your size</p>
            <div className={styles.sizes}>
              {item.availableSizes.map((size) => (
                <button
                  key={size.id}
                  className={`${styles.sizeBtn} ${selectedSizeLabel === size.sizeLabel ? styles['sizeBtn--active'] : ''}`}
                  onClick={() => setSelectedSizeLabel(size.sizeLabel)}
                >
                  {size.sizeLabel}
                </button>
              ))}
              <button className={styles.infoBtn} aria-label="Size guide">
                <img src={InfoIcon} alt="" width={20} height={20} />
              </button>
            </div>
          </div>

          {/* Color (mock, display only) */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Choose your color</p>
            <div className={styles.colors}>
              {MOCK_COLORS.map((color) => (
                <span
                  key={color}
                  className={styles.colorDot}
                  style={{ background: color }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          {/* Price */}
          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>Price</span>
            <span className={styles.priceValue}>{item.price}$</span>
          </div>

          {/* CTA buttons */}
          <div className={styles.actions}>
            <PrimaryButton
              onClick={handleAddToCart}
              loading={cartLoading}
              disabled={cartAdded}
            >
              {cartAdded ? '✓ Added to Bag' : 'Add To My Bag'}
            </PrimaryButton>

            <button
              className={styles.tryOnBtn}
              onClick={() => setView('fitting')}
            >
              Virtual Try On
            </button>
          </div>

          {/* You may also like */}
          <section className={styles.similar}>
            <div className={styles.similar__header}>
              <h2 className={styles.similar__title}>You may also like</h2>
              <div className={styles.similar__nav}>
                <button aria-label="Previous">
                  <img src={ChevronLeftIcon} alt="" width={20} height={20} />
                </button>
                <button aria-label="Next">
                  <img src={ChevronRightIcon} alt="" width={20} height={20} />
                </button>
              </div>
            </div>
            <div className={styles.similar__list}>
              {similarItems
                .filter((s) => s.id !== item.id)
                .slice(0, 2)
                .map((s) => (
                  <ItemCard key={s.id} item={s} />
                ))}
            </div>
          </section>
          <Footer />
        </main>
      </>
    );
  }

  // ─── Fitting Room View ──────────────────────────────────────────────────────

  return (
    <>
      <Header />
      <main className={styles.page}>
        {/* Gender toggle + back */}
        <div className={styles.fitting__topRow}>
          <div className={styles.genderToggle}>
            {GENDER_TOGGLE.map(({ value, label }) => (
              <button
                key={value}
                className={`${styles.genderBtn} ${gender === value ? styles['genderBtn--active'] : ''}`}
                onClick={() => setGender(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            className={styles.editBtn}
            onClick={() => setIsMeasurementsOpen(true)}
          >
            Edit Measurements
            <img src={ChevronRightIcon} alt="" width={16} height={16} />
          </button>
        </div>

        <EditMeasurementsModal
          isOpen={isMeasurementsOpen}
          onClose={() => setIsMeasurementsOpen(false)}
          onSave={() => {
            runFitting();
          }}
        />

        {/* Silhouette */}
        <Silhouette
          linePositionPct={fitLoading ? 50 : linePositionPct}
          label={fitLoading ? 'Calculating...' : fitLabel}
          heightCm={height}
          itemLengthCm={
            fitResult ? Math.round(fitResult.visual_markers.h_end_cm) : null
          }
          gender={gender}
          loading={fitLoading}
        />

        {/* Height slider */}
        <div className={styles.sliderWrap}>
          <input
            type="range"
            min={140}
            max={210}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className={styles.slider}
            aria-label="Your height"
          />
          <div className={styles.sliderLabels}>
            <span>Your Height</span>
            <span>{height} cm</span>
          </div>
        </div>

        {/* Item info */}
        <h1 className={styles.title}>{item.name}</h1>
        <p className={styles.brand}>{item.brand}</p>

        {/* Size */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Choose your size</p>
          <div className={styles.sizes}>
            {item.availableSizes.map((size) => (
              <button
                key={size.id}
                className={`${styles.sizeBtn} ${selectedSizeLabel === size.sizeLabel ? styles['sizeBtn--active'] : ''}`}
                onClick={() => setSelectedSizeLabel(size.sizeLabel)}
              >
                {size.sizeLabel}
              </button>
            ))}
            <button className={styles.infoBtn} aria-label="Size guide">
              <img src={InfoIcon} alt="" width={20} height={20} />
            </button>
          </div>
        </div>

        {/* Color (mock) */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Choose your color</p>
          <div className={styles.colors}>
            {MOCK_COLORS.map((color) => (
              <span
                key={color}
                className={styles.colorDot}
                style={{ background: color }}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>Price</span>
          <span className={styles.priceValue}>{item.price}$</span>
        </div>

        {/* CTA */}
        <div className={styles.actions}>
          <PrimaryButton
            onClick={handleAddToCart}
            loading={cartLoading}
            disabled={cartAdded || !selectedSizeLabel}
          >
            {cartAdded ? '✓ Added to Bag' : 'Add To My Bag'}
          </PrimaryButton>
        </div>

        {/* You may also like */}
        <section className={styles.similar}>
          <div className={styles.similar__header}>
            <h2 className={styles.similar__title}>You may also like</h2>
            <div className={styles.similar__nav}>
              <button aria-label="Previous">
                <img src={ChevronLeftIcon} alt="" width={20} height={20} />
              </button>
              <button aria-label="Next">
                <img src={ChevronRightIcon} alt="" width={20} height={20} />
              </button>
            </div>
          </div>
          <div className={styles.similar__list}>
            {similarItems
              .filter((s) => s.id !== item.id)
              .slice(0, 2)
              .map((s) => (
                <ItemCard key={s.id} item={s} />
              ))}
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default Item;
