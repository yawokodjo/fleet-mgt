import React from "react";
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

function AccessDenied() {
    const { t } = useTranslation();
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', padding: '2rem', textAlign: 'center',
        }}>
            <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.2rem', marginBottom: '1.5rem',
                boxShadow: '0 8px 24px rgba(220,38,38,0.15)',
            }}>
                🔒
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#0f172a', marginBottom: '0.6rem' }}>
                {t('access.denied_title')}
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '380px', lineHeight: 1.6, margin: 0 }}>
                {t('access.denied_message')}
            </p>
            <div style={{
                marginTop: '1.5rem', padding: '0.6rem 1.2rem', borderRadius: '10px',
                background: '#fee2e2', border: '1px solid #fca5a5',
                fontSize: '0.82rem', fontWeight: 600, color: '#dc2626',
            }}>
                {t('access.contact_admin')}
            </div>
        </div>
    );
}

export default function PrivateRoute({ children, roles }) {
    const { token, user } = useAuth();

    if (!token) return <Navigate to="/login" replace />;

    if (roles && user && !roles.includes(user.role)) {
        return <AccessDenied />;
    }

    return children;
}
