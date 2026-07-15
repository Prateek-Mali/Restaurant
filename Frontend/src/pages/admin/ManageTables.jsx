import { useEffect, useState } from 'react';
import tableService from '../../services/tableService';
import { TableCard } from '../../components/admin/TableCard';
import { QRCodeModal } from '../../components/admin/QRCodeModal';

export function ManageTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingTable, setViewingTable] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  function loadTables() {
    setLoading(true);
    return tableService
      .getAllTables()
      .then(setTables)
      .finally(() => setLoading(false));
  }

  async function handleAddTable() {
    setAdding(true);
    try {
      const nextNumber = tables.length === 0 ? 1 : Math.max(...tables.map((t) => t.tableNumber)) + 1;
      const table = await tableService.createTable(nextNumber);
      setTables((prev) => [...prev, table].sort((a, b) => a.tableNumber - b.tableNumber));
    } finally {
      setAdding(false);
    }
  }

  async function handleRegenerate(id) {
    const updated = await tableService.regenerateQR(id);
    setTables((prev) => prev.map((t) => (t._id === id ? updated : t)));
  }

  async function handleDelete(id) {
    await tableService.deleteTable(id);
    setTables((prev) => prev.filter((t) => t._id !== id));
  }

  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#2B2420' }}>Tables</div>
          <div style={{ fontSize: 13, color: '#8C8073', marginTop: 4 }}>
            {tables.length} tables · {occupiedCount} occupied
          </div>
        </div>
        <div
          onClick={adding ? undefined : handleAddTable}
          style={{ padding: '11px 18px', background: adding ? '#E7DCCC' : '#DE5B33', color: adding ? '#8C8073' : '#fff', borderRadius: 12, fontWeight: 700, fontSize: 13.5, cursor: adding ? 'default' : 'pointer' }}
        >
          {adding ? 'Adding…' : '+ Add table'}
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#8C8073', fontSize: 14 }}>Loading tables…</div>
      ) : (
        <div style={{ background: '#FFFFFF', border: '1px solid #E7DCCC', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr 2fr', padding: '12px 20px', background: '#F2EAE0', fontSize: 12, fontWeight: 700, color: '#8C8073', textTransform: 'uppercase', letterSpacing: 0.3 }}>
            <div>Table</div>
            <div>Status</div>
            <div>QR code</div>
            <div>Actions</div>
          </div>
          {tables.map((t) => (
            <TableCard key={t._id} table={t} onView={setViewingTable} onRegenerate={handleRegenerate} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {viewingTable && <QRCodeModal table={viewingTable} onClose={() => setViewingTable(null)} />}
    </div>
  );
}
