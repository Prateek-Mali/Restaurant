// The single source of truth for how the menu is organised.
//
// Served to the frontend via GET /api/menu/taxonomy rather than duplicated there,
// so the admin form's dropdowns, the customer's browsing tabs, and this server's
// validation can never drift apart. Change the menu structure here and everything
// follows — no frontend redeploy needed.
//
// Depth varies by section on purpose: Mains needs a cuisine level (Veg → Punjabi),
// while Starters/Desserts/Beverages only need hot vs cold.

const MENU_TAXONOMY = {
  starters: {
    label: 'Starters',
    groups: {
      cold: { label: 'Cold Starters', hint: 'Salads, chaat with curd, cold canapés' },
      hot: { label: 'Hot Starters', hint: 'Tikka, kebab, pakora, momos, fried snacks' },
    },
  },

  mains: {
    label: 'Main Menu',
    groups: {
      veg: {
        label: 'Veg',
        subgroups: {
          'south-indian': 'South Indian',
          'north-indian': 'Punjabi / North Indian',
          rajasthani: 'Rajasthani',
          gujarati: 'Gujarati',
          'street-food': 'Street Food Style',
          'indo-chinese': 'Indo-Chinese',
        },
      },
      'non-veg': {
        label: 'Non-Veg',
        subgroups: {
          'south-indian': 'South Indian',
          'north-indian': 'Punjabi / North Indian',
          hyderabadi: 'Hyderabadi',
          bengali: 'Bengali',
          'coastal-goan': 'Coastal / Goan',
          'indo-chinese': 'Indo-Chinese',
        },
      },
      bread: {
        label: 'Bread',
        subgroups: {
          tandoori: 'Tandoori',
          fried: 'Fried',
        },
      },
    },
  },

  desserts: {
    label: 'Desserts',
    groups: {
      cold: { label: 'Cold Desserts', hint: 'Ice cream, kulfi, gelato, falooda' },
      hot: { label: 'Hot Desserts', hint: 'Brownie, halwa, jalebi, malpua' },
    },
  },

  beverages: {
    label: 'Beverages',
    groups: {
      cold: { label: 'Cold Drinks', hint: 'Juice, soda, lassi, shakes' },
      hot: { label: 'Hot Drinks', hint: 'Tea, coffee, filter kaapi' },
    },
  },
};

const SECTIONS = Object.keys(MENU_TAXONOMY);

function getGroups(section) {
  return Object.keys(MENU_TAXONOMY[section]?.groups || {});
}

function getSubgroups(section, group) {
  return Object.keys(MENU_TAXONOMY[section]?.groups?.[group]?.subgroups || {});
}

// A section either requires a subgroup for every group (Mains) or none at all.
function requiresSubgroup(section, group) {
  return getSubgroups(section, group).length > 0;
}

// Returns an error string, or null when the combination is valid.
function validateCategory({ section, group, subgroup }) {
  if (!SECTIONS.includes(section)) {
    return `section must be one of: ${SECTIONS.join(', ')}`;
  }

  const validGroups = getGroups(section);
  if (!validGroups.includes(group)) {
    return `group for "${section}" must be one of: ${validGroups.join(', ')}`;
  }

  const validSubgroups = getSubgroups(section, group);

  if (validSubgroups.length === 0) {
    return subgroup ? `"${section} / ${group}" does not take a subgroup` : null;
  }

  if (!validSubgroups.includes(subgroup)) {
    return `subgroup for "${section} / ${group}" must be one of: ${validSubgroups.join(', ')}`;
  }

  return null;
}

// Human-readable trail, e.g. "Main Menu · Non-Veg · Hyderabadi"
function categoryPath({ section, group, subgroup }) {
  const s = MENU_TAXONOMY[section];
  if (!s) return '';
  const g = s.groups?.[group];
  const parts = [s.label, g?.label, g?.subgroups?.[subgroup]].filter(Boolean);
  return parts.join(' · ');
}

module.exports = {
  MENU_TAXONOMY,
  SECTIONS,
  getGroups,
  getSubgroups,
  requiresSubgroup,
  validateCategory,
  categoryPath,
};
