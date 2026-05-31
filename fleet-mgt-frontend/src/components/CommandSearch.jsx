import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../axios';

const QUICK_ACTIONS = (t) => [
  { icon: '🚗', label: t('dashboard.add_vehicle'), path: '/vehicles/create', color: '#667eea' },
  { icon: '🔧', label: t('dashboard.new_maintenance'), path: '/maintenances/create', color: '#f5576c' },
  { icon: '⛽', label: t('dashboard.new_consumption'), path: '/consumptions/create', color: '#f093fb' },
  { icon: '📊', label: t('dashboard.view_reports'), path: '/reports', color: '#43e97b' },
];

function Highlight({ text, query }) {
  if (!query || !text) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark style={{ background: '#fef3c7', color: '#92400e', borderRadius: '2px', padding: '0 2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
}

export default function CommandSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ vehicles: [], drivers: [], maintenances: [], consumptions: [] });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const go = useCallback((path) => { onClose(); navigate(path); }, [onClose, navigate]);

  // Flatten results into a navigable list
  const flatItems = [];
  results.vehicles.forEach(v => flatItems.push({ path: `/vehicles/${v.id}`, primary: v.license_plate, secondary: `${v.marque} ${v.model}`, icon: '🚗', color: '#667eea' }));
  results.drivers.forEach(d => flatItems.push({ path: `/users/${d.id}`, primary: d.name, secondary: d.email || '', icon: '👤', color: '#43e97b' }));
  results.maintenances.forEach(m => flatItems.push({ path: `/maintenances/${m.id}`, primary: m.maintenance_type, secondary: `${m.vehicle?.license_plate || ''} • ${m.maintenance_company || ''}`, icon: '🔧', color: '#f5576c' }));
  results.consumptions.forEach(c => flatItems.push({ path: `/consumptions/${c.id}`, primary: c.vehicle?.license_plate || '-', secondary: `${c.fuel_volume}L • ${c.driver?.name || ''}`, icon: '⛽', color: '#f093fb' }));

  const flatItemsRef = useRef(flatItems);
  flatItemsRef.current = flatItems;

  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const quickActions = QUICK_ACTIONS(t);
  const showHint = query.trim().length < 2;
  const hasResults = flatItems.length > 0;
  const showEmpty = query.trim().length >= 2 && !loading && !hasResults;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ vehicles: [], drivers: [], maintenances: [], consumptions: [] });
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => { setActiveIndex(-1); }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-result-item]');
      if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { onClose(); return; }
      const items = flatItemsRef.current;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (i < items.length - 1 ? i + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => (i > 0 ? i - 1 : items.length - 1));
      } else if (e.key === 'Enter') {
        const idx = activeIndexRef.current;
        if (idx >= 0 && idx < items.length) {
          e.preventDefault();
          go(items[idx].path);
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, go]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ vehicles: [], drivers: [], maintenances: [], consumptions: [] });
      return;
    }
    const search = async () => {
      setLoading(true);
      try {
        const [vRes, dRes, mRes, cRes] = await Promise.all([
          api.get('/vehicles-list').catch(() => ({ data: [] })),
          api.get('/drivers').catch(() => ({ data: [] })),
          api.get('/maintenances').catch(() => ({ data: [] })),
          api.get('/consumptions').catch(() => ({ data: [] })),
        ]);
        const q = query.toLowerCase().trim();
        const arr = (r) => (Array.isArray(r.data) ? r.data : r.data.data || []);
        setResults({
          vehicles: arr(vRes).filter(v =>
            v.license_plate?.toLowerCase().includes(q) ||
            v.marque?.toLowerCase().includes(q) ||
            v.model?.toLowerCase().includes(q)
          ).slice(0, 5),
          drivers: arr(dRes).filter(d => d.name?.toLowerCase().includes(q)).slice(0, 5),
          maintenances: arr(mRes).filter(m =>
            m.maintenance_type?.toLowerCase().includes(q) ||
            m.vehicle?.license_plate?.toLowerCase().includes(q)
          ).slice(0, 5),
          consumptions: arr(cRes).filter(c =>
            c.vehicle?.license_plate?.toLowerCase().includes(q) ||
            c.driver?.name?.toLowerCase().includes(q)
          ).slice(0, 5),
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Group rendering helpers
  const groups = [
    { icon: '🚗', color: '#667eea', title: t('header.results_vehicles'), items: results.vehicles, renderItem: (v) => ({ primary: v.license_plate, secondary: `${v.marque} ${v.model}`, path: `/vehicles/${v.id}` }) },
    { icon: '👤', color: '#43e97b', title: t('header.results_drivers'), items: results.drivers, renderItem: (d) => ({ primary: d.name, secondary: d.email || '', path: `/users/${d.id}` }) },
    { icon: '🔧', color: '#f5576c', title: t('header.results_maintenances'), items: results.maintenances, renderItem: (m) => ({ primary: m.maintenance_type, secondary: `${m.vehicle?.license_plate || ''} • ${m.maintenance_company || ''}`, path: `/maintenances/${m.id}` }) },
    { icon: '⛽', color: '#f093fb', title: t('header.results_consumptions'), items: results.consumptions, renderItem: (c) => ({ primary: c.vehicle?.license_plate || '-', secondary: `${c.fuel_volume}L • ${c.driver?.name || ''}`, path: `/consumptions/${c.id}` }) },
  ];

  // Compute global index offset per group for active highlight
  const groupOffsets = [];
  let offset = 0;
  groups.forEach(g => { groupOffsets.push(offset); offset += g.items.length; });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.18 }}
            style={{
              width: '100%', maxWidth: '640px', margin: '0 1rem',
              background: '#ffffff', borderRadius: '16px', overflow: 'hidden',
              boxShadow: '0 32px 64px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)',
            }}
          >
            {/* Input row */}
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '14px 18px', gap: '12px',
              borderBottom: '1px solid #f1f5f9',
            }}>
              {loading ? (
                <div className="spinner-border spinner-border-sm text-secondary" style={{ flexShrink: 0 }} />
              ) : (
                <svg width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2.2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('header.search_modal_placeholder')}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', color: '#0f172a' }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{
                  background: '#f1f5f9', border: 'none', borderRadius: '50%',
                  width: '22px', height: '22px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748b', fontSize: '0.75rem', flexShrink: 0,
                }}>✕</button>
              )}
              <kbd onClick={onClose} title={t('common.cancel')} style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px',
                padding: '3px 9px', fontSize: '0.72rem', color: '#64748b',
                cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              }}>Esc</kbd>
            </div>

            {/* Results area */}
            <div ref={listRef} style={{ maxHeight: '440px', overflowY: 'auto' }}>
              {/* Quick actions when no query */}
              {showHint && (
                <div style={{ padding: '12px 8px' }}>
                  <div style={{
                    padding: '5px 10px 6px',
                    fontSize: '0.68rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8',
                  }}>
                    ⚡ {t('home.quick_actions_label')}
                  </div>
                  {quickActions.map((action) => (
                    <button
                      key={action.path}
                      onMouseDown={() => go(action.path)}
                      style={{
                        width: '100%', padding: '9px 10px', borderRadius: '8px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                        background: 'transparent', border: 'none', textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        background: `${action.color}22`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: '1rem',
                      }}>{action.icon}</div>
                      <span style={{ fontWeight: 500, fontSize: '0.88rem', color: '#1e293b' }}>{action.label}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#94a3b8' }}>↵</span>
                    </button>
                  ))}
                  <div style={{ padding: '16px 10px 8px', textAlign: 'center', color: '#cbd5e1', fontSize: '0.76rem' }}>
                    {t('header.search_hint')}
                  </div>
                </div>
              )}

              {showEmpty && (
                <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>😔</div>
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>{t('header.no_results', { query })}</p>
                </div>
              )}

              {hasResults && (
                <div style={{ padding: '8px' }}>
                  {groups.map((group, gi) => {
                    if (!group.items.length) return null;
                    return (
                      <div key={group.title} style={{ marginBottom: '4px' }}>
                        <div style={{
                          padding: '5px 10px 3px',
                          fontSize: '0.68rem', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8',
                        }}>
                          {group.icon} {group.title}
                        </div>
                        {group.items.map((item, itemIdx) => {
                          const { primary, secondary, path } = group.renderItem(item);
                          const globalIdx = groupOffsets[gi] + itemIdx;
                          const isActive = globalIdx === activeIndex;
                          return (
                            <div
                              key={item.id}
                              data-result-item
                              onMouseDown={() => go(path)}
                              onMouseEnter={() => setActiveIndex(globalIdx)}
                              style={{
                                padding: '9px 10px', borderRadius: '8px',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                                background: isActive ? '#f1f5f9' : 'transparent',
                                transition: 'background 0.1s',
                                outline: isActive ? `2px solid ${group.color}44` : 'none',
                              }}
                            >
                              <div style={{
                                width: '34px', height: '34px', borderRadius: '8px',
                                background: `${group.color}22`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, fontSize: '1rem',
                              }}>{group.icon}</div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <Highlight text={primary} query={query} />
                                </div>
                                {secondary && (
                                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    <Highlight text={secondary} query={query} />
                                  </div>
                                )}
                              </div>
                              {isActive && (
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0 }}>↵</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '8px 16px', borderTop: '1px solid #f1f5f9',
              display: 'flex', gap: '16px', fontSize: '0.72rem', color: '#94a3b8',
            }}>
              <span>↑↓ {t('common.navigate')}</span>
              <span>↵ {t('common.confirm')}</span>
              <span>Esc {t('common.cancel')}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
