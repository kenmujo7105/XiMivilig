import React, { useState } from 'react';
import Modal from './UI/Modal';
import Button from './UI/Button';
import Input from './UI/Input';
import Badge from './UI/Badge';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Trash2, UserPlus } from 'lucide-react';

export default function TeamDetailModal({ isOpen, onClose, teamId, onUpdate }) {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMemberId, setNewMemberId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && teamId) {
      const fetchTeam = async () => {
        setLoading(true);
        try {
          const res = await axiosClient.get(`/teams/${teamId}`);
          if (res.success) setTeam(res.data);
        } catch (error) {
          toast.error("Failed to load team details");
        } finally {
          setLoading(false);
        }
      };
      fetchTeam();
    }
  }, [isOpen, teamId]);

  const isCaptain = user && team && user.userId === team.captainId;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberId) return;

    setActionLoading(true);
    try {
      const res = await axiosClient.post(`/teams/${teamId}/members/${newMemberId}`);
      if (res.success) {
        toast.success("Member added!");
        setTeam(res.data);
        setNewMemberId('');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    
    setActionLoading(true);
    try {
      const res = await axiosClient.delete(`/teams/${teamId}/members/${userId}`);
      if (res.success) {
        toast.success("Member removed!");
        // Optimistic update
        setTeam(prev => ({
          ...prev,
          members: prev.members.filter(m => m.userId !== userId)
        }));
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      toast.error("Failed to remove member");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Team Details">
      {loading || !team ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {team.logoUrl ? <img src={team.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{team.name.charAt(0)}</span>}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{team.name}</h2>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <Badge status={team.registrationStatus} />
                {team.seedNumber && <Badge status="default" text={`Seed #${team.seedNumber}`} />}
              </div>
            </div>
          </div>

          {team.description && (
            <div style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {team.description}
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>Roster ({team.members?.length || 0})</h3>
            <div style={{ background: 'var(--surface-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              {team.members?.map(member => (
                <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{member.username}</span>
                    {member.userId === team.captainId && <Badge status="default" text="Captain" />}
                  </div>
                  {isCaptain && member.userId !== team.captainId && (
                    <button onClick={() => handleRemoveMember(member.userId)} disabled={actionLoading} style={{ background: 'transparent', border: 'none', color: 'var(--status-red)', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isCaptain && (
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>Add Member</h4>
              <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <input 
                    className="input" 
                    placeholder="User ID (UUID format)" 
                    value={newMemberId}
                    onChange={e => setNewMemberId(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="secondary" disabled={actionLoading} style={{ padding: '0 16px' }}>
                  <UserPlus size={18} />
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
