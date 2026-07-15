export function StatCard({ label, value, delta }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E7DCCC', borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 12.5, color: '#8C8073', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 28, color: '#2B2420', marginTop: 8 }}>
        {value}
      </div>
      {delta && <div style={{ fontSize: 12, color: '#3F8F5F', fontWeight: 700, marginTop: 6 }}>{delta}</div>}
    </div>
  );
}
