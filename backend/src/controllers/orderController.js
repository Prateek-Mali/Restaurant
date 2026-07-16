const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const { getIO } = require('../config/socket');
const { NEW_ORDER, ORDER_STATUS_UPDATED, PAYMENT_UPDATED } = require('../sockets/orderEvents');

const UNPAID_STATUSES = ['placed', 'preparing', 'ready', 'served'];

// POST /api/orders — public, called by the customer using their tableId
async function placeOrder(req, res) {
  const { tableId, items } = req.body;

  if (!tableId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'tableId and a non-empty items array are required' });
  }

  const table = await Table.findOne({ tableId });
  if (!table) {
    return res.status(404).json({ success: false, message: 'Table not found' });
  }

  const menuItemIds = items.map((i) => i.menuItem);
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
  const menuItemMap = new Map(menuItems.map((m) => [m._id.toString(), m]));

  const orderItems = [];
  for (const requested of items) {
    const menuItem = menuItemMap.get(requested.menuItem);

    if (!menuItem || !menuItem.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `Menu item ${requested.menuItem} is unavailable or does not exist`,
      });
    }

    const quantity = Number(requested.quantity) || 1;
    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
    });
  }

  const order = await Order.create({ table: table._id, items: orderItems, status: 'placed' });

  table.status = 'occupied';
  await table.save();

  const populatedOrder = await order.populate('table', 'tableNumber tableId');

  const io = getIO();
  io.to('kitchen').emit(NEW_ORDER, populatedOrder);
  io.to(`table:${tableId}`).emit(NEW_ORDER, populatedOrder);

  res.status(201).json({ success: true, order: populatedOrder });
}

// GET /api/orders/table/:tableId — public, customer polls their own order status
async function getOrdersByTable(req, res) {
  const table = await Table.findOne({ tableId: req.params.tableId });
  if (!table) {
    return res.status(404).json({ success: false, message: 'Table not found' });
  }

  const orders = await Order.find({ table: table._id })
    .populate('table', 'tableNumber tableId')
    .sort({ createdAt: -1 });
  res.json({ success: true, orders });
}

// GET /api/orders/kitchen — chef/admin only. Active orders, oldest first.
async function getKitchenOrders(req, res) {
  const orders = await Order.find({ status: { $in: ['placed', 'preparing', 'ready'] } })
    .populate('table', 'tableNumber tableId')
    .sort({ createdAt: 1 });

  res.json({ success: true, orders });
}

// PATCH /api/orders/:id/status — chef/admin only
async function updateOrderStatus(req, res) {
  const { status } = req.body;
  const validStatuses = ['placed', 'preparing', 'ready', 'served', 'paid', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const order = await Order.findById(req.params.id).populate('table', 'tableNumber tableId');
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  await order.save();

  const io = getIO();
  io.to('kitchen').emit(ORDER_STATUS_UPDATED, order);
  io.to(`table:${order.table.tableId}`).emit(ORDER_STATUS_UPDATED, order);

  res.json({ success: true, order });
}

// GET /api/orders — admin only, with date range filters for the revenue dashboard
async function getAllOrders(req, res) {
  const { startDate, endDate } = req.query;

  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const orders = await Order.find(filter)
    .populate('table', 'tableNumber tableId')
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
}

// GET /api/orders/open-tabs — chef/admin only. Every table with unpaid orders, combined into one running bill.
async function getOpenTabs(req, res) {
  const orders = await Order.find({ status: { $in: UNPAID_STATUSES } })
    .populate('table', 'tableNumber tableId')
    .sort({ createdAt: 1 });

  const tabsByTable = new Map();
  for (const order of orders) {
    if (!order.table) continue;
    const key = order.table._id.toString();
    if (!tabsByTable.has(key)) {
      tabsByTable.set(key, { table: order.table, orders: [], totalAmount: 0 });
    }
    const tab = tabsByTable.get(key);
    tab.orders.push(order);
    tab.totalAmount += order.totalAmount;
  }

  res.json({ success: true, tabs: Array.from(tabsByTable.values()) });
}

// PATCH /api/orders/checkout/:tableId — chef/admin only. Marks every unpaid order for a
// table as paid in one go and frees the table for the next customer.
//
// NOTE(payments): this is the reference implementation for settling a bill — the
// online-payment path in paymentController.verifyPayment must end up doing exactly
// this (settle whole tab → free table → emit PAYMENT_UPDATED). If you're adding
// Razorpay, share this logic rather than reimplementing it. docs/ADDING_PAYMENTS.md
async function checkoutTable(req, res) {
  const table = await Table.findById(req.params.tableId);
  if (!table) {
    return res.status(404).json({ success: false, message: 'Table not found' });
  }

  const orders = await Order.find({ table: table._id, status: { $in: UNPAID_STATUSES } });
  if (orders.length === 0) {
    return res.status(400).json({ success: false, message: 'This table has no unpaid orders' });
  }

  const orderIds = orders.map((o) => o._id);
  await Order.updateMany({ _id: { $in: orderIds } }, { status: 'paid' });

  table.status = 'available';
  await table.save();

  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const io = getIO();
  io.to('kitchen').emit(PAYMENT_UPDATED, { table, totalAmount, orderIds });
  io.to(`table:${table.tableId}`).emit(PAYMENT_UPDATED, { table, totalAmount, orderIds });

  res.json({ success: true, table, paidOrderIds: orderIds, totalAmount });
}

module.exports = {
  placeOrder,
  getOrdersByTable,
  getKitchenOrders,
  getOpenTabs,
  checkoutTable,
  updateOrderStatus,
  getAllOrders,
};
