import { OrderCard } from './OrderCard';

export function StatusColumn({ label, color, orders, now, newOrderIds, onAdvance }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: color }} />
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 16, color: '#FDFBF8' }}>
          {label}
        </div>
        <div
          style={{
            background: '#2A231C',
            color,
            fontSize: 12,
            fontWeight: 800,
            padding: '2px 10px',
            borderRadius: 999,
          }}
        >
          {orders.length}
        </div>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            border: '1.5px dashed #3D332A',
            borderRadius: 14,
            padding: 28,
            textAlign: 'center',
            color: '#6B5F52',
            fontSize: 13,
          }}
        >
          No orders
        </div>
      ) : (
        orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            now={now}
            isNew={newOrderIds.has(order._id)}
            onAdvance={onAdvance}
          />
        ))
      )}
    </div>
  );
}
