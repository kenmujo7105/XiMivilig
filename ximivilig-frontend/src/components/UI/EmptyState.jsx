import React from 'react';
import { Ghost } from 'lucide-react';

export default function EmptyState({ message, icon: Icon = Ghost }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 20px', color: 'var(--text-muted)', textAlign: 'center' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '50%', marginBottom: '16px' }}>
        <Icon size={48} opacity={0.6} />
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 500 }}>{message || 'No data found'}</h3>
    </div>
  );
}
