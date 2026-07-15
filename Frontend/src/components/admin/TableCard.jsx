import { useState } from 'react';

const qrStripe = 'repeating-linear-gradient(45deg,#2B2420 0px,#2B2420 3px,#F2EAE0 3px,#F2EAE0 6px)';

export function TableCard({ table, onView, onRegenerate, onDelete }) {
  const [confirmingRegen, setConfirmingRegen] = useState(false);
  const isAvailable = table.status === 'available';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr 2fr', padding: '14px 20px', borderTop: '1px solid #E7DCCC', alignItems: 'center' }}>
      <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 15, color: '#2B2420' }}>Table {table.tableNumber}</div>
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 999,
          display: 'inline-block',
          background: isAvailable ? '#DFF3E7' : '#FDF0DC',
          color: isAvailable ? '#3F8F5F' : '#B8862C',
          width: 'fit-content',
        }}
      >
        {isAvailable ? 'Available' : 'Occupied'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: qrStripe, cursor: 'pointer' }} onClick={() => onView(table)} />
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8C8073' }}>{table.tableId.slice(0, 8)}</div>
      </div>

      {confirmingRegen ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FCE3D6', borderRadius: 10, padding: '8px 12px' }}>
          <div style={{ fontSize: 12, color: '#C24A26', fontWeight: 600 }}>Old QR will stop working —</div>
          <div
            onClick={() => {
              onRegenerate(table._id);
              setConfirmingRegen(false);
            }}
            style={{ fontSize: 12, fontWeight: 800, color: '#fff', background: '#DE5B33', padding: '5px 10px', borderRadius: 7, cursor: 'pointer' }}
          >
            Regenerate
          </div>
          <div onClick={() => setConfirmingRegen(false)} style={{ fontSize: 12, fontWeight: 700, color: '#8C8073', cursor: 'pointer' }}>
            Cancel
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 16 }}>
          <div onClick={() => onView(table)} style={{ fontSize: 12.5, fontWeight: 700, color: '#2B2420', cursor: 'pointer', textDecoration: 'underline' }}>
            View
          </div>
          <div onClick={() => setConfirmingRegen(true)} style={{ fontSize: 12.5, fontWeight: 700, color: '#B3ABA1', cursor: 'pointer', textDecoration: 'underline' }}>
            Regenerate
          </div>
          <div onClick={() => onDelete(table._id)} style={{ fontSize: 12.5, fontWeight: 700, color: '#B3ABA1', cursor: 'pointer', textDecoration: 'underline' }}>
            Delete
          </div>
        </div>
      )}
    </div>
  );
}
