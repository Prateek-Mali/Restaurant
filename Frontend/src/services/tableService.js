import api from './api';

async function getAllTables() {
  const { data } = await api.get('/tables');
  return data.tables;
}

async function resolveTable(tableId) {
  const { data } = await api.get(`/tables/resolve/${tableId}`);
  return data.table;
}

async function createTable(tableNumber) {
  const { data } = await api.post('/tables', { tableNumber });
  return data.table;
}

async function regenerateQR(id) {
  const { data } = await api.patch(`/tables/${id}/regenerate-qr`);
  return data.table;
}

async function deleteTable(id) {
  await api.delete(`/tables/${id}`);
}

export default { getAllTables, resolveTable, createTable, regenerateQR, deleteTable };
