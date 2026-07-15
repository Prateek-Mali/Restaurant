import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import orderService from '../../services/orderService';
import { useSocket } from '../../hooks/useSocket';
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
  const socket = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const orderId = localStorage.getItem(`order:${tableId}`);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    orderService
      .getOrdersByTable(tableId)
      .then((orders) => setOrder(orders.find((o) => o._id === orderId) || null))
      .finally(() => setLoading(false));
  }, [tableId, orderId]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!socket) return;

    function joinTable() {
      socket.emit('join_table', tableId);
      // Resync in case the status changed while disconnected (e.g. a server restart).
      if (orderId) {
        orderService.getOrdersByTable(tableId).then((orders) => {
          const match = orders.find((o) => o._id === orderId);
          if (match) setOrder(match);
        });
      }
    }

    joinTable();
    socket.on('connect', joinTable);

    function handleUpdate(updatedOrder) {
      if (updatedOrder._id === orderId) setOrder(updatedOrder);
    }

    function handlePaymentUpdated() {
      localStorage.removeItem(`order:${tableId}`);
      navigate(`/menu/${tableId}/bill`);
    }

    socket.on('order_status_updated', handleUpdate);
    socket.on('new_order', handleUpdate);
    socket.on('payment_updated', handlePaymentUpdated);
    return () => {
      socket.off('connect', joinTable);
      socket.off('order_status_updated', handleUpdate);
      socket.off('new_order', handleUpdate);
      socket.off('payment_updated', handlePaymentUpdated);
    };
  }, [socket, tableId, orderId, navigate]);

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
