import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../axios';

/* ── helpers ── */
const fmt  = n => Number(n || 0).toLocaleString('fr-FR');
const fmtK = n => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} M` : n >= 1000 ? `${(n / 1000).toFixed(0)} k` : String(Math.round(n || 0));
const pct  = (a, b) => b > 0 ? Math.round(a / b * 100) : 0;

/* ── Donut mini ── */
function DonutMini({ value, max, color, size = 64 }) {
    const r = 24; const c = size / 2; const circ = 2 * Math.PI * r;
    const filled = max > 0 ? (value / max) * circ : 0;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={c} cy={c} r={r} fill="none" stroke={`${color}22`} strokeWidth="8" />
            <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="8"
                strokeDasharray={`${filled} ${circ}`} strokeDashoffset={circ * 0.25}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }} />
            <text x={c} y={c + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={color}>
                {max > 0 ? `${Math.round(value / max * 100)}%` : '—'}
            </text>
        </svg>
    );
}

/* ── Sparkline ── */
function Spark({ values, color, w = 90, h = 32 }) {
    if (!values || values.length < 2) return <div style={{ width: w, height: h }} />;
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(' ');
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`${color}18`} stroke="none" />
        </svg>
    );
}

/* ── KPI Card ── */
function KpiCard({ icon, label, value, sub, color, gradient, spark, trend, onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <div onClick={onClick}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                background: '#fff', borderRadius: '20px', padding: '1.35rem 1.5rem',
                border: `1.5px solid ${color}18`,
                boxShadow: hov ? `0 12px 32px ${color}25` : '0 2px 16px rgba(0,0,0,0.06)',
                transform: hov && onClick ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                cursor: onClick ? 'pointer' : 'default',
                position: 'relative', overflow: 'hidden',
            }}
        >
            <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '96px', height: '96px', borderRadius: '50%', background: `${color}0a` }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: gradient || `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                    {icon}
                </div>
                {trend !== undefined && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: trend >= 0 ? '#dcfce7' : '#fee2e2', color: trend >= 0 ? '#16a34a' : '#dc2626' }}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginTop: '5px' }}>{label}</div>
            {sub && <div style={{ fontSize: '0.73rem', color, fontWeight: 600, marginTop: '3px' }}>{sub}</div>}
            {spark && <div style={{ marginTop: '0.7rem' }}><Spark values={spark} color={color} /></div>}
        </div>
    );
}

/* ── Progress stat row ── */
function StatRow({ label, value, total, color, suffix }) {
    const p = pct(value, total);
    return (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.81rem', color: '#475569', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color }}>{suffix || `${value} / ${total}`} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.72rem' }}>({p}%)</span></span>
            </div>
            <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p}%`, background: `linear-gradient(90deg, ${color}cc, ${color})`, borderRadius: '6px', transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
        </div>
    );
}

/* ── Activity item ── */
function ActivityItem({ icon, bg, title, sub, time, onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
            style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.7rem 0.85rem', borderRadius: '12px', background: hov ? '#f8fafd' : 'transparent', transition: 'background 0.15s', cursor: onClick ? 'pointer' : 'default' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem', flexShrink: 0 }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '1px' }}>{sub}</div>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>{time}</div>
        </div>
    );
}

/* ── Quick action ── */
function QuickAction({ icon, label, color, gradient, onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
            style={{
                background: hov ? gradient : `${color}0f`,
                border: `1.5px solid ${color}${hov ? '44' : '22'}`,
                borderRadius: '16px', padding: '1.25rem 1rem', textAlign: 'center', cursor: 'pointer',
                transform: hov ? 'translateY(-3px)' : 'translateY(0)',
                boxShadow: hov ? `0 8px 20px ${color}30` : 'none',
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
            }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: hov ? '#fff' : '#334155', lineHeight: 1.3 }}>{label}</div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════ */
export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    /* ── State ── */
    const [vehicles,     setVehicles]     = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [consumptions, setConsumptions] = useState([]);
    const [drivers,      setDrivers]      = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [currentTime,  setCurrentTime]  = useState(new Date());
    const [showWarning,  setShowWarning]  = useState(false);
    const [countdown,    setCountdown]    = useState(60);
    const [weather,      setWeather]      = useState(null);

    /* ── Clock ── */
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    /* ── Weather — Open-Meteo (Lomé, Togo) — gratuit, sans clé ── */
    useEffect(() => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=6.1375&longitude=1.2123&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Africa%2FAbidjan&forecast_days=1')
            .then(r => r.json())
            .then(data => {
                const c = data.current;
                const code = c.weather_code;
                const icon =
                    code === 0               ? '☀️'  :
                    code <= 3                ? '🌤️' :
                    code <= 48               ? '🌫️' :
                    code <= 67               ? '🌧️' :
                    code <= 77               ? '🌨️' :
                    code <= 82               ? '🌦️' :
                    code <= 99               ? '⛈️'  : '🌡️';
                const desc =
                    code === 0               ? 'Ciel dégagé'   :
                    code <= 3                ? 'Peu nuageux'   :
                    code <= 48               ? 'Brouillard'    :
                    code <= 67               ? 'Pluvieux'      :
                    code <= 82               ? 'Averses'       :
                    code <= 99               ? 'Orageux'       : '';
                setWeather({
                    temp:     Math.round(c.temperature_2m),
                    humidity: c.relative_humidity_2m,
                    wind:     Math.round(c.wind_speed_10m),
                    icon,
                    desc,
                });
            })
            .catch(() => {/* silently ignore — widget simply stays hidden */});
    }, []);

    /* ── Inactivity timer ── */
    useEffect(() => {
        const IDLE = 5 * 60 * 1000; const WARN = 60 * 1000;
        let idleT, warnT, cntT;
        const reset = () => {
            clearTimeout(idleT); clearTimeout(warnT); clearInterval(cntT);
            setShowWarning(false); setCountdown(60);
            warnT = setTimeout(() => {
                setShowWarning(true);
                let s = 60; cntT = setInterval(() => { s--; setCountdown(s); if (s <= 0) clearInterval(cntT); }, 1000);
            }, IDLE - WARN);
            idleT = setTimeout(() => logout(), IDLE);
        };
        const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(e => document.addEventListener(e, reset));
        reset();
        return () => { clearTimeout(idleT); clearTimeout(warnT); clearInterval(cntT); events.forEach(e => document.removeEventListener(e, reset)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logout]);

    /* ── Fetch data ── */
    useEffect(() => {
        const toArr = d => Array.isArray(d.data) ? d.data : (d.data?.data ?? []);
        Promise.all([
            api.get('/vehicles-list', { headers }).catch(() => ({ data: [] })),
            api.get('/maintenances',  { headers }).catch(() => ({ data: [] })),
            api.get('/consumptions',  { headers }).catch(() => ({ data: [] })),
            api.get('/drivers',       { headers }).catch(() => ({ data: [] })),
        ]).then(([v, m, c, d]) => {
            setVehicles(toArr(v));
            setMaintenances(toArr(m));
            setConsumptions(toArr(c));
            setDrivers(Array.isArray(d.data) ? d.data : (d.data?.data ?? []));
        }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Computed stats ── */
    const stats = useMemo(() => {
        const now = new Date(); const mo = now.getMonth(); const yr = now.getFullYear();

        // vehicles
        const vOp  = vehicles.filter(v => v.status === 'operational').length;
        const vMnt = vehicles.filter(v => v.status === 'maintenance').length;
        const vOos = vehicles.filter(v => v.status === 'out_of_service').length;
        const alerts = vehicles.filter(v => v.status !== 'operational');

        // maintenances
        const mCompleted  = maintenances.filter(m => m.status === 'completed').length;
        const mInProgress = maintenances.filter(m => m.status === 'in_progress').length;
        const mPlanned    = maintenances.filter(m => m.status === 'planned').length;
        const totalMaintCost = maintenances.reduce((s, m) => s + Number(m.cost || 0), 0);

        // consumptions — this month vs last month
        const thisMonth = consumptions.filter(c => {
            const d = new Date(c.date || c.created_at);
            return d.getMonth() === mo && d.getFullYear() === yr;
        });
        const lastMonthDate = new Date(yr, mo - 1, 1);
        const lastMonth = consumptions.filter(c => {
            const d = new Date(c.date || c.created_at);
            return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
        });
        const fuelThisMonth = thisMonth.reduce((s, c) => s + Number(c.fuel_cost || 0), 0);
        const fuelLastMonth = lastMonth.reduce((s, c) => s + Number(c.fuel_cost || 0), 0);
        const fuelTrend = fuelLastMonth > 0 ? Math.round((fuelThisMonth - fuelLastMonth) / fuelLastMonth * 100) : null;
        const volThisMonth = thisMonth.reduce((s, c) => s + Number(c.fuel_volume || 0), 0);

        // monthly sparkline (last 6 months)
        const monthlyMap = {};
        consumptions.forEach(c => {
            const d = new Date(c.date || c.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
            monthlyMap[key] = (monthlyMap[key] || 0) + Number(c.fuel_cost || 0);
        });
        const spark = Object.keys(monthlyMap).sort().slice(-6).map(k => monthlyMap[k]);

        // avg L/100km
        const sorted = [...consumptions].sort((a, b) => new Date(a.date) - new Date(b.date));
        let dist = 0, vol = 0;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].vehicle_id !== sorted[i-1].vehicle_id) continue;
            const d = Number(sorted[i].mileage || 0) - Number(sorted[i-1].mileage || 0);
            if (d > 0) { dist += d; vol += Number(sorted[i].fuel_volume || 0); }
        }
        const avgL100 = dist > 0 ? (vol / dist * 100).toFixed(1) : null;

        // recent activity: merge last maintenances + consumptions, sort by date, top 6
        const mActivity = maintenances.slice(-10).map(m => ({
            id: `m-${m.id}`, type: 'maintenance', date: new Date(m.scheduled_date || m.created_at),
            title: `${m.maintenance_type || 'Maintenance'} — ${m.maintenance_company || ''}`.trim(),
            sub: m.vehicle?.license_plate || `Véhicule #${m.vehicle_id}`,
            icon: '🔧', bg: 'linear-gradient(135deg, #fd7e14, #f59e0b)',
            route: `/maintenances/${m.id}`,
        }));
        const cActivity = consumptions.slice(-10).map(c => ({
            id: `c-${c.id}`, type: 'consumption', date: new Date(c.date || c.created_at),
            title: `Plein — ${fmt(Math.round(c.fuel_cost || 0))} FCFA`,
            sub: c.vehicle?.license_plate || `Véhicule #${c.vehicle_id}`,
            icon: '⛽', bg: 'linear-gradient(135deg, #198754, #22c55e)',
            route: `/consumptions/${c.id}`,
        }));
        const recent = [...mActivity, ...cActivity]
            .sort((a, b) => b.date - a.date)
            .slice(0, 6);

        return { vOp, vMnt, vOos, alerts, mCompleted, mInProgress, mPlanned, totalMaintCost, fuelThisMonth, fuelLastMonth, fuelTrend, volThisMonth, spark, avgL100, recent, thisMonthCount: thisMonth.length };
    }, [vehicles, maintenances, consumptions]);

    /* ── Time helpers ── */
    const timeStr = currentTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = currentTime.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
    const monthName = currentTime.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

    const relativeTime = (date) => {
        const diff = (new Date() - date) / 1000;
        if (diff < 3600)  return `Il y a ${Math.round(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.round(diff / 3600)} h`;
        if (diff < 172800) return 'Hier';
        return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '1rem' }}>
            <div style={{ width: '52px', height: '52px', border: '4px solid #e2e8f0', borderTopColor: '#0d6efd', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Chargement du tableau de bord…</span>
        </div>
    );

    return (
        <div style={{ padding: '1.5rem 1.75rem', maxWidth: '1200px', margin: '0 auto', background: '#f8fafd', minHeight: '100vh' }}>

            {/* ── Inactivity warning ── */}
            {showWarning && (
                <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 9999, minWidth: '320px', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 16px 48px rgba(220,38,38,0.4)', color: '#fff', animation: 'slideIn 0.3s ease' }}>
                    <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>⏰</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{t('dashboard.inactivity_title')}</div>
                            <div style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: '0.85rem' }}>
                                {t('dashboard.inactivity_msg_1')} <strong>{countdown}s</strong> {t('dashboard.inactivity_msg_2')}
                            </div>
                            <button onClick={() => { setShowWarning(false); setCountdown(60); }} style={{ width: '100%', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', borderRadius: '9px', padding: '0.45rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                                {t('dashboard.still_here')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Hero Banner ── */}
            <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d3a6e 55%, #1565c0 100%)', borderRadius: '24px', padding: '1.75rem 2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'absolute', bottom: '-80px', left: '35%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.25rem' }}>
                    {/* Welcome */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '0.4rem' }}>
                            Tableau de bord
                        </div>
                        <h1 style={{ margin: 0, fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                            {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || '' })}
                        </h1>
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            {t('dashboard.subtitle')}
                        </p>

                        {/* Alert chip */}
                        {stats.alerts.length > 0 && (
                            <div onClick={() => navigate('/vehicles')} style={{ marginTop: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(253,126,20,0.22)', border: '1px solid rgba(253,126,20,0.4)', borderRadius: '10px', padding: '5px 12px', cursor: 'pointer' }}>
                                <span style={{ fontSize: '0.85rem' }}>⚠️</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbb03b' }}>{stats.alerts.length} véhicule(s) hors service ou en maintenance</span>
                            </div>
                        )}
                    </div>

                    {/* Clock card */}
                    <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '18px', padding: '1.1rem 1.4rem', border: '1px solid rgba(255,255,255,0.15)', minWidth: '200px' }}>
                        <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', letterSpacing: '1px', lineHeight: 1 }}>{timeStr}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', marginTop: '4px', textTransform: 'capitalize' }}>{dateStr}</div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                            {weather ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{weather.icon}</span>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{weather.temp}°C</div>
                                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{weather.desc} · Lomé</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.7rem', marginLeft: 'auto' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7dd3fc' }}>💧 {weather.humidity}%</div>
                                            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.38)' }}>Humidité</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5f3fc' }}>💨 {weather.wind} km/h</div>
                                            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.38)' }}>Vent</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>Météo en chargement…</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <KpiCard
                    icon="🚗" color="#0d6efd"
                    gradient="linear-gradient(135deg, #dbeafe, #eff6ff)"
                    label="Véhicules"
                    value={vehicles.length}
                    sub={`${stats.vOp} opérationnel(s) · ${stats.vMnt} en maint.`}
                    onClick={() => navigate('/vehicles')}
                />
                <KpiCard
                    icon="🔧" color="#fd7e14"
                    gradient="linear-gradient(135deg, #fff7ed, #ffedd5)"
                    label="Maintenances"
                    value={maintenances.length}
                    sub={`${stats.mInProgress} en cours · ${stats.mPlanned} planifié(s)`}
                    onClick={() => navigate('/maintenances')}
                />
                <KpiCard
                    icon="⛽" color="#198754"
                    gradient="linear-gradient(135deg, #dcfce7, #f0fdf4)"
                    label={`Carburant — ${monthName}`}
                    value={`${fmtK(stats.fuelThisMonth)} FCFA`}
                    sub={`${stats.volThisMonth.toFixed(0)} L · ${stats.thisMonthCount} plein(s)`}
                    trend={stats.fuelTrend}
                    spark={stats.spark}
                    onClick={() => navigate('/consumptions')}
                />
                <KpiCard
                    icon="👥" color="#6610f2"
                    gradient="linear-gradient(135deg, #f3e8ff, #faf5ff)"
                    label="Chauffeurs"
                    value={drivers.length}
                    sub={stats.avgL100 ? `Moy. ${stats.avgL100} L/100km` : 'Parc actif'}
                    onClick={() => navigate('/users')}
                />
            </div>

            {/* ── Middle row: Stats + Activity ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>

                {/* Real-time fleet stats */}
                <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.3rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{t('dashboard.monthly_stats')}</h3>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Calculé depuis les données réelles</p>
                        </div>
                    </div>

                    <StatRow
                        label="Véhicules opérationnels"
                        value={stats.vOp} total={vehicles.length}
                        color="#16a34a"
                    />
                    <StatRow
                        label="Maintenances terminées"
                        value={stats.mCompleted} total={maintenances.length}
                        color="#0d6efd"
                    />
                    <StatRow
                        label="Véhicules en maintenance"
                        value={stats.vMnt} total={vehicles.length}
                        color="#d97706"
                    />
                    <StatRow
                        label="Maintenances en cours"
                        value={stats.mInProgress} total={maintenances.length}
                        color="#fd7e14"
                    />

                    {/* Fuel vs maintenance cost */}
                    <div style={{ marginTop: '1.1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {[
                            { label: 'Coût maintenance', value: `${fmtK(stats.totalMaintCost)} FCFA`, color: '#fd7e14', bg: '#fff7ed' },
                            { label: 'Carburant total', value: `${fmtK(consumptions.reduce((s,c) => s+Number(c.fuel_cost||0), 0))} FCFA`, color: '#198754', bg: '#f0fdf4' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: item.bg, borderRadius: '11px', padding: '0.65rem 0.85rem' }}>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{item.label}</div>
                                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: item.color, marginTop: '3px' }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent activity — real data */}
                <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{t('dashboard.recent_activity')}</h3>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Maintenances &amp; consommations récentes</p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fd7e14', display: 'inline-block' }} />
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#198754', display: 'inline-block' }} />
                        </div>
                    </div>

                    {stats.recent.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                            Aucune activité récente
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {stats.recent.map(item => (
                                <ActivityItem key={item.id}
                                    icon={item.icon} bg={item.bg}
                                    title={item.title} sub={item.sub}
                                    time={relativeTime(item.date)}
                                    onClick={() => navigate(item.route)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Fleet health donut */}
                <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Santé de la flotte</h3>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Indicateurs clés en temps réel</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {[
                            { label: 'Véhicules opérationnels', value: stats.vOp, max: vehicles.length, color: '#16a34a' },
                            { label: 'Maintenances terminées', value: stats.mCompleted, max: maintenances.length, color: '#0d6efd' },
                            { label: 'Pleins ce mois', value: stats.thisMonthCount, max: consumptions.length, color: '#198754' },
                            { label: 'Maintenances planifiées', value: stats.mPlanned, max: maintenances.length, color: '#d97706' },
                        ].map((item, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                                <DonutMini value={item.value} max={item.max} color={item.color} />
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginTop: '5px', lineHeight: 1.3 }}>{item.label}</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: item.color }}>{item.value} <span style={{ fontWeight: 400, color: '#94a3b8' }}>/ {item.max}</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 1.1rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{t('dashboard.quick_actions')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.9rem' }}>
                    {[
                        { icon: '🚗', label: t('dashboard.add_vehicle'),      color: '#0d6efd', gradient: 'linear-gradient(135deg, #0d6efd, #3b82f6)', route: '/vehicles/create' },
                        { icon: '🔧', label: t('dashboard.new_maintenance'),   color: '#fd7e14', gradient: 'linear-gradient(135deg, #fd7e14, #f59e0b)', route: '/maintenances/create' },
                        { icon: '⛽', label: t('dashboard.new_consumption'),   color: '#198754', gradient: 'linear-gradient(135deg, #198754, #22c55e)', route: '/consumptions/create' },
                        { icon: '📊', label: t('dashboard.view_reports'),      color: '#6610f2', gradient: 'linear-gradient(135deg, #6610f2, #8b5cf6)', route: '/reports' },
                    ].map((a, i) => (
                        <QuickAction key={i} icon={a.icon} label={a.label} color={a.color} gradient={a.gradient} onClick={() => navigate(a.route)} />
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(110%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
            `}</style>
        </div>
    );
}
