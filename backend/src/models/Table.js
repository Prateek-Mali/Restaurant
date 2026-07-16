const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// No qrCodeUrl here on purpose: the QR is derived from tableId + FRONTEND_URL at
// read time, so it always reflects the current site instead of going stale.
const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  tableId: { type: String, required: true, unique: true, default: uuidv4 },
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Table', tableSchema);
