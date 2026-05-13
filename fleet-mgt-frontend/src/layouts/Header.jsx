import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CommandSearch from "../components/CommandSearch";
import { useAuth } from "../context/AuthContext";

/* ── Help Modal ── */
function HelpModal({ onClose }) {
    const { t } = useTranslation();
    const items = [
        { icon: '🚗', title: t('help.vehicles_title'), desc: t('help.vehicles_desc') },
        { icon: '⛽', title: t('help.fuel_title'),     desc: t('help.fuel_desc') },
        { icon: '🔧', title: t('help.maint_title'),    desc: t('help.maint_desc') },
        { icon: '📊', title: t('help.reports_title'),  desc: t('help.reports_desc') },
    ];
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 2000,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#141b2d', borderRadius: '18px', padding: '2rem',
                    maxWidth: '440px', width: '100%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                        {t('help.title')}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}>×</button>
                </div>
                {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.9rem', marginBottom: '1.1rem' }}>
                        <div style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' }}>{item.icon}</div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e0e6f0', marginBottom: '0.2rem' }}>{item.title}</div>
                            <div style={{ fontSize: '0.82rem', color: '#7a90b5', lineHeight: 1.55 }}>{item.desc}</div>
                        </div>
                    </div>
                ))}
                <button
                    onClick={onClose}
                    style={{
                        marginTop: '0.5rem', width: '100%',
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '9px', padding: '0.55rem',
                        color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
                        fontSize: '0.88rem', fontWeight: 600,
                    }}
                >
                    {t('help.close')}
                </button>
            </div>
        </div>
    );
}

/* ── User Menu ── */
function UserMenu({ user, onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const initials = user?.name ? user.name.charAt(0).toUpperCase() : '?';

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    padding: '5px 10px 5px 5px',
                    color: 'rgba(255,255,255,0.9)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
                <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: '#0d6efd', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                }}>
                    {initials}
                </div>
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || 'Utilisateur'}
                </span>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ opacity: 0.6, flexShrink: 0 }}>
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#0d1b2e', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px', padding: '6px',
                    minWidth: '180px', zIndex: 3000,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                }}>
                    <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '4px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            {user?.role || 'user'}
                        </div>
                        <div style={{ fontSize: '0.88rem', color: '#e0e6f0', fontWeight: 600, marginTop: '2px' }}>
                            {user?.name}
                        </div>
                    </div>
                    <button
                        onClick={() => { setOpen(false); navigate('/profile'); }}
                        style={{ ...menuItemStyle }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {t('nav.profile')}
                    </button>
                    <button
                        onClick={() => { setOpen(false); onLogout(); }}
                        style={{ ...menuItemStyle, color: '#f87171' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                        {t('header.logout')}
                    </button>
                </div>
            )}
        </div>
    );
}

const menuItemStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
    width: '100%', background: 'transparent', border: 'none',
    color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
    fontSize: '0.86rem', fontWeight: 500,
    padding: '8px 12px', borderRadius: '8px',
    textAlign: 'left', transition: 'background 0.15s',
};

/* ── Header ── */
export default function Header() {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    const handleLangChange = (e) => i18n.changeLanguage(e.target.value);

    useEffect(() => {
        const handleKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const iconBtnStyle = {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '36px', height: '36px',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '9px', color: 'rgba(255,255,255,0.8)',
        cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700,
        transition: 'background 0.2s',
        flexShrink: 0,
    };

    return (
        <>
            {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}

            <header className="text-white py-3" style={{ backgroundColor: '#001f3f' }}>
                <div className="container">
                    {/* Desktop Layout */}
                    <div className="d-none d-lg-flex justify-content-between align-items-center">
                        <a href="https://www.compassion.com/" target="_blank" rel="noopener noreferrer">
                            <img src="/src/assets/logo-ci.png" alt="Logo" width={50} height={50} />
                        </a>

                        <div className="text-center flex-grow-1 mx-3">
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                                {t('header.title')}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>
                                {t('header.title_sub')}
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            {/* Search */}
                            <button
                                onClick={() => setSearchOpen(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '10px',
                                    padding: '7px 14px',
                                    color: 'rgba(255,255,255,0.75)',
                                    cursor: 'pointer',
                                    fontSize: '0.88rem',
                                    transition: 'all 0.2s',
                                    minWidth: '180px',
                                    justifyContent: 'space-between',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                    </svg>
                                    {t('header.search_placeholder')}
                                </span>
                                <kbd style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    borderRadius: '4px', padding: '1px 6px',
                                    fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)',
                                    fontFamily: 'inherit',
                                }}>
                                    Ctrl K
                                </kbd>
                            </button>

                            {/* Language */}
                            <select
                                className="form-select form-select-sm bg-secondary text-white border-0"
                                style={{ width: 'auto' }}
                                value={i18n.language}
                                onChange={handleLangChange}
                            >
                                <option value="fr">FR</option>
                                <option value="en">EN</option>
                            </select>

                            {/* Help */}
                            <button
                                onClick={() => setHelpOpen(true)}
                                title={t('help.title')}
                                style={iconBtnStyle}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                ?
                            </button>

                            {/* User menu */}
                            {user && <UserMenu user={user} onLogout={logout} />}
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="d-lg-none">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <a href="https://www.compassion.com/" target="_blank" rel="noopener noreferrer">
                                <img src="/src/assets/logo-ci.png" alt="Logo" width={40} height={40} />
                            </a>
                            <div className="d-flex align-items-center gap-2">
                                <select
                                    className="form-select form-select-sm bg-secondary text-white border-0"
                                    style={{ width: 'auto' }}
                                    value={i18n.language}
                                    onChange={handleLangChange}
                                >
                                    <option value="fr">FR</option>
                                    <option value="en">EN</option>
                                </select>
                                <button
                                    onClick={() => setHelpOpen(true)}
                                    style={{ ...iconBtnStyle, width: '32px', height: '32px', fontSize: '0.9rem' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                >
                                    ?
                                </button>
                                {user && (
                                    <button
                                        onClick={logout}
                                        style={{ ...iconBtnStyle, width: '32px', height: '32px' }}
                                        title={t('header.logout')}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    >
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        <h1 className="text-center text-white fs-6 fw-bold mb-2">
                            {t('header.title_short')}
                        </h1>

                        <button
                            onClick={() => setSearchOpen(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                width: '100%',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '10px',
                                padding: '8px 14px',
                                color: 'rgba(255,255,255,0.75)',
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                            }}
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            {t('header.search_placeholder')}
                        </button>
                    </div>
                </div>
            </header>

            <CommandSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
