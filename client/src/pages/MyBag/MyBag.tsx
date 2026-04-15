import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import { cartApi, type Cart } from '../../services/api';

const MyBag = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return handleRemove(itemId);
    setUpdatingId(itemId);
    try {
      const data = await cartApi.updateQuantity(itemId, quantity);
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    setUpdatingId(itemId);
    try {
      const data = await cartApi.removeItem(itemId);
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      const data = await cartApi.clearCart();
      setCart(data);
    } catch (err) {
      console.error(err);
    }
  };

  const isEmpty = !cart || cart.cart_items.length === 0;

  return (
    <>
      <Header />
      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && isEmpty && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              Nothing in your bag yet!
            </p>
            <p>Browse our store, find items & happy shopping!</p>
            <Link to="/catalog">
              <button style={{ padding: '12px 32px', marginTop: '16px', cursor: 'pointer' }}>
                Browse items
              </button>
            </Link>
          </div>
        )}

        {!loading && !isEmpty && cart && (
          <div style={{ display: 'flex', gap: '48px' }}>

            {/* Left — items */}
            <div style={{ flex: 1 }}>
              <h1>My Bag</h1>
              <p>You've got {cart.total_items} item{cart.total_items !== 1 ? 's' : ''} in the bag</p>

              {cart.cart_items.map((cartItem) => (
                <div key={cartItem.id} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 0', borderBottom: '1px solid #eee'
                }}>
                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(cartItem.id)}
                    disabled={updatingId === cartItem.id}
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: '1px solid #999', background: 'white',
                      cursor: 'pointer', fontSize: '12px'
                    }}
                  >×</button>

                  {/* Image */}
                  <img
                    src={cartItem.item.image_url}
                    alt={cartItem.item.name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', background: '#f0f0f0' }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{cartItem.item.name}</p>
                    <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
                      {cartItem.item.brand.name}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => handleUpdateQuantity(cartItem.id, cartItem.quantity - 1)}
                      disabled={updatingId === cartItem.id}
                      style={{ padding: '4px 8px', cursor: 'pointer' }}
                    >−</button>
                    <span>{cartItem.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(cartItem.id, cartItem.quantity + 1)}
                      disabled={updatingId === cartItem.id}
                      style={{ padding: '4px 8px', cursor: 'pointer' }}
                    >+</button>
                  </div>
                </div>
              ))}

              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
                <span>Subtotal</span>
                <span>${cart.total_price}</span>
              </div>
            </div>

            {/* Right — summary */}
            <div style={{ width: '300px' }}>
              <div style={{ padding: '16px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span>Subtotal</span><span>${cart.total_price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Shipping</span><span>$0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span>Tax</span><span>$0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                  <span>Total</span><span>${cart.total_price}</span>
                </div>
                <button
                  style={{
                    width: '100%', marginTop: '16px', padding: '14px',
                    background: '#ddd', border: 'none', cursor: 'pointer', fontSize: '15px'
                  }}
                >
                  Checkout →
                </button>
                <button
                  onClick={handleClearCart}
                  style={{
                    width: '100%', marginTop: '8px', padding: '10px',
                    background: 'none', border: '1px solid #ccc',
                    cursor: 'pointer', fontSize: '13px', color: '#999'
                  }}
                >
                  Clear bag
                </button>
              </div>
            </div>

          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default MyBag;