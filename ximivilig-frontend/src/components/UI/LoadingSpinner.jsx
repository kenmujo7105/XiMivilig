import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 32, className = '' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }} className={className}>
      <Loader2 size={size} color="var(--accent-start)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
