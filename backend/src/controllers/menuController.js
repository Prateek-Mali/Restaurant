const MenuItem = require('../models/MenuItem');

// GET /api/menu — public. Optional ?category= filter.
async function getMenu(req, res) {
  const { category } = req.query;

  const filter = { isAvailable: true };
  if (category) filter.category = category;

  const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });

  const groupedByCategory = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  res.json({ success: true, items, groupedByCategory });
}

// GET /api/menu/all — admin-only. Includes unavailable items for menu management.
async function getAllMenuItems(req, res) {
  const items = await MenuItem.find().sort({ category: 1, name: 1 });
  res.json({ success: true, items });
}

// POST /api/menu — admin-only
async function createMenuItem(req, res) {
  const { name, description, price, category, imageUrl, isAvailable } = req.body;

  if (!name || price === undefined || !category) {
    return res.status(400).json({ success: false, message: 'name, price and category are required' });
  }

  const item = await MenuItem.create({ name, description, price, category, imageUrl, isAvailable });
  res.status(201).json({ success: true, item });
}

// PUT /api/menu/:id — admin-only
async function updateMenuItem(req, res) {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    return res.status(404).json({ success: false, message: 'Menu item not found' });
  }

  res.json({ success: true, item });
}

// DELETE /api/menu/:id — admin-only
async function deleteMenuItem(req, res) {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Menu item not found' });
  }
  res.json({ success: true, message: 'Menu item deleted' });
}

// PATCH /api/menu/:id/toggle-availability — admin or chef
async function toggleAvailability(req, res) {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Menu item not found' });
  }

  item.isAvailable = !item.isAvailable;
  await item.save();

  res.json({ success: true, item });
}

module.exports = {
  getMenu,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};
