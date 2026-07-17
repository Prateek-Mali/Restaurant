const mongoose = require('mongoose');
const { SECTIONS, validateCategory } = require('../config/menuTaxonomy');

// Category is a path, not a single value: section → group → subgroup.
// Depth varies — Mains uses all three (Main Menu · Veg · Punjabi), while
// Starters/Desserts/Beverages stop at the group (Desserts · Hot Desserts).
// The enums below only catch the shape; the pre-validate hook enforces that the
// combination actually exists in the taxonomy, since e.g. "hyderabadi" is a valid
// subgroup under Non-Veg but not under Veg.
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },

  section: { type: String, required: true, enum: SECTIONS },
  group: { type: String, required: true },
  subgroup: { type: String, default: null },

  imageUrl: { type: String },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

menuItemSchema.pre('validate', function validateTaxonomy(next) {
  const error = validateCategory({
    section: this.section,
    group: this.group,
    subgroup: this.subgroup || undefined,
  });

  // invalidate() is the supported way to fail validation from a hook — building a
  // ValidationError by hand here silently passes, because addError() returns undefined.
  if (error) this.invalidate('category', error);

  next();
});

// Makes browsing by section/group fast once the menu grows.
menuItemSchema.index({ section: 1, group: 1, subgroup: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
