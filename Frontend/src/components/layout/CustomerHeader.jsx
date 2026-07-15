export function CustomerHeader({ tableNumber, title, onBack }) {
  return (
    <div style={{ padding: '24px 20px 12px', boxSizing: 'border-box', background: '#FAF6F0', flexShrink: 0 }}>
      {onBack ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={onBack} style={{ fontSize: 20, fontWeight: 700, color: '#2B2420', cursor: 'pointer' }}>
            ←
          </div>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 19, color: '#2B2420' }}>{title}</div>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22, color: '#2B2420', letterSpacing: -0.3 }}>
            Ember &amp; Oak
          </div>
          {tableNumber && (
            <div
              style={{
                display: 'inline-block',
                marginTop: 6,
                padding: '4px 10px',
                borderRadius: 999,
                background: '#FCE3D6',
                color: '#C24A26',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Table {tableNumber}
            </div>
          )}
        </>
      )}
    </div>
  );
}
