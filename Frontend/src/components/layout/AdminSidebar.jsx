import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/menu', label: 'Manage Menu' },
  { to: '/admin/tables', label: 'Manage Tables' },
  { to: '/admin/staff', label: 'Manage Staff' },
];

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', width: '100%', fontFamily: "'Public Sans', system-ui, sans-serif", background: '#FAF6F0', display: 'flex' }}>
      <div
        style={{
          width: 232,
          flexShrink: 0,
          background: '#FFFFFF',
          borderRight: '1px solid #E7DCCC',
          padding: '24px 16px',
          boxSizing: 'border-box',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#2B2420', padding: '0 8px 4px' }}>
          Ember &amp; Oak
        </div>
        <div style={{ fontSize: 12, color: '#8C8073', padding: '0 8px 24px' }}>Owner Admin</div>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: 'block',
              padding: '11px 12px',
              borderRadius: 10,
              marginBottom: 4,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              background: isActive ? '#FCE3D6' : 'transparent',
              color: isActive ? '#C24A26' : '#5A5148',
            })}
          >
            {item.label}
          </NavLink>
        ))}

        <div
          onClick={logout}
          style={{ marginTop: 24, padding: '11px 12px', fontWeight: 700, fontSize: 14, color: '#B3ABA1', cursor: 'pointer' }}
        >
          Sign out
        </div>
      </div>

      <div style={{ flex: 1, padding: '36px 40px', boxSizing: 'border-box', minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}
