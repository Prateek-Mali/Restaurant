import api from './api';

async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.user;
}

async function getAllStaff() {
  const { data } = await api.get('/auth/staff');
  return data.staff;
}

async function registerStaff(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data.user;
}

async function toggleStaffActive(id) {
  const { data } = await api.patch(`/auth/staff/${id}/toggle-active`);
  return data.user;
}

async function deleteStaff(id) {
  await api.delete(`/auth/staff/${id}`);
}

export default { login, getMe, getAllStaff, registerStaff, toggleStaffActive, deleteStaff };
