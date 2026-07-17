import { useEffect, useState } from 'react';
import menuService from '../services/menuService';

// The taxonomy is static config — fetch it once per page load and share it, rather
// than every component asking for it.
let cached = null;

export function useMenuTaxonomy() {
  const [taxonomy, setTaxonomy] = useState(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return;
    menuService
      .getTaxonomy()
      .then((t) => {
        cached = t;
        setTaxonomy(t);
      })
      .catch(() => setTaxonomy(null))
      .finally(() => setLoading(false));
  }, []);

  return { taxonomy, loading };
}

// ── Read helpers ────────────────────────────────────────────────────────────────
// Kept here so components never poke at the taxonomy's shape directly.

export function getSections(taxonomy) {
  return Object.entries(taxonomy || {}).map(([key, s]) => ({ key, label: s.label }));
}

export function getGroups(taxonomy, section) {
  const groups = taxonomy?.[section]?.groups || {};
  return Object.entries(groups).map(([key, g]) => ({ key, label: g.label, hint: g.hint }));
}

export function getSubgroups(taxonomy, section, group) {
  const subs = taxonomy?.[section]?.groups?.[group]?.subgroups || {};
  return Object.entries(subs).map(([key, label]) => ({ key, label }));
}

// Mains needs a cuisine; Starters/Desserts/Beverages stop at the group.
export function needsSubgroup(taxonomy, section, group) {
  return getSubgroups(taxonomy, section, group).length > 0;
}
