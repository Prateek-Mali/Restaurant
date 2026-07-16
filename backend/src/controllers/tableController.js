const { v4: uuidv4 } = require('uuid');
const Table = require('../models/Table');
const { generateTableQR } = require('../utils/generateQR');

// The QR image is derived from the table's current id + FRONTEND_URL, never stored.
// Storing it meant every saved QR silently rotted the moment the site URL changed,
// and old tables kept pointing at dead deployments until manually regenerated.
async function withFreshQR(table) {
  return { ...table.toObject(), qrCodeUrl: await generateTableQR(table.tableId) };
}

// POST /api/tables — admin-only
async function createTable(req, res) {
  const { tableNumber } = req.body;

  if (!tableNumber) {
    return res.status(400).json({ success: false, message: 'tableNumber is required' });
  }

  const existing = await Table.findOne({ tableNumber });
  if (existing) {
    return res.status(409).json({ success: false, message: 'A table with this number already exists' });
  }

  const table = await Table.create({ tableNumber, tableId: uuidv4() });

  res.status(201).json({ success: true, table: await withFreshQR(table) });
}

// GET /api/tables/resolve/:tableId — public. Lets the customer menu page show its own table number.
async function resolveTable(req, res) {
  const table = await Table.findOne({ tableId: req.params.tableId }).select('tableNumber tableId status');
  if (!table) {
    return res.status(404).json({ success: false, message: 'Table not found' });
  }
  res.json({ success: true, table });
}

// GET /api/tables — admin-only
async function getAllTables(req, res) {
  const tables = await Table.find().sort({ tableNumber: 1 });
  const withQR = await Promise.all(tables.map(withFreshQR));
  res.json({ success: true, tables: withQR });
}

// GET /api/tables/:id — admin-only
async function getTableById(req, res) {
  const table = await Table.findById(req.params.id);
  if (!table) {
    return res.status(404).json({ success: false, message: 'Table not found' });
  }
  res.json({ success: true, table: await withFreshQR(table) });
}

// PATCH /api/tables/:id/regenerate-qr — admin-only. Rotates the table's secret id,
// which invalidates any previously printed QR (use if one is compromised).
async function regenerateQR(req, res) {
  const table = await Table.findById(req.params.id);
  if (!table) {
    return res.status(404).json({ success: false, message: 'Table not found' });
  }

  table.tableId = uuidv4();
  await table.save();

  res.json({ success: true, table: await withFreshQR(table) });
}

// DELETE /api/tables/:id — admin-only
async function deleteTable(req, res) {
  const table = await Table.findByIdAndDelete(req.params.id);
  if (!table) {
    return res.status(404).json({ success: false, message: 'Table not found' });
  }
  res.json({ success: true, message: 'Table deleted' });
}

module.exports = { createTable, getAllTables, getTableById, resolveTable, regenerateQR, deleteTable };
