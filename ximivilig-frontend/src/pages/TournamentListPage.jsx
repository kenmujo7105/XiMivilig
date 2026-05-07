import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import TournamentCard from '../components/TournamentCard';
import Pagination from '../components/UI/Pagination';
import EmptyState from '../components/UI/EmptyState';
import { Search, Filter } from 'lucide-react';
import { TOURNAMENT_STATUS } from '../utils/constants';

export default function TournamentListPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [format, setFormat] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset to page 0 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data
  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '12'
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (status) params.append('status', status);
      if (format) params.append('format', format);

      const response = await axiosClient.get(`/tournaments?${params.toString()}`);
      if (response.success) {
        setTournaments(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch tournaments:", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, format]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return (
    <div className="container">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Tournaments</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Find and join upcoming tournaments or watch ongoing ones.</p>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '16px', 
        marginBottom: '32px',
        background: 'var(--card-color)',
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '13px' }} />
          <input
            className="input"
            style={{ paddingLeft: '44px' }}
            placeholder="Search tournaments by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', flex: '1 1 auto' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Filter size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
            <select 
              className="select" 
              style={{ paddingLeft: '44px', appearance: 'none' }}
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            >
              <option value="">All Statuses</option>
              {Object.keys(TOURNAMENT_STATUS).map(key => (
                <option key={key} value={key}>{key.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <select 
              className="select" 
              value={format} 
              onChange={(e) => { setFormat(e.target.value); setPage(0); }}
            >
              <option value="">All Formats</option>
              <option value="SINGLE_ELIMINATION">Single Elimination</option>
              <option value="DOUBLE_ELIMINATION">Double Elimination</option>
              <option value="ROUND_ROBIN">Round Robin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="shimmer card" style={{ height: '220px', border: 'none' }} />
          ))}
        </div>
      ) : tournaments.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {tournaments.map(t => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
          <Pagination 
            pageNumber={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        </>
      ) : (
        <EmptyState message="No tournaments found matching your filters." />
      )}
    </div>
  );
}
