import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import toast from 'react-hot-toast';

export default function CreateTournamentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: '',
    format: 'SINGLE_ELIMINATION',
    maxParticipants: 16,
    minParticipants: 2,
    registrationStartAt: '',
    registrationEndAt: '',
    startAt: '',
    endAt: '',
    isPublic: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert datetime strings to ISO format required by backend if needed, 
      // but usually standard HTML datetime-local matches Spring's LocalDateTime if formatted properly
      const payload = {
        ...formData,
        registrationStartAt: formData.registrationStartAt ? new Date(formData.registrationStartAt).toISOString() : null,
        registrationEndAt: formData.registrationEndAt ? new Date(formData.registrationEndAt).toISOString() : null,
        startAt: formData.startAt ? new Date(formData.startAt).toISOString() : null,
        endAt: formData.endAt ? new Date(formData.endAt).toISOString() : null,
      };

      const res = await axiosClient.post('/tournaments', payload);
      if (res.success) {
        toast.success("Tournament created successfully!");
        navigate(`/dashboard`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create tournament.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Create Tournament</h1>
        <p style={{ color: 'var(--text-muted)' }}>Set up your new tournament and start accepting registrations.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input label="Tournament Title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Description</label>
              <textarea className="textarea" name="description" rows={4} value={formData.description} onChange={handleChange} />
            </div>

            <Input label="Game (e.g., League of Legends)" name="game" value={formData.game} onChange={handleChange} />
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Format</label>
              <select className="select" name="format" value={formData.format} onChange={handleChange}>
                <option value="SINGLE_ELIMINATION">Single Elimination</option>
                <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                <option value="ROUND_ROBIN">Round Robin</option>
              </select>
            </div>

            <Input label="Max Participants" type="number" min="2" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} required />
            <Input label="Min Participants" type="number" min="2" name="minParticipants" value={formData.minParticipants} onChange={handleChange} required />

            <Input label="Registration Start" type="datetime-local" name="registrationStartAt" value={formData.registrationStartAt} onChange={handleChange} required />
            <Input label="Registration End" type="datetime-local" name="registrationEndAt" value={formData.registrationEndAt} onChange={handleChange} required />

            <Input label="Tournament Start" type="datetime-local" name="startAt" value={formData.startAt} onChange={handleChange} required />
            <Input label="Tournament End" type="datetime-local" name="endAt" value={formData.endAt} onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="isPublic" name="isPublic" checked={formData.isPublic} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
            <label htmlFor="isPublic" style={{ fontSize: '0.95rem' }}>Make this tournament public (visible on the home page)</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Tournament'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
