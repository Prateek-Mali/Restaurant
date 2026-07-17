import { useEffect, useState } from 'react';
import menuService from '../../services/menuService';
import { MenuItemTable } from '../../components/admin/MenuItemTable';
import { MenuItemForm } from '../../components/admin/MenuItemForm';

// Category is a path now: section → group → (subgroup, for Mains only).
const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  section: 'starters',
  group: 'cold',
  subgroup: '',
  imageUrl: '',
  isAvailable: true,
};

export function ManageMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  function loadItems() {
    setLoading(true);
    return menuService
      .getAllMenuItems()
      .then(setItems)
      .finally(() => setLoading(false));
  }

  function openAddForm() {
    setFormMode('add');
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setFormOpen(true);
  }

  function openEditForm(item) {
    setFormMode('edit');
    setForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      section: item.section,
      group: item.group,
      subgroup: item.subgroup || '',
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable,
    });
    setEditingId(item._id);
    setFormError('');
    setFormOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        // Sections without a cuisine level must send null, not '' — the server
        // rejects a stray subgroup on e.g. Starters.
        subgroup: form.subgroup || null,
      };
      if (formMode === 'add') {
        await menuService.createMenuItem(payload);
      } else {
        await menuService.updateMenuItem(editingId, payload);
      }
      setFormOpen(false);
      await loadItems();
    } catch (err) {
      // Surface the server's reason ("subgroup for mains/veg must be one of…")
      // instead of silently closing and losing the admin's input.
      setFormError(err.response?.data?.message || 'Could not save this item. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id) {
    const updated = await menuService.toggleAvailability(id);
    setItems((prev) => prev.map((i) => (i._id === id ? updated : i)));
  }

  async function handleDelete(id) {
    await menuService.deleteMenuItem(id);
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  const availableCount = items.filter((i) => i.isAvailable).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#2B2420' }}>Menu items</div>
          <div style={{ fontSize: 13, color: '#8C8073', marginTop: 4 }}>
            {items.length} items · {availableCount} available
          </div>
        </div>
        <div
          onClick={openAddForm}
          style={{ padding: '11px 18px', background: '#DE5B33', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
        >
          + Add item
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#8C8073', fontSize: 14 }}>Loading menu…</div>
      ) : (
        <MenuItemTable items={items} onToggle={handleToggle} onEdit={openEditForm} onDelete={handleDelete} />
      )}

      {formOpen && (
        <MenuItemForm
          mode={formMode}
          form={form}
          onChange={setForm}
          onCancel={() => setFormOpen(false)}
          onSave={handleSave}
          saving={saving}
          error={formError}
        />
      )}
    </div>
  );
}
