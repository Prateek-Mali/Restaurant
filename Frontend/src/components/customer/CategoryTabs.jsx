const CATEGORIES = [
  { key: 'starters', label: 'Starters' },
  { key: 'mains', label: 'Mains' },
  { key: 'desserts', label: 'Desserts' },
  { key: 'beverages', label: 'Beverages' },
];

export function CategoryTabs({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '10px 20px', overflowX: 'auto', flexShrink: 0, boxSizing: 'border-box' }}>
      {CATEGORIES.map((cat) => (
        <div
          key={cat.key}
          onClick={() => onChange(cat.key)}
          style={{
            padding: '8px 14px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            flexShrink: 0,
            background: cat.key === active ? '#DE5B33' : '#F2EAE0',
            color: cat.key === active ? '#fff' : '#8C8073',
          }}
        >
          {cat.label}
        </div>
      ))}
    </div>
  );
}
