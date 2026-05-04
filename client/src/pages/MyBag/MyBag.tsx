import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import EmptyState from '../../shared/components/EmptyState/EmptyState';
import { SimilarItems } from '../../shared/components/SimilarItems/SimilarItems';
import { PrimaryButton } from '../../shared/components/ui/PrimaryButton/PrimaryButton';
import { useCart } from '../../providers/CartContext';
import { ordersApi, type DeliveryMethod } from '../../services/api';
import type { Cart, CartItem } from '../../services/api';
import ChevronDownIcon from '../../assets/icons/chevron-down.svg';
import XIcon from '../../assets/icons/x.svg';
import EmptyBagIllustration from '../../assets/illustrations/empty-bag.png';
import styles from './MyBag.module.scss';

// ─── Step indicators ──────────────────────────────────────────────────────────

interface StepDotsProps {
  current: number;
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
            {ci.size_label && (
              <p className={styles['cart-item__brand']}>Size: {ci.size_label}</p>
            )}
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
  country: string;
  deliveryMethod: DeliveryMethod;
}

interface Step2Props {
  cart: Cart;
  form: FormState;
  setForm: (f: FormState) => void;
  onReview: () => void;
}

const Step2 = ({ cart, form, setForm, onReview }: Step2Props) => {
  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className={styles['step2']}>
      <h1 className={styles['page-title']}>My Bag</h1>
      <p className={styles['page-subtitle']}>
        You've got {cart.total_items} item{cart.total_items !== 1 ? 's' : ''} in the bag
      </p>

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

      <section className={styles['form-section']}>
        <h2 className={styles['form-section__title']}>Shipping details</h2>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>First Name *</label>
          <input type="text" placeholder="John" value={form.firstName} onChange={set('firstName')} className={styles['form-field__input']} />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>Last Name *</label>
          <input type="text" placeholder="Doe" value={form.lastName} onChange={set('lastName')} className={styles['form-field__input']} />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>Country *</label>
          <input type="text" placeholder="US" value={form.country} onChange={set('country')} className={styles['form-field__input']} />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>City *</label>
          <input type="text" placeholder="New York" value={form.city} onChange={set('city')} className={styles['form-field__input']} />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>Address</label>
          <input type="text" placeholder="123 Main St" value={form.address} onChange={set('address')} className={styles['form-field__input']} />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>Address 2 (optional)</label>
          <input type="text" placeholder="Apt 4B" value={form.address2} onChange={set('address2')} className={styles['form-field__input']} />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>Zip Code</label>
          <input type="text" placeholder="NY 10011" value={form.zip} onChange={set('zip')} className={styles['form-field__input']} />
        </div>
        <div className={styles['form-field']}>
          <label className={styles['form-field__label']}>Delivery Method *</label>
          <select value={form.deliveryMethod} onChange={set('deliveryMethod')} className={styles['form-field__input']}>
            <option value="COURIER">Courier</option>
            <option value="POST_OFFICE">Post Office</option>
            <option value="PARCEL_LOCKER">Parcel Locker</option>
          </select>
        </div>
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
  submitting: boolean;
}

const Step3 = ({ cart, form, onConfirm, submitting }: Step3Props) => (
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
        {form.country}, {form.city}{form.zip ? `, ${form.zip}` : ''}<br />
        {form.address}{form.address2 ? `, ${form.address2}` : ''}<br />
        {form.deliveryMethod.replace('_', ' ')}
      </p>
    </section>

    <div className={`${styles['summary__row']} ${styles['summary__row--total']}`} style={{ marginBottom: 24 }}>
      <span>Total</span><span>${cart.total_price}</span>
    </div>

    <PrimaryButton onClick={onConfirm} loading={submitting}>Payment →</PrimaryButton>
    <StepDots current={3} total={3} />
  </div>
);

// ─── Step 4 — Success ─────────────────────────────────────────────────────────

const Step4 = () => (
  <div className={styles['step4']}>
    <h1 className={styles['page-title']}>My Bag</h1>

    <div className={styles['success']}>
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

    <SimilarItems />
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
  country: '',
  deliveryMethod: 'COURIER',
};

const MyBag = () => {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [promoOpen, setPromoOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEmpty = !cart || cart.cart_items.length === 0;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const order = await ordersApi.create({
        delivery_info: {
          country: form.country,
          city: form.city,
          delivery_method: form.deliveryMethod,
          zip_code: form.zip || null,
          address_line: form.address || null,
        },
      });
      const session = await ordersApi.checkout(order.id);
      window.location.href = session.checkout_url;
    } catch (err) {
      console.warn('Checkout failed:', err);
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <>
      <Header />
      <main className={styles.main} />
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <main className={styles.main}>
        {isEmpty && step !== 4 ? (
          <EmptyState
            title="Nothing in your bag yet!"
            subtitle="Browse our store, find items & happy shopping!"
            buttonText="Browse Items"
            buttonPath="/catalog"
            illustration={EmptyBagIllustration}
          />
        ) : step === 1 && cart ? (
          <Step1
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
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
            onConfirm={handleConfirm}
            submitting={submitting}
          />
        ) : (
          <Step4 />
        )}
      </main>
      <Footer />
    </>
  );
};

export default MyBag;