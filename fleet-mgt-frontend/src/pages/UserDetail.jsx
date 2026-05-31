import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axios";

const ROLE_BADGE = {
    admin:      { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', icon: '👑' },
    manager:    { bg: '#eff6ff', color: '#0d6efd', border: '#bfdbfe', icon: '👨‍💼' },
    driver:     { bg: '#dcfce7', color: '#16a34a', border: '#86efac', icon: '🚗' },
    accountant: { bg: '#f5f3ff', color: '#6d28d9', border: '#c4b5fd', icon: '📊' },
    mechanic:   { bg: '#fff7ed', color: '#ea580c', border: '#fdba74', icon: '🔧' },
};

export default function UserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!id || id === 'undefined') { navigate('/users'); return; }
        fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchUser = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/users/${id}`);
            setUser(res.data.user || res.data.data || res.data);
        } catch (err) {
            const msg = err.response?.data?.message || 'Impossible de charger les détails de l\'utilisateur.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const isActive = user && !user.deleted_at;
    const role = user?.role?.toLowerCase();
    const rs = ROLE_BADGE[role] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', icon: '👤' };

    const field = (label, value) => (
        <div style={{ marginBottom: '1.1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>{value || '—'}</div>
        </div>
    );

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div className="spinner-border" style={{ color: '#667eea' }} />
        </div>
    );

    if (error) return (
        <div style={{ padding: '1.5rem', maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ background: '#fff0f0', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '1.25rem', color: '#dc2626', marginBottom: '1rem' }}>
                ⚠️ {error}
            </div>
            <button onClick={() => navigate('/users')} style={{ padding: '0.55rem 1.2rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                ← Retour à la liste
            </button>
        </div>
    );

    if (!user) return null;

    return (
        <div style={{ padding: '1.5rem', maxWidth: '740px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.25rem', background: '#fff', borderRadius: '0 0 16px 16px', boxShadow: '0 4px 20px rgba(102,126,234,0.1)', padding: '1rem 1.25rem' }}>
                <button onClick={() => navigate('/users')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', padding: 0, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ‹ Retour
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, boxShadow: '0 4px 14px rgba(102,126,234,0.35)' }}>
                        {rs.icon}
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.18rem', color: '#0f172a', lineHeight: 1.2 }}>{user.name}</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{user.email}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>
                            {rs.icon} {user.role}
                        </span>
                        <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, background: isActive ? '#dcfce7' : '#fee2e2', color: isActive ? '#16a34a' : '#dc2626', border: `1px solid ${isActive ? '#86efac' : '#fca5a5'}` }}>
                            {isActive ? '✓ Actif' : '✗ Désactivé'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: '1.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
                    {field('Nom complet', user.name)}
                    {field('Email', user.email)}
                    {field('Rôle', user.role)}
                    {field('Statut', isActive ? 'Actif' : 'Désactivé')}
                    {field('Date de création', user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : null)}
                    {field('Dernière mise à jour', user.updated_at ? new Date(user.updated_at).toLocaleDateString('fr-FR') : null)}
                    {user.deleted_at && field('Désactivé le', new Date(user.deleted_at).toLocaleDateString('fr-FR'))}
                    {field('Tentatives de connexion', user.login_attempts ?? '0')}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => navigate(`/users/${id}/edit`)} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                    ✏️ Modifier
                </button>
                <button onClick={() => navigate('/users')} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                    ← Retour à la liste
                </button>
            </div>
        </div>
    );
}
