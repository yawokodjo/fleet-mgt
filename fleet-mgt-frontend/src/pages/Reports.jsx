import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../axios';

/* ── helpers ── */
const fmt  = (n) => Number(n || 0).toLocaleString('fr-FR');
const fmtK = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)} k` : String(Math.round(n || 0));

function KpiCard({ icon, label, value, sub, color, onClick }) {
    return (
        <div onClick={onClick} style={{
            background: '#fff', borderRadius: '16px', padding: '1.25rem 1.4rem',
            border: `1.5px solid ${color}22`, boxShadow: '0 2px 14px rgba(0,0,0,0.06)',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'transform 0.18s, box-shadow 0.18s',
            position: 'relative', overflow: 'hidden',
        }}
            onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}30`; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,0,0,0.06)'; }}
        >
            <div style={{ position: 'absolute', right: '-10px', top: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: `${color}10` }} />
            <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '0.85rem' }}>
                {icon}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginTop: '4px' }}>{label}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: color, fontWeight: 600, marginTop: '3px' }}>{sub}</div>}
        </div>
    );
}

function StatusBar({ label, count, total, color }) {
    const pct = total > 0 ? Math.round(count / total * 100) : 0;
    return (
        <div style={{ marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{label}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>
                    {count} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({pct}%)</span>
                </span>
            </div>
            <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '6px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
        </div>
    );
}

function ReportCard({ icon, color, title, desc, features, route }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    return (
        <div style={{ background: '#fff', borderRadius: '18px', border: `1.5px solid ${color}22`, boxShadow: '0 2px 14px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${color}18, ${color}08)`, borderBottom: `3px solid ${color}`, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '13px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                    {icon}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{title}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{desc}</p>
                </div>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {features.map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
                            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: `${color}20`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>✓</span>
                            {f}
                        </li>
                    ))}
                </ul>
                <button onClick={() => navigate(route)} style={{
                    width: '100%', padding: '0.65rem', borderRadius: '10px', border: 'none',
                    background: color, color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                    cursor: 'pointer', boxShadow: `0 4px 14px ${color}40`,
                    transition: 'opacity 0.18s',
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    {t('reports.view_report')} →
                </button>
            </div>
        </div>
    );
}

/* trick: t accessible inside ReportCard via prop drill is simpler — inline below */

export default function Reports() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [vehicles,     setVehicles]     = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [consumptions, setConsumptions] = useState([]);
    const [loading,      setLoading]      = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/vehicles-list').catch(() => ({ data: [] })),
            api.get('/maintenances').catch(() => ({ data: [] })),
            api.get('/consumptions').catch(() => ({ data: [] })),
        ]).then(([v, m, c]) => {
            const toArr = d => Array.isArray(d.data) ? d.data : (d.data?.data || []);
            setVehicles(toArr(v));
            setMaintenances(toArr(m));
            setConsumptions(toArr(c));
        }).finally(() => setLoading(false));
     
    }, []);

    /* ── computed stats ── */
    const stats = useMemo(() => {
        const now   = new Date();
        const month = now.getMonth();
        const year  = now.getFullYear();

        // vehicles
        const vByStatus = { operational: 0, maintenance: 0, out_of_service: 0 };
        vehicles.forEach(v => { vByStatus[v.status] = (vByStatus[v.status] || 0) + 1; });

        // maintenances
        const mByStatus = { planned: 0, in_progress: 0, completed: 0, cancelled: 0 };
        maintenances.forEach(m => { mByStatus[m.status] = (mByStatus[m.status] || 0) + 1; });
        const totalMaintCost = maintenances.reduce((s, m) => s + Number(m.cost || 0), 0);

        // consumptions — current month
        const thisMonth = consumptions.filter(c => {
            const d = new Date(c.date || c.created_at);
            return d.getMonth() === month && d.getFullYear() === year;
        });
        const totalFuelVolume = thisMonth.reduce((s, c) => s + Number(c.fuel_volume || 0), 0);
        const totalFuelCost   = thisMonth.reduce((s, c) => s + Number(c.fuel_cost   || 0), 0);

        // all-time totals
        const allFuelCost = consumptions.reduce((s, c) => s + Number(c.fuel_cost || 0), 0);

        // avg L/100km (single-vehicle consumptions with mileage)
        const withMileage = consumptions.filter(c => c.mileage).sort((a, b) => new Date(a.date) - new Date(b.date));
        let distances = 0, volumes = 0;
        for (let i = 1; i < withMileage.length; i++) {
            const dist = withMileage[i].mileage - withMileage[i - 1].mileage;
            if (dist > 0) { distances += dist; volumes += Number(withMileage[i].fuel_volume || 0); }
        }
        const avgL100 = distances > 0 ? (volumes / distances * 100).toFixed(1) : null;

        // alerts: vehicles not operational
        const alerts = vehicles.filter(v => v.status !== 'operational');

        return { vByStatus, mByStatus, totalMaintCost, totalFuelVolume, totalFuelCost, allFuelCost, avgL100, alerts, thisMonthCount: thisMonth.length };
    }, [vehicles, maintenances, consumptions]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="spinner-border text-primary" />
        </div>
    );

    const monthName = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', background: '#f4f6fb', minHeight: '100vh' }}>

            {/* ── Header ── */}
            <div style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.45rem', color: '#0f172a', margin: 0 }}>
                    📊 {t('reports.title')}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px', marginBottom: 0 }}>
                    {t('reports.dashboard_subtitle')} — <span style={{ fontWeight: 600, color: '#0d6efd' }}>{monthName}</span>
                </p>
            </div>

            {/* ── Alerts ── */}
            {stats.alerts.length > 0 && (
                <div style={{ background: '#fff8ed', border: '1.5px solid #fd7e1440', borderRadius: '14px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#92400e' }}>
                            {stats.alerts.length} véhicule(s) hors service ou en maintenance
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '3px' }}>
                            {stats.alerts.map(v => v.license_plate).join(' · ')}
                        </div>
                    </div>
                    <button onClick={() => navigate('/vehicles')} style={{ marginLeft: 'auto', background: '#fd7e14', border: 'none', color: '#fff', borderRadius: '8px', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                        Voir →
                    </button>
                </div>
            )}

            {/* ── KPI row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <KpiCard icon="🚗" color="#0d6efd" label={t('dashboard.vehicles')}
                    value={vehicles.length}
                    sub={`${stats.vByStatus.operational} opérationnel(s)`}
                    onClick={() => navigate('/vehicles')} />
                <KpiCard icon="🔧" color="#fd7e14" label={t('dashboard.maintenances')}
                    value={maintenances.length}
                    sub={`${stats.mByStatus.in_progress} en cours`}
                    onClick={() => navigate('/maintenances')} />
                <KpiCard icon="⛽" color="#198754" label={`Carburant — ${monthName}`}
                    value={`${fmtK(stats.totalFuelCost)} FCFA`}
                    sub={`${stats.totalFuelVolume.toFixed(0)} L — ${stats.thisMonthCount} plein(s)`}
                    onClick={() => navigate('/consumptions')} />
                <KpiCard icon="💰" color="#6610f2" label="Coût maintenance total"
                    value={`${fmtK(stats.totalMaintCost)} FCFA`}
                    sub={stats.avgL100 ? `Moy. ${stats.avgL100} L/100km` : 'Tous véhicules'} />
            </div>

            {/* ── Breakdowns ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>

                {/* Véhicules par statut */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '1.4rem 1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>Véhicules par statut</h3>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0d6efd', background: '#eff6ff', padding: '3px 10px', borderRadius: '20px' }}>{vehicles.length} total</span>
                    </div>
                    <StatusBar label="Opérationnel"   count={stats.vByStatus.operational}    total={vehicles.length} color="#16a34a" />
                    <StatusBar label="En maintenance"  count={stats.vByStatus.maintenance}     total={vehicles.length} color="#d97706" />
                    <StatusBar label="Hors service"    count={stats.vByStatus.out_of_service}  total={vehicles.length} color="#dc2626" />
                </div>

                {/* Maintenances par statut */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '1.4rem 1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>Maintenances par statut</h3>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fd7e14', background: '#fff7ed', padding: '3px 10px', borderRadius: '20px' }}>{maintenances.length} total</span>
                    </div>
                    <StatusBar label="Planifié"   count={stats.mByStatus.planned}     total={maintenances.length} color="#0d6efd" />
                    <StatusBar label="En cours"   count={stats.mByStatus.in_progress} total={maintenances.length} color="#d97706" />
                    <StatusBar label="Terminé"    count={stats.mByStatus.completed}   total={maintenances.length} color="#16a34a" />
                    <StatusBar label="Annulé"     count={stats.mByStatus.cancelled}   total={maintenances.length} color="#dc2626" />
                </div>

                {/* Fuel stats */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '1.4rem 1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>Carburant — synthèse</h3>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#198754', background: '#f0fdf4', padding: '3px 10px', borderRadius: '20px' }}>{consumptions.length} pleins</span>
                    </div>
                    {[
                        { label: 'Coût total (tous)', value: `${fmt(Math.round(stats.allFuelCost))} FCFA`, color: '#198754' },
                        { label: `Coût ce mois (${monthName})`, value: `${fmt(Math.round(stats.totalFuelCost))} FCFA`, color: '#0d6efd' },
                        { label: `Volume ce mois`, value: `${stats.totalFuelVolume.toFixed(1)} L`, color: '#6610f2' },
                        { label: 'Consommation moy.',  value: stats.avgL100 ? `${stats.avgL100} L/100km` : '— (données insuffisantes)', color: '#fd7e14' },
                    ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{row.label}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: row.color }}>{row.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Report access cards ── */}
            <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '1rem' }}>
                    Accès aux rapports détaillés
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>

                    {/* Rapport Consommation */}
                    <div style={{ background: '#fff', borderRadius: '18px', border: '1.5px solid #19875422', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, #19875418, #19875408)', borderBottom: '3px solid #198754', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '13px', background: '#198754', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>⛽</div>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{t('reports.consumption_title')}</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{t('reports.consumption_desc')}</p>
                            </div>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {[t('reports.filter_vehicle'), t('reports.filter_period'), t('reports.export_excel'), 'Calcul distance & taux L/100km'].map((f, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
                                        <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#19875420', color: '#198754', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>✓</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => navigate('/reports/consumption')} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: 'none', background: '#198754', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 14px #19875440', transition: 'opacity 0.18s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                {t('reports.view_report')} →
                            </button>
                        </div>
                    </div>

                    {/* Rapport Maintenance */}
                    <div style={{ background: '#fff', borderRadius: '18px', border: '1.5px solid #fd7e1422', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, #fd7e1418, #fd7e1408)', borderBottom: '3px solid #fd7e14', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '13px', background: '#fd7e14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🔧</div>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{t('reports.maintenance_title')}</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{t('reports.maintenance_desc')}</p>
                            </div>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {[t('reports.filter_vehicle'), t('reports.filter_period'), t('reports.export_excel'), 'Suivi des coûts par véhicule'].map((f, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
                                        <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fd7e1420', color: '#fd7e14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>✓</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => navigate('/reports/maintenance')} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: 'none', background: '#fd7e14', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 14px #fd7e1440', transition: 'opacity 0.18s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                {t('reports.view_report')} →
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
