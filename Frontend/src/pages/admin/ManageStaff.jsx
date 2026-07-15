import { useEffect, useState } from 'react';
import authService from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { StaffForm } from '../../components/admin/StaffForm';

const EMPTY_FORM = { name: '', email: '', role: 'chef', password: '' };

export function ManageStaff() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  useEffect(() => {
    loadStaff();
  }, []);

  function loadStaff() {
    setLoading(true);
    return authService
      .getAllStaff()
      .then(setStaff)
      .finally(() => setLoading(false));
  }

  function openAddForm() {
    setForm(EMPTY_FORM);
    setError('');
    setFormOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await authService.registerStaff(form);
      setFormOpen(false);
      await loadStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create staff member');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(id) {
    const updated = await authService.toggleStaffActive(id);
    setStaff((prev) => prev.map((p) => (p._id === id ? { ...p, active: updated.active } : p)));
  }

  async function handleRemove(id) {
    await authService.deleteStaff(id);
    setStaff((prev) => prev.filter((p) => p._id !== id));
    setConfirmRemoveId(null);
  }

  const activeCount = staff.filter((p) => p.active).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#2B2420' }}>Staff</div>
          <div style={{ fontSize: 13, color: '#8C8073', marginTop: 4 }}>
            {staff.length} accounts · {activeCount} active
          </div>
        </div>
        <div
          onClick={openAddForm}
          style={{ padding: '11px 18px', background: '#DE5B33', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
        >
          + Add staff
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#8C8073', fontSize: 14 }}>Loading staff…</div>
      ) : (
        <div style={{ background: '#FFFFFF', border: '1px solid #E7DCCC', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.8fr 0.8fr 0.9fr 1.2fr', padding: '12px 20px', background: '#F2EAE0', fontSize: 12, fontWeight: 700, color: '#8C8073', textTransform: 'uppercase', letterSpacing: 0.3 }}>
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {staff.map((p) => {
            const isSelf = p._id === currentUser?.id;
            const confirming = confirmRemoveId === p._id;
            return (
              <div
                key={p._id}
                style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.8fr 0.8fr 0.9fr 1.2fr', padding: '14px 20px', borderTop: '1px solid #E7DCCC', alignItems: 'center' }}
              >
                <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 14, color: '#2B2420' }}>{p.name}</div>
                <div style={{ fontSize: 13, color: '#8C8073' }}>{p.email}</div>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 999,
                    display: 'inline-block',
                    width: 'fit-content',
                    background: p.role === 'admin' ? '#FCE3D6' : '#E9EEF6',
                    color: p.role === 'admin' ? '#C24A26' : '#3B6FA6',
                  }}
                >
                  {p.role === 'admin' ? 'Admin' : 'Chef'}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 999,
                    display: 'inline-block',
                    width: 'fit-content',
                    background: p.active ? '#DFF3E7' : '#F2EAE0',
                    color: p.active ? '#3F8F5F' : '#8C8073',
                  }}
                >
                  {p.active ? 'Active' : 'Inactive'}
                </div>

                {confirming ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div
                      onClick={() => handleRemove(p._id)}
                      style={{ fontSize: 12, fontWeight: 800, color: '#fff', background: '#DE5B33', padding: '5px 9px', borderRadius: 7, cursor: 'pointer' }}
                    >
                      Remove
                    </div>
                    <div onClick={() => setConfirmRemoveId(null)} style={{ fontSize: 12, fontWeight: 700, color: '#8C8073', cursor: 'pointer' }}>
                      Cancel
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div onClick={() => handleToggleActive(p._id)} style={{ fontSize: 12.5, fontWeight: 700, color: '#2B2420', cursor: 'pointer', textDecoration: 'underline' }}>
                      {p.active ? 'Deactivate' : 'Activate'}
                    </div>
                    {!isSelf && (
                      <div onClick={() => setConfirmRemoveId(p._id)} style={{ fontSize: 12.5, fontWeight: 700, color: '#B3ABA1', cursor: 'pointer', textDecoration: 'underline' }}>
                        Remove
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <StaffForm
          form={form}
          onChange={setForm}
          onCancel={() => setFormOpen(false)}
          onSave={handleSave}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}
