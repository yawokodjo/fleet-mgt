import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import logoCI from '../assets/logo-ci.png';
import carImg from '../assets/voiture.jpg';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const MAX_ATTEMPTS = 3;
const BLOCK_MINUTES = 5;

/* ── helpers ── */
const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/* ── Dot indicators ── */
function AttemptDots({ remaining }) {
    return (
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginTop: '8px' }}>
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                <div key={i} style={{
                    width: '9px', height: '9px', borderRadius: '50%',
                    background: i < remaining ? '#16a34a' : '#ef4444',
                    transition: 'background 0.3s',
                    boxShadow: i < remaining ? '0 0 4px #16a34a88' : '0 0 4px #ef444488',
                }} />
            ))}
            <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '4px' }}>
                {remaining} essai{remaining > 1 ? 's' : ''} restant{remaining > 1 ? 's' : ''}
            </span>
        </div>
    );
}

/* ── Countdown ring ── */
function CountdownRing({ seconds, total = BLOCK_MINUTES * 60 }) {
    const r = 28; const circ = 2 * Math.PI * r;
    const progress = (seconds / total) * circ;
    return (
        <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}>
            <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={r} fill="none" stroke="#fee2e2" strokeWidth="5" />
                <circle cx="36" cy="36" r={r} fill="none" stroke="#ef4444" strokeWidth="5"
                    strokeDasharray={`${progress} ${circ}`}
                    strokeDashoffset={circ * 0.25}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s linear' }}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#dc2626' }}>
                {fmtTime(seconds)}
            </div>
        </div>
    );
}

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [showPwd,  setShowPwd]  = useState(false);
    const [loading,  setLoading]  = useState(false);

    /* error states */
    const [errorMsg,   setErrorMsg]   = useState('');
    const [remaining,  setRemaining]  = useState(MAX_ATTEMPTS);
    const [shake,      setShake]      = useState(false);

    /* block states */
    const [blocked,    setBlocked]    = useState(false);
    const [countdown,  setCountdown]  = useState(0);

    /* deleted modal */
    const [deleted,    setDeleted]    = useState(false);

    const emailRef = useRef(null);

    /* countdown timer */
    useEffect(() => {
        if (!blocked || countdown <= 0) return;
        const t = setInterval(() => {
            setCountdown(s => {
                if (s <= 1) { clearInterval(t); setBlocked(false); setRemaining(MAX_ATTEMPTS); setErrorMsg(''); return 0; }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [blocked]);

    /* shake animation reset */
    useEffect(() => {
        if (!shake) return;
        const t = setTimeout(() => setShake(false), 500);
        return () => clearTimeout(t);
    }, [shake]);

    const triggerError = (msg, left) => {
        setErrorMsg(msg);
        if (left !== undefined) setRemaining(left);
        setShake(true);
        setPassword('');
        emailRef.current?.focus();
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (loading || blocked) return;
        setLoading(true);
        setErrorMsg('');

        try {
            /* Use fetch directly — bypasses axios interceptors entirely */
            const res = await fetch(`${API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                /* ✅ Connexion réussie */
                login(data.user, data.access_token);
                return;
            }

            /* ❌ Erreur */
            const code = data?.code;

            if (code === 'ACCOUNT_BLOCKED') {
                const secs = Math.round(data.remaining_seconds || BLOCK_MINUTES * 60);
                setBlocked(true);
                setCountdown(secs);
                setErrorMsg(data.message || 'Compte temporairement bloqué.');
                setPassword('');

            } else if (code === 'ACCOUNT_DELETED') {
                setDeleted(true);

            } else if (code === 'INVALID_PASSWORD') {
                const left = data.remaining_attempts ?? (remaining - 1);
                triggerError(
                    left === 0
                        ? 'Dernière tentative épuisée. Votre compte est bloqué 5 minutes.'
                        : `Mot de passe incorrect. Il vous reste ${left} essai${left > 1 ? 's' : ''}.`,
                    left
                );

            } else {
                triggerError(data?.message || 'Email ou mot de passe incorrect.');
            }

        } catch {
            triggerError('Impossible de contacter le serveur. Vérifiez votre connexion.');
        } finally {
            setLoading(false);
        }
    };

    const pwdOk = password.length >= 8;

    /* ── Styles ── */
    const inputStyle = (focused) => ({
        width: '100%', padding: '0.7rem 1rem', borderRadius: '12px',
        border: `1.5px solid ${focused ? '#0d6efd' : '#e2e8f0'}`,
        background: '#f8faff', fontSize: '0.92rem', color: '#0f172a',
        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s',
    });

    const pwdInputStyle = () => ({
        ...inputStyle(focusPwd),
        paddingRight: '2.8rem',
        border: password.length === 0
            ? `1.5px solid ${focusPwd ? '#0d6efd' : '#e2e8f0'}`
            : `1.5px solid ${pwdOk ? '#16a34a' : '#ef4444'}`,
    });

    const [focusEmail, setFocusEmail] = useState(false);
    const [focusPwd,   setFocusPwd]   = useState(false);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
            <style>{`
                @keyframes shake {
                    0%,100%{transform:translateX(0)}
                    20%{transform:translateX(-8px)}
                    40%{transform:translateX(8px)}
                    60%{transform:translateX(-6px)}
                    80%{transform:translateX(6px)}
                }
                @keyframes fadeIn {
                    from{opacity:0;transform:translateY(-8px)}
                    to{opacity:1;transform:translateY(0)}
                }
            `}</style>

            {/* ── Left panel ── */}
            <div className="d-none d-lg-flex" style={{ flex: '1.1', position: 'relative', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <img src={carImg} alt="Fleet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(0,20,50,.55) 0%,rgba(0,10,30,.85) 100%)' }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '3rem' }}>
                    <img src={logoCI} alt="CI" style={{ height: '52px', marginBottom: '1.5rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.4))' }} />
                    <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.2, marginBottom: '.75rem' }}>
                        Gestion de Flotte<br />Véhicule
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.95rem', maxWidth: '360px', lineHeight: 1.65, marginBottom: '2rem' }}>
                        Suivez, planifiez et optimisez votre parc automobile.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem', maxWidth: '340px' }}>
                        {[
                            { icon: '🚗', text: 'Suivi en temps réel de vos véhicules' },
                            { icon: '⛽', text: 'Analyse de la consommation carburant' },
                            { icon: '🔧', text: 'Maintenance planifiée & historique' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                <div style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,.12)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</div>
                                <span style={{ color: 'rgba(255,255,255,.88)', fontSize: '.88rem' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right panel ── */}
            <div style={{ flex: 1, minWidth: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>

                    {/* Mobile logo */}
                    <div className="d-flex d-lg-none justify-content-center mb-4">
                        <img src={logoCI} alt="CI" style={{ height: '44px' }} />
                    </div>

                    {/* Language */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', gap: '.4rem' }}>
                        {['fr','en'].map(lang => (
                            <button key={lang} onClick={() => i18n.changeLanguage(lang)} style={{
                                padding: '.3rem .75rem', borderRadius: '6px', fontSize: '.78rem', fontWeight: 700,
                                cursor: 'pointer', border: '1.5px solid', transition: 'all .15s',
                                background:   i18n.language === lang ? '#0d6efd' : 'transparent',
                                color:        i18n.language === lang ? '#fff'    : '#64748b',
                                borderColor:  i18n.language === lang ? '#0d6efd' : '#e2e8f0',
                            }}>{lang.toUpperCase()}</button>
                        ))}
                    </div>

                    <h2 style={{ fontWeight: 800, fontSize: '1.55rem', color: '#0f172a', marginBottom: '.4rem' }}>Bienvenue 👋</h2>
                    <p style={{ color: '#64748b', fontSize: '.88rem', marginBottom: '1.75rem' }}>Connectez-vous à votre espace de gestion</p>

                    {/* ── BLOCKED banner ── */}
                    {blocked && (
                        <div style={{ animation: 'fadeIn .3s ease', background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '1.5px solid #fca5a5', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <CountdownRing seconds={countdown} />
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#dc2626', marginBottom: '.25rem' }}>🔒 Compte temporairement bloqué</div>
                                <div style={{ fontSize: '.82rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                                    Trop de tentatives échouées.<br />
                                    Réessayez dans <strong>{fmtTime(countdown)}</strong>.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── ERROR banner ── */}
                    {errorMsg && !blocked && (
                        <div style={{ animation: 'fadeIn .25s ease', background: '#fff8f8', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '.85rem 1rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '.85rem', color: '#dc2626' }}>{errorMsg}</div>
                                    {remaining < MAX_ATTEMPTS && remaining > 0 && (
                                        <AttemptDots remaining={remaining} />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Form ── */}
                    <div style={{ animation: shake ? 'shake .45s ease' : 'none' }}>
                        <form onSubmit={handleSubmit}>
                            {/* Email */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                    Adresse email
                                </label>
                                <input
                                    ref={emailRef}
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onFocus={() => setFocusEmail(true)}
                                    onBlur={() => setFocusEmail(false)}
                                    placeholder="exemple@ci.org"
                                    disabled={loading || blocked}
                                    required
                                    autoComplete="email"
                                    style={inputStyle(focusEmail)}
                                />
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151' }}>Mot de passe</label>
                                    <Link to="/forgot-password" style={{ fontSize: '.78rem', color: '#0d6efd', fontWeight: 600, textDecoration: 'none' }}>
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPwd ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        onFocus={() => setFocusPwd(true)}
                                        onBlur={() => setFocusPwd(false)}
                                        placeholder="••••••••"
                                        disabled={loading || blocked}
                                        required
                                        autoComplete="current-password"
                                        style={pwdInputStyle()}
                                    />
                                    <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem', padding: '2px' }}>
                                        {showPwd ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {password.length > 0 && (
                                    <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: pwdOk ? '#16a34a' : '#ef4444', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.73rem', color: pwdOk ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
                                            {pwdOk ? 'Mot de passe valide' : `Encore ${8 - password.length} caractère${8 - password.length > 1 ? 's' : ''}`}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={loading || blocked} style={{
                                width: '100%', padding: '.78rem', borderRadius: '12px', border: 'none',
                                background: blocked ? '#94a3b8' : loading ? '#3b82f6' : 'linear-gradient(135deg,#0d6efd,#0b5ed7)',
                                color: '#fff', fontWeight: 700, fontSize: '.95rem',
                                cursor: loading || blocked ? 'not-allowed' : 'pointer',
                                boxShadow: blocked ? 'none' : '0 4px 16px rgba(13,110,253,.4)',
                                transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                            }}>
                                {loading ? (
                                    <>
                                        <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                                        Connexion en cours…
                                    </>
                                ) : blocked ? (
                                    `🔒 Bloqué — ${fmtTime(countdown)}`
                                ) : (
                                    'Se connecter →'
                                )}
                            </button>
                        </form>
                    </div>

                    <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                        <span style={{ color: '#94a3b8', fontSize: '.78rem' }}>ou</span>
                        <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                    </div>

                    <Link to="/register" style={{
                        display: 'block', textAlign: 'center', padding: '.65rem', borderRadius: '12px',
                        border: '1.5px solid #e2e8f0', color: '#374151', fontWeight: 600, fontSize: '.88rem',
                        textDecoration: 'none', transition: 'all .18s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0d6efd'; e.currentTarget.style.background = '#f0f5ff'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'transparent'; }}>
                        Créer un compte
                    </Link>

                    <p style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '.72rem', marginTop: '1.5rem' }}>
                        © {new Date().getFullYear()} Compassion International Togo
                    </p>
                </div>
            </div>

            {/* ── Deleted modal ── */}
            {deleted && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem 2rem', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
                        <h4 style={{ fontWeight: 800, marginBottom: '.5rem', color: '#0f172a' }}>Compte désactivé</h4>
                        <p style={{ color: '#64748b', fontSize: '.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            Votre compte a été désactivé après plusieurs tentatives de connexion échouées.<br />
                            Veuillez contacter l'administrateur.
                        </p>
                        <button onClick={() => navigate('/')} style={{ width: '100%', padding: '.7rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#0d6efd,#0b5ed7)', color: '#fff', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer' }}>
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
