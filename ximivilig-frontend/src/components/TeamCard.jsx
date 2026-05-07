import React from 'react';
import Card from './UI/Card';
import Badge from './UI/Badge';
import { Users } from 'lucide-react';

export default function TeamCard({ team, onClick }) {
  return (
    <Card 
      onClick={onClick}
      style={{ 
        cursor: 'pointer', 
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-main)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {team.logoUrl ? <img src={team.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{team.name.charAt(0)}</span>}
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{team.name}</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Captain: {team.captainUsername}</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Users size={16} /> {team.members?.length || 1}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {team.seedNumber && <Badge status="default" text={`#${team.seedNumber}`} />}
          <Badge status={team.registrationStatus} />
        </div>
      </div>
    </Card>
  );
}
