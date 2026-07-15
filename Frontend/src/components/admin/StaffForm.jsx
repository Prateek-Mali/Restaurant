export function StaffForm({ form, onChange, onCancel, onSave, saving, error }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,36,32,0.35)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 }}>
      <div style={{ background: '#FFFFFF', height: '100vh', width: 400, maxWidth: '92vw', padding: 28, boxSizing: 'border-box', overflowY: 'auto', boxShadow: '-8px 0 30px rgba(0,0,0,0.12)' }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18, color: '#2B2420', marginBottom: 18 }}>
          Add staff member
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Name">
            <input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              style={inputStyle}
            />
          </Field>
          <Field label="Role">
            <select value={form.role} onChange={(e) => onChange({ ...form, role: e.target.value })} style={inputStyle}>
              <option value="chef">Chef</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={form.password}
              onChange={(e) => onChange({ ...form, password: e.target.value })}
              style={inputStyle}
            />
          </Field>
        </div>

        {error && <div style={{ marginTop: 14, fontSize: 13, color: '#C24A26', fontWeight: 600 }}>{error}</div>}

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
            {saving ? 'Saving…' : 'Save staff'}
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
