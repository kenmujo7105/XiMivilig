import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './UI/Card';
import Badge from './UI/Badge';
import { Users, Calendar, Trophy } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function TournamentCard({ tournament }) {
  const navigate = useNavigate();

  const getFormatDisplay = (format) => {
    switch (format) {
      case 'SINGLE_ELIMINATION': return 'Single Elim';
      case 'DOUBLE_ELIMINATION': return 'Double Elim';
      case 'ROUND_ROBIN': return 'Round Robin';
      default: return format;
    }
  };

  return (
    <Card 
      onClick={() => navigate(`/tournaments/${tournament.id}`)}
      style={{ 
        cursor: 'pointer', 
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-main)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={14} /> {tournament.game || 'Any Game'}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.3 }}>
            {tournament.title}
          </h3>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <Badge status={tournament.status} />
        <Badge status="default" text={getFormatDisplay(tournament.format)} />
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} />
            <span>{tournament.registeredTeamsCount} / {tournament.maxParticipants} Teams</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} />
            <span>{formatDate(tournament.startAt).split(',')[0]}</span>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Organized by <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{tournament.createdByUsername}</span>
        </div>
      </div>
    </Card>
  );
}
