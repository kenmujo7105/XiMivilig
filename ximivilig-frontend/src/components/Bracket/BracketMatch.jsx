import React from 'react';
import Badge from '../UI/Badge';

export default function BracketMatch({ match }) {
  const isBye = match.status === 'BYE';
  
  const getTeamDisplay = (team, isWinner) => {
    if (!team) return <div style={{ color: 'var(--text-muted)' }}>TBD</div>;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: isWinner ? 700 : 400, color: isWinner ? 'var(--accent-start)' : 'var(--text-main)' }}>
        {team.seedNumber && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{team.seedNumber}</span>}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
          {team.name}
        </span>
      </div>
    );
  };

  const getBorderColor = () => {
    if (match.status === 'IN_PROGRESS') return 'var(--status-blue)';
    if (match.status === 'COMPLETED') return 'var(--border-color)';
    return 'transparent';
  };

  return (
    <div 
      data-match-id={match.id}
      style={{
      width: '220px',
      background: 'var(--card-color)',
      border: `1px solid ${getBorderColor()}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: match.status === 'IN_PROGRESS' ? '0 0 0 2px rgba(59, 130, 246, 0.4)' : 'var(--shadow-main)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 2,
    }}>
      {/* Top half / Team 1 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-color)',
        background: match.winner?.id === match.team1?.id ? 'rgba(255,255,255,0.05)' : 'transparent'
      }}>
        {getTeamDisplay(match.team1, match.winner?.id && match.winner?.id === match.team1?.id)}
        <div style={{ fontWeight: 600 }}>{match.score1 !== null ? match.score1 : '-'}</div>
      </div>

      {/* Bottom half / Team 2 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '8px 12px',
        background: match.winner?.id === match.team2?.id ? 'rgba(255,255,255,0.05)' : 'transparent'
      }}>
        {isBye ? (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>BYE</div>
        ) : (
          getTeamDisplay(match.team2, match.winner?.id && match.winner?.id === match.team2?.id)
        )}
        <div style={{ fontWeight: 600 }}>{!isBye && match.score2 !== null ? match.score2 : '-'}</div>
      </div>

      {/* Status indicator */}
      {match.status === 'IN_PROGRESS' && (
        <div style={{ position: 'absolute', top: '50%', left: '-4px', transform: 'translateY(-50%)', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-blue)' }} className="pulse-dot" />
      )}
    </div>
  );
}
