const mongoose = require('mongoose');

// ⚠️ TODO(payments): this schema is per-ORDER, but a bill is a running tab of many
// orders on one table (see orderController.getOpenTabs / checkoutTable). Paying
// against a single order would settle only the customer's first round and leave
// the rest owing. Rework to { table, orders: [...], amount } before wiring up a
// real checkout, and split gatewayTransactionId into gatewayOrderId +
// gatewayPaymentId (it's currently overwritten on verify, losing the audit trail).
// Full explanation: docs/ADDING_PAYMENTS.md §3
const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet'], required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  gatewayTransactionId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
