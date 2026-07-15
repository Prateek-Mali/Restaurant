const { v4: uuidv4 } = require('uuid');
const Table = require('../models/Table');
const { generateTableQR } = require('../utils/generateQR');

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

  const tableId = uuidv4();
  const qrCodeUrl = await generateTableQR(tableId);

  const table = await Table.create({ tableNumber, tableId, qrCodeUrl });

  res.status(201).json({ success: true, table });
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
  res.json({ success: true, tables });
}

// GET /api/tables/:id — admin-only
async function getTableById(req, res) {
  const table = await Table.findById(req.params.id);
  if (!table) {
    return res.status(404).json({ success: false, message: 'Table not found' });
  }
  res.json({ success: true, table });
}

// PATCH /api/tables/:id/regenerate-qr — admin-only, rotates tableId if QR is compromised
async function regenerateQR(req, res) {
  const table = await Table.findById(req.params.id);
  if (!table) {
    return res.status(404).json({ success: false, message: 'Table not found' });
  }

  table.tableId = uuidv4();
  table.qrCodeUrl = await generateTableQR(table.tableId);
  await table.save();

  res.json({ success: true, table });
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
