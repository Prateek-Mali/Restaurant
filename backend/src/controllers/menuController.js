const MenuItem = require('../models/MenuItem');
const { MENU_TAXONOMY, categoryPath } = require('../config/menuTaxonomy');

// Sorting by the category path keeps a section's items together in a sensible order.
const SORT = { section: 1, group: 1, subgroup: 1, name: 1 };

// Adds the human-readable trail ("Main Menu · Veg · Rajasthani") so clients don't
// each have to re-derive it from the taxonomy.
function withPath(item) {
  return { ...item.toObject(), categoryPath: categoryPath(item) };
}

// GET /api/menu/taxonomy — public. The menu's shape, so the admin form and the
// customer's browsing tabs are always built from the same definition the server
// validates against.
async function getTaxonomy(req, res) {
  res.json({ success: true, taxonomy: MENU_TAXONOMY });
}

// GET /api/menu — public. Optional ?section= &group= &subgroup= filters.
async function getMenu(req, res) {
  const { section, group, subgroup } = req.query;

  const filter = { isAvailable: true };
  if (section) filter.section = section;
  if (group) filter.group = group;
  if (subgroup) filter.subgroup = subgroup;

  const items = await MenuItem.find(filter).sort(SORT);
  res.json({ success: true, items: items.map(withPath) });
}

// GET /api/menu/all — admin-only. Includes unavailable items for menu management.
async function getAllMenuItems(req, res) {
  const items = await MenuItem.find().sort(SORT);
  res.json({ success: true, items: items.map(withPath) });
}

// POST /api/menu — admin-only
async function createMenuItem(req, res) {
  const { name, description, price, section, group, subgroup, imageUrl, isAvailable } = req.body;

  if (!name || price === undefined || !section || !group) {
    return res.status(400).json({ success: false, message: 'name, price, section and group are required' });
  }

  // The model's pre-validate hook checks that section/group/subgroup actually
  // exist together in the taxonomy.
  const item = await MenuItem.create({
    name,
    description,
    price,
    section,
    group,
    subgroup: subgroup || null,
    imageUrl,
    isAvailable,
  });

  res.status(201).json({ success: true, item: withPath(item) });
}

// PUT /api/menu/:id — admin-only
async function updateMenuItem(req, res) {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Menu item not found' });
  }

  // Loaded and saved rather than findByIdAndUpdate: document pre('validate') hooks
  // don't run on update queries, so the taxonomy check would be skipped entirely and
  // an edit could park an item in a category that doesn't exist.
  const fields = ['name', 'description', 'price', 'section', 'group', 'subgroup', 'imageUrl', 'isAvailable'];
  for (const field of fields) {
    if (req.body[field] !== undefined) item[field] = req.body[field];
  }
  // Moving an item to a section that takes no subgroup must clear the stale one.
  if (req.body.subgroup === '' || req.body.subgroup === null) item.subgroup = null;

  await item.save();
  res.json({ success: true, item: withPath(item) });
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

  res.json({ success: true, item: withPath(item) });
}

module.exports = {
  getTaxonomy,
  getMenu,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};
