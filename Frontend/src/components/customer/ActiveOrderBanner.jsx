import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';

// Short status labels — the full sentences live on the Order Status page. This is a
// glance-and-move-on strip, so it stays terse.
const STATUS_LABEL = {
  placed: 'Order placed',
  preparing: 'Preparing your food',
  ready: 'Ready — on its way',
  served: 'Served — enjoy!',
};

const STATUS_COLOR = {
  placed: '#DE5B33',
  preparing: '#B8862C',
  ready: '#3F8F5F',
  served: '#8C8073',
};

// Shown on the menu once a table has an open order, so a customer browsing for
// dessert can still get back to their status or bill. Hidden on a fresh scan —
// there's nothing to navigate to yet.
export function ActiveOrderBanner({ tableId, status, total }) {
  const navigate = useNavigate();
  const color = STATUS_COLOR[status] || '#8C8073';

  return (
    <div style={{ display: 'flex', gap: 8, padding: '0 20px 10px', boxSizing: 'border-box', flexShrink: 0 }}>
      <div
        onClick={() => navigate(`/menu/${tableId}/status`)}
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#FFFFFF',
          border: `1px solid ${color}33`,
          borderRadius: 12,
          padding: '10px 12px',
          cursor: 'pointer',
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0, animation: 'livePulse 1.4s ease-in-out infinite' }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2420', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {STATUS_LABEL[status] || 'Order in progress'}
          </div>
          <div style={{ fontSize: 11, color: '#8C8073' }}>Tap to track</div>
        </div>
        <div style={{ fontSize: 14, color: '#B3ABA1', flexShrink: 0 }}>›</div>
      </div>

      <div
        onClick={() => navigate(`/menu/${tableId}/bill`)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F2EAE0',
          borderRadius: 12,
          padding: '10px 14px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 10.5, color: '#8C8073', fontWeight: 600 }}>Bill</div>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13.5, fontWeight: 800, color: '#2B2420' }}>
          {formatCurrency(total)}
        </div>
      </div>
    </div>
  );
}
