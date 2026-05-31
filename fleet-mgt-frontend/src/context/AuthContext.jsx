import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Restore user optimistically for instant first render
    const saved = localStorage.getItem('user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem('user'); }
    }

    // Verify session (cookie mode) or Bearer token (cross-domain mode)
    api.get('/me')
      .then(res => {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  // accessToken is optional — present in cross-domain (production) mode
  const login = (userData, accessToken = null) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (accessToken) {
      sessionStorage.setItem('token', accessToken);
    }
    navigate('/dashboard', { replace: true });
  };

  const logout = async () => {
    try { await api.post('/logout'); } catch { /* ignore */ }
    setUser(null);
    localStorage.clear();
    sessionStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <div
          className="spinner-border text-white mb-3"
          role="status"
          style={{ width: '3rem', height: '3rem' }}
        >
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="text-white fw-semibold">Chargement de l'application...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
