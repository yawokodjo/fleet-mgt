import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../axios.js';

const STATUS_MAP = {
    operational: { label: 'Opérationnel', color: '#16a34a', bg: '#dcfce7' },
    maintenance:  { label: 'En maintenance', color: '#d97706', bg: '#fef3c7' },
    out_of_service: { label: 'Hors service', color: '#dc2626', bg: '#fee2e2' },
};

const FUEL_ICON = { essence: '⛽', diesel: '🛢️', hybride: '⚡', électrique: '⚡', gpl: '🔵', autre: '⬛' };

function InfoRow({ icon, label, value, badge }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, marginRight: '0.9rem' }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
                {badge
                    ? <span style={{ fontSize: '0.82rem', fontWeight: 700, color: badge.color, background: badge.bg, padding: '2px 10px', borderRadius: '20px', display: 'inline-block', marginTop: '2px' }}>{value}</span>
                    : <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', marginTop: '1px' }}>{value || '—'}</div>}
            </div>
        </div>
    );
}

export default function VehicleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        api.get(`/vehicles/${id}`)
            .then(res => setVehicle(res.data))
            .catch(() => navigate('/vehicles'));
    }, [id, navigate]);

    if (!vehicle) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div className="spinner-border text-primary" />
        </div>
    );

    const st = STATUS_MAP[vehicle.status] || { label: vehicle.status, color: '#64748b', bg: '#f1f5f9' };

    return (
        <div style={{ padding: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
            {/* Header card */}
            <div style={{ background: 'linear-gradient(135deg, #0d6efd18, #0d6efd08)', border: '1.5px solid #0d6efd22', borderRadius: '16px', padding: '1.5rem 1.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#0d6efd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>🚗</div>
                <div>
                    <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.35rem', color: '#0f172a' }}>
                        {vehicle.marque} {vehicle.model}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '4px' }}>
                        <span style={{ fontWeight: 700, color: '#0d6efd', fontSize: '0.95rem', letterSpacing: '1px' }}>{vehicle.license_plate}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: st.color, background: st.bg, padding: '2px 9px', borderRadius: '20px' }}>{st.label}</span>
                    </div>
                </div>
            </div>

            {/* Info card */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', padding: '0.5rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.25rem' }}>
                <InfoRow icon="🏷️" label={t('vehicles.brand')}  value={vehicle.marque} />
                <InfoRow icon="🔖" label={t('vehicles.model')}   value={vehicle.model} />
                <InfoRow icon="📅" label={t('vehicles.year')}    value={vehicle.year} />
                <InfoRow icon={FUEL_ICON[vehicle.fuel_type] || '⛽'} label={t('vehicles.fuel_type')} value={vehicle.fuel_type} />
                <InfoRow icon="💳" label={t('vehicles.fuel_card')} value={vehicle.fuel_card || '—'} />
                <InfoRow icon="📍" label={t('vehicles.mileage')} value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '—'} />
                <InfoRow icon="🔄" label={t('vehicles.status')} value={st.label} badge={st} />
                {vehicle.document_url && (
                    <div style={{ padding: '0.75rem 0' }}>
                        <a href={vehicle.document_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#0d6efd', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', background: '#eff6ff', padding: '6px 14px', borderRadius: '8px' }}>
                            📄 {t('vehicles.document_view')}
                        </a>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => navigate('/vehicles')} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                    ← {t('vehicles.back_to_list')}
                </button>
                <Link to={`/vehicles/${id}/edit`} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: 'none', background: '#0d6efd', color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
                    ✏️ {t('common.edit')}
                </Link>
            </div>
        </div>
    );
}
