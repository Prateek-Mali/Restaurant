import { getElapsedColor, getElapsedMinutes, formatElapsedLabel } from '../../utils/formatElapsedTime';

const ACTION_BY_STATUS = {
  placed: { label: 'Start preparing', bg: '#5FA8E0', next: 'preparing' },
  preparing: { label: 'Mark ready', bg: '#4ADE80', next: 'ready' },
  ready: { label: 'Mark served', bg: '#FDFBF8', next: 'served' },
};

export function OrderCard({ order, now, isNew, onAdvance }) {
  const elapsedMin = getElapsedMinutes(order.createdAt, now);
  const elapsedColor = getElapsedColor(elapsedMin);
  const action = ACTION_BY_STATUS[order.status];

  const borderColor = isNew ? '#FF6B45' : elapsedMin > 10 ? '#FF5A5A' : '#3D332A';

  return (
    <div
      style={{
        background: '#2A231C',
        borderRadius: 16,
        padding: 18,
        border: `2px solid ${borderColor}`,
        animation: isNew ? 'cardPulse 1.4s ease-in-out infinite' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          {isNew && (
            <div
              style={{
                display: 'inline-block',
                background: '#FF6B45',
                color: '#1E1812',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 0.4,
                padding: '2px 8px',
                borderRadius: 6,
                marginBottom: 6,
              }}
            >
              NEW
            </div>
          )}
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 26, color: '#FDFBF8' }}>
            Table {order.table?.tableNumber ?? '—'}
          </div>
        </div>
        <div
          style={{
            background: '#1E1812',
            color: elapsedColor,
            fontWeight: 800,
            fontSize: 13,
            padding: '5px 10px',
            borderRadius: 8,
            flexShrink: 0,
          }}
        >
          {formatElapsedLabel(elapsedMin)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
        {order.items.map((it, idx) => (
          <div key={idx} style={{ fontSize: 14.5, color: '#D8CFC4' }}>
            {it.quantity}× {it.name}
          </div>
        ))}
      </div>

      {action && (
        <div
          onClick={() => onAdvance(order._id, action.next)}
          style={{
            background: action.bg,
            color: '#1E1812',
            textAlign: 'center',
            padding: 15,
            borderRadius: 12,
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 800,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </div>
      )}
    </div>
  );
}
