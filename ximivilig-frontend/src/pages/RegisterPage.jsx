import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Mail, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { ROLE_PLAYER, ROLE_ORGANIZER } from '../utils/constants';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: ROLE_PLAYER 
  });
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/tournaments';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.username.length < 3 || formData.username.length > 50) {
      toast.error('Username must be between 3 and 50 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const success = await register(formData);
    setIsLoading(false);

    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join XiMivilig to manage tournaments</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <User size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '12px' }} />
            <input 
              className="input" 
              style={{ paddingLeft: '48px' }}
              type="text" 
              name="username" 
              placeholder="Username" 
              value={formData.username} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '12px' }} />
            <input 
              className="input" 
              style={{ paddingLeft: '48px' }}
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '12px' }} />
            <input 
              className="input" 
              style={{ paddingLeft: '48px' }}
              type="password" 
              name="password" 
              placeholder="Password (min 8 chars)" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Shield size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '12px' }} />
            <select 
              className="select" 
              style={{ paddingLeft: '48px', appearance: 'none' }}
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
            >
              <option value={ROLE_PLAYER}>I am a Player</option>
              <option value={ROLE_ORGANIZER}>I am an Organizer</option>
            </select>
          </div>

          <Button type="submit" variant="primary" disabled={isLoading} style={{ width: '100%', marginTop: '8px' }}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-start)', fontWeight: 500 }}>
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
