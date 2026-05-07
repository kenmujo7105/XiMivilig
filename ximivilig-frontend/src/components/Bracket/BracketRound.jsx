import React from 'react';
import BracketMatch from './BracketMatch';

export default function BracketRound({ round, roundIndex }) {
  // Logic for spacing between matches in elimination brackets
  const matchHeight = 70; // rough height of a match card
  const baseGap = 32;
  const gap = baseGap * Math.pow(2, roundIndex);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: `${gap}px`,
      justifyContent: 'space-around',
      position: 'relative'
    }}>
      <h4 style={{ 
        position: 'absolute', 
        top: '-40px', 
        left: 0, 
        right: 0, 
        textAlign: 'center', 
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        fontWeight: 600
      }}>
        {round.name}
      </h4>
      
      {round.matches.map(match => (
        <div key={match.id} style={{ position: 'relative' }}>
          <BracketMatch match={match} />
          {/* Connector logic could go here using CSS pseudo elements on a wrapper, but for simplicity we rely on flex spacing */}
        </div>
      ))}
    </div>
  );
}
