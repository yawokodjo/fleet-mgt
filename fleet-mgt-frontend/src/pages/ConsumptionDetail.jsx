import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../axios';

function InfoRow({ icon, label, value }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.72rem 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', flexShrink: 0, marginRight: '0.85rem' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginTop: '1px' }}>{value || '—'}</div>
            </div>
        </div>
    );
}

export default function ConsumptionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [c, setC] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/consumptions/${id}`)
            .then(res => setC(res.data))
            .catch(() => navigate('/consumptions'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}><div className="spinner-border text-success" /></div>;
    if (!c) return null;

    const cpl = c.fuel_volume > 0 ? Math.round(c.fuel_cost / c.fuel_volume) : null;

    return (
        <div style={{ padding: '1.5rem', maxWidth: '660px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #dcfce7, #f0fdf4)', border: '1.5px solid #86efac', borderRadius: '0 0 18px 18px', padding: '0.9rem 1.5rem 1.1rem', marginBottom: '1.25rem', boxShadow: '0 4px 20px rgba(22,163,74,0.1)' }}>
                <button onClick={() => navigate('/consumptions')} style={{ background: 'none', border: 'none', color: '#22c55e', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', padding: 0, marginBottom: '0.55rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ‹ {t('common.back')}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '13px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.45rem', flexShrink: 0, boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>⛽</div>
                <div>
                    <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', lineHeight: 1.2 }}>{t('consumptions.detail_title')}</h2>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
                        {c.vehicle?.license_plate || '—'} · {c.date}
                    </div>
                </div>
                </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {[
                    { label: 'Volume', value: `${Number(c.fuel_volume).toFixed(2)} L`, color: '#0d6efd' },
                    { label: 'Coût Total', value: `${Number(c.fuel_cost).toLocaleString()} FCFA`, color: '#198754' },
                    { label: 'Coût/Litre', value: cpl ? `${cpl.toLocaleString()} FCFA` : '—', color: '#fd7e14' },
                ].map((s, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid #f1f5f9', padding: '0.9rem', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{s.label}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: s.color, marginTop: '4px' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Details */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', padding: '0.4rem 1.4rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '1.25rem' }}>
                <InfoRow icon="📅" label={t('consumptions.detail_date')}   value={c.date} />
                <InfoRow icon="🚗" label={t('consumptions.detail_vehicle')} value={c.vehicle?.license_plate} />
                <InfoRow icon="👤" label={t('consumptions.detail_driver')}  value={c.driver?.name} />
                <InfoRow icon="📍" label={t('consumptions.mileage')}        value={c.mileage ? `${Number(c.mileage).toLocaleString()} km` : '—'} />
                <InfoRow icon="⛽" label={t('consumptions.detail_liters')}  value={`${Number(c.fuel_volume).toFixed(2)} L`} />
                <InfoRow icon="💰" label={t('consumptions.detail_amount')}  value={`${Number(c.fuel_cost).toLocaleString()} FCFA`} />
                {c.document_url && (
                    <div style={{ padding: '0.72rem 0' }}>
                        <a href={c.document_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#198754', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', background: '#f0fdf4', padding: '6px 14px', borderRadius: '8px' }}>
                            📄 {t('consumptions.document_view')}
                        </a>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => navigate('/consumptions')} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                    ← {t('common.back_to_list')}
                </button>
                <button onClick={() => navigate(`/consumptions/${id}/edit`)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: 'none', background: '#198754', color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                    ✏️ {t('common.edit')}
                </button>
            </div>
        </div>
    );
}
