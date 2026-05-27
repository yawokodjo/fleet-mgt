import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import api from "../axios";
import Pagination from "../components/Pagination";

const STATUS_BADGE = {
  planned:     { bg: '#eff6ff', color: '#0d6efd', border: '#bfdbfe', key: 'maintenances.status_label_planned' },
  in_progress: { bg: '#fff7ed', color: '#d97706', border: '#fcd34d', key: 'maintenances.status_label_in_progress' },
  completed:   { bg: '#dcfce7', color: '#16a34a', border: '#86efac', key: 'maintenances.status_label_completed' },
  cancelled:   { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', key: 'maintenances.status_label_cancelled' },
};

const TYPES = [
  { value: 'vidange',       key: 'maintenances.type_vidange' },
  { value: 'pneus',         key: 'maintenances.type_pneus' },
  { value: 'freins',        key: 'maintenances.type_freins' },
  { value: 'batterie',      key: 'maintenances.type_batterie' },
  { value: 'révision',      key: 'maintenances.type_revision' },
  { value: 'carrosserie',   key: 'maintenances.type_carrosserie' },
  { value: 'électricité',   key: 'maintenances.type_electricite' },
  { value: 'climatisation', key: 'maintenances.type_climatisation' },
  { value: 'autre',         key: 'maintenances.type_autre' },
];

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

export default function Maintenances() {
  const [logs, setLogs]               = useState([]);
  const [pagination, setPagination]   = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15, from: 0, to: 0 });
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]   = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [sortBy, setSortBy]           = useState('scheduled_date');
  const [sortDir, setSortDir]         = useState('desc');
  const [message, setMessage]         = useState(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const filtersRef    = useRef({ search: '', status: '', type: '', dateFrom: '', dateTo: '', sortBy: 'scheduled_date', sortDir: 'desc', perPage: 15 });
  const searchTimeout = useRef(null);
  const menuRef       = useRef(null);
  const navigate      = useNavigate();
  const { t }         = useTranslation();

  useEffect(() => {
    fetchData(1);
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setSelectedMaintenance(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async (page = 1, perPage = filtersRef.current.perPage) => {
    setLoading(true);
    try {
      const { search: s, status, type, dateFrom: df, dateTo: dt, sortBy: sb, sortDir: sd } = filtersRef.current;
      const params = { page, per_page: perPage, sort_by: sb, sort_dir: sd };
      if (s)      params.search    = s;
      if (status) params.status    = status;
      if (type)   params.type      = type;
      if (df)     params.date_from = df;
      if (dt)     params.date_to   = dt;
      const res = await api.get("/maintenances", { params });
      const d = res.data;
      setLogs(d.data || d || []);
      const pp = { currentPage: d.current_page ?? 1, lastPage: d.last_page ?? 1, total: d.total ?? 0, perPage: d.per_page ?? perPage, from: d.from ?? 0, to: d.to ?? 0 };
      setPagination(pp);
      filtersRef.current.perPage = pp.perPage;
    } catch (err) {
      console.error(err);
      setMessage(t('maintenances.load_error'));
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

  const handleStatusChange = (value) => {
    setFilterStatus(value);
    filtersRef.current.status = value;
    fetchData(1);
  };

  const handleTypeChange = (value) => {
    setFilterType(value);
    filtersRef.current.type = value;
    fetchData(1);
  };

  const handleSort = (col) => {
    const newDir = filtersRef.current.sortBy === col && filtersRef.current.sortDir === 'desc' ? 'asc' : 'desc';
    setSortBy(col); setSortDir(newDir);
    filtersRef.current.sortBy = col;
    filtersRef.current.sortDir = newDir;
    fetchData(1);
  };

  const handleDateFromChange = (value) => {
    setDateFrom(value);
    filtersRef.current.dateFrom = value;
    fetchData(1);
  };

  const handleDateToChange = (value) => {
    setDateTo(value);
    filtersRef.current.dateTo = value;
    fetchData(1);
  };

  const clearAll = () => {
    clearTimeout(searchTimeout.current);
    setSearch(''); setFilterStatus(''); setFilterType(''); setDateFrom(''); setDateTo('');
    filtersRef.current.search = ''; filtersRef.current.status = ''; filtersRef.current.type = '';
    filtersRef.current.dateFrom = ''; filtersRef.current.dateTo = '';
    fetchData(1);
  };

  const handlePageChange    = (page)    => { setSelectedMaintenance(null); fetchData(page); };
  const handlePerPageChange = (perPage) => { setSelectedMaintenance(null); filtersRef.current.perPage = perPage; fetchData(1, perPage); };

  const handleRowClick = (event, m) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: event.clientX, y: rect.bottom });
    setSelectedMaintenance(m);
  };

  const handleView   = () => { navigate(`/maintenances/${selectedMaintenance.id}`);      setSelectedMaintenance(null); };
  const handleEdit   = () => { navigate(`/maintenances/${selectedMaintenance.id}/edit`); setSelectedMaintenance(null); };
  const handleDelete = async () => {
    if (!window.confirm(t('maintenances.delete_confirm'))) { setSelectedMaintenance(null); return; }
    try {
      await api.delete(`/maintenances/${selectedMaintenance.id}`);
      setMessage(t('maintenances.delete_success'));
      setSelectedMaintenance(null);
      fetchData(pagination.currentPage);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage(t('common.error'));
      setSelectedMaintenance(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatDate = (s) => {
    if (!s) return "-";
    try { const d = new Date(s); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
    catch { return s; }
  };

  const hasFilter = search || filterStatus || filterType || dateFrom || dateTo;
  const thProps   = { sortBy, sortDir, onSort: handleSort };

  const fetchAll = async () => {
    const { search: s, status, type, dateFrom: df, dateTo: dt, sortBy: sb, sortDir: sd } = filtersRef.current;
    const params = { per_page: 9999, sort_by: sb, sort_dir: sd };
    if (s)  params.search    = s;
    if (status) params.status = status;
    if (type) params.type    = type;
    if (df) params.date_from = df;
    if (dt) params.date_to   = dt;
    const res = await api.get('/maintenances', { params });
    const d = res.data;
    return d.data || d || [];
  };

  const statusLabel = (s) => t(STATUS_BADGE[s]?.key ?? s);

  const exportPDF = async () => {
    const all = await fetchAll();
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14); doc.setFont(undefined, 'bold');
    doc.text(t('maintenances.list_title'), 14, 15);
    doc.setFontSize(9); doc.setFont(undefined, 'normal');
    doc.text(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), 14, 22);
    autoTable(doc, {
      startY: 27,
      head: [[t('maintenances.date'), t('maintenances.vehicle'), t('maintenances.driver'), t('maintenances.type'), t('maintenances.company'), t('maintenances.cost'), t('vehicles.status')]],
      body: all.map(m => [
        formatDate(m.scheduled_date),
        m.vehicle?.license_plate || '-',
        m.driver?.name || '-',
        m.maintenance_type,
        m.maintenance_company,
        m.cost ? Number(m.cost).toLocaleString('fr-FR') : '-',
        statusLabel(m.status),
      ]),
      foot: [['', '', '', '', t('reports.total'), `${all.reduce((s, m) => s + Number(m.cost || 0), 0).toLocaleString('fr-FR')} FCFA`, '']],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [249, 115, 22] },
      footStyles: { fillColor: [241, 245, 249], textColor: [30, 30, 30], fontStyle: 'bold' },
    });
    doc.save(`maintenances-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const exportExcel = async () => {
    const all = await fetchAll();
    const rows = all.map(m => ({
      [t('maintenances.date')]:    formatDate(m.scheduled_date),
      [t('maintenances.vehicle')]: m.vehicle?.license_plate || '-',
      [t('maintenances.driver')]:  m.driver?.name || '-',
      [t('maintenances.type')]:    m.maintenance_type,
      [t('maintenances.company')]: m.maintenance_company,
      [t('maintenances.cost')]:    m.cost ? Number(m.cost) : '',
      [t('vehicles.status')]:      statusLabel(m.status),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [12, 14, 20, 14, 18, 12, 14].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Maintenances');
    XLSX.writeFile(wb, `maintenances-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="container py-4">
      <div className="sticky-page-header" style={{ background: '#fff', borderRadius: '0 0 18px 18px', boxShadow: '0 4px 24px rgba(253,126,20,0.1)', padding: '0.85rem 0', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #fb923c, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>🔧</div>
            <div>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', lineHeight: 1.2 }}>{t('maintenances.list_title')}</h2>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>{pagination.total} {t('reports.records_count')}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF
            </button>
            <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Excel
            </button>
            <button onClick={() => navigate("/maintenances/create")}
              style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', border: 'none', color: '#fff', borderRadius: '10px', padding: '0.48rem 1.1rem', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 3px 10px rgba(249,115,22,0.28)', whiteSpace: 'nowrap' }}>
              + {t('maintenances.add_btn')}
            </button>
          </div>
        </div>
      </div>

      {/* Barre recherche + filtres */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '14px' }}>
        <div className="card-body py-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white" style={{ border: '2px solid #e9ecef', borderRight: 'none' }}>🔍</span>
                <input type="text" className="form-control" placeholder={t('maintenances.search_placeholder')}
                  value={search} onChange={e => handleSearchChange(e.target.value)}
                  style={{ border: '2px solid #e9ecef', borderLeft: 'none' }} />
                {search && <button className="btn btn-outline-secondary" style={{ border: '2px solid #e9ecef' }} onClick={() => handleSearchChange('')}>✕</button>}
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filterStatus} onChange={e => handleStatusChange(e.target.value)} style={{ border: '2px solid #e9ecef' }}>
                <option value="">{t('maintenances.all_statuses')}</option>
                <option value="planned">{t('maintenances.status_label_planned')}</option>
                <option value="in_progress">{t('maintenances.status_label_in_progress')}</option>
                <option value="completed">{t('maintenances.status_label_completed')}</option>
                <option value="cancelled">{t('maintenances.status_label_cancelled')}</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={filterType} onChange={e => handleTypeChange(e.target.value)} style={{ border: '2px solid #e9ecef' }}>
                <option value="">{t('maintenances.all_types')}</option>
                {TYPES.map(tp => <option key={tp.value} value={tp.value}>{t(tp.key)}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control" title={t('reports.start_date')}
                value={dateFrom} onChange={e => handleDateFromChange(e.target.value)}
                style={{ border: '2px solid #e9ecef' }} />
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control" title={t('reports.end_date')}
                value={dateTo} onChange={e => handleDateToChange(e.target.value)}
                style={{ border: '2px solid #e9ecef' }} />
            </div>
            {hasFilter && (
              <div className="col-md-1">
                <button className="btn btn-sm btn-outline-danger w-100" style={{ borderRadius: '10px' }} onClick={clearAll}>{t('maintenances.clear_filters')}</button>
              </div>
            )}
          </div>
          {hasFilter && (
            <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
              <small className="text-muted">{t('maintenances.filter_active')}</small>
              {search && <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary" style={{ fontWeight: 600 }}>"{search}"</span>}
              {filterStatus && <span className="badge rounded-pill" style={{ background: STATUS_BADGE[filterStatus]?.bg, color: STATUS_BADGE[filterStatus]?.color, border: `1px solid ${STATUS_BADGE[filterStatus]?.border}`, fontWeight: 700 }}>{t(STATUS_BADGE[filterStatus]?.key)}</span>}
              {filterType && <span className="badge rounded-pill bg-info bg-opacity-10 text-info" style={{ fontWeight: 600 }}>{t(TYPES.find(tp => tp.value === filterType)?.key || '')}</span>}
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="alert alert-info text-center alert-dismissible fade show">
          {message}<button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">{t('common.loading')}</span></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center">
            <thead className="table-light">
              <tr>
                <Th col="scheduled_date"      label={t('maintenances.date')}    {...thProps} />
                <th>{t('maintenances.vehicle')}</th>
                <th>{t('maintenances.driver')}</th>
                <Th col="maintenance_type"    label={t('maintenances.type')}    {...thProps} />
                <Th col="maintenance_company" label={t('maintenances.company')} {...thProps} />
                <Th col="cost"                label={t('maintenances.cost')}    {...thProps} />
                <Th col="status"              label={t('vehicles.status')}      {...thProps} />
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((m) => {
                const isSelected = selectedMaintenance?.id === m.id;
                const sb = STATUS_BADGE[m.status];
                return (
                  <tr key={m.id} onClick={(e) => handleRowClick(e, m)} title={t('vehicles.click_hint')}
                    style={{ cursor: 'pointer', backgroundColor: isSelected ? '#0d6efd' : 'transparent', color: isSelected ? 'white' : 'inherit', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td style={{ fontSize: '0.9rem' }}>{formatDate(m.scheduled_date)}</td>
                    <td><span className="badge" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#6c757d', color: 'white' }}>{m.vehicle?.license_plate || "-"}</span></td>
                    <td>{m.driver?.name || "-"}</td>
                    <td><span className="badge" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#17a2b8', color: 'white' }}>{m.maintenance_type}</span></td>
                    <td>{m.maintenance_company}</td>
                    <td><strong style={{ color: isSelected ? 'white' : '#28a745' }}>{m.cost ? Number(m.cost).toLocaleString('fr-FR') : '-'}</strong></td>
                    <td>
                      {sb ? (
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, background: isSelected ? 'rgba(255,255,255,0.2)' : sb.bg, color: isSelected ? '#fff' : sb.color, border: `1px solid ${isSelected ? 'rgba(255,255,255,0.3)' : sb.border}` }}>{t(sb.key)}</span>
                      ) : m.status}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="7" className="text-center text-muted py-5">
                  <div className="fs-1 mb-3">🔧</div>
                  <p className="mb-0">{hasFilter ? t('maintenances.no_search_results') : t('maintenances.no_maintenances')}</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} total={pagination.total} perPage={pagination.perPage} from={pagination.from} to={pagination.to} onPageChange={handlePageChange} onPerPageChange={handlePerPageChange} />

      {selectedMaintenance && (
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
