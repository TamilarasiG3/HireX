import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Coding Practice', path: '/codingPractice' },
  { label: 'Mock Test', path: '/quiz' },
  { label: 'Mock Interview', path: '/mockInterview' },
  { label: 'Profile', path: '/profile' },
];

export default function Sidebar({ user }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleNav = (path) => {
    router.push(path);
    setOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('hirex_token');
    localStorage.removeItem('hirex_user');
    router.push('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HX';

  return (
    <>
      <button className="mobile-toggle" onClick={() => setOpen(!open)}>
        {open ? '\u2715' : '\u2630'}
      </button>
      {open && <div className="sidebar-overlay visible" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>HireX</h2>
          <span>Career Preparation</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`sidebar-link ${router.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <h4>{user?.fullName || 'Student'}</h4>
              <p>{user?.email || ''}</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm btn-block" style={{ marginTop: 12 }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
