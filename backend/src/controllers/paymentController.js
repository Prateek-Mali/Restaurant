const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { getIO } = require('../config/socket');
const { PAYMENT_UPDATED } = require('../sockets/orderEvents');

function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payments/initiate — public. Called by the customer's screen after the bill is ready.
async function initiatePayment(req, res) {
  const { orderId, method } = req.body;

  if (!orderId || !method) {
    return res.status(400).json({ success: false, message: 'orderId and method are required' });
  }

  const order = await Order.findById(orderId).populate('table', 'tableId');
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Online payment is not configured yet. Please pay at the counter.',
    });
  }

  const razorpay = getRazorpayInstance();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalAmount * 100), // paise
    currency: 'INR',
    receipt: order._id.toString(),
  });

  const payment = await Payment.create({
    order: order._id,
    amount: order.totalAmount,
    method,
    status: 'pending',
    gatewayTransactionId: razorpayOrder.id,
  });

  res.status(201).json({
    success: true,
    payment,
    razorpayOrder,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}

// POST /api/payments/verify — handles the gateway's callback/webhook
async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing Razorpay verification fields' });
  }

  const payment = await Payment.findOne({ gatewayTransactionId: razorpay_order_id });
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isValid = expectedSignature === razorpay_signature;

  payment.status = isValid ? 'success' : 'failed';
  payment.gatewayTransactionId = razorpay_payment_id;
  await payment.save();

  let order = null;
  if (isValid) {
    order = await Order.findByIdAndUpdate(payment.order, { status: 'paid' }, { new: true }).populate(
      'table',
      'tableNumber tableId'
    );

    const io = getIO();
    io.to('kitchen').emit(PAYMENT_UPDATED, { payment, order });
    io.to(`table:${order.table.tableId}`).emit(PAYMENT_UPDATED, { payment, order });
  }

  res.json({ success: isValid, payment, order });
}

// GET /api/payments/revenue — admin only
async function getRevenueSummary(req, res) {
  const { startDate, endDate } = req.query;

  const matchStage = { status: 'paid' };
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const [totalsResult, revenueByDate, topItems] = await Promise.all([
    Order.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          name: { $first: '$items.name' },
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 10 },
    ]),
  ]);

  res.json({
    success: true,
    totalRevenue: totalsResult[0]?.totalRevenue || 0,
    orderCount: totalsResult[0]?.orderCount || 0,
    revenueByDate,
    topSellingItems: topItems,
  });
}

module.exports = { initiatePayment, verifyPayment, getRevenueSummary };
