import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useActiveOrder } from '../../hooks/useActiveOrder';
import { CustomerHeader } from '../../components/layout/CustomerHeader';
import { OrderStatusTracker } from '../../components/customer/OrderStatusTracker';
import { formatCurrency } from '../../utils/formatCurrency';

const STAGE_INDEX = { placed: 0, preparing: 1, ready: 2, served: 3, paid: 3 };
const STAGE_COPY = {
  placed: { headline: 'Order placed', sub: 'The kitchen has received your order.' },
  preparing: { headline: 'Preparing your food', sub: 'Your dishes are being cooked fresh.' },
  ready: { headline: 'Ready for pickup', sub: 'Your order is ready — a server is bringing it over.' },
  served: { headline: 'Served — enjoy!', sub: "Bon appétit. Tap below whenever you're ready to pay." },
  paid: { headline: 'Paid — thank you!', sub: 'See you again soon.' },
};

export function OrderStatus() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());

  // Shares one source of truth with the menu's ActiveOrderBanner. Previously this
  // page located the order via localStorage, which could disagree with the banner
  // (cleared storage, a second phone at the same table) and wrongly claim there was
  // no active order while the banner linked here.
  const { orders, loading } = useActiveOrder(tableId);

  // Orders arrive newest-first, so the newest unpaid one is what's being cooked.
  const trackedId = localStorage.getItem(`order:${tableId}`);
  const order = orders.find((o) => o._id === trackedId) || orders[0] || null;

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Once the tab is settled there's nothing left to track — send them to the receipt.
  useEffect(() => {
    if (!loading && orders.length === 0 && trackedId) {
      localStorage.removeItem(`order:${tableId}`);
      navigate(`/menu/${tableId}/bill`);
    }
  }, [loading, orders.length, trackedId, tableId, navigate]);

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#FAF6F0', padding: 24, color: '#8C8073' }}>Loading order…</div>;
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF6F0', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
        <CustomerHeader title="Order status" onBack={() => navigate(`/menu/${tableId}`)} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', color: '#8C8073', fontSize: 13 }}>
          No active order for this table yet. Place an order from the menu to see live status here.
        </div>
      </div>
    );
  }

  const stageIndex = STAGE_INDEX[order.status] ?? 0;
  const copy = STAGE_COPY[order.status] || STAGE_COPY.placed;
  const elapsedSec = Math.max(0, Math.floor((now - new Date(order.createdAt).getTime()) / 1000));
  const elapsedLabel = elapsedSec < 60 ? `${elapsedSec}s ago` : `${Math.floor(elapsedSec / 60)} min ago`;
  const placedAtLabel = new Date(order.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF6F0', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      <div style={{ padding: '24px 20px 4px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 19, color: '#2B2420' }}>Order status</div>
        <div onClick={() => navigate(`/menu/${tableId}`)} style={{ fontSize: 12, color: '#B3ABA1', cursor: 'pointer' }}>
          Menu
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 24px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: 999, background: '#3F8F5F' }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3F8F5F', letterSpacing: 0.4, textTransform: 'uppercase' }}>Live</div>
          <div style={{ fontSize: 12, color: '#8C8073', marginLeft: 6 }}>
            Table {order.table?.tableNumber} · Placed at {placedAtLabel} · {elapsedLabel}
          </div>
        </div>

        <div style={{ marginTop: 22, padding: 18, background: '#F2EAE0', borderRadius: 16 }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#2B2420' }}>{copy.headline}</div>
          <div style={{ fontSize: 13, color: '#8C8073', marginTop: 3 }}>{copy.sub}</div>
        </div>

        <OrderStatusTracker stageIndex={stageIndex} />

        <div style={{ marginTop: 28, fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 13, color: '#2B2420' }}>Your items</div>
        <div style={{ marginTop: 8 }}>
          {order.items.map((it, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E7DCCC', fontSize: 13, color: '#2B2420' }}>
              <span>
                {it.quantity}× {it.name}
              </span>
              <span style={{ color: '#8C8073' }}>{formatCurrency(it.price * it.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: '14px 20px 28px', boxSizing: 'border-box', background: '#FAF6F0', borderTop: '1px solid #E7DCCC' }}>
        <div
          onClick={() => navigate(`/menu/${tableId}/bill`)}
          style={{ background: '#2B2420', color: '#fff', textAlign: 'center', padding: 15, borderRadius: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          View bill
        </div>
      </div>
    </div>
  );
}
