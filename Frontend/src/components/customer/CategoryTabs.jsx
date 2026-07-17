import { getSections, getGroups, getSubgroups, needsSubgroup } from '../../hooks/useMenuTaxonomy';

// Three levels is a lot for a phone, so each row is its own horizontally scrollable
// strip and the third only appears for Mains (the only section with a cuisine level).
// Subgroups include an "All" option — someone browsing for "any veg dish" shouldn't
// have to guess a cuisine first.
export function CategoryTabs({ taxonomy, section, group, subgroup, onChange }) {
  const sections = getSections(taxonomy);
  const groups = getGroups(taxonomy, section);
  const subgroups = getSubgroups(taxonomy, section, group);
  const showSubgroups = needsSubgroup(taxonomy, section, group);

  // Selecting a parent resets its children, otherwise you'd be left filtering Veg
  // dishes by a Non-Veg-only cuisine and see an empty list.
  function pickSection(nextSection) {
    const firstGroup = getGroups(taxonomy, nextSection)[0]?.key ?? '';
    onChange({ section: nextSection, group: firstGroup, subgroup: null });
  }

  function pickGroup(nextGroup) {
    onChange({ section, group: nextGroup, subgroup: null });
  }

  return (
    <div style={{ flexShrink: 0 }}>
      <Strip>
        {sections.map((s) => (
          <Chip key={s.key} active={s.key === section} onClick={() => pickSection(s.key)} variant="section">
            {s.label}
          </Chip>
        ))}
      </Strip>

      <Strip>
        {groups.map((g) => (
          <Chip key={g.key} active={g.key === group} onClick={() => pickGroup(g.key)} variant="group">
            {g.label}
          </Chip>
        ))}
      </Strip>

      {showSubgroups && (
        <Strip>
          <Chip active={!subgroup} onClick={() => onChange({ section, group, subgroup: null })} variant="sub">
            All
          </Chip>
          {subgroups.map((s) => (
            <Chip
              key={s.key}
              active={s.key === subgroup}
              onClick={() => onChange({ section, group, subgroup: s.key })}
              variant="sub"
            >
              {s.label}
            </Chip>
          ))}
        </Strip>
      )}
    </div>
  );
}

function Strip({ children }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '6px 20px', overflowX: 'auto', boxSizing: 'border-box' }}>
      {children}
    </div>
  );
}

// Each level is visually quieter than the one above it, so the hierarchy reads at a
// glance instead of looking like three identical rows of buttons.
const VARIANTS = {
  section: { on: { bg: '#DE5B33', fg: '#fff' }, off: { bg: '#F2EAE0', fg: '#8C8073' }, size: 13, weight: 700 },
  group: { on: { bg: '#2B2420', fg: '#fff' }, off: { bg: '#FFFFFF', fg: '#5A5148' }, size: 12.5, weight: 600 },
  sub: { on: { bg: '#FCE3D6', fg: '#C24A26' }, off: { bg: 'transparent', fg: '#8C8073' }, size: 12, weight: 600 },
};

function Chip({ active, onClick, children, variant }) {
  const v = VARIANTS[variant];
  const state = active ? v.on : v.off;

  return (
    <div
      onClick={onClick}
      style={{
        padding: variant === 'sub' ? '5px 10px' : '8px 14px',
        borderRadius: 999,
        fontSize: v.size,
        fontWeight: v.weight,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        flexShrink: 0,
        background: state.bg,
        color: state.fg,
        border: variant === 'group' && !active ? '1px solid #E7DCCC' : '1px solid transparent',
      }}
    >
      {children}
    </div>
  );
}
