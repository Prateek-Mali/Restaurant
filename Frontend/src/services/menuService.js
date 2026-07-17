import api from './api';

// The menu's structure is defined once on the server (config/menuTaxonomy.js) and
// fetched here, so the form's dropdowns and the customer's tabs can't drift from
// what the API actually accepts.
async function getTaxonomy() {
  const { data } = await api.get('/menu/taxonomy');
  return data.taxonomy;
}

async function getMenu() {
  const { data } = await api.get('/menu');
  return data.items;
}

async function getAllMenuItems() {
  const { data } = await api.get('/menu/all');
  return data.items;
}

async function createMenuItem(payload) {
  const { data } = await api.post('/menu', payload);
  return data.item;
}

async function updateMenuItem(id, payload) {
  const { data } = await api.put(`/menu/${id}`, payload);
  return data.item;
}

async function deleteMenuItem(id) {
  await api.delete(`/menu/${id}`);
}

async function toggleAvailability(id) {
  const { data } = await api.patch(`/menu/${id}/toggle-availability`);
  return data.item;
}

export default {
  getTaxonomy,
  getMenu,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};
