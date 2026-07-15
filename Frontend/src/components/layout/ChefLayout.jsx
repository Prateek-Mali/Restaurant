import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const TABS = [
  { to: '/chef', label: 'Kitchen Display', end: true },
  { to: '/chef/payments', label: 'Payments', end: false },
];

export function ChefLayout() {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', width: '100%', fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      <div
        style={{
          height: 60,
          background: '#FFFFFF',
          borderBottom: '1px solid #E7DCCC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxSizing: 'border-box',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: '#2B2420' }}>
            Ember &amp; Oak <span style={{ fontWeight: 600, color: '#8C8073', fontSize: 13, marginLeft: 6 }}>Staff Tools</span>
          </div>
          <div style={{ display: 'flex', gap: 6, background: '#F2EAE0', padding: 4, borderRadius: 999 }}>
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                style={({ isActive }) => ({
                  padding: '8px 18px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  background: isActive ? '#2B2420' : 'transparent',
                  color: isActive ? '#fff' : '#8C8073',
                })}
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, color: '#8C8073' }}>{user?.name}</div>
          <div onClick={logout} style={{ fontSize: 13, fontWeight: 700, color: '#C24A26', cursor: 'pointer' }}>
            Sign out
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
