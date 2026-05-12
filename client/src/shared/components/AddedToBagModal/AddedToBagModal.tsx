import styles from './AddedToBagModal.module.scss';
import { useState, useEffect } from 'react';
import ArrowRightWhiteIcon from '../../../assets/icons/arrow-right-white.svg';
import MinusIcon from '../../../assets/icons/minus.svg';
import PlusIcon from '../../../assets/icons/plus.svg';

interface AddedToBagModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    name: string;
    brand: string;
    imageUrl: string;
    price: number;
  };
  selectedSizeLabel: string | null;
}

interface ModalContentProps {
  item: AddedToBagModalProps['item'];
  selectedSizeLabel: string | null;
  onClose: () => void;
}

const ModalContent = ({
  item,
  selectedSizeLabel,
  onClose,
}: ModalContentProps) => {
  const [quantity, setQuantity] = useState(1);
  const total = item.price * quantity;

  return (
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      <div className={styles.header}>
        <h2 className={styles.title}>Added to My Bag</h2>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="#0D0C0D"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className={styles.body}>
        {/* Левая колонка: картинка + кнопки (планшет/десктоп) */}
        <div className={styles.imageCol}>
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
          </div>
          {/* Кнопки под картинкой — планшет/десктоп */}
          <div className={styles.actionsDesktop}>
            <button className={styles.keepBtn} onClick={onClose}>
              Keep Shopping
            </button>
            <a href="/my-bag" className={styles.viewBtn}>
              View My Bag
              <img
                src={ArrowRightWhiteIcon}
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        {/* Правая колонка: инфо */}
        <div className={styles.info}>
          <h3 className={styles.itemName}>{item.name}</h3>
          <p className={styles.brand}>{item.brand}</p>

          <div className={styles.meta}>
            <span className={styles.metaLabel}>Size:</span>
            <span className={styles.metaValue}>{selectedSizeLabel ?? '—'}</span>
          </div>

          <div className={styles.quantity}>
            <span className={styles.quantityLabel}>Quantity</span>
            <div className={styles.quantityControls}>
              <button
                className={styles.quantityBtn}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <img
                  src={MinusIcon}
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden="true"
                />
              </button>
              <span className={styles.quantityValue}>{quantity}</span>
              <button
                className={styles.quantityBtn}
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <img
                  src={PlusIcon}
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.total}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.totalValue}>${total}</span>
          </div>
        </div>
      </div>

      {/* buttons — mobile */}
      <div className={styles.actionsMobile}>
        <a href="/my-bag" className={styles.viewBtn}>
          View My Bag
          <img
            src={ArrowRightWhiteIcon}
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
        </a>
        <a href="/catalog" className={styles.keepBtn}>
          Keep Shopping
        </a>
      </div>
    </div>
  );
};

export const AddedToBagModal = ({
  isOpen,
  onClose,
  item,
  selectedSizeLabel,
}: AddedToBagModalProps) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Added to My Bag"
    >
      <ModalContent
        item={item}
        selectedSizeLabel={selectedSizeLabel}
        onClose={onClose}
      />
    </div>
  );
};
