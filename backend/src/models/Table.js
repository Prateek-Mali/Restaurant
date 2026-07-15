const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  tableId: { type: String, required: true, unique: true, default: uuidv4 },
  qrCodeUrl: { type: String },
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Table', tableSchema);
