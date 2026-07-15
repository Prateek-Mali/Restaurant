import { useEffect, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import orderService from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
import { getElapsedMinutes, formatElapsedLabel } from '../../utils/formatElapsedTime';

export function Payments() {
  const socket = useSocket();
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingTableId, setConfirmingTableId] = useState(null);
  const [checkingOutId, setCheckingOutId] = useState(null);

  function loadTabs() {
    return orderService.getOpenTabs().then(setTabs);
  }

  useEffect(() => {
    loadTabs().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Safety net, same reasoning as the Kitchen Display: self-heal if a socket event is missed.
    const resync = setInterval(loadTabs, 15000);
    return () => clearInterval(resync);
  }, []);

  useEffect(() => {
    if (!socket) return;

    function joinKitchen() {
      socket.emit('join_kitchen');
      loadTabs();
    }

    joinKitchen();
    socket.on('connect', joinKitchen);
    socket.on('new_order', loadTabs);
    socket.on('order_status_updated', loadTabs);
    socket.on('payment_updated', loadTabs);

    return () => {
      socket.off('connect', joinKitchen);
      socket.off('new_order', loadTabs);
      socket.off('order_status_updated', loadTabs);
      socket.off('payment_updated', loadTabs);
    };
  }, [socket]);

  async function handleCheckout(tableMongoId) {
    setCheckingOutId(tableMongoId);
    try {
      await orderService.checkoutTable(tableMongoId);
      setTabs((prev) => prev.filter((t) => t.table._id !== tableMongoId));
    } finally {
      setCheckingOutId(null);
      setConfirmingTableId(null);
    }
  }

  return (
    <div style={{ background: '#FAF6F0', minHeight: 'calc(100vh - 60px)', padding: '28px 32px 40px', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 26, color: '#2B2420', marginBottom: 4 }}>
        Payments
      </div>
      <div style={{ fontSize: 13, color: '#8C8073', marginBottom: 22 }}>
        Tables with an open bill — confirm here once a customer has paid (cash or otherwise)
      </div>

      {loading ? (
        <div style={{ color: '#8C8073', fontSize: 14 }}>Loading open tabs…</div>
      ) : tabs.length === 0 ? (
        <div style={{ border: '1.5px dashed #E7DCCC', borderRadius: 14, padding: 32, textAlign: 'center', color: '#8C8073', fontSize: 13 }}>
          No open bills right now — every table is settled up.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {tabs.map((tab) => {
            const itemCounts = new Map();
            for (const order of tab.orders) {
              for (const item of order.items) {
                itemCounts.set(item.name, (itemCounts.get(item.name) || 0) + item.quantity);
              }
            }
            const oldestOrder = tab.orders[0];
            const elapsedMin = getElapsedMinutes(oldestOrder.createdAt);
            const confirming = confirmingTableId === tab.table._id;
            const checkingOut = checkingOutId === tab.table._id;

            return (
              <div key={tab.table._id} style={{ background: '#FFFFFF', border: '1px solid #E7DCCC', borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18, color: '#2B2420' }}>
                    Table {tab.table.tableNumber}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#8C8073' }}>
                    Open {formatElapsedLabel(elapsedMin)}
                  </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: '#B3ABA1', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
                  {tab.orders.length} order{tab.orders.length === 1 ? '' : 's'}
                </div>

                <div style={{ marginBottom: 14 }}>
                  {Array.from(itemCounts.entries()).map(([name, qty]) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#2B2420', padding: '4px 0' }}>
                      <span>{qty}× {name}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 16, color: '#2B2420', padding: '10px 0', borderTop: '1px solid #E7DCCC', marginBottom: 12 }}>
                  <span>Total</span>
                  <span>{formatCurrency(tab.totalAmount)}</span>
                </div>

                {confirming ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div
                      onClick={() => handleCheckout(tab.table._id)}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: 12,
                        borderRadius: 10,
                        background: checkingOut ? '#E7DCCC' : '#3F8F5F',
                        color: checkingOut ? '#8C8073' : '#fff',
                        fontWeight: 800,
                        fontSize: 13.5,
                        cursor: checkingOut ? 'default' : 'pointer',
                      }}
                    >
                      {checkingOut ? 'Confirming…' : 'Confirm paid'}
                    </div>
                    <div
                      onClick={() => setConfirmingTableId(null)}
                      style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 10, border: '1px solid #E7DCCC', color: '#8C8073', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
                    >
                      Cancel
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setConfirmingTableId(tab.table._id)}
                    style={{ textAlign: 'center', padding: 13, borderRadius: 10, background: '#2B2420', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
                  >
                    Mark as Paid
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
