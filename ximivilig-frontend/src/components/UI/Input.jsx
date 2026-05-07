import React from 'react';

export default function Input({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{label}</label>}
      <input className="input" style={error ? { borderColor: 'var(--status-red)' } : {}} {...props} />
      {error && <span style={{ color: 'var(--status-red)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
}
