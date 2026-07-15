import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import orderService from '../../services/orderService';
import { StatusColumn } from '../../components/chef/StatusColumn';
import { playNewOrderChime } from '../../utils/playNotificationSound';
import '../../styles/chef.css';

const COLUMN_DEFS = [
  { key: 'placed', label: 'New', color: '#FF6B45' },
  { key: 'preparing', label: 'Preparing', color: '#5FA8E0' },
  { key: 'ready', label: 'Ready', color: '#4ADE80' },
];

const ACTIVE_STATUSES = new Set(['placed', 'preparing', 'ready']);

export function KitchenDashboard() {
  const socket = useSocket();

  const [orders, setOrders] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const newOrderTimers = useRef([]);

  useEffect(() => {
    orderService
      .getKitchenOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    // Safety net: resync from the API periodically in case a socket event is
    // ever missed (e.g. a dropped connection), so the display self-heals
    // instead of silently drifting from reality.
    const resync = setInterval(() => {
      orderService.getKitchenOrders().then(setOrders);
    }, 15000);
    return () => clearInterval(resync);
  }, []);

  useEffect(() => {
    return () => newOrderTimers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!socket) return;

    function joinKitchen() {
      socket.emit('join_kitchen');
      // Resync in case orders changed while disconnected (e.g. a server restart).
      orderService.getKitchenOrders().then(setOrders);
    }

    joinKitchen();
    socket.on('connect', joinKitchen);

    function markAsNew(orderId) {
      setNewOrderIds((prev) => new Set(prev).add(orderId));
      const timer = setTimeout(() => {
        setNewOrderIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }, 3500);
      newOrderTimers.current.push(timer);
    }

    function handleNewOrder(order) {
      setOrders((prev) => (prev.some((o) => o._id === order._id) ? prev : [...prev, order]));
      markAsNew(order._id);
      playNewOrderChime();
    }

    function handleStatusUpdated(updatedOrder) {
      setOrders((prev) => {
        if (!ACTIVE_STATUSES.has(updatedOrder.status)) {
          return prev.filter((o) => o._id !== updatedOrder._id);
        }
        return prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o));
      });
    }

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdated);

    return () => {
      socket.off('connect', joinKitchen);
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdated);
    };
  }, [socket]);

  async function handleAdvance(orderId, nextStatus) {
    const updated = await orderService.updateOrderStatus(orderId, nextStatus);
    setOrders((prev) => {
      if (!ACTIVE_STATUSES.has(updated.status)) {
        return prev.filter((o) => o._id !== orderId);
      }
      return prev.map((o) => (o._id === orderId ? updated : o));
    });
  }

  const columns = COLUMN_DEFS.map((cd) => ({
    ...cd,
    orders: orders.filter((o) => o.status === cd.key).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
  }));

  return (
    <div style={{ width: '100%', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      <div style={{ background: '#1E1812', minHeight: 'calc(100vh - 60px)', padding: '28px 32px 40px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 26, color: '#FDFBF8' }}>
              Kitchen Display
            </div>
            <div style={{ fontSize: 13, color: '#A89C8E', marginTop: 2 }}>
              Oldest orders float to the top of each column
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: '#4ADE80',
                animation: 'livePulse 1.4s ease-in-out infinite',
              }}
            />
            <div style={{ fontSize: 12, color: '#4ADE80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Live
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#A89C8E', fontSize: 14 }}>Loading orders…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {columns.map((col) => (
              <StatusColumn
                key={col.key}
                label={col.label}
                color={col.color}
                orders={col.orders}
                now={now}
                newOrderIds={newOrderIds}
                onAdvance={handleAdvance}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
