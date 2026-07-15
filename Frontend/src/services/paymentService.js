import api from './api';

async function getRevenueSummary() {
  const { data } = await api.get('/payments/revenue');
  return data;
}

async function initiatePayment(orderId, method) {
  const { data } = await api.post('/payments/initiate', { orderId, method });
  return data;
}

export default { getRevenueSummary, initiatePayment };
