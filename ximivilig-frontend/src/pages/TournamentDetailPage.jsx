import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import Badge from '../components/UI/Badge';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import BracketView from '../components/Bracket/BracketView';
import StandingsTable from '../components/Bracket/StandingsTable';
import TeamCard from '../components/TeamCard';
import CreateTeamModal from '../components/CreateTeamModal';
import RegistrationModal from '../components/RegistrationModal';
import TeamDetailModal from '../components/TeamDetailModal';
import { Calendar, Users, Trophy, CheckCircle } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { TOURNAMENT_STATUS } from '../utils/constants';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, subscribe } = useWebSocket();
  
  const [tournament, setTournament] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [bracketData, setBracketData] = useState(null);
  const [standingsData, setStandingsData] = useState(null);
  const [matchesData, setMatchesData] = useState([]);
  const [teamsData, setTeamsData] = useState([]);

  // Modals state
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const fetchTournament = useCallback(async () => {
    try {
      const res = await axiosClient.get(`/tournaments/${id}`);
      if (res.success) setTournament(res.data);
    } catch (error) {
      console.error("Failed to fetch tournament:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  // WebSocket Subscriptions
  useEffect(() => {
    if (!isConnected || !id) return;

    // Subscribe to bracket updates
    const bracketSub = subscribe(`/topic/tournaments/${id}/bracket`, (data) => {
      console.log("Received live bracket update", data);
      setBracketData(data);
    });

    // Subscribe to match updates
    const matchSub = subscribe(`/topic/tournaments/${id}/matches`, (updatedMatch) => {
      console.log("Received live match update", updatedMatch);
      // Update the matches list if we are on the matches tab
      setMatchesData(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
      
      // We don't automatically update bracketData here because the backend might 
      // send a full bracket update via the bracket topic anyway. 
      // But we could optionally deep update bracketData.rounds.matches if needed.
    });

    return () => {
      if (bracketSub) bracketSub.unsubscribe();
      if (matchSub) matchSub.unsubscribe();
    };
  }, [isConnected, id, subscribe]);

  const fetchTabData = useCallback(async () => {
    if (!tournament) return;
    try {
      if (activeTab === 'overview' || activeTab === 'teams') {
        const res = await axiosClient.get(`/tournaments/${id}/teams`);
        if (res.success) setTeamsData(res.data);
      }
      
      if (activeTab === 'bracket' && (tournament.status === 'IN_PROGRESS' || tournament.status === 'COMPLETED')) {
        if (tournament.format === 'ROUND_ROBIN') {
          const res = await axiosClient.get(`/tournaments/${id}/standings`);
          if (res.success) setStandingsData(res.data);
        } else {
          const res = await axiosClient.get(`/tournaments/${id}/bracket`);
          if (res.success) setBracketData(res.data);
        }
      }
      
      if (activeTab === 'matches') {
        const res = await axiosClient.get(`/tournaments/${id}/matches`);
        if (res.success) setMatchesData(res.data);
      }
    } catch (error) {
      console.error(`Failed to fetch data for tab ${activeTab}:`, error);
    }
  }, [id, activeTab, tournament]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  if (loading) return <LoadingSpinner size={48} />;
  if (!tournament) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Tournament not found</div>;

  const isPlayer = user && user.role === 'PLAYER';
  const showBracketTab = tournament.status === TOURNAMENT_STATUS.IN_PROGRESS || tournament.status === TOURNAMENT_STATUS.COMPLETED;

  const getFormatDisplay = (format) => {
    switch (format) {
      case 'SINGLE_ELIMINATION': return 'Single Elimination';
      case 'DOUBLE_ELIMINATION': return 'Double Elimination';
      case 'ROUND_ROBIN': return 'Round Robin';
      default: return format;
    }
  };

  const handleRegisterClick = () => {
    setIsRegistrationOpen(true);
  };

  const handleRegistrationSuccess = () => {
    setIsRegistrationOpen(false);
    fetchTournament(); // refresh tournament details (e.g. registered count)
    if (activeTab === 'overview' || activeTab === 'teams') fetchTabData();
  };

  return (
    <div className="container">
      {/* Header Section */}
      <div style={{
        background: 'var(--card-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        marginBottom: '32px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-main)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Badge status={tournament.status} />
              <Badge status="default" text={getFormatDisplay(tournament.format)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Trophy size={14} /> {tournament.game || 'Any Game'}
              </div>
            </div>
            
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{tournament.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Organized by <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{tournament.createdByUsername}</span>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Participants</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                <Users size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                {tournament.registeredTeamsCount} / {tournament.maxParticipants}
              </div>
            </div>
            
            {tournament.status === TOURNAMENT_STATUS.REGISTRATION_OPEN && isPlayer && (
              <Button variant="primary" style={{ padding: '12px 24px', fontSize: '1.05rem' }} onClick={handleRegisterClick}>
                Register Now
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>Registration Progress</span>
            <span>{Math.round((tournament.registeredTeamsCount / tournament.maxParticipants) * 100)}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--accent-start), var(--accent-end))',
              width: `${Math.min(100, (tournament.registeredTeamsCount / tournament.maxParticipants) * 100)}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '32px', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{ 
            padding: '12px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: '1.05rem', fontWeight: activeTab === 'overview' ? 600 : 400,
            color: activeTab === 'overview' ? 'var(--accent-start)' : 'var(--text-muted)',
            borderBottom: activeTab === 'overview' ? '2px solid var(--accent-start)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Overview
        </button>
        {showBracketTab && (
          <button 
            onClick={() => setActiveTab('bracket')}
            style={{ 
              padding: '12px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: '1.05rem', fontWeight: activeTab === 'bracket' ? 600 : 400,
              color: activeTab === 'bracket' ? 'var(--accent-start)' : 'var(--text-muted)',
              borderBottom: activeTab === 'bracket' ? '2px solid var(--accent-start)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Bracket
          </button>
        )}
        <button 
          onClick={() => setActiveTab('matches')}
          style={{ 
            padding: '12px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: '1.05rem', fontWeight: activeTab === 'matches' ? 600 : 400,
            color: activeTab === 'matches' ? 'var(--accent-start)' : 'var(--text-muted)',
            borderBottom: activeTab === 'matches' ? '2px solid var(--accent-start)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Matches
        </button>
        <button 
          onClick={() => setActiveTab('teams')}
          style={{ 
            padding: '12px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: '1.05rem', fontWeight: activeTab === 'teams' ? 600 : 400,
            color: activeTab === 'teams' ? 'var(--accent-start)' : 'var(--text-muted)',
            borderBottom: activeTab === 'teams' ? '2px solid var(--accent-start)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Teams
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '400px' }}>
        
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Description</h3>
              <div style={{ color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {tournament.description || 'No description provided.'}
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--card-color)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={20} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registration</div>
                    <div style={{ fontWeight: 500 }}>
                      {formatDate(tournament.registrationStartAt)} <br/>to {formatDate(tournament.registrationEndAt)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle size={20} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tournament Dates</div>
                    <div style={{ fontWeight: 500 }}>
                      {formatDate(tournament.startAt)} <br/>to {formatDate(tournament.endAt)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Users size={20} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Team Requirements</div>
                    <div style={{ fontWeight: 500 }}>Min: {tournament.minParticipants} / Max: {tournament.maxParticipants}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BRACKET */}
        {activeTab === 'bracket' && (
          <div>
            {tournament.format === 'ROUND_ROBIN' ? (
              <StandingsTable standings={standingsData} />
            ) : (
              <BracketView bracket={bracketData} />
            )}
          </div>
        )}

        {/* TAB: MATCHES */}
        {activeTab === 'matches' && (
          <div>
            {matchesData.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No matches available yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {matchesData.map(match => (
                  <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-color)', padding: '16px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 1, textAlign: 'right', fontWeight: match.winner?.id === match.team1?.id ? 700 : 400, color: match.winner?.id === match.team1?.id ? 'var(--accent-start)' : 'var(--text-main)' }}>
                      {match.team1?.name || 'TBD'}
                    </div>
                    <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                        {match.score1 ?? '-'} : {match.score2 ?? '-'}
                      </div>
                      <Badge status={match.status} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left', fontWeight: match.winner?.id === match.team2?.id ? 700 : 400, color: match.winner?.id === match.team2?.id ? 'var(--accent-start)' : 'var(--text-main)' }}>
                      {match.status === 'BYE' ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>BYE</span> : (match.team2?.name || 'TBD')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: TEAMS */}
        {activeTab === 'teams' && (
          <div>
            {teamsData.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No teams have joined yet.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {teamsData.map(team => (
                  <TeamCard key={team.id} team={team} onClick={() => setSelectedTeamId(team.id)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTeamModal 
        isOpen={isCreateTeamOpen} 
        onClose={() => setIsCreateTeamOpen(false)} 
        tournamentId={id}
        onSuccess={() => {
          setIsCreateTeamOpen(false);
          setIsRegistrationOpen(true);
        }}
      />
      
      <RegistrationModal 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)}
        tournamentId={id}
        onSuccess={handleRegistrationSuccess}
        onCreateNewTeam={() => {
          setIsRegistrationOpen(false);
          setIsCreateTeamOpen(true);
        }}
      />

      <TeamDetailModal 
        isOpen={!!selectedTeamId}
        onClose={() => setSelectedTeamId(null)}
        teamId={selectedTeamId}
        onUpdate={fetchTabData}
      />

    </div>
  );
}
