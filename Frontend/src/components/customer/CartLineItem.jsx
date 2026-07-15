import { formatCurrency } from '../../utils/formatCurrency';

const stripeOn = 'repeating-linear-gradient(135deg,#EFE6D8 0px,#EFE6D8 8px,#E4D6C2 8px,#E4D6C2 16px)';

export function CartLineItem({ line, onInc, onDec, onRemove }) {
  const { menuItem, quantity } = line;

  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #E7DCCC', alignItems: 'center' }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          flexShrink: 0,
          background: menuItem.imageUrl ? `url(${menuItem.imageUrl}) center/cover` : stripeOn,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 14, color: '#2B2420' }}>{menuItem.name}</div>
        <div style={{ fontSize: 12, color: '#8C8073', marginTop: 2 }}>{formatCurrency(menuItem.price)} each</div>
        <div onClick={() => onRemove(menuItem._id)} style={{ fontSize: 11.5, color: '#B3ABA1', marginTop: 4, cursor: 'pointer', textDecoration: 'underline' }}>
          Remove
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F2EAE0', borderRadius: 999, padding: '4px 8px' }}>
          <div
            onClick={() => onDec(menuItem._id)}
            style={{ width: 22, height: 22, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#2B2420', cursor: 'pointer' }}
          >
            –
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2420', minWidth: 12, textAlign: 'center' }}>{quantity}</div>
          <div
            onClick={() => onInc(menuItem._id)}
            style={{ width: 22, height: 22, borderRadius: 999, background: '#DE5B33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
          >
            +
          </div>
        </div>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 13.5, color: '#2B2420' }}>
          {formatCurrency(menuItem.price * quantity)}
        </div>
      </div>
    </div>
  );
}
