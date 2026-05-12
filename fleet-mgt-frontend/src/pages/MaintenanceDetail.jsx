import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../axios';

const STATUS_MAP = {
    planned:     { label: 'Planifié',  color: '#0d6efd', bg: '#eff6ff' },
    in_progress: { label: 'En cours',  color: '#d97706', bg: '#fef3c7' },
    completed:   { label: 'Terminé',   color: '#16a34a', bg: '#dcfce7' },
    cancelled:   { label: 'Annulé',    color: '#dc2626', bg: '#fee2e2' },
};

function InfoRow({ icon, label, value, badge }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.72rem 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', flexShrink: 0, marginRight: '0.85rem' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
                {badge
                    ? <span style={{ fontSize: '0.8rem', fontWeight: 700, color: badge.color, background: badge.bg, padding: '2px 10px', borderRadius: '20px', display: 'inline-block', marginTop: '2px' }}>{value}</span>
                    : <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginTop: '1px' }}>{value || '—'}</div>}
            </div>
        </div>
    );
}

export default function MaintenanceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [m, setM] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/maintenances/${id}`)
            .then(res => setM(res.data))
            .catch(() => navigate('/maintenances'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}><div className="spinner-border text-warning" /></div>;
    if (!m) return null;

    const st = STATUS_MAP[m.status] || { label: m.status, color: '#64748b', bg: '#f1f5f9' };

    return (
        <div style={{ padding: '1.5rem', maxWidth: '660px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #fd7e1418, #fd7e1408)', border: '1.5px solid #fd7e1422', borderRadius: '16px', padding: '1.4rem 1.6rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '13px', background: '#fd7e14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🔧</div>
                <div>
                    <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>{t('maintenances.detail_title')}</h2>
                    <div style={{ display: 'flex', align: 'center', gap: '0.6rem', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{m.vehicle?.license_plate || '—'}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: st.color, background: st.bg, padding: '2px 9px', borderRadius: '20px' }}>{st.label}</span>
                    </div>
                </div>
            </div>

            {/* Cost highlight */}
            {m.cost && (
                <div style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid #f1f5f9', padding: '1rem 1.4rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Coût total</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fd7e14' }}>{Number(m.cost).toLocaleString()} FCFA</div>
                    </div>
                    {m.mileage_at_service && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Kilométrage</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{Number(m.mileage_at_service).toLocaleString()} km</div>
                        </div>
                    )}
                </div>
            )}

            {/* Details */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', padding: '0.4rem 1.4rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '1.25rem' }}>
                <InfoRow icon="📅" label={t('maintenances.detail_date')}    value={m.scheduled_date} />
                <InfoRow icon="✅" label="Date réalisée"                     value={m.completed_date || '—'} />
                <InfoRow icon="🚗" label={t('maintenances.detail_vehicle')} value={m.vehicle?.license_plate} />
                <InfoRow icon="👤" label={t('maintenances.detail_driver')}  value={m.driver?.name} />
                <InfoRow icon="🔩" label={t('maintenances.detail_type')}    value={m.maintenance_type} />
                <InfoRow icon="🏢" label={t('maintenances.detail_company')} value={m.maintenance_company} />
                <InfoRow icon="🔄" label={t('maintenances.detail_status') || 'Statut'} value={st.label} badge={st} />
                {m.description && <InfoRow icon="📝" label={t('maintenances.detail_desc')} value={m.description} />}
                {m.document_url && (
                    <div style={{ padding: '0.72rem 0' }}>
                        <a href={m.document_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#fd7e14', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', background: '#fff7ed', padding: '6px 14px', borderRadius: '8px' }}>
                            📄 {t('maintenances.document_view')}
                        </a>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => navigate('/maintenances')} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                    ← {t('common.back')}
                </button>
                <button onClick={() => navigate(`/maintenances/${id}/edit`)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: 'none', background: '#fd7e14', color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                    ✏️ {t('common.edit')}
                </button>
            </div>
        </div>
    );
}
