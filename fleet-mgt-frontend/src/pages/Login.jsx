import React, { useState, useEffect } from 'react';
import api from '../axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import logoCI from '../assets/logo-ci.png';
import carImg from '../assets/voiture.jpg';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (isBlocked && blockEndTime) {
      const interval = setInterval(() => {
        const diff = Math.max(0, Math.floor((blockEndTime - new Date()) / 1000));
        setRemainingTime(diff);
        if (diff === 0) { setIsBlocked(false); setBlockEndTime(null); setRemainingAttempts(3); setError(''); }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isBlocked, blockEndTime]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = e => {
    setCredentials(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/login', credentials);
      login(res.data.user, res.data.access_token);
      setRemainingAttempts(3);
    } catch (err) {
      const d      = err.response?.data;
      const code   = d?.code;

      if (code === 'ACCOUNT_BLOCKED') {
        setIsBlocked(true);
        const seconds = d.remaining_seconds || 300;
        setRemainingTime(Math.round(seconds));
        setBlockEndTime(new Date(Date.now() + seconds * 1000));
        setError(d.message);
      } else if (code === 'ACCOUNT_DELETED') {
        setShowDeleteModal(true);
      } else if (code === 'INVALID_PASSWORD') {
        const left = d.remaining_attempts ?? (remainingAttempts - 1);
        setRemainingAttempts(left);
        setError(d.message || `Mot de passe incorrect. Il vous reste ${left} tentative(s).`);
      } else if (!err.response) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
      } else {
        setError(d?.message || 'Email ou mot de passe incorrect.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: '100%', background: '#f8faff',
    border: '1.5px solid #e2e8f0', borderRadius: '10px',
    padding: '0.65rem 0.95rem', fontSize: '0.92rem', color: '#1e293b',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s',
  };
  const inpFocus = { borderColor: '#0d6efd' };
  const inpBlur  = { borderColor: '#e2e8f0' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>

      {/* Left — image panel */}
      <div className="d-none d-lg-flex" style={{ flex: '1.1', position: 'relative', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <img src={carImg} alt="Fleet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(0,20,50,0.55) 0%, rgba(0,10,30,0.82) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '3rem' }}>
          <img src={logoCI} alt="CI" style={{ height: '52px', marginBottom: '1.5rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }} />
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Gestion de Flotte<br />Véhicule
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.95rem', maxWidth: '360px', lineHeight: 1.65, marginBottom: '2rem' }}>
            Suivez, planifiez et optimisez votre parc automobile — tout en un seul espace.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '340px' }}>
            {[
              { icon: '🚗', text: 'Suivi en temps réel de vos véhicules' },
              { icon: '⛽', text: 'Analyse de la consommation carburant' },
              { icon: '🔧', text: 'Maintenance planifiée & historique' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.12)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</div>
                <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.88rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, minWidth: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ width: '100%', maxWidth: '400px' }}>

          {/* Mobile logo */}
          <div className="d-flex d-lg-none justify-content-center mb-4">
            <img src={logoCI} alt="CI" style={{ height: '44px' }} />
          </div>

          {/* Language toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', gap: '0.4rem' }}>
            {['fr', 'en'].map(lang => (
              <button key={lang} onClick={() => i18n.changeLanguage(lang)}
                style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                  background: i18n.language === lang ? '#0d6efd' : 'transparent',
                  color:      i18n.language === lang ? '#fff'    : '#64748b',
                  borderColor: i18n.language === lang ? '#0d6efd' : '#e2e8f0',
                }}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <h2 style={{ fontWeight: 800, fontSize: '1.55rem', color: '#0f172a', marginBottom: '0.4rem' }}>{t('login.welcome')}</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '2rem' }}>{t('login.subtitle')}</p>

          {/* Blocked alert */}
          {isBlocked && (
            <div style={{ background: '#fff0f0', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '1.1rem', marginBottom: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🔒</div>
              <strong style={{ color: '#dc2626', display: 'block', marginBottom: '0.3rem' }}>{t('login.blocked_title')}</strong>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>{formatTime(remainingTime)}</div>
              <small style={{ color: '#94a3b8' }}>{t('login.blocked_remaining')}</small>
            </div>
          )}

          {/* Error */}
          {error && !isBlocked && (
            <div style={{ background: '#fff0f0', border: '1.5px solid #fca5a5', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#dc2626', fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#dc2626' }}>{t('login.error_title')}</strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#7f1d1d' }}>{error}</p>
                {remainingAttempts < 3 && remainingAttempts > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < remainingAttempts ? '#16a34a' : '#dc2626' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('login.email_label')}</label>
              <input type="email" name="email" value={credentials.email} onChange={handleChange}
                placeholder="exemple@ci.org" disabled={loading || isBlocked} required
                style={inp} onFocus={e => Object.assign(e.target.style, inpFocus)} onBlur={e => Object.assign(e.target.style, inpBlur)} />
            </div>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('login.password_label')}</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} name="password" value={credentials.password} onChange={handleChange}
                  placeholder="••••••••" disabled={loading || isBlocked} required
                  style={{ ...inp, paddingRight: '2.8rem' }}
                  onFocus={e => Object.assign(e.target.style, inpFocus)} onBlur={e => Object.assign(e.target.style, inpBlur)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading || isBlocked}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#94a3b8' }}>
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || isBlocked} style={{
              width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none', cursor: loading || isBlocked ? 'not-allowed' : 'pointer',
              background: isBlocked ? '#94a3b8' : 'linear-gradient(135deg, #0d6efd, #0b5ed7)',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
              boxShadow: isBlocked ? 'none' : '0 4px 16px rgba(13,110,253,0.4)',
              transition: 'opacity 0.2s',
            }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />{t('login.signing_in')}</> :
               isBlocked ? t('login.account_locked') : t('login.sign_in')}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/forgot-password" style={{ color: '#0d6efd', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                {t('login.forgot_password')}
              </Link>
            </div>

            <div style={{ margin: '1.5rem 0', borderTop: '1px solid #f1f5f9', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '0 0.75rem', color: '#94a3b8', fontSize: '0.78rem' }}>ou</span>
            </div>

            <Link to="/register" style={{
              display: 'block', textAlign: 'center', padding: '0.65rem', borderRadius: '10px',
              border: '1.5px solid #e2e8f0', color: '#374151', fontWeight: 600, fontSize: '0.88rem',
              textDecoration: 'none', transition: 'border-color 0.18s, background 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0d6efd'; e.currentTarget.style.background = '#f0f5ff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'transparent'; }}>
              {t('login.create_account')}
            </Link>
          </form>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '1.5rem' }}>{t('login.copyright')}</p>
        </motion.div>
      </div>

      {/* Deleted account modal */}
      <Modal show={showDeleteModal} onHide={() => {}} centered backdrop="static">
        <Modal.Body className="text-center p-5">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h4 className="fw-bold mb-3">{t('login.deleted_title')}</h4>
          <p className="text-muted mb-4">{t('login.deleted_msg')}</p>
          <button className="btn btn-primary w-100" style={{ borderRadius: '10px', fontWeight: 700, background: 'linear-gradient(135deg,#0d6efd,#0b5ed7)', border: 'none' }}
            onClick={() => { setShowDeleteModal(false); navigate('/register'); }}>
            {t('login.create_new_account')}
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
