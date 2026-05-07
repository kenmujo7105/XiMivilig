import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/UI/Button';
import TournamentCard from '../components/TournamentCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

export default function HomePage() {
  const { user } = useAuth();
  const [featuredTournaments, setFeaturedTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axiosClient.get('/tournaments?size=3&status=REGISTRATION_OPEN');
        if (response.success && response.data.content) {
          setFeaturedTournaments(response.data.content);
        }
      } catch (error) {
        console.error("Failed to fetch featured tournaments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const isOrganizer = user && (user.role === 'ORGANIZER' || user.role === 'ADMIN');

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '100px 24px',
        textAlign: 'center',
        background: 'linear-gradient(to bottom, rgba(26,26,46,0.8), var(--bg-color))',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract background blobs could go here */}
        <div style={{
          position: 'absolute', top: '-100px', left: '20%', width: '300px', height: '300px', 
          background: 'var(--accent-start)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: '-50px', right: '10%', width: '400px', height: '400px', 
          background: 'var(--secondary-start)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 800, 
            marginBottom: '24px',
            background: 'linear-gradient(to right, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2
          }}>
            Organize. Compete. Conquer.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 40px' }}>
            The ultimate platform to host, manage, and participate in esports and sports tournaments. Experience seamless bracket management and live updates.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tournaments">
              <Button variant="primary" style={{ padding: '14px 28px', fontSize: '1.1rem' }}>
                Browse Tournaments
              </Button>
            </Link>
            {isOrganizer && (
              <Link to="/tournaments/new">
                <Button variant="ghost" style={{ padding: '14px 28px', fontSize: '1.1rem' }}>
                  Create Tournament
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="container" style={{ padding: '60px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Featured Tournaments</h2>
            <p style={{ color: 'var(--text-muted)' }}>Join these open tournaments before they start.</p>
          </div>
          <Link to="/tournaments" style={{ color: 'var(--accent-start)', fontWeight: 500 }}>View All</Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer card" style={{ height: '220px', border: 'none' }} />
            ))}
          </div>
        ) : featuredTournaments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {featuredTournaments.map(t => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p>No featured tournaments available at the moment.</p>
          </div>
        )}
      </section>
    </div>
  );
}
