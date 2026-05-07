import React from 'react';
import BracketRound from './BracketRound';

export default function BracketView({ bracket }) {
  if (!bracket || !bracket.rounds) return <div style={{ color: 'var(--text-muted)' }}>No bracket data available.</div>;

  return (
    <div style={{ 
      overflowX: 'auto', 
      padding: '60px 24px 24px 24px', 
      background: 'rgba(0,0,0,0.2)', 
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{ display: 'flex', gap: '64px', minWidth: 'min-content' }}>
        {bracket.rounds.map((round, index) => (
          <BracketRound key={round.id || index} round={round} roundIndex={index} />
        ))}
      </div>
    </div>
  );
}
