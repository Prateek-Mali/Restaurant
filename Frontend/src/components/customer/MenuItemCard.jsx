import { formatCurrency } from '../../utils/formatCurrency';

const stripeOn = 'repeating-linear-gradient(135deg,#EFE6D8 0px,#EFE6D8 8px,#E4D6C2 8px,#E4D6C2 16px)';
const stripeOff = 'repeating-linear-gradient(135deg,#ECECEC 0px,#ECECEC 8px,#E0E0E0 8px,#E0E0E0 16px)';

export function MenuItemCard({ item, quantity, onAdd, onInc, onDec }) {
  const available = item.isAvailable;

  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #E7DCCC', opacity: available ? 1 : 0.55 }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 14,
          flexShrink: 0,
          position: 'relative',
          background: item.imageUrl ? `url(${item.imageUrl}) center/cover` : available ? stripeOn : stripeOff,
        }}
      >
        {!available && (
          <div
            style={{
              position: 'absolute',
              bottom: 4,
              left: 4,
              right: 4,
              textAlign: 'center',
              background: '#2B2420',
              color: '#fff',
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              borderRadius: 5,
              padding: '2px 0',
            }}
          >
            Sold out
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, color: '#2B2420' }}>{item.name}</div>
        <div
          style={{
            fontSize: 12.5,
            color: '#8C8073',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description}
        </div>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 14, color: '#DE5B33', marginTop: 2 }}>
          {formatCurrency(item.price)}
        </div>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {!available ? null : quantity > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F2EAE0', borderRadius: 999, padding: '4px 8px' }}>
            <div
              onClick={() => onDec(item._id)}
              style={{ width: 22, height: 22, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#2B2420', cursor: 'pointer' }}
            >
              –
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2420', minWidth: 12, textAlign: 'center' }}>{quantity}</div>
            <div
              onClick={() => onInc(item._id)}
              style={{ width: 22, height: 22, borderRadius: 999, background: '#DE5B33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
            >
              +
            </div>
          </div>
        ) : (
          <div
            onClick={() => onAdd(item)}
            style={{ width: 32, height: 32, borderRadius: 999, background: '#F2EAE0', color: '#DE5B33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, fontWeight: 600, cursor: 'pointer' }}
          >
            +
          </div>
        )}
      </div>
    </div>
  );
}
