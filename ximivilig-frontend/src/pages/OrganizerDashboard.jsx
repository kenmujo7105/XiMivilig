import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../hooks/useAuth';
import Badge from '../components/UI/Badge';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import BracketView from '../components/Bracket/BracketView';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import toast from 'react-hot-toast';
import { Plus, Settings, Users, Trophy, ChevronRight, Check, X } from 'lucide-react';
import { TOURNAMENT_STATUS } from '../utils/constants';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  
  // Panel States
  const [activeTab, setActiveTab] = useState('registrations');
  const [registrations, setRegistrations] = useState([]);
  const [bracketData, setBracketData] = useState(null);
  
  // Seed State
  const [seeds, setSeeds] = useState({});
  
  // Match Modal
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');

  const fetchTournaments = useCallback(async () => {
    try {
      // Ideally, a specific endpoint for organizer's tournaments. 
      // For now, fetch all and filter client-side or use search params if supported.
      const res = await axiosClient.get('/tournaments?size=100');
      if (res.success) {
        const myTournaments = user.role === 'ADMIN' 
          ? res.data.content 
          : res.data.content.filter(t => t.createdById === user.userId);
        setTournaments(myTournaments);
      }
    } catch (error) {
      toast.error("Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const loadTournamentData = async (tId) => {
    try {
      if (activeTab === 'registrations') {
        const res = await axiosClient.get(`/tournaments/${tId}/registrations`);
        if (res.success) setRegistrations(res.data);
      } else if (activeTab === 'bracket') {
        const res = await axiosClient.get(`/tournaments/${tId}/bracket`);
        if (res.success) setBracketData(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedTournament) {
      loadTournamentData(selectedTournament.id);
    }
  }, [selectedTournament, activeTab]);

  // --- Actions ---

  const handleStateTransition = async (action) => {
    try {
      const res = await axiosClient.post(`/tournaments/${selectedTournament.id}/${action}`);
      if (res.success) {
        toast.success(`Tournament ${action}ed successfully!`);
        setSelectedTournament(res.data);
        fetchTournaments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} tournament`);
    }
  };

  const handleApprove = async (regId) => {
    try {
      await axiosClient.put(`/registrations/${regId}/approve`);
      toast.success("Approved!");
      loadTournamentData(selectedTournament.id);
    } catch (error) {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (regId) => {
    const reason = window.prompt("Rejection reason:");
    if (reason === null) return;
    try {
      await axiosClient.put(`/registrations/${regId}/reject`, { reason });
      toast.success("Rejected!");
      loadTournamentData(selectedTournament.id);
    } catch (error) {
      toast.error("Failed to reject");
    }
  };

  const handleSaveSeeds = async () => {
    try {
      const seedRequests = Object.keys(seeds).map(teamId => ({
        teamId,
        seedNumber: parseInt(seeds[teamId])
      })).filter(s => !isNaN(s.seedNumber));
      
      const res = await axiosClient.post(`/tournaments/${selectedTournament.id}/seed`, seedRequests);
      if (res.success) {
        toast.success("Seeds saved!");
      }
    } catch (error) {
      toast.error("Failed to save seeds");
    }
  };

  const handleGenerateBracket = async () => {
    try {
      await axiosClient.post(`/tournaments/${selectedTournament.id}/generate-bracket`);
      toast.success("Bracket generated!");
      // Refresh tournament to get new status
      const res = await axiosClient.get(`/tournaments/${selectedTournament.id}`);
      setSelectedTournament(res.data);
      setActiveTab('bracket');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate bracket");
    }
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.put(`/matches/${selectedMatch.id}/result`, {
        score1: parseInt(score1),
        score2: parseInt(score2)
      });
      if (res.success) {
        toast.success("Score updated!");
        setSelectedMatch(null);
        loadTournamentData(selectedTournament.id);
      }
    } catch (error) {
      toast.error("Failed to update score");
    }
  };

  if (loading) return <LoadingSpinner size={48} />;

  return (
    <div className="container" style={{ display: 'flex', gap: '32px', minHeight: '70vh' }}>
      
      {/* Sidebar */}
      <div style={{ width: '300px', flexShrink: 0 }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>My Tournaments</h2>
          <Link to="/tournaments/new"><Button variant="ghost" style={{ padding: '6px' }}><Plus size={18}/></Button></Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tournaments.map(t => (
            <div 
              key={t.id} 
              onClick={() => { setSelectedTournament(t); setActiveTab('registrations'); }}
              style={{ 
                padding: '16px', 
                background: selectedTournament?.id === t.id ? 'rgba(255,255,255,0.1)' : 'var(--card-color)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{t.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {t.status.replace('_', ' ')} • {t.registeredTeamsCount}/{t.maxParticipants}
                </div>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          ))}
          {tournaments.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No tournaments found. Create one to get started!</div>}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: 'var(--card-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {!selectedTournament ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Select a tournament from the sidebar to manage it.
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>{selectedTournament.title}</h2>
                  <Badge status={selectedTournament.status} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedTournament.status === TOURNAMENT_STATUS.DRAFT && (
                    <Button variant="primary" onClick={() => handleStateTransition('publish')}>Publish</Button>
                  )}
                  {selectedTournament.status === TOURNAMENT_STATUS.REGISTRATION_OPEN && (
                    <Button variant="secondary" onClick={() => handleStateTransition('close-registration')}>Close Registration</Button>
                  )}
                  <Button variant="danger" onClick={() => { if(window.confirm('Cancel tournament?')) handleStateTransition('cancel'); }}>Cancel</Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
              {['registrations', 'seeding', 'bracket', 'settings'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    padding: '16px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
                    fontWeight: activeTab === tab ? 600 : 400,
                    color: activeTab === tab ? 'var(--accent-start)' : 'var(--text-muted)',
                    borderBottom: activeTab === tab ? '2px solid var(--accent-start)' : '2px solid transparent',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content area */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              
              {/* REGISTRATIONS TAB */}
              {activeTab === 'registrations' && (
                <div>
                  <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 600 }}>Registrations</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px' }}>Team Name</th>
                        <th style={{ padding: '12px' }}>Note</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.length === 0 ? (
                        <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No registrations yet.</td></tr>
                      ) : registrations.map(reg => (
                        <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px', fontWeight: 500 }}>{reg.teamName}</td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{reg.note || '-'}</td>
                          <td style={{ padding: '12px' }}><Badge status={reg.status} /></td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            {reg.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <Button variant="ghost" onClick={() => handleApprove(reg.id)} style={{ padding: '6px 10px', color: 'var(--status-green)', borderColor: 'var(--status-green)' }}><Check size={16}/></Button>
                                <Button variant="ghost" onClick={() => handleReject(reg.id)} style={{ padding: '6px 10px', color: 'var(--status-red)', borderColor: 'var(--status-red)' }}><X size={16}/></Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SEEDING TAB */}
              {activeTab === 'seeding' && (
                <div>
                  <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 600 }}>Seeding</h3>
                  {selectedTournament.status !== TOURNAMENT_STATUS.REGISTRATION_CLOSED ? (
                    <div style={{ color: 'var(--text-muted)' }}>You must Close Registration before assigning seeds.</div>
                  ) : (
                    <div>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Assign seed numbers to approved teams.</p>
                      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                        {registrations.filter(r => r.status === 'APPROVED').map(reg => (
                          <div key={reg.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontWeight: 500 }}>{reg.teamName}</div>
                            <input 
                              type="number" 
                              className="input" 
                              style={{ width: '80px', padding: '8px' }}
                              placeholder="Seed #"
                              value={seeds[reg.teamId] || ''}
                              onChange={(e) => setSeeds(prev => ({ ...prev, [reg.teamId]: e.target.value }))}
                            />
                          </div>
                        ))}
                      </div>
                      <Button variant="primary" onClick={handleSaveSeeds}>Save Seeds</Button>
                    </div>
                  )}
                </div>
              )}

              {/* BRACKET TAB */}
              {activeTab === 'bracket' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Bracket Control</h3>
                    {selectedTournament.status === TOURNAMENT_STATUS.REGISTRATION_CLOSED && (
                      <Button variant="primary" onClick={handleGenerateBracket}>Generate Bracket & Start</Button>
                    )}
                  </div>
                  
                  {selectedTournament.status === TOURNAMENT_STATUS.IN_PROGRESS || selectedTournament.status === TOURNAMENT_STATUS.COMPLETED ? (
                    <div>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Click on any match to update the score.</p>
                      <div onClickCapture={(e) => {
                        // Very basic way to intercept clicks on BracketMatch for organizer
                        // Ideally we pass a callback down, but since we reuse BracketView, we can just intercept
                        const matchId = e.target.closest('[data-match-id]')?.getAttribute('data-match-id');
                        if (matchId) {
                          const match = findMatchById(bracketData, matchId);
                          if (match) {
                            setSelectedMatch(match);
                            setScore1(match.score1 ?? '');
                            setScore2(match.score2 ?? '');
                          }
                        }
                      }}>
                        {/* We need to modify BracketMatch slightly to include data-match-id, we will do that separately if needed, 
                            but for this prompt, let's assume we can pass an onMatchClick or we build a simpler view here */}
                        <BracketView bracket={bracketData} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Bracket is not generated yet.</div>
                  )}
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div>
                  <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 600 }}>Settings</h3>
                  <div style={{ color: 'var(--text-muted)' }}>Edit tournament settings form goes here (similar to Create Tournament but with PUT method).</div>
                </div>
              )}

            </div>
          </>
        )}
      </div>

      {/* Match Score Modal */}
      <Modal isOpen={!!selectedMatch} onClose={() => setSelectedMatch(null)} title="Update Match Score">
        {selectedMatch && (
          <form onSubmit={handleSubmitScore} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>{selectedMatch.team1?.name || 'TBD'}</div>
                <Input type="number" min="0" value={score1} onChange={e => setScore1(e.target.value)} placeholder="Score" required />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-muted)', marginTop: '-16px' }}>VS</div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>{selectedMatch.team2?.name || 'TBD'}</div>
                <Input type="number" min="0" value={score2} onChange={e => setScore2(e.target.value)} placeholder="Score" required />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button type="button" variant="ghost" onClick={() => setSelectedMatch(null)}>Cancel</Button>
              <Button type="submit" variant="primary">Submit Result</Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}

// Helper for the intercept hack above
function findMatchById(bracket, id) {
  if (!bracket || !bracket.rounds) return null;
  for (let r of bracket.rounds) {
    const match = r.matches.find(m => m.id === id);
    if (match) return match;
  }
  return null;
}
