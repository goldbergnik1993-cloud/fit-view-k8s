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

import CircleXIcon from '../../assets/icons/circle-x-error.svg';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
import EmptyBagIllustration from '../../assets/illustrations/empty-bag.png';
import MinusIcon from '../../assets/icons/minus.svg';
import PlusIcon from '../../assets/icons/plus.svg';
import ArrowRightIcon from '../../assets/icons/arrow-right-white.svg';
import styles from './MyBag.module.scss';

// ─── Breadcrumb (desktop only) ────────────────────────────────────────────────

interface BreadcrumbProps {
  step: number;
}

const STEPS = ['My Bag', 'Checkout', 'Review Order'];

const Breadcrumb = ({ step }: BreadcrumbProps) => (
  <div className={styles['breadcrumb']}>
    {STEPS.map((label, i) => (
      <span key={label} className={styles['breadcrumb__item-wrap']}>
        <span
          className={`${styles['breadcrumb__step']} ${i + 1 === step ? styles['breadcrumb__step--active'] : ''}`}
        >
          {label}
        </span>
        {i < STEPS.length - 1 && (
          <img
            src={ArrowRightIcon}
            alt=""
            width={16}
            height={16}
            className={
              i + 1 < step
                ? styles['breadcrumb__arrow']
                : styles['breadcrumb__arrow--inactive']
            }
          />
        )}
      </span>
    ))}
  </div>
);

// ─── Step Dots ────────────────────────────────────────────────────────────────

interface StepDotsProps {
  current: number;
  total: number;
}

const StepDots = ({ current, total }: StepDotsProps) => (
  <div
    className={styles['step-dots']}
    aria-label={`Step ${current} of ${total}`}
  >
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className={`${styles['step-dots__dot']} ${i + 1 === current ? styles['step-dots__dot--active'] : ''}`}
      />
    ))}
  </div>
);

// ─── Cart Compact (used in Step 2 & 3) ───────────────────────────────────────

interface CartCompactProps {
  cart: Cart;
}

const CartCompact = ({ cart }: CartCompactProps) => (
  <div className={styles['cart-compact']}>
    {cart.cart_items.map((ci: CartItem) => (
      <div key={ci.id} className={styles['cart-compact__item']}>
        <img
          src={ci.item.image_url || 'https://placehold.co/80x100?text=Item'}
          alt={ci.item.name}
          className={styles['cart-compact__image']}
        />
        <div className={styles['cart-compact__info']}>
          <p className={styles['cart-compact__name']}>{ci.item.name}</p>
          <p className={styles['cart-compact__brand']}>{ci.item.brand.name}</p>
          <p className={styles['cart-compact__qty']}>Quantity: {ci.quantity}</p>
        </div>
      </div>
    ))}
    <div className={styles['cart-compact__subtotal']}>
      <span className={styles['cart-compact__subtotal-label']}>Subtotal</span>
      <span className={styles['cart-compact__subtotal-value']}>
        ${Number(cart.total_price).toFixed(2)}
      </span>
    </div>
  </div>
);

// ─── Step 1 — My Bag ──────────────────────────────────────────────────────────

interface Step1Props {
  cart: Cart;
  onUpdateQuantity: (itemId: number, qty: number) => void;
  onRemove: (itemId: number) => void;
  onCheckout: () => void;
}

const Step1 = ({
  cart,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: Step1Props) => (
  <div className={styles['step1']}>
    {/* Left: cart items */}
    <div className={styles['step1__left']}>
      <p className={styles['page-title']}>My Bag</p>
      <p className={styles['page-subtitle']}>
        You've got {cart.total_items} item{cart.total_items !== 1 ? 's' : ''} in
        the bag
      </p>

      <div className={styles['cart-list']}>
        {cart.cart_items.map((ci: CartItem) => (
          <div key={ci.id} className={styles['cart-item']}>
            {/* Remove button — outside card, top-left */}
            <button
              className={styles['cart-item__remove']}
              onClick={() => onRemove(ci.id)}
              aria-label="Remove item"
            >
              <img src={CircleXIcon} alt="" width={24} height={24} />
            </button>

            {/* Card */}
            <div className={styles['cart-item__card']}>
              <img
                src={ci.item.image_url}
                alt={ci.item.name}
                className={styles['cart-item__image']}
              />
              <div className={styles['cart-item__info']}>
                <p className={styles['cart-item__name']}>{ci.item.name}</p>
                <p className={styles['cart-item__brand']}>
                  {ci.item.brand.name}
                </p>
                {ci.size_label && (
                  <p className={styles['cart-item__size']}>
                    Size: {ci.size_label}
                  </p>
                )}
                <div className={styles['cart-item__qty']}>
                  <span className={styles['cart-item__qty-label']}>
                    Quantity
                  </span>
                  <button
                    className={styles['cart-item__qty-btn']}
                    onClick={() => onUpdateQuantity(ci.id, ci.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    <img src={MinusIcon} alt="" width={16} height={16} />
                  </button>
                  <span className={styles['cart-item__qty-value']}>
                    {ci.quantity}
                  </span>
                  <button
                    className={styles['cart-item__qty-btn']}
                    onClick={() => onUpdateQuantity(ci.id, ci.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <img src={PlusIcon} alt="" width={16} height={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className={styles['cart-item__subtotal']}>
              <span className={styles['cart-item__subtotal-label']}>
                Subtotal
              </span>
              <span className={styles['cart-item__subtotal-value']}>
                ${(Number(ci.item.price) * ci.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Right: promo + summary */}
    <div className={styles['step1__right']}>
      {/* Promo */}
      <div className={styles['promo']}>
        <div className={styles['promo__toggle']}>
          <span>Have a promo code?</span>
          <img src={ChevronRightIcon} alt="" width={20} height={20} />
        </div>
      </div>

      {/* Summary */}
      <div className={styles['summary']}>
        <div className={styles['summary__row']}>
          <span className={styles['summary__row-label--bold']}>Subtotal</span>
          <span className={styles['summary__row-value--bold']}>
            ${Number(cart.total_price).toFixed(2)}
          </span>
        </div>
        <div className={styles['summary__row']}>
          <span className={styles['summary__row-label']}>Shipping</span>
          <span className={styles['summary__row-value']}>$0.00</span>
        </div>
        <div className={styles['summary__row']}>
          <span className={styles['summary__row-label']}>Tax</span>
          <span className={styles['summary__row-value']}>$0.00</span>
        </div>
        <div
          className={`${styles['summary__row']} ${styles['summary__row--total']}`}
        >
          <span className={styles['summary__total-label']}>Total</span>
          <span className={styles['summary__total-value']}>
            ${Number(cart.total_price).toFixed(2)}
          </span>
        </div>
      </div>

      <PrimaryButton onClick={onCheckout}>
        Checkout <img src={ArrowRightIcon} alt="" width={16} height={16} />
      </PrimaryButton>
      <StepDots current={1} total={3} />
    </div>
  </div>
);

// ─── Step 2 — Checkout ────────────────────────────────────────────────────────

interface FormState {
  firstName: string;
  lastName: string;
  address: string;
  address2: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  deliveryMethod: DeliveryMethod;
}

interface Step2Props {
  cart: Cart;
  form: FormState;
  setForm: (f: FormState) => void;
  onReview: () => void;
}

const Step2 = ({ cart, form, setForm, onReview }: Step2Props) => {
  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [field]: e.target.value });

  return (
    <div className={styles['step2']}>
      {/* Left */}
      <div className={styles['step2__left']}>
        <p className={styles['page-title']}>My Bag</p>
        <p className={styles['page-subtitle']}>
          You've got {cart.total_items} item{cart.total_items !== 1 ? 's' : ''}{' '}
          in the bag
        </p>

        <CartCompact cart={cart} />

        <div className={styles['form-section']}>
          <h2 className={styles['form-section__title']}>Shipping Details</h2>
          <div className={styles['form-grid']}>
            <div className={styles['form-field']}>
              <label className={styles['form-field__label']}>
                First Name *
              </label>
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
              <label className={styles['form-field__label']}>
                Address 2 (optional)
              </label>
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
                placeholder="NR32 1UE"
                value={form.zip}
                onChange={set('zip')}
                className={styles['form-field__input']}
              />
            </div>
            <div className={styles['form-field']}>
              <label className={styles['form-field__label']}>
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="+07700 900123"
                value={form.phone}
                onChange={set('phone')}
                className={styles['form-field__input']}
              />
            </div>
            <div className={styles['form-field']}>
              <label className={styles['form-field__label']}>
                Email (optional)
              </label>
              <input
                type="email"
                placeholder="mailbox@gmail.com"
                value={form.email}
                onChange={set('email')}
                className={styles['form-field__input']}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className={styles['step2__right']}>
        <div className={styles['payment-block']}>
          <h2 className={styles['payment-block__title']}>Payment details</h2>
          <label className={styles['radio-label']}>
            <input
              type="radio"
              name="payment"
              defaultChecked
              className={styles['radio-input']}
            />
            <span className={styles['radio-custom']} />
            Card
          </label>
          <label className={styles['radio-label']}>
            <input
              type="radio"
              name="payment"
              className={styles['radio-input']}
            />
            <span className={styles['radio-custom']} />
            Cash on delivery
          </label>
          <div className={styles['payment-block__total']}>
            <span className={styles['payment-block__total-label']}>Total</span>
            <span className={styles['payment-block__total-value']}>
              ${Number(cart.total_price).toFixed(2)}
            </span>
          </div>
        </div>

        <PrimaryButton onClick={onReview}>
          Review Order{' '}
          <img src={ArrowRightIcon} alt="" width={16} height={16} />
        </PrimaryButton>
        <StepDots current={2} total={3} />
      </div>
    </div>
  );
};

// ─── Step 3 — Review Order ────────────────────────────────────────────────────

interface Step3Props {
  cart: Cart;
  form: FormState;
  onConfirm: () => void;
  submitting: boolean;
}

const Step3 = ({ cart, form, onConfirm, submitting }: Step3Props) => (
  <div className={styles['step3']}>
    <div className={styles['step3__left']}>
      <p className={styles['page-title']}>My Bag</p>
      <p className={styles['page-subtitle']}>
        You've got {cart.total_items} item{cart.total_items !== 1 ? 's' : ''} in
        the bag
      </p>

      <CartCompact cart={cart} />

      <div className={styles['form-section']}>
        <h2 className={styles['form-section__title']}>Shipping details</h2>
        <div className={styles['review-text']}>
          <span className={styles['review-text__line']}>
            {form.firstName} {form.lastName}
          </span>
          <span className={styles['review-text__line']}>
            {form.address}
            {form.address2 ? `, ${form.address2}` : ''}
          </span>
          <span className={styles['review-text__line']}>
            {form.city}
            {form.zip ? `, ${form.zip}` : ''}
          </span>
          <span className={styles['review-text__line']}>{form.phone}</span>
          <span className={styles['review-text__line']}>{form.email}</span>
        </div>
      </div>
    </div>

    <div className={styles['step3__right']}>
      <div className={styles['payment-block']}>
        <h2 className={styles['payment-block__title']}>Payment details</h2>
        <p className={styles['payment-block__value']}>Card</p>
        <div className={styles['payment-block__total']}>
          <span className={styles['payment-block__total-label']}>Total</span>
          <span className={styles['payment-block__total-value']}>
            ${Number(cart.total_price).toFixed(2)}
          </span>
        </div>
      </div>

      <PrimaryButton onClick={onConfirm} loading={submitting}>
        Payment <img src={ArrowRightIcon} alt="" width={16} height={16} />
      </PrimaryButton>
      <StepDots current={3} total={3} />
    </div>
  </div>
);

// ─── Step 4 — Success ─────────────────────────────────────────────────────────

const Step4 = () => (
  <div className={styles['step4']}>
    <p className={styles['page-title']}>My Bag</p>

    <div className={styles['success']}>
      <div className={styles['success__illustration']} aria-hidden="true">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="80"
            cy="60"
            r="40"
            stroke="#0D0C0D"
            strokeWidth="2"
            fill="none"
          />
          <polyline
            points="62,60 76,74 100,48"
            stroke="#0D0C0D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <rect
            x="40"
            y="95"
            width="30"
            height="50"
            rx="4"
            stroke="#0D0C0D"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="75"
            y="85"
            width="45"
            height="60"
            rx="4"
            stroke="#0D0C0D"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M50 95 Q55 80 60 95"
            stroke="#0D0C0D"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M85 85 Q97 68 109 85"
            stroke="#0D0C0D"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      <h2 className={styles['success__title']}>Thanks for your order!</h2>
      <p className={styles['success__text']}>
        A confirmation email has been sent to your inbox
      </p>

      <div className={styles['success__actions']}>
        <PrimaryButton>
          Track Order <img src={ArrowRightIcon} alt="" width={16} height={16} />
        </PrimaryButton>
        <Link to="/catalog">
          <button className={styles['success__keep-shopping']}>
            Keep Shopping
          </button>
        </Link>
      </div>
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
  phone: '',
  email: '',
  deliveryMethod: 'COURIER',
};

const MyBag = () => {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
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

  if (loading)
    return (
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
        {step !== 4 && !isEmpty && <Breadcrumb step={step} />}
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
