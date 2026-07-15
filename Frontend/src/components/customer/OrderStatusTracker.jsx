const STAGES = ['Placed', 'Preparing', 'Ready', 'Served'];

export function OrderStatusTracker({ stageIndex }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 24, padding: '0 4px' }}>
      {STAGES.map((label, i) => {
        const reached = i <= stageIndex;
        const circleBg = reached ? '#DE5B33' : '#fff';
        const circleBorder = reached ? '#DE5B33' : '#E7DCCC';
        const circleColor = reached ? '#fff' : '#B3ABA1';
        const lineBg = i < stageIndex ? '#DE5B33' : '#E7DCCC';

        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 64, flexShrink: 0 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  background: circleBg,
                  border: `2px solid ${circleBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  color: circleColor,
                }}
              >
                {i < stageIndex ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#2B2420', textAlign: 'center' }}>{label}</div>
            </div>
            {i < STAGES.length - 1 && <div style={{ flex: 1, height: 2, background: lineBg, marginBottom: 20 }} />}
          </div>
        );
      })}
    </div>
  );
}
