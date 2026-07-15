import { formatCurrency } from '../../utils/formatCurrency';

export function CartSummaryBar({ totalQuantity, subtotal, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'sticky',
        left: 16,
        right: 16,
        bottom: 16,
        margin: '0 16px 16px',
        background: '#2B2420',
        borderRadius: 16,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
        cursor: 'pointer',
      }}
    >
      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
        {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
      </div>
      <div style={{ color: '#fff', fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15 }}>
        {formatCurrency(subtotal)} →
      </div>
    </div>
  );
}
