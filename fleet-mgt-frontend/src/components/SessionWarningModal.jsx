import React, { useState, useEffect } from 'react';
import { WARNING_MS } from '../hooks/useInactivityTimer';

export default function SessionWarningModal({ visible, onStay, onLogout }) {
  const [seconds, setSeconds] = useState(Math.floor(WARNING_MS / 1000));

  useEffect(() => {
    if (!visible) { setSeconds(Math.floor(WARNING_MS / 1000)); return; }
    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, '0');
  const countdown = mins > 0 ? `${mins}:${secs}` : `${seconds}s`;
  const urgent = seconds <= 30;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '2rem 2.5rem',
        maxWidth: '420px', width: '100%', textAlign: 'center',
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        animation: 'fadeInUp 0.25s ease-out',
      }}>
        {/* Icône */}
        <div style={{
          width: '68px', height: '68px', borderRadius: '50%', margin: '0 auto 1.25rem',
          background: urgent ? 'linear-gradient(135deg,#fee2e2,#fecaca)' : 'linear-gradient(135deg,#fff7ed,#fed7aa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
          boxShadow: `0 8px 20px ${urgent ? 'rgba(220,38,38,0.2)' : 'rgba(234,88,12,0.2)'}`,
          transition: 'all 0.3s',
        }}>
          {urgent ? '⚠️' : '⏱️'}
        </div>

        <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.5rem' }}>
          Session sur le point d'expirer
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Vous avez été inactif un moment. Votre session se fermera automatiquement dans :
        </p>

        {/* Compte à rebours */}
        <div style={{
          fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1.75rem',
          color: urgent ? '#dc2626' : '#ea580c',
          transition: 'color 0.3s',
        }}>
          {countdown}
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onStay}
            style={{
              flex: 1, padding: '0.72rem', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(102,126,234,0.4)',
            }}
          >
            ✓ Rester connecté
          </button>
          <button
            onClick={onLogout}
            style={{
              flex: 1, padding: '0.72rem', borderRadius: '10px',
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
