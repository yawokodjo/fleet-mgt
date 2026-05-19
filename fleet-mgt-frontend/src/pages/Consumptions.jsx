import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../axios";
import Pagination from "../components/Pagination";

function SortIcon({ col, sortBy, sortDir }) {
  if (sortBy !== col) return <span style={{ color: '#cbd5e1', marginLeft: 4, fontSize: '0.7rem' }}>⇅</span>;
  return <span style={{ color: '#0d6efd', marginLeft: 4, fontSize: '0.75rem' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

function Th({ col, label, sortBy, sortDir, onSort }) {
  return (
    <th onClick={() => onSort(col)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
      {label}<SortIcon col={col} sortBy={sortBy} sortDir={sortDir} />
    </th>
  );
}

export default function Consumptions() {
  const [logs, setLogs]             = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15, from: 0, to: 0 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [sortBy, setSortBy]         = useState('date');
  const [sortDir, setSortDir]       = useState('desc');
  const [selectedConsumption, setSelectedConsumption] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const filtersRef    = useRef({ search: '', startDate: '', endDate: '', sortBy: 'date', sortDir: 'desc', perPage: 15 });
  const searchTimeout = useRef(null);
  const menuRef       = useRef(null);
  const navigate      = useNavigate();
  const { t }         = useTranslation();

  useEffect(() => {
    fetchData(1);
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setSelectedConsumption(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async (page = 1, perPage = filtersRef.current.perPage) => {
    setLoading(true);
    try {
      const { search: s, startDate: sd, endDate: ed, sortBy: sb, sortDir: sdir } = filtersRef.current;
      const params = { page, per_page: perPage, sort_by: sb, sort_dir: sdir };
      if (s)  params.search     = s;
      if (sd) params.start_date = sd;
      if (ed) params.end_date   = ed;
      const res = await api.get("/consumptions", { params });
      const d = res.data;
      setLogs(d.data || d || []);
      const pp = { currentPage: d.current_page ?? 1, lastPage: d.last_page ?? 1, total: d.total ?? 0, perPage: d.per_page ?? perPage, from: d.from ?? 0, to: d.to ?? 0 };
      setPagination(pp);
      filtersRef.current.perPage = pp.perPage;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    filtersRef.current.search = value;
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchData(1), 350);
  };

  const handleStartDate = (value) => {
    setStartDate(value);
    filtersRef.current.startDate = value;
    fetchData(1);
  };

  const handleEndDate = (value) => {
    setEndDate(value);
    filtersRef.current.endDate = value;
    fetchData(1);
  };

  const handleSort = (col) => {
    const newDir = filtersRef.current.sortBy === col && filtersRef.current.sortDir === 'desc' ? 'asc' : 'desc';
    setSortBy(col); setSortDir(newDir);
    filtersRef.current.sortBy = col;
    filtersRef.current.sortDir = newDir;
    fetchData(1);
  };

  const clearAll = () => {
    clearTimeout(searchTimeout.current);
    setSearch(''); setStartDate(''); setEndDate('');
    filtersRef.current.search = ''; filtersRef.current.startDate = ''; filtersRef.current.endDate = '';
    fetchData(1);
  };

  const handlePageChange    = (page)    => { setSelectedConsumption(null); fetchData(page); };
  const handlePerPageChange = (perPage) => { setSelectedConsumption(null); filtersRef.current.perPage = perPage; fetchData(1, perPage); };

  const handleRowClick = (event, c) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: event.clientX, y: rect.bottom });
    setSelectedConsumption(c);
  };

  const handleView   = () => { navigate(`/consumptions/${selectedConsumption.id}`);      setSelectedConsumption(null); };
  const handleEdit   = () => { navigate(`/consumptions/${selectedConsumption.id}/edit`); setSelectedConsumption(null); };
  const handleDelete = async () => {
    if (!window.confirm(t('consumptions.delete_confirm'))) { setSelectedConsumption(null); return; }
    try {
      await api.delete(`/consumptions/${selectedConsumption.id}`);
      alert(t('consumptions.delete_success'));
      setSelectedConsumption(null);
      fetchData(pagination.currentPage);
    } catch (err) {
      console.error(err);
      alert(t('common.error'));
      setSelectedConsumption(null);
    }
  };

  const formatDate = (s) => {
    if (!s) return "-";
    try { const d = new Date(s); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
    catch { return s; }
  };

  const hasFilter = search || startDate || endDate;
  const thProps   = { sortBy, sortDir, onSort: handleSort };

  return (
    <div className="container py-4">
      <div className="sticky-page-header" style={{ background: '#fff', borderRadius: '0 0 18px 18px', boxShadow: '0 4px 24px rgba(25,135,84,0.1)', padding: '0.85rem 0', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>⛽</div>
            <div>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', lineHeight: 1.2 }}>{t('consumptions.list_title')}</h2>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>{pagination.total} {t('reports.records_count')}</span>
            </div>
          </div>
          <button onClick={() => navigate("/consumptions/create")}
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#fff', borderRadius: '10px', padding: '0.48rem 1.1rem', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 3px 10px rgba(22,163,74,0.28)', whiteSpace: 'nowrap' }}>
            + {t('consumptions.add_btn')}
          </button>
        </div>
      </div>

      {/* Barre recherche + filtres */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '14px' }}>
        <div className="card-body py-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white" style={{ border: '2px solid #e9ecef', borderRight: 'none' }}>🔍</span>
                <input type="text" className="form-control" placeholder={t('consumptions.search_placeholder')}
                  value={search} onChange={e => handleSearchChange(e.target.value)}
                  style={{ border: '2px solid #e9ecef', borderLeft: 'none' }} />
                {search && <button className="btn btn-outline-secondary" style={{ border: '2px solid #e9ecef' }} onClick={() => handleSearchChange('')}>✕</button>}
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{t('consumptions.date_from_label')}</label>
              <input type="date" className="form-control" value={startDate} onChange={e => handleStartDate(e.target.value)} style={{ border: '2px solid #e9ecef' }} />
            </div>
            <div className="col-md-3">
              <label className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{t('consumptions.date_to_label')}</label>
              <input type="date" className="form-control" value={endDate} onChange={e => handleEndDate(e.target.value)} style={{ border: '2px solid #e9ecef' }} />
            </div>
            {hasFilter && (
              <div className="col-md-2">
                <button className="btn btn-sm btn-outline-danger w-100" style={{ borderRadius: '10px' }} onClick={clearAll}>{t('consumptions.clear_filters')}</button>
              </div>
            )}
          </div>
          {hasFilter && (
            <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
              <small className="text-muted">{t('consumptions.filter_active')}</small>
              {search    && <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary" style={{ fontWeight: 600 }}>"{search}"</span>}
              {startDate && <span className="badge rounded-pill bg-success bg-opacity-10 text-success" style={{ fontWeight: 600 }}>{t('consumptions.from_date', { date: startDate })}</span>}
              {endDate   && <span className="badge rounded-pill bg-success bg-opacity-10 text-success" style={{ fontWeight: 600 }}>{t('consumptions.to_date', { date: endDate })}</span>}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">{t('common.loading')}</span></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light text-center">
              <tr>
                <Th col="date"       label={t('consumptions.date')}         {...thProps} />
                <th>{t('consumptions.vehicle')}</th>
                <th>{t('consumptions.driver')}</th>
                <Th col="fuel_volume" label={t('consumptions.liters_short')} {...thProps} />
                <Th col="fuel_cost"   label={t('consumptions.amount_short')} {...thProps} />
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((c) => {
                const isSelected = selectedConsumption?.id === c.id;
                return (
                  <tr key={c.id} onClick={(e) => handleRowClick(e, c)} title={t('vehicles.click_hint')}
                    style={{ cursor: 'pointer', backgroundColor: isSelected ? '#0d6efd' : 'transparent', color: isSelected ? 'white' : 'inherit', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td className="text-center" style={{ fontSize: '0.9rem' }}>{formatDate(c.date)}</td>
                    <td className="text-center"><span className="badge" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#6c757d', color: 'white' }}>{c.vehicle?.license_plate}</span></td>
                    <td className="text-center">{c.driver?.name}</td>
                    <td className="text-center"><span className="badge" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#17a2b8', color: 'white', fontSize: '0.9rem' }}>{c.fuel_volume} L</span></td>
                    <td className="text-center"><strong style={{ color: isSelected ? 'white' : '#28a745' }}>{c.fuel_cost ? Number(c.fuel_cost).toLocaleString('fr-FR') : '-'}</strong></td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="text-center text-muted py-5">
                  <div className="fs-1 mb-3">⛽</div>
                  <p className="mb-0">{hasFilter ? t('consumptions.no_search_results') : t('consumptions.no_consumptions')}</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} total={pagination.total} perPage={pagination.perPage} from={pagination.from} to={pagination.to} onPageChange={handlePageChange} onPerPageChange={handlePerPageChange} />

      {selectedConsumption && (
        <div ref={menuRef} style={{ position: 'fixed', top: `${menuPosition.y}px`, left: `${menuPosition.x}px`, zIndex: 1000, transform: 'translateX(-50%)', animation: 'fadeIn 0.2s ease-in-out' }}>
          <div className="card shadow-lg border-0" style={{ minWidth: '220px', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="card-header bg-primary text-white py-2"><small className="fw-bold">{t('common.actions')}</small></div>
            <div className="list-group list-group-flush">
              {[
                { label: t('common.view'),   sub: t('common.view_details'),      color: '#28a745', icon: '👁️', fn: handleView },
                { label: t('common.edit'),   sub: t('common.edit_info'),          color: '#ffc107', icon: '✏️', fn: handleEdit },
                { label: t('common.delete'), sub: t('common.delete_permanently'), color: '#dc3545', icon: '🗑️', fn: handleDelete },
              ].map(({ label, sub, color, icon, fn }) => (
                <button key={label} onClick={fn} className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3" style={{ border: 'none', cursor: 'pointer' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: color, borderRadius: '8px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                  <div className="flex-grow-1"><strong className="d-block">{label}</strong><small className="text-muted">{sub}</small></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateX(-50%) translateY(-10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        .list-group-item-action:hover { background-color:#f8f9fa !important; transform:translateX(3px); transition:all 0.2s ease; }
      `}</style>
    </div>
  );
}
