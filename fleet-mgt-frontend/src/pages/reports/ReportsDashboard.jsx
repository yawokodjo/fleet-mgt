import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../../axios';

/* ── helpers ── */
const fmt  = n => Number(n || 0).toLocaleString('fr-FR');
const fmtK = n => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} M` : n >= 1000 ? `${(n / 1000).toFixed(0)} k` : String(Math.round(n || 0));

/* ── SVG Illustrations ── */
function IlluFleet() {
    return (
        <svg viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <rect x="10" y="80" width="200" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
            {/* Car 1 */}
            <g transform="translate(20,50)">
                <rect x="8" y="16" width="64" height="22" rx="4" fill="rgba(255,255,255,0.18)" />
                <rect x="14" y="8" width="48" height="16" rx="3" fill="rgba(255,255,255,0.28)" />
                <circle cx="18" cy="40" r="6" fill="rgba(255,255,255,0.35)" />
                <circle cx="62" cy="40" r="6" fill="rgba(255,255,255,0.35)" />
                <rect x="16" y="11" width="16" height="10" rx="2" fill="rgba(255,255,255,0.15)" />
                <rect x="36" y="11" width="22" height="10" rx="2" fill="rgba(255,255,255,0.15)" />
            </g>
            {/* Car 2 */}
            <g transform="translate(110,55)">
                <rect x="8" y="14" width="58" height="20" rx="4" fill="rgba(255,255,255,0.12)" />
                <rect x="14" y="6" width="42" height="14" rx="3" fill="rgba(255,255,255,0.2)" />
                <circle cx="16" cy="36" r="5" fill="rgba(255,255,255,0.3)" />
                <circle cx="56" cy="36" r="5" fill="rgba(255,255,255,0.3)" />
            </g>
            {/* Chart bars */}
            <rect x="168" y="30" width="10" height="50" rx="3" fill="rgba(255,255,255,0.15)" />
            <rect x="182" y="18" width="10" height="62" rx="3" fill="rgba(255,255,255,0.22)" />
            <rect x="196" y="42" width="10" height="38" rx="3" fill="rgba(255,255,255,0.12)" />
            {/* Dots */}
            <circle cx="168" cy="22" r="3" fill="rgba(255,255,255,0.5)" />
            <circle cx="40"  cy="30" r="2" fill="rgba(255,255,255,0.3)" />
            <circle cx="80"  cy="20" r="2" fill="rgba(255,255,255,0.25)" />
            <circle cx="150" cy="35" r="3" fill="rgba(255,255,255,0.2)" />
        </svg>
    );
}

function IlluFuel() {
    return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            {/* Pump body */}
            <rect x="18" y="20" width="28" height="40" rx="4" fill="currentColor" opacity="0.3" />
            <rect x="22" y="24" width="20" height="12" rx="2" fill="currentColor" opacity="0.5" />
            {/* Nozzle */}
            <path d="M46 28 L58 22 L60 26 L52 32 L50 36 L46 34 Z" fill="currentColor" opacity="0.4" />
            <rect x="18" y="52" width="28" height="8" rx="2" fill="currentColor" opacity="0.45" />
            {/* Flame/wave */}
            <path d="M10 58 Q15 54 20 58 Q25 62 30 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            {/* Bar chart behind */}
            <rect x="4" y="45" width="6" height="20" rx="2" fill="currentColor" opacity="0.18" />
            <rect x="12" y="38" width="6" height="27" rx="2" fill="currentColor" opacity="0.14" />
        </svg>
    );
}

function IlluWrench() {
    return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            {/* Wrench */}
            <path d="M52 14a12 12 0 0 0-11.3 16L18 52a6 6 0 1 0 8.5 8.5l22.7-22.7A12 12 0 1 0 52 14z" fill="currentColor" opacity="0.35" />
            <circle cx="52" cy="26" r="5" fill="currentColor" opacity="0.5" />
            <circle cx="21" cy="57" r="3.5" fill="currentColor" opacity="0.55" />
            {/* Sparklines */}
            <polyline points="4,56 10,48 18,52 26,40 34,44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        </svg>
    );
}

/* ── Donut Chart ── */
function DonutChart({ segments, size = 110 }) {
    const r = 36; const cx = size / 2; const cy = size / 2;
    const circ = 2 * Math.PI * r;
    let offset = 0;
    const total = segments.reduce((s, sg) => s + sg.value, 0);
    const arcs = segments.map(sg => {
        const pct = total > 0 ? sg.value / total : 0;
        const dash = pct * circ;
        const arc = { dash, offset: circ - offset, ...sg };
        offset += dash;
        return arc;
    });
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
            {arcs.map((arc, i) => (
                <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                    stroke={arc.color} strokeWidth="14"
                    strokeDasharray={`${arc.dash} ${circ}`}
                    strokeDashoffset={arc.offset}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.8s ease' }}
                />
            ))}
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f172a">{total}</text>
            <text x={cx} y={cy + 13} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">TOTAL</text>
        </svg>
    );
}

/* ── Mini Sparkline ── */
function Sparkline({ values, color, height = 36, width = 100 }) {
    if (!values || values.length < 2) return null;
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - (v / max) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={`0,${height} ${pts} ${width},${height}`} fill={`${color}20`} stroke="none" />
        </svg>
    );
}

/* ── KPI Card ── */
function KpiCard({ icon, label, value, sub, color, spark, onClick, badge }) {
    return (
        <div onClick={onClick} style={{
            background: '#fff', borderRadius: '18px', padding: '1.3rem 1.5rem',
            border: `1.5px solid ${color}18`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'transform 0.18s, box-shadow 0.18s',
            position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0',
        }}
            onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 10px 30px ${color}22`; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; }}
        >
            {/* BG circle */}
            <div style={{ position: 'absolute', right: '-18px', top: '-18px', width: '90px', height: '90px', borderRadius: '50%', background: `${color}0d` }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color }}>
                    {icon}
                </div>
                {badge && <span style={{ fontSize: '0.7rem', fontWeight: 700, background: `${color}15`, color, padding: '3px 9px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{badge}</span>}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginTop: '5px' }}>{label}</div>
            {sub && <div style={{ fontSize: '0.73rem', color, fontWeight: 600, marginTop: '4px' }}>{sub}</div>}
            {spark && (
                <div style={{ marginTop: '0.75rem' }}>
                    <Sparkline values={spark} color={color} />
                </div>
            )}
        </div>
    );
}

/* ── Status Legend Row ── */
function StatusRow({ label, count, total, color, onClick }) {
    const pct = total > 0 ? Math.round(count / total * 100) : 0;
    return (
        <div onClick={onClick} style={{ marginBottom: '0.9rem', cursor: onClick ? 'pointer' : 'default', borderRadius: '8px', padding: onClick ? '2px 4px' : '0', transition: 'background 0.15s' }}
            onMouseEnter={e => { if (onClick) e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={e => { if (onClick) e.currentTarget.style.background = 'transparent'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{label}</span>
                    {onClick && <span style={{ fontSize: '0.65rem', color, fontWeight: 700 }}>↗</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color }}>{count}</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{pct}%</span>
                </div>
            </div>
            <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}cc, ${color})`, borderRadius: '6px', transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
        </div>
    );
}

/* ── Report Entry Card ── */
function ReportEntryCard({ color, gradient, title, desc, features, route, IlluComp, stat, statLabel }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: '#fff', borderRadius: '22px', overflow: 'hidden',
                border: `1.5px solid ${color}22`,
                boxShadow: hovered ? `0 16px 48px ${color}28` : '0 4px 18px rgba(0,0,0,0.07)',
                transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
                transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
            }}
        >
            {/* Gradient hero */}
            <div style={{ background: gradient, padding: '1.75rem 1.75rem 1.25rem', position: 'relative', overflow: 'hidden', minHeight: '160px' }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', right: '30px', bottom: '-50px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#fff', marginBottom: '0.35rem' }}>{title}</h3>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{desc}</p>
                        {stat && (
                            <div style={{ marginTop: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '5px 12px' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{stat}</span>
                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)' }}>{statLabel}</span>
                            </div>
                        )}
                    </div>
                    {/* Illustration */}
                    <div style={{ width: '80px', height: '80px', color: '#fff', flexShrink: 0, opacity: 0.9 }}>
                        <IlluComp />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '1.4rem 1.75rem' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {features.map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '0.83rem', color: '#475569' }}>
                            <span style={{ width: '20px', height: '20px', borderRadius: '6px', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>✓</span>
                            {f}
                        </li>
                    ))}
                </ul>
                <button
                    onClick={() => navigate(route)}
                    style={{
                        width: '100%', padding: '0.72rem', borderRadius: '12px', border: 'none',
                        background: gradient, color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                        cursor: 'pointer', letterSpacing: '0.2px',
                        boxShadow: `0 4px 16px ${color}40`,
                        transition: 'opacity 0.18s, box-shadow 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}55`; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1';   e.currentTarget.style.boxShadow = `0 4px 16px ${color}40`; }}
                >
                    {t('reports.access_report')}
                </button>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════ */
export default function ReportsDashboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [vehicles,     setVehicles]     = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [consumptions, setConsumptions] = useState([]);
    const [loading,      setLoading]      = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/vehicles-list').catch(() => ({ data: [] })),
            api.get('/maintenances',  { headers }).catch(() => ({ data: [] })),
            api.get('/consumptions',  { headers }).catch(() => ({ data: [] })),
        ]).then(([v, m, c]) => {
            const toArr = d => Array.isArray(d.data) ? d.data : (d.data?.data ?? []);
            setVehicles(toArr(v));
            setMaintenances(toArr(m));
            setConsumptions(toArr(c));
        }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stats = useMemo(() => {
        const now = new Date(); const mo = now.getMonth(); const yr = now.getFullYear();

        const vByStatus = { operational: 0, maintenance: 0, out_of_service: 0 };
        vehicles.forEach(v => { vByStatus[v.status] = (vByStatus[v.status] || 0) + 1; });

        const mByStatus = { planned: 0, in_progress: 0, completed: 0, cancelled: 0 };
        maintenances.forEach(m => { mByStatus[m.status] = (mByStatus[m.status] || 0) + 1; });
        const totalMaintCost = maintenances.reduce((s, m) => s + Number(m.cost || 0), 0);

        const thisMonth = consumptions.filter(c => {
            const d = new Date(c.date || c.created_at);
            return d.getMonth() === mo && d.getFullYear() === yr;
        });
        const totalFuelVolume = thisMonth.reduce((s, c) => s + Number(c.fuel_volume || 0), 0);
        const totalFuelCost   = thisMonth.reduce((s, c) => s + Number(c.fuel_cost   || 0), 0);
        const allFuelCost     = consumptions.reduce((s, c) => s + Number(c.fuel_cost || 0), 0);

        const sorted = [...consumptions].sort((a, b) => new Date(a.date) - new Date(b.date));
        const monthlyFuel = {};
        sorted.forEach(c => {
            const d = new Date(c.date || c.created_at);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            monthlyFuel[key] = (monthlyFuel[key] || 0) + Number(c.fuel_cost || 0);
        });
        const sparkFuel = Object.values(monthlyFuel).slice(-6);

        const withMileage = sorted.filter(c => c.mileage);
        let dist = 0, vol = 0;
        for (let i = 1; i < withMileage.length; i++) {
            const d = withMileage[i].mileage - withMileage[i-1].mileage;
            if (d > 0 && withMileage[i].vehicle_id === withMileage[i-1].vehicle_id) { dist += d; vol += Number(withMileage[i].fuel_volume || 0); }
        }
        const avgL100 = dist > 0 ? (vol / dist * 100).toFixed(1) : null;
        const alerts  = vehicles.filter(v => v.status !== 'operational');

        return { vByStatus, mByStatus, totalMaintCost, totalFuelVolume, totalFuelCost, allFuelCost, avgL100, alerts, thisMonthCount: thisMonth.length, sparkFuel };
    }, [vehicles, maintenances, consumptions]);

    const monthName = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    const exportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(16); doc.setFont(undefined, 'bold');
        doc.text('Rapport de synthèse — Gestion de Flotte', 14, 16);
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(`Compassion International Togo · ${today}`, 14, 23);

        autoTable(doc, {
            startY: 30,
            head: [['Indicateur', 'Valeur']],
            body: [
                ['Véhicules (total)',             String(vehicles.length)],
                ['  – Opérationnels',             String(stats.vByStatus.operational)],
                ['  – En maintenance',            String(stats.vByStatus.maintenance)],
                ['  – Hors service',              String(stats.vByStatus.out_of_service)],
                ['Maintenances (total)',          String(maintenances.length)],
                ['  – Planifiées',               String(stats.mByStatus.planned)],
                ['  – En cours',                 String(stats.mByStatus.in_progress)],
                ['  – Terminées',               String(stats.mByStatus.completed)],
                ['  – Annulées',                String(stats.mByStatus.cancelled)],
                ['Coût total maintenances (FCFA)', fmt(Math.round(stats.totalMaintCost))],
                [`Carburant — ${monthName} (FCFA)`, fmt(Math.round(stats.totalFuelCost))],
                [`Volume carburant — ${monthName} (L)`, stats.totalFuelVolume.toFixed(1)],
                ['Carburant historique total (FCFA)', fmt(Math.round(stats.allFuelCost))],
                ['Conso. moyenne (L/100 km)',      stats.avgL100 ?? 'N/A'],
                ['Ravitaillements (total)',        String(consumptions.length)],
            ],
            styles: { fontSize: 9 },
            headStyles: { fillColor: [13, 58, 110] },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 90 } },
        });

        doc.save(`rapport-synthese-${new Date().toISOString().slice(0,10)}.pdf`);
    };

    const exportExcel = () => {
        const wb = XLSX.utils.book_new();

        const kpiRows = [
            { Indicateur: 'Véhicules (total)',              Valeur: vehicles.length },
            { Indicateur: '  – Opérationnels',              Valeur: stats.vByStatus.operational },
            { Indicateur: '  – En maintenance',             Valeur: stats.vByStatus.maintenance },
            { Indicateur: '  – Hors service',               Valeur: stats.vByStatus.out_of_service },
            { Indicateur: 'Maintenances (total)',           Valeur: maintenances.length },
            { Indicateur: '  – Planifiées',                Valeur: stats.mByStatus.planned },
            { Indicateur: '  – En cours',                  Valeur: stats.mByStatus.in_progress },
            { Indicateur: '  – Terminées',                Valeur: stats.mByStatus.completed },
            { Indicateur: '  – Annulées',                 Valeur: stats.mByStatus.cancelled },
            { Indicateur: 'Coût total maintenances (FCFA)', Valeur: stats.totalMaintCost },
            { Indicateur: `Carburant — ${monthName} (FCFA)`, Valeur: stats.totalFuelCost },
            { Indicateur: `Volume carburant — ${monthName} (L)`, Valeur: Number(stats.totalFuelVolume.toFixed(1)) },
            { Indicateur: 'Carburant historique total (FCFA)', Valeur: stats.allFuelCost },
            { Indicateur: 'Conso. moyenne (L/100 km)',       Valeur: stats.avgL100 ?? 'N/A' },
            { Indicateur: 'Ravitaillements (total)',         Valeur: consumptions.length },
        ];
        const ws = XLSX.utils.json_to_sheet(kpiRows);
        ws['!cols'] = [{ wch: 40 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Synthèse');

        XLSX.writeFile(wb, `rapport-synthese-${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
            <div style={{ width: '52px', height: '52px', border: '4px solid #e2e8f0', borderTopColor: '#0d6efd', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{t('common.loading')}</span>
        </div>
    );

    return (
        <div style={{ padding: '1.5rem 1.75rem', maxWidth: '1160px', margin: '0 auto', background: '#f8fafd', minHeight: '100vh' }}>

            {/* ── Hero Banner ── */}
            <div style={{
                background: 'linear-gradient(135deg, #0d1b36 0%, #0d4a8c 60%, #1a6fd4 100%)',
                borderRadius: '0 0 24px 24px', marginBottom: '1.75rem', overflow: 'hidden',
                padding: '2rem 2.5rem',
            }}>
                {/* BG blobs */}
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'absolute', bottom: '-80px', left: '40%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.6rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {t('nav.dashboard')}
                            </div>
                            <div style={{ background: '#10b981', borderRadius: '20px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                                {t('reports.live_data_badge')}
                            </div>
                        </div>
                        <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                            {t('reports.hero_title')}
                        </h1>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                            {t('reports.fleet_overview')} — <span style={{ color: '#60c8ff', fontWeight: 600 }}>{monthName}</span>
                        </p>

                        {/* Quick stats row */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem', alignItems: 'center' }}>
                            {[
                                { label: t('reports.vehicles_section'),    value: vehicles.length,     icon: '🚗' },
                                { label: t('reports.maintenances_section'), value: maintenances.length, icon: '🔧' },
                                { label: t('reports.quick_refuels'),        value: consumptions.length, icon: '⛽' },
                                { label: t('reports.quick_alerts'),         value: stats.alerts.length, icon: '⚠️' },
                            ].map((s, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    <span style={{ fontSize: '1rem' }}>{s.icon}</span>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.5)', background: 'rgba(220,38,38,0.18)', color: '#fca5a5', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                PDF
                            </button>
                            <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '10px', border: '1px solid rgba(22,163,74,0.5)', background: 'rgba(22,163,74,0.18)', color: '#86efac', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                Excel
                            </button>
                        </div>
                    </div>

                    {/* SVG illustration */}
                    <div style={{ width: '200px', height: '130px', flexShrink: 0, opacity: 0.85 }}>
                        <IlluFleet />
                    </div>
                </div>
            </div>

            {/* ── Alert banner ── */}
            {stats.alerts.length > 0 && (
                <div style={{ background: 'linear-gradient(135deg, #fff7ed, #fff3e0)', border: '1.5px solid #fed7aa', borderRadius: '14px', padding: '0.85rem 1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fd7e14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>⚠️</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#92400e' }}>{t('reports.vehicles_alert', { count: stats.alerts.length })}</div>
                        <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '2px' }}>{stats.alerts.map(v => v.license_plate).join(' · ')}</div>
                    </div>
                    <button onClick={() => navigate('/vehicles?status=maintenance,out_of_service')} style={{ background: '#fd7e14', border: 'none', color: '#fff', borderRadius: '8px', padding: '5px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                        {t('reports.see_link')}
                    </button>
                </div>
            )}

            {/* ── KPI Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                <KpiCard icon="🚗" color="#0d6efd" label={t('reports.vehicles_section')}
                    value={vehicles.length}
                    sub={t('dashboard.vehicles_kpi_sub', { op: stats.vByStatus.operational, mnt: stats.vByStatus.maintenance })}
                    badge={`${stats.vByStatus.maintenance} ${t('vehicles.status_maintenance').toLowerCase()}`}
                    onClick={() => navigate('/vehicles')} />
                <KpiCard icon="🔧" color="#fd7e14" label={t('reports.maintenances_section')}
                    value={maintenances.length}
                    sub={t('dashboard.maintenances_kpi_sub', { inProgress: stats.mByStatus.in_progress, planned: stats.mByStatus.planned })}
                    badge={`${fmt(Math.round(stats.totalMaintCost))} FCFA`}
                    onClick={() => navigate('/maintenances')} />
                <KpiCard icon="⛽" color="#198754" label={t('dashboard.fuel_kpi_label', { month: monthName })}
                    value={`${fmtK(stats.totalFuelCost)} FCFA`}
                    sub={t('dashboard.fuel_kpi_sub', { vol: stats.totalFuelVolume.toFixed(0), count: stats.thisMonthCount })}
                    spark={stats.sparkFuel}
                    onClick={() => navigate('/consumptions')} />
                <KpiCard icon="📈" color="#6610f2" label={t('reports.avg_consumption')}
                    value={stats.avgL100 ? `${stats.avgL100} L/100` : '—'}
                    sub={stats.avgL100 ? t('reports.full_fleet') : t('reports.insufficient_data')}
                    badge={`${fmtK(stats.allFuelCost)} FCFA ${t('reports.total_cost_label')}`} />
            </div>

            {/* ── Breakdown Charts ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>

                {/* Véhicules par statut */}
                <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{t('reports.vehicles_section')}</h3>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{t('reports.vehicles_distribution')}</p>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#eff6ff', color: '#0d6efd', padding: '4px 10px', borderRadius: '20px' }}>{vehicles.length} total</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <DonutChart segments={[
                            { value: stats.vByStatus.operational,   color: '#16a34a' },
                            { value: stats.vByStatus.maintenance,    color: '#d97706' },
                            { value: stats.vByStatus.out_of_service, color: '#dc2626' },
                        ]} />
                        <div style={{ flex: 1 }}>
                            <StatusRow label={t('reports.status_operational')}   count={stats.vByStatus.operational}    total={vehicles.length} color="#16a34a" onClick={() => navigate('/vehicles?status=operational')} />
                            <StatusRow label={t('reports.status_maintenance')}   count={stats.vByStatus.maintenance}     total={vehicles.length} color="#d97706" onClick={() => navigate('/vehicles?status=maintenance')} />
                            <StatusRow label={t('reports.status_out_of_service')} count={stats.vByStatus.out_of_service}  total={vehicles.length} color="#dc2626" onClick={() => navigate('/vehicles?status=out_of_service')} />
                        </div>
                    </div>
                </div>

                {/* Maintenances par statut */}
                <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{t('reports.maintenances_section')}</h3>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{t('reports.vehicles_distribution')}</p>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#fff7ed', color: '#fd7e14', padding: '4px 10px', borderRadius: '20px' }}>{maintenances.length} total</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <DonutChart segments={[
                            { value: stats.mByStatus.planned,     color: '#0d6efd' },
                            { value: stats.mByStatus.in_progress, color: '#d97706' },
                            { value: stats.mByStatus.completed,   color: '#16a34a' },
                            { value: stats.mByStatus.cancelled,   color: '#dc2626' },
                        ]} />
                        <div style={{ flex: 1 }}>
                            <StatusRow label={t('maintenances.status_label_planned')}     count={stats.mByStatus.planned}     total={maintenances.length} color="#0d6efd" />
                            <StatusRow label={t('maintenances.status_label_in_progress')} count={stats.mByStatus.in_progress} total={maintenances.length} color="#d97706" />
                            <StatusRow label={t('maintenances.status_label_completed')}   count={stats.mByStatus.completed}   total={maintenances.length} color="#16a34a" />
                            <StatusRow label={t('maintenances.status_label_cancelled')}   count={stats.mByStatus.cancelled}   total={maintenances.length} color="#dc2626" />
                        </div>
                    </div>
                </div>

                {/* Fuel summary */}
                <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{t('reports.fuel_section')}</h3>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{t('reports.fuel_summary')}</p>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#f0fdf4', color: '#198754', padding: '4px 10px', borderRadius: '20px' }}>{t('reports.fuel_badge', { count: consumptions.length })}</span>
                    </div>
                    {[
                        { label: t('reports.historical_cost'),              value: `${fmt(Math.round(stats.allFuelCost))} FCFA`,    color: '#198754', bg: '#f0fdf4' },
                        { label: t('reports.this_month', { month: monthName }), value: `${fmt(Math.round(stats.totalFuelCost))} FCFA`, color: '#0d6efd', bg: '#eff6ff' },
                        { label: t('reports.volume_month'),                 value: `${stats.totalFuelVolume.toFixed(1)} L`,         color: '#6610f2', bg: '#f5f3ff' },
                        { label: t('reports.avg_consumption'),              value: stats.avgL100 ? `${stats.avgL100} L/100km` : '—', color: '#fd7e14', bg: '#fff7ed' },
                    ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', borderRadius: '10px', background: row.bg, marginBottom: i < 3 ? '0.5rem' : 0 }}>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{row.label}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: row.color }}>{row.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Report Entry Cards ── */}
            <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.2px', whiteSpace: 'nowrap' }}>{t('reports.detailed_reports_section')}</span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    <ReportEntryCard
                        color="#0d6efd"
                        gradient="linear-gradient(135deg, #0b3d8f 0%, #0d6efd 50%, #3b82f6 100%)"
                        title={t('reports.vehicle_report_title')}
                        desc={t('reports.vehicle_report_desc')}
                        IlluComp={IlluFleet}
                        stat={`${vehicles.length}`}
                        statLabel={t('reports.records_count')}
                        features={[
                            t('reports.filter_status'),
                            t('reports.filter_year'),
                            t('reports.status_distribution'),
                            t('reports.mileage_total'),
                        ]}
                        route="/reports/vehicles"
                    />
                    <ReportEntryCard
                        color="#198754"
                        gradient="linear-gradient(135deg, #0f7340 0%, #198754 50%, #22c55e 100%)"
                        title={t('reports.consumption_title')}
                        desc={t('reports.consumption_desc')}
                        IlluComp={IlluFuel}
                        stat={`${consumptions.length}`}
                        statLabel={t('reports.records_count')}
                        features={[
                            t('reports.filter_vehicle'),
                            t('reports.filter_period'),
                            t('reports.export_excel'),
                            t('reports.l100km_calc'),
                        ]}
                        route="/reports/consumption"
                    />
                    <ReportEntryCard
                        color="#fd7e14"
                        gradient="linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #fd7e14 100%)"
                        title={t('reports.maintenance_title')}
                        desc={t('reports.maintenance_desc')}
                        IlluComp={IlluWrench}
                        stat={`${fmt(Math.round(stats.totalMaintCost))} FCFA`}
                        statLabel={t('reports.total_cost_label')}
                        features={[
                            t('reports.filter_vehicle'),
                            t('reports.filter_period'),
                            t('reports.export_excel'),
                            t('reports.cost_per_vehicle'),
                        ]}
                        route="/reports/maintenance"
                    />
                </div>
            </div>
        </div>
    );
}
