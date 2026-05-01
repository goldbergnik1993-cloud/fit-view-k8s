import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import ItemCard from '../../shared/components/ItemCard/ItemCard';
import { PrimaryButton } from '../../shared/components/ui/PrimaryButton/PrimaryButton';
import { mockClothingItems } from '../../data/mockClothing';
import type { ClothingItem } from '../../types/clothing';
import type { Cart, CartItem } from '../../services/api';
import ChevronDownIcon from '../../assets/icons/chevron-down.svg';
import XIcon from '../../assets/icons/x.svg';
import styles from './MyBag.module.scss';

// ─── Mock cart data ───────────────────────────────────────────────────────────

const MOCK_CART: Cart = {
  user_id: 1,
  id: 1,
  status: 'Active',
  cart_items: [
    {
      id: 1,
      quantity: 1,
      item: {
        id: 1,
        name: 'Evening Wrap Dress',
        brand: { id: 1, name: 'Mango' },
        category: 'dress',
        gender: 'female',
        image_url: 'https://placehold.co/80x100?text=Dress',
        price: '129',
        is_favorite: false,
      },
    },
  ],
  created_at: '',
  updated_at: '',
  total_items: 1,
  total_price: 129,
};

// ─── Step indicators ──────────────────────────────────────────────────────────

interface StepDotsProps {
  current: number; // 1 | 2 | 3
  total: number;
}

const StepDots = ({ current, total }: StepDotsProps) => (
  <div className={styles['step-dots']} aria-label={`Step ${current} of ${total}`}>
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className={`${styles['step-dots__dot']} ${i + 1 === current ? styles['step-dots__dot--active'] : ''}`}
      />
    ))}
  </div>
);

// ─── Step 1 — Cart ────────────────────────────────────────────────────────────

interface Step1Props {
  cart: Cart;
  onUpdateQuantity: (itemId: number, qty: number) => void;
  onRemove: (itemId: number) => void;
  onCheckout: () => void;
  promoOpen: boolean;
  setPromoOpen: (v: boolean) => void;
}

const Step1 = ({ cart, onUpdateQuantity, onRemove, onCheckout, promoOpen, setPromoOpen }: Step1Props) => (
  <div className={styles['step1']}>
    <h1 className={styles['page-title']}>My Bag</h1>
    <p className={styles['page-subtitle']}>
      You've got {cart.total_items} item{cart.total_items !== 1 ? 's' : ''} in the bag
    </p>

    <div className={styles['cart-list']}>
      {cart.cart_items.map((ci: CartItem) => (
        <div key={ci.id} className={styles['cart-item']}>
          <button
            className={styles['cart-item__remove']}
            onClick={() => onRemove(ci.id)}
            aria-label="Remove item"
          >
            <img src={XIcon} alt="" width={12} height={12} />
          </button>

          <img
            src={ci.item.image_url}
            alt={ci.item.name}
            className={styles['cart-item__image']}
          />

          <div className={styles['cart-item__info']}>
            <p className={styles['cart-item__name']}>{ci.item.name}</p>
            <p className={styles['cart-item__brand']}>{ci.item.brand.name}</p>

            <div className={styles['cart-item__qty']}>
              <button
                className={styles['cart-item__qty-btn']}
                onClick={() => onUpdateQuantity(ci.id, ci.quantity - 1)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className={styles['cart-item__qty-value']}>{ci.quantity}</span>
              <button
                className={styles['cart-item__qty-btn']}
                onClick={() => onUpdateQuantity(ci.id, ci.quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className={styles['subtotal']}>
      <span className={styles['subtotal__label']}>Subtotal</span>
      <span className={styles['subtotal__value']}>${cart.total_price}</span>
    </div>

    {/* Promo code */}
    <div className={styles['promo']}>
      <button
        className={styles['promo__toggle']}
        onClick={() => setPromoOpen(!promoOpen)}
        aria-expanded={promoOpen}
      >
        <span>Have a promo code?</span>
        <img
          src={ChevronDownIcon}
          alt=""
          width={20}
          height={20}
          className={promoOpen ? styles['promo__chevron--open'] : ''}
        />
      </button>
      {promoOpen && (
        <div className={styles['promo__body']}>
          <input
            type="text"
            placeholder="Enter promo code"
            className={styles['promo__input']}
          />
          <button className={styles['promo__apply']}>Apply</button>
        </div>
      )}
    </div>

    {/* Summary */}
    <div className={styles['summary']}>
      <div className={styles['summary__row']}>
        <span>Subtotal</span><span>${cart.total_price}</span>
      </div>
      <div className={styles['summary__row']}>
        <span>Shipping</span><span>$0</span>
      </div>
      <div className={styles['summary__row']}>
        <span>Tax</span><span>$0</span>
      </div>
      <div className={`${styles['summary__row']} ${styles['summary__row--total']}`}>
        <span>Total</span><span>${cart.total_price}</span>
      </div>
    </div>

    <PrimaryButton onClick={onCheckout}>Checkout →</PrimaryButton>
    <StepDots current={1} total={3} />
  </div>
);

// ─── Step 2 — Checkout form ───────────────────────────────────────────────────

interface FormState {
  firstName: string;
  lastName: string;
  address: string;
  address2: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  payment: 'card' | 'cash';
}

interface Step2Props {
  cart: Cart;
  form: FormState;
  setForm: (f: FormState) => void;
  onReview: () => void;
}

const Step2 = ({ cart, form, setForm, onReview }: Step2Props) => {
  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className={styles['step2']}>
      <h1 className={styles['page-title']}>My Bag</h1>
      <p className={styles['page-subtitle']}>
        You've got {cart.total_items} item{cart.total_items !== 1 ? 's' : ''} in the bag
      </p>

      {/* Cart summary (compact) */}
      <div className={styles['cart-compact']}>
        {cart.cart_items.map((ci: CartItem) => (
          <div key={ci.id} className={styles['cart-compact__item']}>
            <img src={ci.item.image_url} alt={ci.item.name} className={styles['cart-compact__image']} />
            <div>
              <p className={styles['cart-compact__name']}>{ci.item.name}</p>
              <p className={styles['cart-compact__brand']}>{ci.item.brand.name}</p>
              <p className={styles['cart-compact__qty']}>Quantity: {ci.quantity}</p>
            </div>
          </div>
        ))}
        <div className={styles['subtotal']}>
          <span className={styles['subtotal__label']}>Subtotal</span>
          <span className={styles['subtotal__value']}>${cart.total_price}</span>
        </div>
      </div>

      {/* Shipping */}
      <section className={styles['form-section']}>
        <h2 className={styles['form-section__title']}>Shipping details</h2>

        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>First Name *</label>
          <input
            type="text"
            placeholder="John"
            value={form.firstName}
            onChange={set('firstName')}
            className={styles['form-field__input']}
          />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>Last Name *</label>
          <input
            type="text"
            placeholder="Doe"
            value={form.lastName}
            onChange={set('lastName')}
            className={styles['form-field__input']}
          />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>Address *</label>
          <input
            type="text"
            placeholder="Address line 1"
            value={form.address}
            onChange={set('address')}
            className={styles['form-field__input']}
          />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>Address 2 (optional)</label>
          <input
            type="text"
            placeholder="Address line 2"
            value={form.address2}
            onChange={set('address2')}
            className={styles['form-field__input']}
          />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>City *</label>
          <input
            type="text"
            placeholder="London"
            value={form.city}
            onChange={set('city')}
            className={styles['form-field__input']}
          />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>Zip Code *</label>
          <input
            type="text"
            placeholder="NM32 1UE"
            value={form.zip}
            onChange={set('zip')}
            className={styles['form-field__input']}
          />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>Phone Number *</label>
          <input
            type="tel"
            placeholder="+1 000 number"
            value={form.phone}
            onChange={set('phone')}
            className={styles['form-field__input']}
          />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>Email (optional)</label>
          <input
            type="email"
            placeholder="mailbox@gmail.com"
            value={form.email}
            onChange={set('email')}
            className={styles['form-field__input']}
          />
        </div>
      </section>

      {/* Payment */}
      <section className={styles['form-section']}>
        <h2 className={styles['form-section__title']}>Payment details</h2>
        <label className={styles['radio-label']}>
          <input
            type="radio"
            name="payment"
            value="card"
            checked={form.payment === 'card'}
            onChange={() => setForm({ ...form, payment: 'card' })}
            className={styles['radio-label__input']}
          />
          Card
        </label>
        <label className={styles['radio-label']}>
          <input
            type="radio"
            name="payment"
            value="cash"
            checked={form.payment === 'cash'}
            onChange={() => setForm({ ...form, payment: 'cash' })}
            className={styles['radio-label__input']}
          />
          Cash on delivery
        </label>
      </section>

      <div className={`${styles['summary__row']} ${styles['summary__row--total']}`} style={{ marginBottom: 24 }}>
        <span>Total</span><span>${cart.total_price}</span>
      </div>

      <PrimaryButton onClick={onReview}>Review Order →</PrimaryButton>
      <StepDots current={2} total={3} />
    </div>
  );
};

// ─── Step 3 — Review & confirm ────────────────────────────────────────────────

interface Step3Props {
  cart: Cart;
  form: FormState;
  onConfirm: () => void;
}

const Step3 = ({ cart, form, onConfirm }: Step3Props) => (
  <div className={styles['step3']}>
    <h1 className={styles['page-title']}>My Bag</h1>
    <p className={styles['page-subtitle']}>
      You've got {cart.total_items} item{cart.total_items !== 1 ? 's' : ''} in the bag
    </p>

    {cart.cart_items.map((ci: CartItem) => (
      <div key={ci.id} className={styles['cart-compact__item']}>
        <img src={ci.item.image_url} alt={ci.item.name} className={styles['cart-compact__image']} />
        <div>
          <p className={styles['cart-compact__name']}>{ci.item.name}</p>
          <p className={styles['cart-compact__brand']}>{ci.item.brand.name}</p>
          <p className={styles['cart-compact__qty']}>Quantity: {ci.quantity}</p>
        </div>
      </div>
    ))}

    <div className={styles['subtotal']} style={{ marginBottom: 24 }}>
      <span className={styles['subtotal__label']}>Subtotal</span>
      <span className={styles['subtotal__value']}>${cart.total_price}</span>
    </div>

    <section className={styles['form-section']}>
      <h2 className={styles['form-section__title']}>Shipping details</h2>
      <p className={styles['review-text']}>
        {form.firstName} {form.lastName}<br />
        {form.address}{form.address2 ? `, ${form.address2}` : ''}<br />
        {form.city}{form.zip ? `, ${form.zip}` : ''}<br />
        {form.phone}<br />
        {form.email}
      </p>
    </section>

    <section className={styles['form-section']}>
      <h2 className={styles['form-section__title']}>Payment details</h2>
      <p className={styles['review-text']}>
        {form.payment === 'card' ? 'Card' : 'Cash on delivery'}
      </p>
    </section>

    <div className={`${styles['summary__row']} ${styles['summary__row--total']}`} style={{ marginBottom: 24 }}>
      <span>Total</span><span>${cart.total_price}</span>
    </div>

    <PrimaryButton onClick={onConfirm}>Payment →</PrimaryButton>
    <StepDots current={3} total={3} />
  </div>
);

// ─── Step 4 — Success ─────────────────────────────────────────────────────────

const Step4 = ({ recommendations }: { recommendations: ClothingItem[] }) => (
  <div className={styles['step4']}>
    <h1 className={styles['page-title']}>My Bag</h1>

    <div className={styles['success']}>
      {/* Placeholder illustration — замени на реальный SVG из фигмы */}
      <div className={styles['success__illustration']} aria-hidden="true">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="60" r="40" stroke="#0D0C0D" strokeWidth="2" fill="none" />
          <polyline points="62,60 76,74 100,48" stroke="#0D0C0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="40" y="95" width="30" height="50" rx="4" stroke="#0D0C0D" strokeWidth="2" fill="none" />
          <rect x="75" y="85" width="45" height="60" rx="4" stroke="#0D0C0D" strokeWidth="2" fill="none" />
          <path d="M50 95 Q55 80 60 95" stroke="#0D0C0D" strokeWidth="2" fill="none" />
          <path d="M85 85 Q97 68 109 85" stroke="#0D0C0D" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <h2 className={styles['success__title']}>Thanks for your order!</h2>
      <p className={styles['success__text']}>A confirmation email has been sent to your inbox</p>

      <PrimaryButton>Track Order →</PrimaryButton>
      <Link to="/catalog">
        <button className={styles['success__keep-shopping']}>Keep Shopping</button>
      </Link>
    </div>

    {/* You may also like */}
    {recommendations.length > 0 && (
      <section className={styles['similar']}>
        <div className={styles['similar__header']}>
          <h2 className={styles['similar__title']}>You may also like</h2>
          <div className={styles['similar__nav']}>
            <button aria-label="Previous">‹</button>
            <button aria-label="Next">›</button>
          </div>
        </div>
        <div className={styles['similar__list']}>
          {recommendations.slice(0, 2).map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    )}
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyBag = ({ recommendations }: { recommendations: ClothingItem[] }) => (
  <div className={styles['empty']}>
    <h1 className={styles['page-title']}>My Bag</h1>

    {/* Placeholder — замени на реальный SVG из фигмы */}
    <div className={styles['empty__illustration']} aria-hidden="true">
      <svg width="160" height="180" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 55 L130 55 L115 150 H45 L30 55Z" stroke="#0D0C0D" strokeWidth="2" fill="none" />
        <path d="M55 55 Q55 25 80 25 Q105 25 105 55" stroke="#0D0C0D" strokeWidth="2" fill="none" />
      </svg>
    </div>

    <h2 className={styles['empty__title']}>Nothing in your bag yet!</h2>
    <p className={styles['empty__text']}>Browse our store, find items & happy shopping!</p>

    <Link to="/catalog">
      <PrimaryButton>Browse Items</PrimaryButton>
    </Link>

    {recommendations.length > 0 && (
      <section className={styles['similar']}>
        <div className={styles['similar__header']}>
          <h2 className={styles['similar__title']}>You may also like</h2>
          <div className={styles['similar__nav']}>
            <button aria-label="Previous">‹</button>
            <button aria-label="Next">›</button>
          </div>
        </div>
        <div className={styles['similar__list']}>
          {recommendations.slice(0, 2).map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    )}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const INITIAL_FORM: FormState = {
  firstName: '',
  lastName: '',
  address: '',
  address2: '',
  city: '',
  zip: '',
  phone: '',
  email: '',
  payment: 'card',
};

const MyBag = () => {
  const [cart, setCart] = useState<Cart | null>(MOCK_CART);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [promoOpen, setPromoOpen] = useState(false);

  const isEmpty = !cart || cart.cart_items.length === 0;

  const handleUpdateQuantity = (itemId: number, qty: number) => {
    if (!cart) return;
    if (qty < 1) return handleRemove(itemId);
    setCart({
      ...cart,
      cart_items: cart.cart_items.map((ci) =>
        ci.id === itemId ? { ...ci, quantity: qty } : ci
      ),
      total_items: cart.cart_items.reduce((s, ci) => s + (ci.id === itemId ? qty : ci.quantity), 0),
      total_price: cart.cart_items.reduce(
        (s, ci) => s + Number(ci.item.price) * (ci.id === itemId ? qty : ci.quantity),
        0
      ),
    });
  };

  const handleRemove = (itemId: number) => {
    if (!cart) return;
    const updated = cart.cart_items.filter((ci) => ci.id !== itemId);
    setCart({
      ...cart,
      cart_items: updated,
      total_items: updated.reduce((s, ci) => s + ci.quantity, 0),
      total_price: updated.reduce((s, ci) => s + Number(ci.item.price) * ci.quantity, 0),
    });
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        {isEmpty && step !== 4 ? (
          <EmptyBag recommendations={mockClothingItems} />
        ) : step === 1 && cart ? (
          <Step1
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
            onCheckout={() => setStep(2)}
            promoOpen={promoOpen}
            setPromoOpen={setPromoOpen}
          />
        ) : step === 2 && cart ? (
          <Step2
            cart={cart}
            form={form}
            setForm={setForm}
            onReview={() => setStep(3)}
          />
        ) : step === 3 && cart ? (
          <Step3
            cart={cart}
            form={form}
            onConfirm={() => setStep(4)}
          />
        ) : (
          <Step4 recommendations={mockClothingItems} />
        )}
      </main>
      <Footer />
    </>
  );
};

export default MyBag;