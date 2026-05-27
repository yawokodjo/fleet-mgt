import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoCI from "../assets/logo-ci.png";

const NAV_GROUPS = [
    {
        label: null,
        links: [
            { to: "/dashboard", labelKey: "nav.dashboard", icon: <DashIcon /> },
            { to: "/vehicles",  labelKey: "nav.vehicles",  icon: <CarIcon /> },
            { to: "/consumptions", labelKey: "nav.consumptions", icon: <FuelIcon /> },
            { to: "/maintenances", labelKey: "nav.maintenances", icon: <WrenchIcon /> },
        ],
    },
    {
        labelKey: "nav.reports_group",
        links: [
            { to: "/reports",              labelKey: "nav.reports",              icon: <ChartIcon /> },
            { to: "/reports/vehicles",     labelKey: "nav.vehicle_report",       icon: <CarIcon /> },
            { to: "/reports/consumption",  labelKey: "nav.consumption_report",   icon: <TrendIcon /> },
            { to: "/reports/maintenance",  labelKey: "nav.maintenance_report",   icon: <ToolIcon /> },
        ],
    },
    {
        labelKey: "nav.admin_group",
        links: [
            { to: "/users",   labelKey: "nav.users",   icon: <UsersIcon /> },
            { to: "/profile", labelKey: "nav.profile", icon: <PersonIcon /> },
        ],
    },
];

/* ── SVG icons ── */
function DashIcon()    { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>; }
function CarIcon()     { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 17H3v-3.5a1 1 0 0 1 .1-.45l2.4-5.6A1 1 0 0 1 6.4 7h11.2a1 1 0 0 1 .9.55l2.4 5.6a1 1 0 0 1 .1.45V17h-2m-14 0h14m-14 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>; }
function FuelIcon()    { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5h1a2 2 0 0 1 2 2v4a1 1 0 0 0 2 0v-6l-3-3"/><rect x="5" y="8" width="6" height="4" rx="1"/></svg>; }
function WrenchIcon()  { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"/></svg>; }
function ChartIcon()   { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 20V10m-6 10V4M6 20v-6"/></svg>; }
function TrendIcon()   { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>; }
function ToolIcon()    { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>; }
function UsersIcon()   { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function PersonIcon()  { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function HamburgerIcon({ open }) {
    return open
        ? <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
        : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}

const SIDEBAR_BG   = "linear-gradient(180deg, #06101e 0%, #0b1a30 60%, #091526 100%)";
const ACTIVE_BG    = "rgba(13,110,253,0.18)";
const ACTIVE_COLOR = "#4d9fff";
const HOVER_BG     = "rgba(255,255,255,0.05)";
const TEXT_MUTED   = "rgba(255,255,255,0.38)";
const TEXT_NORMAL  = "rgba(255,255,255,0.78)";

export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            <style>{`
                @media (min-width: 768px) {
                    .sb-panel { transform: translateX(0) !important; }
                }
                .sb-link {
                    display: flex; align-items: center; gap: 12px;
                    padding: 10px 16px; border-radius: 10px; margin: 2px 8px;
                    text-decoration: none; font-size: 0.88rem; font-weight: 500;
                    color: ${TEXT_NORMAL}; transition: background 0.18s, color 0.18s;
                    cursor: pointer;
                }
                .sb-link:hover { background: ${HOVER_BG}; color: #fff; }
                .sb-link.active { background: ${ACTIVE_BG}; color: ${ACTIVE_COLOR}; }
                .sb-link .sb-icon { flex-shrink: 0; opacity: 0.75; transition: opacity 0.18s; }
                .sb-link:hover .sb-icon, .sb-link.active .sb-icon { opacity: 1; }
                .sb-group-label {
                    font-size: 0.67rem; font-weight: 700; letter-spacing: 1.2px;
                    text-transform: uppercase; color: ${TEXT_MUTED};
                    padding: 6px 24px 4px; margin-top: 8px;
                }
                .sb-scroll::-webkit-scrollbar { width: 4px; }
                .sb-scroll::-webkit-scrollbar-track { background: transparent; }
                .sb-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
            `}</style>

            {/* Hamburger — visible only on mobile, fixed top-left */}
            <button
                onClick={() => setOpen(!open)}
                className="d-md-none"
                style={{
                    position: 'fixed', top: '12px', left: '12px', zIndex: 1100,
                    background: '#0d6efd', border: 'none', color: '#fff',
                    borderRadius: '10px', width: '40px', height: '40px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(13,110,253,0.4)',
                    cursor: 'pointer',
                }}
            >
                <HamburgerIcon open={open} />
            </button>

            {/* Overlay */}
            {open && (
                <div
                    className="d-md-none"
                    onClick={() => setOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1050,
                        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
                    }}
                />
            )}

            {/* Sidebar panel */}
            <div
                style={{
                    width: '240px',
                    position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 1060,
                    background: SIDEBAR_BG,
                    display: 'flex', flexDirection: 'column',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    transform: `translateX(${open ? '0' : '-100%'})`,
                    transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
                }}
                className="sb-panel d-md-block"
            >
                {/* Logo */}
                <div style={{
                    padding: '1.1rem 1.25rem 0.9rem',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <Link to="/"><img src={logoCI} alt="CI" style={{ height: '34px', objectFit: 'contain' }} /></Link>
                    <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                            CI Togo
                        </div>
                        <div style={{ fontSize: '0.65rem', color: TEXT_MUTED, lineHeight: 1.2 }}>
                            Gestion de Flotte
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="sb-scroll flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden', paddingTop: '0.5rem', paddingBottom: '1rem' }}>
                    {NAV_GROUPS.map((group, gi) => (
                        <div key={gi}>
                            {group.labelKey && (
                                <div className="sb-group-label">{t(group.labelKey)}</div>
                            )}
                            {group.links.map(link => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    end={link.to === "/"}
                                    className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="sb-icon">{link.icon}</span>
                                    <span>{t(link.labelKey)}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div style={{
                    padding: '0.9rem 1.25rem',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    fontSize: '0.7rem', color: TEXT_MUTED,
                }}>
                    <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '2px' }}>
                        Compassion International Togo
                    </div>
                    <div>© 2025 • v1.0</div>
                </div>
            </div>

            {/* Spacer so content doesn't hide under fixed sidebar on desktop */}
            <div className="d-none d-md-block flex-shrink-0" style={{ width: '240px' }} />
        </>
    );
}
