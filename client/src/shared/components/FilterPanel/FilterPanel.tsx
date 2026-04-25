import { useState } from 'react';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import styles from './FilterPanel.module.scss';
import CloseIcon from '../../../assets/icons/burger-close.svg';

export interface FilterState {
  sort_by: 'price_asc' | 'price_desc' | 'new' | 'popular' | '';
  gender: string[];
  size: string[];
  brands: number[];
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

const GENDER_OPTIONS = [
  { label: 'Man', value: 'male' },
  { label: 'Woman', value: 'female' },
];

const SIZE_OPTIONS = ['S', 'M', 'L'];

const BRAND_OPTIONS = [
  { label: 'Zara', value: 1 },
  { label: 'Patagonia', value: 2 },
  { label: "Levi's", value: 3 },
  { label: 'The North Face', value: 4 },
  { label: 'Mango', value: 5 },
  { label: 'Cos', value: 6 },
  { label: 'Ralph Lauren', value: 7 },
  { label: 'Superdry', value: 8 },
];

const SORT_OPTIONS = [
  { label: 'New', value: 'new' },
  { label: 'Popular', value: 'popular' },
  { label: 'Price (Low - High)', value: 'price_asc' },
  { label: 'Price (High - Low)', value: 'price_desc' },
];

export const FilterPanel = ({
  isOpen,
  onClose,
  filters,
  onApply,
}: FilterPanelProps) => {
  const { isMobile } = useBreakpoint();
  const [local, setLocal] = useState<FilterState>(filters);
  const [expanded, setExpanded] = useState<string[]>(['sort_by']);

  const toggle = (section: string) => {
    setExpanded((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const toggleGender = (value: string) => {
    setLocal((prev) => ({
      ...prev,
      gender: prev.gender.includes(value)
        ? prev.gender.filter((g) => g !== value)
        : [...prev.gender, value],
    }));
  };

  const toggleSize = (value: string) => {
    setLocal((prev) => ({
      ...prev,
      size: prev.size.includes(value)
        ? prev.size.filter((s) => s !== value)
        : [...prev.size, value],
    }));
  };

  const toggleBrand = (value: number) => {
    setLocal((prev) => ({
      ...prev,
      brands: prev.brands.includes(value)
        ? prev.brands.filter((b) => b !== value)
        : [...prev.brands, value],
    }));
  };

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  const handleClearAll = () => {
    const empty: FilterState = {
      sort_by: '',
      gender: [],
      size: [],
      brands: [],
    };
    setLocal(empty);
    onApply(empty);
    onClose();
  };

  const hasFilters =
    local.gender.length > 0 ||
    local.size.length > 0 ||
    local.brands.length > 0 ||
    local.sort_by !== '';

  const hasChanges =
    local.sort_by !== filters.sort_by ||
    JSON.stringify(local.gender) !== JSON.stringify(filters.gender) ||
    JSON.stringify(local.size) !== JSON.stringify(filters.size) ||
    JSON.stringify(local.brands) !== JSON.stringify(filters.brands);

  if (!isOpen) return null;

  const content = (
    <div key={isOpen ? 'open' : 'closed'} className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>Filter & Sort</span>
        <div className={styles.headerRight}>
          {hasFilters && (
            <button className={styles.clearAll} onClick={handleClearAll}>
              Clear all
            </button>
          )}
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <img src={CloseIcon} alt="" width={20} height={20} />
          </button>
        </div>
      </div>

      {/* Applied filters */}
      {hasFilters && (
        <div className={styles.applied}>
          <span className={styles.appliedLabel}>Applied filters</span>
          <div className={styles.appliedTags}>
            {local.gender.map((g) => (
              <button
                key={g}
                className={styles.tag}
                onClick={() => toggleGender(g)}
              >
                × {GENDER_OPTIONS.find((o) => o.value === g)?.label}
              </button>
            ))}
            {local.size.map((s) => (
              <button
                key={s}
                className={styles.tag}
                onClick={() => toggleSize(s)}
              >
                × {s}
              </button>
            ))}
            {local.brands.map((b) => (
              <button
                key={b}
                className={styles.tag}
                onClick={() => toggleBrand(b)}
              >
                × {BRAND_OPTIONS.find((o) => o.value === b)?.label}
              </button>
            ))}
            {local.sort_by && (
              <button
                className={styles.tag}
                onClick={() => setLocal((prev) => ({ ...prev, sort_by: '' }))}
              >
                ×{' '}
                {local.sort_by === 'price_asc'
                  ? 'Price (Low - High)'
                  : 'Price (High - Low)'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className={styles.body}>
        {/* Sort by */}
        <div className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => toggle('sort_by')}
          >
            <span>Sort by</span>
            <span>{expanded.includes('sort_by') ? '∧' : '∨'}</span>
          </button>
          {expanded.includes('sort_by') && (
            <div className={styles.sectionBody}>
              {SORT_OPTIONS.map((opt) => (
                <label key={opt.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="sort_by"
                    value={opt.value}
                    checked={local.sort_by === opt.value}
                    onChange={() =>
                      setLocal((prev) => ({
                        ...prev,
                        sort_by: opt.value as FilterState['sort_by'],
                      }))
                    }
                    className={styles.radio}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Gender */}
        <div className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => toggle('gender')}
          >
            <span>Gender</span>
            <span>{expanded.includes('gender') ? '∧' : '∨'}</span>
          </button>
          {expanded.includes('gender') && (
            <div className={styles.sectionBody}>
              {GENDER_OPTIONS.map((opt) => (
                <label key={opt.value} className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={local.gender.includes(opt.value)}
                    onChange={() => toggleGender(opt.value)}
                    className={styles.checkbox}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Size */}
        <div className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => toggle('size')}
          >
            <span>Size</span>
            <span>{expanded.includes('size') ? '∧' : '∨'}</span>
          </button>
          {expanded.includes('size') && (
            <div className={styles.sectionBody}>
              {SIZE_OPTIONS.map((s) => (
                <label key={s} className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={local.size.includes(s)}
                    onChange={() => toggleSize(s)}
                    className={styles.checkbox}
                  />
                  {s}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Brand */}
        <div className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => toggle('brands')}
          >
            <span>Brand</span>
            <span>{expanded.includes('brands') ? '∧' : '∨'}</span>
          </button>
          {expanded.includes('brands') && (
            <div className={styles.sectionBody}>
              {BRAND_OPTIONS.map((opt) => (
                <label key={opt.value} className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={local.brands.includes(opt.value)}
                    onChange={() => toggleBrand(opt.value)}
                    className={styles.checkbox}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className={styles.section}>
          <button className={styles.sectionHeader} disabled>
            <span>Color</span>
            <span>∨</span>
          </button>
        </div>
      </div>

      {/* Apply button — only if changes */}
      {hasChanges && (
        <div className={styles.footer}>
          <button className={styles.applyBtn} onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );

  //  Mobile version
  if (isMobile) {
    return <div className={styles.mobileOverlay}>{content}</div>;
  }

  //  Desktop version + Tablet
  return (
    <>
      <div className={styles.desktopBackdrop} onClick={onClose} />
      <div className={styles.desktopDropdown}>{content}</div>
    </>
  );
};
