import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import { useSocket } from '../../hooks/useSocket';
import { CustomerHeader } from '../../components/layout/CustomerHeader';
import { formatCurrency } from '../../utils/formatCurrency';

const UNPAID_STATUSES = new Set(['placed', 'preparing', 'ready', 'served']);

export function Bill() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [justPaid, setJustPaid] = useState(false);

  function loadOrders() {
    return orderService.getOrdersByTable(tableId).then((allOrders) => {
      setOrders(allOrders.filter((o) => UNPAID_STATUSES.has(o.status)));
    });
  }

  useEffect(() => {
    loadOrders().finally(() => setLoading(false));
  }, [tableId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_table', tableId);

    function handleUpdate() {
      loadOrders();
    }

    function handlePaymentUpdated() {
      localStorage.removeItem(`order:${tableId}`);
      setJustPaid(true);
      setOrders([]);
    }

    socket.on('order_status_updated', handleUpdate);
    socket.on('new_order', handleUpdate);
    socket.on('payment_updated', handlePaymentUpdated);
    return () => {
      socket.off('order_status_updated', handleUpdate);
      socket.off('new_order', handleUpdate);
      socket.off('payment_updated', handlePaymentUpdated);
    };
  }, [socket, tableId]);

  const grandTotal = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // TODO(payments): this is where the Razorpay checkout modal goes — see
  // docs/ADDING_PAYMENTS.md §4 Step 5. Today it just calls initiate, gets a 503
  // (no gateway keys configured), and shows the pay-at-counter fallback below.
  //
  // ⚠️ Note `orders[0]` — that's only the FIRST round of a multi-round tab. It's a
  // placeholder, NOT a pattern to build on. Wiring a real modal to it would charge
  // ₹350 on a ₹550 bill. Make the endpoint tab-scoped first, then pass `tableId`.
  //
  // Once verify succeeds, do NOT reset the UI here — the `payment_updated` socket
  // listener above already handles it.
  async function handlePay() {
    setPaying(true);
    setError('');
    try {
      await paymentService.initiatePayment(orders[0]._id, 'card');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Online payment is not set up yet. Please pay at the counter — the staff will confirm it.'
      );
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#FAF6F0', padding: 24, color: '#8C8073' }}>Loading bill…</div>;
  }

  if (justPaid) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 36px', textAlign: 'center', background: '#FAF6F0', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
        <div style={{ width: 76, height: 76, borderRadius: 999, background: '#DFF3E7', color: '#3F8F5F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800 }}>
          ✓
        </div>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22, color: '#2B2420' }}>Thank you!</div>
        <div style={{ fontSize: 14, color: '#8C8073', lineHeight: 1.5 }}>
          Your bill has been paid.
          <br />
          See you again soon at TMC.
        </div>
        <div
          onClick={() => {
            localStorage.removeItem(`order:${tableId}`);
            navigate(`/menu/${tableId}`);
          }}
          style={{ marginTop: 10, padding: '13px 26px', background: '#2B2420', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
        >
          Back to menu
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF6F0', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
        <CustomerHeader title="Your bill" onBack={() => navigate(`/menu/${tableId}`)} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', color: '#8C8073', fontSize: 13 }}>
          You don't have an open bill yet. Order something from the menu to get started.
        </div>
      </div>
    );
  }

  const tableNumber = orders[0].table?.tableNumber;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF6F0', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      <CustomerHeader title="Your bill" onBack={() => navigate(`/menu/${tableId}/status`)} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 12px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 12, color: '#8C8073', marginBottom: 8 }}>
          Table {tableNumber} · TMC · {orders.length} order{orders.length === 1 ? '' : 's'} this visit
        </div>

        {orders.map((order, orderIdx) => (
          <div key={order._id} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#B3ABA1', textTransform: 'uppercase', letterSpacing: 0.4, margin: '10px 0 4px' }}>
              Round {orderIdx + 1}
            </div>
            {order.items.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #E7DCCC', fontSize: 13.5, color: '#2B2420' }}>
                <span>
                  {it.quantity}× {it.name}
                </span>
                <span style={{ color: '#8C8073' }}>{formatCurrency(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
        ))}

        <div style={{ marginTop: 16, padding: 16, background: '#F2EAE0', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 15, color: '#2B2420' }}>
            <span>Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {error && <div style={{ marginTop: 14, fontSize: 13, color: '#C24A26', fontWeight: 600 }}>{error}</div>}
      </div>

      <div style={{ flexShrink: 0, padding: '14px 20px 28px', boxSizing: 'border-box', background: '#FAF6F0', borderTop: '1px solid #E7DCCC' }}>
        <div
          onClick={paying ? undefined : handlePay}
          style={{
            background: paying ? '#E7DCCC' : '#DE5B33',
            color: paying ? '#8C8073' : '#fff',
            textAlign: 'center',
            padding: 16,
            borderRadius: 14,
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 800,
            fontSize: 15,
            cursor: paying ? 'default' : 'pointer',
          }}
        >
          {paying ? 'Processing…' : `Pay now · ${formatCurrency(grandTotal)}`}
        </div>
      </div>
    </div>
  );
}
