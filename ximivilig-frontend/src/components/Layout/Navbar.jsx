import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User as UserIcon, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../UI/Button';
import Badge from '../UI/Badge';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const hasDashboardAccess = user && (user.role === 'ORGANIZER' || user.role === 'ADMIN');

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(10, 10, 15, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          XiMivilig
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'none' }} className="desktop-nav">
          <ul style={{ display: 'flex', gap: '24px', listStyle: 'none', alignItems: 'center' }}>
            <li><Link to="/" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='var(--text-muted)'}>Home</Link></li>
            <li><Link to="/tournaments" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='var(--text-muted)'}>Tournaments</Link></li>
          </ul>
        </nav>

        {/* Right Side (Auth) */}
        <div style={{ display: 'none' }} className="desktop-auth">
          {!isAuthenticated ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login"><Button variant="ghost">Login</Button></Link>
              <Link to="/register"><Button variant="primary">Register</Button></Link>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 8px', borderRadius: 'var(--radius-sm)', transition: 'background 0.2s' }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                onMouseOut={e => e.currentTarget.style.background='transparent'}
              >
                <div style={{ background: 'var(--card-color)', padding: '6px', borderRadius: '50%' }}>
                  <UserIcon size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.username}</span>
                  <Badge status={user?.role} text={user?.role} />
                </div>
                <ChevronDown size={16} color="var(--text-muted)" />
              </div>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '200px',
                  background: 'var(--card-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-main)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {hasDashboardAccess && (
                    <Link to="/dashboard" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', color: 'var(--status-red)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: '0.95rem' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div style={{ display: 'flex' }} className="mobile-toggle">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={{ background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/tournaments" onClick={() => setIsMobileMenuOpen(false)}>Tournaments</Link>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
          {!isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}><Button variant="ghost" style={{ width: '100%' }}>Login</Button></Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}><Button variant="primary" style={{ width: '100%' }}>Register</Button></Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <UserIcon size={18} /> <span>{user?.username} ({user?.role})</span>
              </div>
              {hasDashboardAccess && (
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              )}
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', color: 'var(--status-red)', background: 'transparent', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Basic responsive styles inline for demo, should move to CSS */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: block !important; }
          .desktop-auth { display: block !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
