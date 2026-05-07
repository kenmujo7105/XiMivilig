import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: 'var(--bg-color)',
      color: 'var(--text-main)'
    }}>
      <Navbar />
      <main style={{ flex: 1, padding: '32px 0' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
