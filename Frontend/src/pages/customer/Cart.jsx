import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import orderService from '../../services/orderService';
import { useCart } from '../../hooks/useCart';
import { CustomerHeader } from '../../components/layout/CustomerHeader';
import { CartLineItem } from '../../components/customer/CartLineItem';
import { formatCurrency } from '../../utils/formatCurrency';

export function Cart() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { lineList, subtotal, incItem, decItem, removeItem, clearCart } = useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  async function handlePlaceOrder() {
    setPlacing(true);
    setError('');
    try {
      const order = await orderService.placeOrder({
        tableId,
        items: lineList.map((l) => ({ menuItem: l.menuItem._id, quantity: l.quantity })),
      });
      localStorage.setItem(`order:${tableId}`, order._id);
      clearCart();
      navigate(`/menu/${tableId}/status`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF6F0', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      <CustomerHeader title="Your order" onBack={() => navigate(`/menu/${tableId}`)} />

      {lineList.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 40px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: '#F2EAE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
            🛒
          </div>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, color: '#2B2420' }}>Your cart is empty</div>
          <div style={{ fontSize: 13, color: '#8C8073' }}>Add a few dishes from the menu to get started.</div>
          <div
            onClick={() => navigate(`/menu/${tableId}`)}
            style={{ marginTop: 6, padding: '12px 22px', background: '#DE5B33', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Browse menu
          </div>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 12px', boxSizing: 'border-box' }}>
            {lineList.map((line) => (
              <CartLineItem key={line.menuItem._id} line={line} onInc={incItem} onDec={decItem} onRemove={removeItem} />
            ))}

            <div style={{ marginTop: 16, padding: 16, background: '#F2EAE0', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 15, color: '#2B2420' }}>
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>

            {error && <div style={{ marginTop: 12, fontSize: 13, color: '#C24A26', fontWeight: 600 }}>{error}</div>}
          </div>

          <div style={{ flexShrink: 0, padding: '14px 20px 28px', boxSizing: 'border-box', background: '#FAF6F0', borderTop: '1px solid #E7DCCC' }}>
            <div
              onClick={placing ? undefined : handlePlaceOrder}
              style={{
                background: placing ? '#E7DCCC' : '#DE5B33',
                color: placing ? '#8C8073' : '#fff',
                textAlign: 'center',
                padding: 16,
                borderRadius: 14,
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 800,
                fontSize: 15,
                cursor: placing ? 'default' : 'pointer',
              }}
            >
              {placing ? 'Placing order…' : `Place order · ${formatCurrency(subtotal)}`}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
