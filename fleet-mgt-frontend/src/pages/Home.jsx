import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useTranslation } from 'react-i18next';
import logoCI from '../assets/logo-ci.png';
import carBg from '../assets/voiture.jpg';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

const FEATURES = [
    {
        icon: <svg width="34" height="34" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM3 6h18M5 10h14M4 6l1.5-3h13L20 6" /></svg>,
        titleKey: 'home.feat_vehicles_title',
        descKey: 'home.feat_vehicles_desc',
        color: '#0d6efd',
    },
    {
        icon: <svg width="34" height="34" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4 4-4" /></svg>,
        titleKey: 'home.feat_consumption_title',
        descKey: 'home.feat_consumption_desc',
        color: '#198754',
    },
    {
        icon: <svg width="34" height="34" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.77 3.77z" /></svg>,
        titleKey: 'home.feat_maintenance_title',
        descKey: 'home.feat_maintenance_desc',
        color: '#fd7e14',
    },
];

function HelpModal({ onClose }) {
    const { t } = useTranslation();
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={onClose}>
            <motion.div
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#141b2d', borderRadius: '18px', padding: '2rem',
                    maxWidth: '440px', width: '100%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>{t('home.help_title')}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}>×</button>
                </div>
                {[
                    { title: t('home.help_access'), desc: t('home.help_access_desc'), icon: '🔑' },
                    { title: t('home.help_forgot'), desc: t('home.help_forgot_desc'), icon: '🔒' },
                    { title: t('home.help_contact'), desc: t('home.help_contact_desc'), icon: '📧' },
                ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.9rem', marginBottom: '1.2rem' }}>
                        <div style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' }}>{item.icon}</div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e0e6f0', marginBottom: '0.25rem' }}>{item.title}</div>
                            <div style={{ fontSize: '0.82rem', color: '#7a90b5', lineHeight: 1.55 }}>{item.desc}</div>
                        </div>
                    </div>
                ))}
                <button onClick={onClose} style={{
                    marginTop: '0.5rem', width: '100%', background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '9px', padding: '0.55rem',
                    color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
                }}>
                    {t('home.help_close')}
                </button>
            </motion.div>
        </div>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [showHelp, setShowHelp] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [contactSent, setContactSent] = useState(false);

    const toggleLang = () => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');

    const handleContact = (e) => {
        e.preventDefault();
        setContactSent(true);
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setContactSent(false), 5000);
    };

    const btnBase = {
        border: 'none', borderRadius: '9px', cursor: 'pointer',
        fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.18s',
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#fff', overflowX: 'hidden' }}>
            <AnimatePresence>{showHelp && <HelpModal onClose={() => setShowHelp(false)} />}</AnimatePresence>

            {/* ── Navbar ── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.7rem 2rem',
                background: 'rgba(10,15,26,0.8)',
                backdropFilter: 'blur(14px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <img src={logoCI} alt="CI" style={{ height: '36px', objectFit: 'contain' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2, color: '#e0e6f0' }}>
                        {t('home.app_name_line1')}<br />
                        <span style={{ fontWeight: 400, fontSize: '0.78rem', color: '#6e85b0' }}>{t('home.app_name_line2')}</span>
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {/* Language toggle */}
                    <button
                        onClick={toggleLang}
                        style={{ ...btnBase, background: 'rgba(255,255,255,0.08)', color: '#c8d8f0', padding: '0.45rem 0.9rem', border: '1px solid rgba(255,255,255,0.12)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >
                        {i18n.language === 'fr' ? 'EN' : 'FR'}
                    </button>

                    {/* Help button */}
                    <button
                        onClick={() => setShowHelp(true)}
                        title={t('home.help_title')}
                        style={{ ...btnBase, background: 'rgba(255,255,255,0.08)', color: '#c8d8f0', padding: '0.45rem 0.8rem', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >
                        ?
                    </button>

                    {/* Sign in */}
                    <button
                        onClick={() => navigate('/login')}
                        style={{ ...btnBase, background: '#0d6efd', color: '#fff', padding: '0.5rem 1.3rem', boxShadow: '0 0 16px rgba(13,110,253,0.35)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#0b5ed7'; e.currentTarget.style.boxShadow = '0 0 22px rgba(13,110,253,0.55)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#0d6efd'; e.currentTarget.style.boxShadow = '0 0 16px rgba(13,110,253,0.35)'; }}
                    >
                        {t('home.sign_in')}
                    </button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={carBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.42)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,15,26,0.25) 0%, rgba(10,15,26,0.7) 100%)' }} />

                <motion.div initial="hidden" animate="visible" variants={stagger}
                    style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 1.5rem', maxWidth: '780px' }}>
                    <motion.div variants={fadeUp} transition={{ duration: 0.55 }}>
                        <img src={logoCI} alt="CI" style={{ height: '58px', marginBottom: '1.4rem', filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))' }} />
                    </motion.div>
                    <motion.h1 variants={fadeUp} transition={{ duration: 0.6 }}
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.1rem', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
                        {t('home.hero_title')}
                    </motion.h1>
                    <motion.p variants={fadeUp} transition={{ duration: 0.6 }}
                        style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: '#c2d4ee', marginBottom: '2rem', lineHeight: 1.7 }}>
                        {t('home.hero_subtitle')}
                    </motion.p>
                    <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
                        <button onClick={() => navigate('/login')} style={{
                            ...btnBase, background: '#0d6efd', color: '#fff',
                            padding: '0.85rem 2.5rem', fontSize: '1.05rem', fontWeight: 700,
                            boxShadow: '0 4px 24px rgba(13,110,253,0.5)',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(13,110,253,0.65)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(13,110,253,0.5)'; }}>
                            {t('home.hero_cta')}
                        </button>
                    </motion.div>
                </motion.div>

                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}
                    style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1, color: 'rgba(255,255,255,0.35)' }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </motion.div>
            </section>

            {/* ── Features ── */}
            <section style={{ padding: '5.5rem 1.5rem', background: '#0d1320' }}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
                    style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <motion.div variants={fadeUp} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', fontWeight: 800, marginBottom: '0.7rem' }}>{t('home.features_title')}</h2>
                        <p style={{ color: '#7a90b5', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>{t('home.features_subtitle')}</p>
                    </motion.div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.4rem' }}>
                        {FEATURES.map((f, i) => (
                            <motion.div key={i} variants={fadeUp} transition={{ duration: 0.5 }}
                                style={{ background: '#141b2d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.75rem', cursor: 'default' }}
                                whileHover={{ y: -6, boxShadow: `0 12px 36px rgba(0,0,0,0.35)`, borderColor: f.color + '44' }}>
                                <div style={{ width: '58px', height: '58px', borderRadius: '14px', marginBottom: '1.1rem', background: f.color + '1a', color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' }}>{t(f.titleKey)}</h3>
                                <p style={{ color: '#7a90b5', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>{t(f.descKey)}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* ── Contact ── */}
            <section style={{ padding: '5.5rem 1.5rem', background: '#0a0f1a' }}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger}
                    style={{ maxWidth: '960px', margin: '0 auto' }}>
                    <motion.div variants={fadeUp} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', fontWeight: 800, marginBottom: '0.7rem' }}>{t('home.contact_title')}</h2>
                        <p style={{ color: '#7a90b5', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>{t('home.contact_subtitle')}</p>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Contact info */}
                        <motion.div variants={fadeUp} transition={{ duration: 0.55 }}>
                            <div style={{ background: '#141b2d', borderRadius: '16px', padding: '1.75rem', border: '1px solid rgba(255,255,255,0.07)', height: '100%' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#c8d8f0' }}>Compassion International Togo</h4>
                                {[
                                    { icon: '📧', label: 'Email', value: t('home.contact_email_val'), href: `mailto:${t('home.contact_email_val')}` },
                                    { icon: '📞', label: 'Téléphone', value: t('home.contact_phone_val'), href: null },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '0.9rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: '1px' }}>{item.icon}</div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: '#4a6080', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>{item.label}</div>
                                            {item.href
                                                ? <a href={item.href} style={{ color: '#4d9fff', fontWeight: 500, fontSize: '0.92rem', textDecoration: 'none' }}>{item.value}</a>
                                                : <span style={{ color: '#c8d8f0', fontWeight: 500, fontSize: '0.92rem' }}>{item.value}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Contact form */}
                        <motion.div variants={fadeUp} transition={{ duration: 0.55 }}>
                            <form onSubmit={handleContact} style={{ background: '#141b2d', borderRadius: '16px', padding: '1.75rem', border: '1px solid rgba(255,255,255,0.07)' }}>
                                {contactSent && (
                                    <div style={{ background: '#0f3d20', border: '1px solid #198754', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#75e09a', fontSize: '0.88rem' }}>
                                        ✓ {t('home.contact_sent')}
                                    </div>
                                )}
                                {[
                                    { name: 'name', label: t('home.contact_name'), type: 'text', placeholder: 'Jean Dupont' },
                                    { name: 'email', label: t('home.contact_email_label'), type: 'email', placeholder: 'jean@example.com' },
                                    { name: 'subject', label: t('home.contact_subject'), type: 'text', placeholder: t('home.contact_subject') },
                                ].map(field => (
                                    <div key={field.name} style={{ marginBottom: '0.9rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#7a90b5', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{field.label}</label>
                                        <input
                                            type={field.type} required placeholder={field.placeholder}
                                            value={contactForm[field.name]}
                                            onChange={e => setContactForm(p => ({ ...p, [field.name]: e.target.value }))}
                                            style={{ width: '100%', background: '#0d1320', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '9px', padding: '0.55rem 0.9rem', color: '#e0e6f0', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                                            onFocus={e => e.target.style.borderColor = '#0d6efd'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                    </div>
                                ))}
                                <div style={{ marginBottom: '1.1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#7a90b5', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{t('home.contact_message')}</label>
                                    <textarea
                                        required rows={4} placeholder={t('home.contact_message_ph')}
                                        value={contactForm.message}
                                        onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                                        style={{ width: '100%', background: '#0d1320', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '9px', padding: '0.55rem 0.9rem', color: '#e0e6f0', fontSize: '0.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = '#0d6efd'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                </div>
                                <button type="submit" style={{ ...btnBase, width: '100%', background: 'linear-gradient(135deg, #0d6efd, #0b5ed7)', color: '#fff', padding: '0.7rem', fontSize: '0.92rem', boxShadow: '0 4px 18px rgba(13,110,253,0.35)' }}>
                                    {t('home.contact_send')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ padding: '1.5rem 2rem', background: '#060a12', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img src={logoCI} alt="CI" style={{ height: '26px', objectFit: 'contain' }} />
                    <span style={{ color: '#3a4d66', fontSize: '0.8rem' }}>Compassion International Togo</span>
                </div>
                <span style={{ color: '#263040', fontSize: '0.78rem' }}>{t('home.footer_rights')}</span>
            </footer>
        </div>
    );
}
