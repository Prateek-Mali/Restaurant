import { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

const stripeOn = 'repeating-linear-gradient(135deg,#EFE6D8 0px,#EFE6D8 8px,#E4D6C2 8px,#E4D6C2 16px)';
const stripeOff = 'repeating-linear-gradient(135deg,#ECECEC 0px,#ECECEC 8px,#E0E0E0 8px,#E0E0E0 16px)';

export function MenuItemTable({ items, onToggle, onEdit, onDelete }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E7DCCC', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.5fr 0.8fr 0.9fr 1fr', padding: '12px 20px', background: '#F2EAE0', fontSize: 12, fontWeight: 700, color: '#8C8073', textTransform: 'uppercase', letterSpacing: 0.3 }}>
        <div>Item</div>
        <div>Category</div>
        <div>Price</div>
        <div>Available</div>
        <div>Actions</div>
      </div>

      {items.map((m) => {
        const confirming = confirmDeleteId === m._id;
        return (
          <div
            key={m._id}
            style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.5fr 0.8fr 0.9fr 1fr', padding: '14px 20px', borderTop: '1px solid #E7DCCC', alignItems: 'center', opacity: m.isAvailable ? 1 : 0.6 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: m.imageUrl ? `url(${m.imageUrl}) center/cover` : m.isAvailable ? stripeOn : stripeOff,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 14, color: '#2B2420' }}>{m.name}</div>
                <div style={{ fontSize: 12, color: '#8C8073', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.description}
                </div>
              </div>
            </div>
            {/* categoryPath is built server-side from the taxonomy, e.g. "Main Menu · Veg · Rajasthani" */}
            <div style={{ fontSize: 12, color: '#8C8073', lineHeight: 1.35 }}>{m.categoryPath}</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#2B2420' }}>{formatCurrency(m.price)}</div>
            <div
              onClick={() => onToggle(m._id)}
              style={{
                width: 38,
                height: 22,
                borderRadius: 999,
                background: m.isAvailable ? '#DE5B33' : '#E7DCCC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: m.isAvailable ? 'flex-end' : 'flex-start',
                padding: 2,
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ width: 18, height: 18, borderRadius: 999, background: '#fff' }} />
            </div>

            {confirming ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div
                  onClick={() => {
                    onDelete(m._id);
                    setConfirmDeleteId(null);
                  }}
                  style={{ fontSize: 12, fontWeight: 800, color: '#fff', background: '#DE5B33', padding: '5px 9px', borderRadius: 7, cursor: 'pointer' }}
                >
                  Delete
                </div>
                <div onClick={() => setConfirmDeleteId(null)} style={{ fontSize: 12, fontWeight: 700, color: '#8C8073', cursor: 'pointer' }}>
                  Cancel
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 14 }}>
                <div onClick={() => onEdit(m)} style={{ fontSize: 12.5, fontWeight: 700, color: '#2B2420', cursor: 'pointer', textDecoration: 'underline' }}>
                  Edit
                </div>
                <div onClick={() => setConfirmDeleteId(m._id)} style={{ fontSize: 12.5, fontWeight: 700, color: '#B3ABA1', cursor: 'pointer', textDecoration: 'underline' }}>
                  Delete
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
