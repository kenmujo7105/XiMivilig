import React, { useState, useEffect } from 'react';
import Modal from './UI/Modal';
import Button from './UI/Button';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function RegistrationModal({ isOpen, onClose, tournamentId, onSuccess, onCreateNewTeam }) {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUserTeams = async () => {
        setLoading(true);
        try {
          const res = await axiosClient.get(`/tournaments/${tournamentId}/teams`);
          if (res.success) {
            // Filter teams where user is captain
            const myTeams = res.data.filter(t => t.captainId === user?.userId);
            setTeams(myTeams);
            if (myTeams.length > 0) setSelectedTeamId(myTeams[0].id);
          }
        } catch (error) {
          console.error("Failed to fetch teams", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserTeams();
    }
  }, [isOpen, tournamentId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) return;

    setSubmitting(true);
    try {
      const res = await axiosClient.post(`/tournaments/${tournamentId}/register`, {
        teamId: selectedTeamId,
        note: note
      });
      if (res.success) {
        toast.success("Registration submitted! Waiting for approval.");
        onSuccess(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register for Tournament">
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading teams...</div>
      ) : teams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>You haven't created any teams for this tournament yet.</p>
          <Button variant="primary" onClick={onCreateNewTeam}>Create a Team</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Select Team</label>
            <select 
              className="select" 
              value={selectedTeamId} 
              onChange={(e) => setSelectedTeamId(e.target.value)}
              required
            >
              <option value="" disabled>Select your team</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Message to Organizer (Optional)</label>
            <textarea 
              className="textarea" 
              rows={3}
              placeholder="e.g., We are available after 5 PM."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <Button type="button" variant="ghost" onClick={onCreateNewTeam} style={{ fontSize: '0.85rem' }}>+ Create another team</Button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={submitting || !selectedTeamId}>
                {submitting ? 'Submitting...' : 'Register'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
