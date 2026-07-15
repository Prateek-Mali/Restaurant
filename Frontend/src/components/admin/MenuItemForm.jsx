const CATEGORIES = ['starters', 'mains', 'desserts', 'beverages'];

export function MenuItemForm({ mode, form, onChange, onCancel, onSave, saving }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,36,32,0.35)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 }}>
      <div style={{ background: '#FFFFFF', height: '100vh', width: 440, maxWidth: '92vw', padding: 28, boxSizing: 'border-box', overflowY: 'auto', boxShadow: '-8px 0 30px rgba(0,0,0,0.12)' }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18, color: '#2B2420', marginBottom: 18 }}>
          {mode === 'add' ? 'Add menu item' : 'Edit menu item'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Name">
            <input
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              style={inputStyle}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
            />
          </Field>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Field label="Price (₹)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => onChange({ ...form, price: e.target.value })}
                  style={inputStyle}
                />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => onChange({ ...form, category: e.target.value })}
                  style={inputStyle}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c[0].toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <Field label="Image URL (optional)">
            <input
              value={form.imageUrl || ''}
              onChange={(e) => onChange({ ...form, imageUrl: e.target.value })}
              placeholder="https://…"
              style={inputStyle}
            />
          </Field>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2420' }}>Available on menu</div>
            <div
              onClick={() => onChange({ ...form, isAvailable: !form.isAvailable })}
              style={{
                width: 38,
                height: 22,
                borderRadius: 999,
                background: form.isAvailable ? '#DE5B33' : '#E7DCCC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: form.isAvailable ? 'flex-end' : 'flex-start',
                padding: 2,
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ width: 18, height: 18, borderRadius: 999, background: '#fff' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <div
            onClick={onCancel}
            style={{ flex: 1, textAlign: 'center', padding: 13, borderRadius: 12, border: '1px solid #E7DCCC', fontWeight: 700, fontSize: 14, color: '#2B2420', cursor: 'pointer' }}
          >
            Cancel
          </div>
          <div
            onClick={saving ? undefined : onSave}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: 13,
              borderRadius: 12,
              background: saving ? '#E7DCCC' : '#DE5B33',
              color: saving ? '#8C8073' : '#fff',
              fontWeight: 800,
              fontSize: 14,
              cursor: saving ? 'default' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save item'}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#8C8073', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 12px',
  borderRadius: 10,
  border: '1px solid #E7DCCC',
  fontSize: 14,
  fontFamily: "'Public Sans', sans-serif",
  color: '#2B2420',
};
