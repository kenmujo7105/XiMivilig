import React from 'react';

export default function StandingsTable({ standings }) {
  if (!standings || standings.length === 0) return <div style={{ color: 'var(--text-muted)' }}>No standings data available.</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Rank</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Team</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }} title="Played">MP</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }} title="Won">W</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }} title="Drawn">D</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }} title="Lost">L</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }} title="Goals For">GF</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }} title="Goals Against">GA</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }} title="Goal Difference">GD</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }} title="Points">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr key={s.team.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
              <td style={{ padding: '16px', fontWeight: 600 }}>{s.rank}</td>
              <td style={{ padding: '16px', fontWeight: 500 }}>{s.team.name}</td>
              <td style={{ padding: '16px' }}>{s.played}</td>
              <td style={{ padding: '16px', color: 'var(--status-green)' }}>{s.won}</td>
              <td style={{ padding: '16px', color: 'var(--status-gray)' }}>{s.drawn}</td>
              <td style={{ padding: '16px', color: 'var(--status-red)' }}>{s.lost}</td>
              <td style={{ padding: '16px' }}>{s.goalsFor}</td>
              <td style={{ padding: '16px' }}>{s.goalsAgainst}</td>
              <td style={{ padding: '16px' }}>{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</td>
              <td style={{ padding: '16px', fontWeight: 700, color: 'var(--accent-start)' }}>{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
