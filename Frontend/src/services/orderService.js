import api from './api';

async function getKitchenOrders() {
  const { data } = await api.get('/orders/kitchen');
  return data.orders;
}

async function updateOrderStatus(orderId, status) {
  const { data } = await api.patch(`/orders/${orderId}/status`, { status });
  return data.order;
}

async function placeOrder(payload) {
  const { data } = await api.post('/orders', payload);
  return data.order;
}

async function getOrdersByTable(tableId) {
  const { data } = await api.get(`/orders/table/${tableId}`);
  return data.orders;
}

async function getAllOrders(params) {
  const { data } = await api.get('/orders', { params });
  return data.orders;
}

async function getOpenTabs() {
  const { data } = await api.get('/orders/open-tabs');
  return data.tabs;
}

async function checkoutTable(tableId) {
  const { data } = await api.patch(`/orders/checkout/${tableId}`);
  return data;
}

export default {
  getKitchenOrders,
  updateOrderStatus,
  placeOrder,
  getOrdersByTable,
  getAllOrders,
  getOpenTabs,
  checkoutTable,
};
