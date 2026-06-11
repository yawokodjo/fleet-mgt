import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import logoCI from '../assets/logo-ci.png';
import carImg from '../assets/voiture.jpg';

const criteriaKeys = ['uppercase', 'lowercase', 'number', 'special', 'length'];

function getCriteria(pw) {
  return {
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[^A-Za-z0-9]/.test(pw),
    length:    pw.length >= 8,
  };
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, i18n } = useTranslation();

  const criteria = getCriteria(form.password);
  const allMet = Object.values(criteria).every(Boolean);
  const strength = Object.values(criteria).filter(Boolean).length;

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError(t('register.password_mismatch')); return; }
    if (!allMet) { setError(t('register.password_requirements')); return; }
    setLoading(true);
    try {
      const res = await api.post('/register', { name: form.name, email: form.email, password: form.password, password_confirmation: form.confirmPassword });
      login(res.data.user, res.data.access_token);
    } catch (err) {
      if (err.response?.data?.errors) setError(Object.values(err.response.data.errors)[0][0]);
      else setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const strengthColor = ['#e2e8f0','#dc2626','#f59e0b','#f59e0b','#16a34a','#16a34a'][strength];

  const inp = {
    width: '100%', background: '#f8faff', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', padding: '0.62rem 0.9rem', fontSize: '0.88rem',
    color: '#1e293b', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>

      {/* Left panel */}
      <div className="d-none d-lg-flex" style={{ flex: '0.8', position: 'relative', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <img src={carImg} alt="Fleet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(0,30,60,0.6) 0%, rgba(0,10,30,0.85) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '2.5rem' }}>
          <img src={logoCI} alt="CI" style={{ height: '48px', marginBottom: '1.25rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }} />
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem', lineHeight: 1.25, marginBottom: '0.6rem' }}>
            Rejoignez votre équipe
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: 1.65, maxWidth: '300px' }}>
            Créez votre compte pour accéder au système de gestion de flotte de Compassion International Togo.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, minWidth: '340px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: '#fff', padding: '2rem', overflowY: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ width: '100%', maxWidth: '440px', paddingTop: '1rem', paddingBottom: '2rem' }}>

          <div className="d-flex d-lg-none justify-content-center mb-4">
            <img src={logoCI} alt="CI" style={{ height: '40px' }} />
          </div>

          {/* Language */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem', gap: '0.4rem' }}>
            {['fr','en'].map(lang => (
              <button key={lang} onClick={() => i18n.changeLanguage(lang)}
                style={{ padding: '0.28rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                  background: i18n.language === lang ? '#0d6efd' : 'transparent',
                  color:      i18n.language === lang ? '#fff'    : '#64748b',
                  borderColor: i18n.language === lang ? '#0d6efd' : '#e2e8f0',
                }}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', marginBottom: '0.3rem' }}>{t('register.title')}</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
            {t('register.already_account')}{' '}
            <Link to="/login" style={{ color: '#0d6efd', fontWeight: 600, textDecoration: 'none' }}>{t('register.connect')}</Link>
          </p>

          {error && (
            <div style={{ background: '#fff0f0', border: '1.5px solid #fca5a5', borderRadius: '10px', padding: '0.7rem 0.9rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#dc2626' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: '0.9rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>{t('register.name')}</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required disabled={loading}
                placeholder="Jean Dupont" style={inp}
                onFocus={e => e.target.style.borderColor = '#0d6efd'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '0.9rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>{t('register.email')}</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required disabled={loading}
                placeholder="exemple@ci.org" style={inp}
                onFocus={e => e.target.style.borderColor = '#0d6efd'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '0.9rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>{t('register.password')}</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required disabled={loading}
                  placeholder="••••••••" style={{ ...inp, paddingRight: '2.8rem' }}
                  onFocus={e => e.target.style.borderColor = '#0d6efd'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.95rem' }}>
                  {showPw ? '👁️' : '🔒'}
                </button>
              </div>

              {form.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ height: '100%', width: `${strength * 20}%`, background: strengthColor, borderRadius: '4px', transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {criteriaKeys.map(k => (
                      <span key={k} style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: '20px', background: criteria[k] ? '#dcfce7' : '#f1f5f9', color: criteria[k] ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                        {criteria[k] ? '✓' : '·'} {t(`register.criteria_${k}`)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>{t('register.confirm_password')}</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required disabled={loading}
                placeholder="••••••••" style={{ ...inp, borderColor: form.confirmPassword && form.confirmPassword !== form.password ? '#dc2626' : '#e2e8f0' }}
                onFocus={e => e.target.style.borderColor = '#0d6efd'} onBlur={e => e.target.style.borderColor = form.confirmPassword && form.confirmPassword !== form.password ? '#dc2626' : '#e2e8f0'} />
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p style={{ fontSize: '0.76rem', color: '#dc2626', marginTop: '4px', marginBottom: 0 }}>{t('register.password_mismatch')}</p>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '0.72rem', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #0d6efd, #0b5ed7)',
              color: '#fff', fontWeight: 700, fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(13,110,253,0.35)',
            }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />{t('register.signing_up')}</> : t('register.submit_btn')}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
