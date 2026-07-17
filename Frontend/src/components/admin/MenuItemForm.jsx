import { useMenuTaxonomy, getSections, getGroups, getSubgroups, needsSubgroup } from '../../hooks/useMenuTaxonomy';

export function MenuItemForm({ mode, form, onChange, onCancel, onSave, saving, error }) {
  const { taxonomy, loading } = useMenuTaxonomy();

  const sections = getSections(taxonomy);
  const groups = getGroups(taxonomy, form.section);
  const subgroups = getSubgroups(taxonomy, form.section, form.group);
  const showSubgroup = needsSubgroup(taxonomy, form.section, form.group);

  // Changing a parent invalidates its children — a leftover "hyderabadi" under Veg
  // would be rejected by the server, so reset downward on every change.
  function changeSection(section) {
    const firstGroup = getGroups(taxonomy, section)[0]?.key ?? '';
    const firstSub = getSubgroups(taxonomy, section, firstGroup)[0]?.key ?? '';
    onChange({ ...form, section, group: firstGroup, subgroup: firstSub });
  }

  function changeGroup(group) {
    const firstSub = getSubgroups(taxonomy, form.section, group)[0]?.key ?? '';
    onChange({ ...form, group, subgroup: firstSub });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,36,32,0.35)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 }}>
      <div style={{ background: '#FFFFFF', height: '100vh', width: 440, maxWidth: '92vw', padding: 28, boxSizing: 'border-box', overflowY: 'auto', boxShadow: '-8px 0 30px rgba(0,0,0,0.12)' }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18, color: '#2B2420', marginBottom: 18 }}>
          {mode === 'add' ? 'Add menu item' : 'Edit menu item'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Name">
            <input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} style={inputStyle} />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
            />
          </Field>

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

          <div style={{ height: 1, background: '#E7DCCC', margin: '4px 0' }} />

          {loading ? (
            <div style={{ fontSize: 13, color: '#8C8073' }}>Loading categories…</div>
          ) : (
            <>
              <Field label="Section">
                <select value={form.section} onChange={(e) => changeSection(e.target.value)} style={inputStyle}>
                  {sections.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Group">
                <select value={form.group} onChange={(e) => changeGroup(e.target.value)} style={inputStyle}>
                  {groups.map((g) => (
                    <option key={g.key} value={g.key}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Only Mains goes three levels deep. */}
              {showSubgroup && (
                <Field label="Cuisine">
                  <select
                    value={form.subgroup || ''}
                    onChange={(e) => onChange({ ...form, subgroup: e.target.value })}
                    style={inputStyle}
                  >
                    {subgroups.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <div style={{ fontSize: 11.5, color: '#8C8073', marginTop: -6 }}>
                {[
                  taxonomy?.[form.section]?.label,
                  taxonomy?.[form.section]?.groups?.[form.group]?.label,
                  showSubgroup ? subgroups.find((s) => s.key === form.subgroup)?.label : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </>
          )}

          <div style={{ height: 1, background: '#E7DCCC', margin: '4px 0' }} />

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
