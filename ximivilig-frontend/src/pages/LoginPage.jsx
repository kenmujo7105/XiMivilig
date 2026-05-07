import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/tournaments';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;

    setIsLoading(true);
    const success = await login(formData.username, formData.password);
    setIsLoading(false);

    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to continue to XiMivilig</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <User size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '12px' }} />
            <input 
              className="input" 
              style={{ paddingLeft: '48px' }}
              type="text" 
              name="username" 
              placeholder="Username or Email" 
              value={formData.username} 
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
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <Button type="submit" variant="primary" disabled={isLoading} style={{ width: '100%', marginTop: '8px' }}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-start)', fontWeight: 500 }}>
            Register
          </Link>
        </div>
      </Card>
    </div>
  );
}
