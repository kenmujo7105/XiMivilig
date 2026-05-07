import React, { useState } from 'react';
import Modal from './UI/Modal';
import Input from './UI/Input';
import Button from './UI/Button';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export default function CreateTeamModal({ isOpen, onClose, tournamentId, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', logoUrl: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    try {
      const res = await axiosClient.post(`/tournaments/${tournamentId}/teams`, formData);
      if (res.success) {
        toast.success("Team created successfully!");
        onSuccess(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create team.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Team">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input 
          label="Team Name" 
          name="name" 
          placeholder="Enter team name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
        />
        <Input 
          label="Logo URL (Optional)" 
          name="logoUrl" 
          placeholder="https://..." 
          value={formData.logoUrl} 
          onChange={handleChange} 
        />
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Description (Optional)</label>
          <textarea 
            className="textarea" 
            name="description" 
            placeholder="Tell us about your team..." 
            rows={3}
            value={formData.description} 
            onChange={handleChange} 
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Team'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
