import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TournamentListPage from './pages/TournamentListPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import CreateTournamentPage from './pages/CreateTournamentPage';
import OrganizerDashboard from './pages/OrganizerDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--card-color)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)'
          },
          success: {
            iconTheme: {
              primary: 'var(--status-green)',
              secondary: 'var(--bg-color)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--status-red)',
              secondary: 'var(--bg-color)',
            },
          },
        }}
      />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/tournaments" element={<TournamentListPage />} />
            <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
            
            <Route path="/tournaments/new" element={
              <RoleRoute roles={['ORGANIZER', 'ADMIN']}>
                <CreateTournamentPage />
              </RoleRoute>
            } />
            
            <Route path="/dashboard" element={
              <RoleRoute roles={['ORGANIZER', 'ADMIN']}>
                <OrganizerDashboard />
              </RoleRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
