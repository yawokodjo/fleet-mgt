import React, { useState } from "react";
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'yawo.kodjo@yahoo.com';

function AccessDenied() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const location = useLocation();
    const [sent, setSent] = useState(false);

    const handleRequest = () => {
        const page = window.location.href;
        const subject = encodeURIComponent(`Demande d'accès — ${location.pathname}`);
        const body = encodeURIComponent(
            `Bonjour,\n\n` +
            `Je sollicite l'accès à la page suivante :\n${page}\n\n` +
            `Mes informations :\n` +
            `- Nom : ${user?.name ?? 'N/A'}\n` +
            `- Email : ${user?.email ?? 'N/A'}\n` +
            `- Rôle actuel : ${user?.role ?? 'N/A'}\n\n` +
            `Merci de bien vouloir m'accorder les droits nécessaires.\n\n` +
            `Cordialement,\n${user?.name ?? ''}`
        );
        window.open(`mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`);
        setSent(true);
        setTimeout(() => setSent(false), 4000);
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center',
        }}>
            {/* Icône */}
            <div style={{
                width: '88px', height: '88px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.4rem', marginBottom: '1.5rem',
                boxShadow: '0 8px 24px rgba(220,38,38,0.15)',
            }}>🔒</div>

            {/* Titre */}
            <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                {t('access.denied_title')}
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '400px', lineHeight: 1.65, margin: '0 0 1.75rem' }}>
                {t('access.denied_message')}
            </p>

            {/* Bouton demande d'accès */}
            {sent ? (
                <div style={{
                    padding: '0.7rem 1.4rem', borderRadius: '10px',
                    background: '#dcfce7', border: '1.5px solid #86efac',
                    fontSize: '0.88rem', fontWeight: 600, color: '#16a34a',
                }}>
                    ✓ {t('access.request_sent')}
                </div>
            ) : (
                <button
                    onClick={handleRequest}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '0.7rem 1.6rem', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                        cursor: 'pointer', boxShadow: '0 4px 14px rgba(102,126,234,0.4)',
                        marginBottom: '1rem',
                    }}
                >
                    ✉️ {t('access.request_button')}
                </button>
            )}

            {/* Info destinataire */}
            <div style={{
                marginTop: '0.75rem', padding: '0.5rem 1rem', borderRadius: '8px',
                background: '#f8faff', border: '1px solid #e2e8f0',
                fontSize: '0.78rem', color: '#94a3b8',
            }}>
                {t('access.request_to')} <strong style={{ color: '#667eea' }}>{ADMIN_EMAIL}</strong>
            </div>
        </div>
    );
}

export default function PrivateRoute({ children, roles }) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (roles && user && !roles.includes(user.role)) {
        return <AccessDenied />;
    }

    return children;
}
