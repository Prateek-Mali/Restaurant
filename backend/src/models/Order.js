const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    items: { type: [orderItemSchema], required: true },
    status: {
      type: String,
      enum: ['placed', 'preparing', 'ready', 'served', 'paid', 'cancelled'],
      default: 'placed',
    },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

orderSchema.pre('validate', function calculateTotal(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  next();
});

module.exports = mongoose.model('Order', orderSchema);
