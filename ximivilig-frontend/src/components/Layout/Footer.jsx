import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--surface-color)',
      borderTop: '1px solid var(--border-color)',
      padding: '40px 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>About</Link>
          <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>GitHub</a>
          <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>API Docs</a>
        </div>
        
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} XiMivilig &mdash; Tournament Management Platform
        </div>
      </div>
    </footer>
  );
}
