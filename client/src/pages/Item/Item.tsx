import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useFavorites } from '../../providers/FavoritesContext';
import { useCart } from '../../providers/CartContext';
import { itemsApi, type FittingRoomResponse } from '../../services/api';
import { useItem, useItems } from '../../hooks/useItems';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import Silhouette from '../../shared/components/Silhouette/Silhouette';
import ItemCard from '../../shared/components/ItemCard/ItemCard';
import { PrimaryButton } from '../../shared/components/ui/PrimaryButton/PrimaryButton';
import styles from './Item.module.scss';
import { Breadcrumb } from '../../shared/components/Breadcrumb/Breadcrumb';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
import InfoIcon from '../../assets/icons/info.svg';
import InfoFilledIcon from '../../assets/icons/info-filled.svg';
import EditMeasurementsModal from '../../shared/components/EditMeasurementsModal/EditMeasurementsModal';
import { AddedToBagModal } from '../../shared/components/AddedToBagModal/AddedToBagModal';
import {
  calculateHEnd,
  getLinePositionPct,
  getResultLabel,
} from '../../utils/fitCalculator';
import { useAuth } from '../../hooks/useAuth';

const MOCK_COLORS = ['#976B56', '#626044', '#B9C8DA', '#D8CAB3'];

const MOCK_SIZE_GUIDE: Record<string, string> = {
  S: 'Chest 86–89" / Waist 62–65" / Hips 90–94"',
  M: 'Chest 90–93" / Waist 66–69" / Hips 95–98"',
  L: 'Chest 94–99" / Waist 70–75" / Hips 98–104"',
  XL: 'Chest 100–105" / Waist 76–82" / Hips 105–112"',
};

type View = 'card' | 'fitting';

const GENDER_TOGGLE: { value: 'male' | 'female'; label: string }[] = [
  { value: 'male', label: 'M' },
  { value: 'female', label: 'F' },
];

const Item = () => {
  const { id } = useParams<{ id: string }>();
  const { item, loading, error } = useItem(id);
  const { items: similarItems } = useItems({
    category: item?.category,
    per_page: 4,
  });
  const { profile } = useUserProfile();
  const { isDesktop } = useBreakpoint();

  const [view, setView] = useState<View>('card');
  const [isMeasurementsOpen, setIsMeasurementsOpen] = useState(false);
  const [isMeasurementsForFitting, setIsMeasurementsForFitting] =
    useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const showColors = !isSizeGuideOpen;

  const { isFavorite: isFav, toggleFavorite } = useFavorites();
  const { addItem, cart, updateQuantity } = useCart();
  const { user } = useAuth();

  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [selectedSizeLabel, setSelectedSizeLabel] = useState<string | null>(
    null
  );
  const [cartLoading, setCartLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [isAddedModalOpen, setIsAddedModalOpen] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  const handleModalQuantityChange = async (q: number) => {
    setModalQuantity(q);
    const cartItem = cart?.cart_items.find(
      (ci) =>
        ci.item.id === Number(item?.id) && ci.size_label === selectedSizeLabel
    );
    if (cartItem) {
      await updateQuantity(cartItem.id, q);
    }
  };

  const [height, setHeight] = useState(170);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [fitResult, setFitResult] = useState<FittingRoomResponse | null>(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [debouncedHeight, setDebouncedHeight] = useState(height);

  useEffect(() => {
    if (!profile) return;
    if (profile.height_cm) setHeight(profile.height_cm);
    if (profile.gender === 'male') setGender('male');
  }, [profile]);

  useEffect(() => {
    if (!item) return;
    setSelectedSizeLabel(null);
    if (item.gender === 'male') setGender('male');
  }, [item]);

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
        shoulders_length_cm: profile?.shoulders_length_cm ?? null,
        breast_length_cm: profile?.breast_length_cm ?? null,
        waist_length_cm: profile?.waist_length_cm ?? null,
        hips_length_cm: profile?.hips_length_cm ?? null,
        leg_length_cm: profile?.leg_length_cm ?? null,
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
          gender,
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
            gender,
            height_cm: debouncedHeight,
            leg_length_cm: profile?.leg_length_cm ?? 0,
            hips_length_cm: profile?.hips_length_cm ?? 0,
            waist_length_cm: profile?.waist_length_cm ?? 0,
            breast_length_cm: profile?.breast_length_cm ?? 0,
            shoulders_length_cm: profile?.shoulders_length_cm ?? 0,
          },
          fitting_image_url: item.fittingImageUrl ?? null,
        });
      }
    } finally {
      setFitLoading(false);
    }
  }, [id, item, debouncedHeight, selectedSizeLabel, gender, profile]);

  useEffect(() => {
    if (view === 'fitting') runFitting();
  }, [view, runFitting]);

  const handleToggleFavorite = async () => {
    if (!id) return;
    setFavoriteLoading(true);
    try {
      await toggleFavorite(id);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!item || !selectedSizeLabel) return;
    setCartLoading(true);
    setCartError(null);
    try {
      await addItem(
        Number(item.id),
        selectedSizeLabel,
        modalQuantity,
        item.price,
        {
          name: item.name,
          brand:
            typeof item.brand === 'string'
              ? { id: 0, name: item.brand }
              : item.brand,
          category: item.category,
          gender: item.gender ?? '',
          image_url: item.imageUrl,
          is_favorite: false,
        }
      );
      setCartAdded(true);
      setIsAddedModalOpen(true);
      setTimeout(() => setCartAdded(false), 2000);
    } catch {
      setCartError('Failed to add to bag');
    } finally {
      setCartLoading(false);
    }
  };

  const linePositionPct = fitResult?.visual_markers.line_position_pct ?? 50;
  const hEndCm = fitResult?.visual_markers.h_end_cm ?? 0;
  const fitLabel = fitResult
    ? `Ends ${Math.round(hEndCm)} cm from floor`
    : 'Ends 0 cm from floor';

  const selectedMeasurement = item?.measurements.find(
    (m) => m.sizeLabel === selectedSizeLabel
  );
  const itemLengthCm =
    selectedMeasurement?.totalLengthCm ?? selectedMeasurement?.inseamCm ?? null;

  // ─── Shared render helpers ────────────────────────────────────────────────

  const renderSizesContent = (itemData: typeof item) => {
    if (!itemData) return null;
    return (
      <>
        <p className={styles.sectionLabel}>Choose your size</p>
        <div className={styles.sizes}>
          {itemData.availableSizes.map((size) => (
            <button
              key={size.id}
              className={`${styles.sizeBtn} ${
                selectedSizeLabel === size.sizeLabel
                  ? styles['sizeBtn--active']
                  : ''
              }`}
              onClick={() => setSelectedSizeLabel(size.sizeLabel)}
            >
              {size.sizeLabel}
            </button>
          ))}
          <button
            className={styles.infoBtn}
            aria-label="Size guide"
            aria-expanded={isSizeGuideOpen}
            onClick={() => setIsSizeGuideOpen((v) => !v)}
          >
            <img
              src={isSizeGuideOpen ? InfoFilledIcon : InfoIcon}
              alt=""
              width={24}
              height={24}
            />
          </button>
        </div>
        {isSizeGuideOpen && (
          <div className={styles.sizeGuide}>
            {itemData.availableSizes.map((size) => (
              <p key={size.id} className={styles.sizeGuide__row}>
                {size.sizeLabel}: {MOCK_SIZE_GUIDE[size.sizeLabel] ?? '—'}
              </p>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderColorsContent = () => (
    <>
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
    </>
  );

  const renderAddToCart = (height: number) => (
    <>
      <PrimaryButton
        style={{ height }}
        onClick={handleAddToCart}
        loading={cartLoading}
        disabled={cartAdded || !selectedSizeLabel}
      >
        {cartAdded ? 'Added to Bag' : 'Add To My Bag'}
      </PrimaryButton>
      {cartError && <p className={styles.cartError}>{cartError}</p>}
    </>
  );

  const renderFavoriteBtn = () => (
    <button
      className={`${styles.favoriteBtn} ${isFav(id ?? '') ? styles['favoriteBtn--active'] : ''}`}
      onClick={handleToggleFavorite}
      disabled={favoriteLoading}
      aria-label={isFav(id ?? '') ? 'Remove from saved' : 'Save item'}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 20 20"
        fill={isFav(id ?? '') ? 'currentColor' : 'none'}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 17C10 17 2 12.5 2 7C2 4.79 3.79 3 6 3C7.5 3 8.8 3.8 9.5 5C9.8 5.5 10.2 5.5 10.5 5C11.2 3.8 12.5 3 14 3C16.21 3 18 4.79 18 7C18 12.5 10 17 10 17Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );

  const renderSimilar = () => (
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
          .filter((s) => s.id !== item?.id)
          .slice(0, isDesktop ? 4 : 2)
          .map((s) => (
            <ItemCard
              key={s.id}
              item={s}
              isFavorite={isFav(s.id)}
              onFavoriteToggle={toggleFavorite}
            />
          ))}
      </div>
    </section>
  );

  if (loading) return <div className={styles.state}>Loading...</div>;
  if (error || !item) return <div className={styles.state}>Item not found</div>;

  // ─── Card View ────────────────────────────────────────────────────────────

  if (view === 'card') {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <div className={styles.breadcrumbWrap}>
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Catalog', href: '/catalog' },
                {
                  label: item.brand,
                  href: item.brandId
                    ? `/catalog?brands=${item.brandId}`
                    : '/catalog',
                },
                { label: item.name },
              ]}
            />
          </div>

          <div className={styles.layout}>
            <div className={styles.layout__left}>
              <h1 className={styles.title}>{item.name}</h1>
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
                {renderFavoriteBtn()}
              </div>
            </div>

            <div className={styles.layout__right}>
              <h1 className={styles['title--right']}>{item.name}</h1>
              <p className={styles.description}>
                Elegant wrap dress with a flattering V-neck and adjustable waist
                tie — perfect for evenings and special occasions.
              </p>
              <p className={styles.material}>Material: 100% Viscose</p>
              <p className={styles.material}>Lining: 100% Polyester</p>

              <div className={styles.section}>{renderSizesContent(item)}</div>
              {showColors && (
                <div className={styles.section}>{renderColorsContent()}</div>
              )}

              <div className={styles['layout__right-spacer']} />

              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Price:</span>
                <span className={styles.priceValue}>{item.price}$</span>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.tryOnBtn}
                  onClick={() => {
                    if (user) {
                      setView('fitting');
                    } else {
                      setIsMeasurementsForFitting(true);
                      setIsMeasurementsOpen(true);
                    }
                  }}
                >
                  Virtual Try-On
                </button>
                <div className={styles.actions__primary}>
                  {renderAddToCart(44)}
                </div>
              </div>
            </div>
          </div>
        </main>
        <EditMeasurementsModal
          isOpen={isMeasurementsOpen}
          onClose={() => {
            setIsMeasurementsOpen(false);
            setIsMeasurementsForFitting(false);
          }}
          onSave={() => {
            setIsMeasurementsOpen(false);
            setIsMeasurementsForFitting(false);
            if (isMeasurementsForFitting) {
              setView('fitting');
            }
          }}
          mode={isMeasurementsForFitting ? 'enter' : 'edit'}
        />
        <AddedToBagModal
          isOpen={isAddedModalOpen}
          onClose={() => {
            setIsAddedModalOpen(false);
            setModalQuantity(1);
          }}
          item={item}
          selectedSizeLabel={selectedSizeLabel}
          quantity={modalQuantity}
          onQuantityChange={handleModalQuantityChange}
        />
        <Footer />
      </>
    );
  }

  // ─── Fitting View ─────────────────────────────────────────────────────────

  return (
    <>
      <Header />
      <main className={styles.page}>
        {/* ── Основной ряд ── */}
        <div className={styles.fitting__body}>
          {/* Левая колонка: back (десктоп) + toggle + editBtn */}
          <div className={styles.fitting__left}>
            <button
              className={styles.fitting__back}
              onClick={() => setView('card')}
              aria-label="Back to item"
            >
              <img src={ChevronLeftIcon} alt="" width={16} height={16} />
            </button>
            <div className={styles.genderToggle}>
              {GENDER_TOGGLE.map(({ value, label }) => {
                const isDisabled =
                  item?.gender !== 'unisex' && item?.gender !== value;
                return (
                  <button
                    key={value}
                    className={`${styles.genderBtn} ${
                      gender === value ? styles['genderBtn--active'] : ''
                    } ${isDisabled ? styles['genderBtn--disabled'] : ''}`}
                    onClick={() => !isDisabled && setGender(value)}
                    disabled={isDisabled}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <button
              className={styles.editBtn}
              onClick={() => setIsMeasurementsOpen(true)}
            >
              Edit Measurements
              <img src={ChevronRightIcon} alt="" width={16} height={16} />
            </button>
          </div>

          {/* Центр: силуэт */}
          <div className={styles.fitting__center}>
            <div className={styles.fitting__silhouette}>
              <Silhouette
                linePositionPct={fitLoading ? 50 : linePositionPct}
                label={fitLoading ? 'Calculating...' : fitLabel}
                heightCm={height}
                itemLengthCm={itemLengthCm}
                gender={gender}
                loading={fitLoading}
                onHeightChange={setHeight}
                hasFittingImage={!!fitResult?.fitting_image_url}
                fittingImageUrl={fitResult?.fitting_image_url}
              />
            </div>
          </div>

          {/* Правая колонка — только десктоп */}
          <div className={styles.fitting__right}>
            <h1 className={styles['fitting__right-title']}>{item.name}</h1>
            <p className={styles['fitting__right-brand']}>{item.brand}</p>
            <div className={styles['fitting__right-sizes']}>
              {renderSizesContent(item)}
            </div>
            {showColors && (
              <div className={styles['fitting__right-colors']}>
                {renderColorsContent()}
              </div>
            )}
            <div className={styles['fitting__right-price']}>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Price:</span>
                <span className={styles.priceValue}>{item.price}$</span>
              </div>
            </div>
            <div className={styles['fitting__right-actions']}>
              {renderAddToCart(48)}
            </div>
          </div>
        </div>

        <EditMeasurementsModal
          isOpen={isMeasurementsOpen}
          onClose={() => setIsMeasurementsOpen(false)}
          onSave={() => runFitting()}
        />

        {/* ── Слайдер под силуэтом ── */}
        <div className={styles.fitting__footerRow}>
          <span className={styles.fitting__endsLabel}>
            {fitLoading ? '...' : fitLabel}
          </span>
          <span className={styles.fitting__itemLengthLabel}>Item length</span>
        </div>

        {/* ── Слайдер ── */}
        <div className={styles['fitting__slider-wrap']}>
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

        {/* ── Нижняя часть: мобайл + планшет ── */}
        <h1 className={styles.fitting__title}>{item.name}</h1>
        <p className={styles.fitting__brand}>{item.brand}</p>

        <div className={styles.fitting__section}>
          {renderSizesContent(item)}
        </div>
        {showColors && (
          <div className={styles['fitting__section--sm']}>
            {renderColorsContent()}
          </div>
        )}

        <div className={styles.fitting__priceRow}>
          <span className={styles.priceLabel}>Price:</span>
          <span className={styles.priceValue}>{item.price}$</span>
        </div>

        <div className={styles.fitting__actions}>{renderAddToCart(44)}</div>

        {renderSimilar()}

        <AddedToBagModal
          isOpen={isAddedModalOpen}
          onClose={() => {
            setIsAddedModalOpen(false);
            setModalQuantity(1);
          }}
          item={item}
          selectedSizeLabel={selectedSizeLabel}
          quantity={modalQuantity}
          onQuantityChange={handleModalQuantityChange}
        />
      </main>
      <Footer />
    </>
  );
};

export default Item;
