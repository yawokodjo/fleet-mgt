import React, { useEffect, useState, useRef } from 'react';
import api from '../axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Pagination from '../components/Pagination';

const STATUS_LABELS_KEYS = {
  operational:    'vehicles.status_operational',
  maintenance:    'vehicles.status_maintenance',
  out_of_service: 'vehicles.status_out_of_service',
};

const STATUS_STYLE = {
  operational:    { row: 'transparent', hover: '#f8f9fa', badge: { bg: '#dcfce7', color: '#16a34a', border: '#86efac' } },
  maintenance:    { row: '#fffbeb',      hover: '#fef3c7', badge: { bg: '#fff7ed', color: '#d97706', border: '#fcd34d' } },
  out_of_service: { row: '#fff1f2',      hover: '#ffe4e6', badge: { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' } },
};

function SortIcon({ col, sortBy, sortDir }) {
  if (sortBy !== col) return <span style={{ color: '#cbd5e1', marginLeft: 4, fontSize: '0.7rem' }}>⇅</span>;
  return <span style={{ color: '#0d6efd', marginLeft: 4, fontSize: '0.75rem' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

function Th({ col, label, sortBy, sortDir, onSort, style }) {
  return (
    <th onClick={() => onSort(col)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', ...style }}>
      {label}<SortIcon col={col} sortBy={sortBy} sortDir={sortDir} />
    </th>
  );
}

export default function Vehicles() {
  const [vehicles, setVehicles]       = useState([]);
  const [pagination, setPagination]   = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 10, from: 0, to: 0 });
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy]           = useState('license_plate');
  const [sortDir, setSortDir]         = useState('asc');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // filtersRef évite les closures périmées dans les debounces et callbacks
  const filtersRef    = useRef({ search: '', status: '', sortBy: 'license_plate', sortDir: 'asc' });
  const searchTimeout = useRef(null);
  const menuRef       = useRef(null);
  const navigate      = useNavigate();
  const { t }         = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Init au montage depuis l'URL (navigation depuis dashboard/reports)
  useEffect(() => {
    const urlStatus = searchParams.get('status') || '';
    setStatusFilter(urlStatus);
    filtersRef.current.status = urlStatus;
    fetchVehicles(1, 10);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setSelectedVehicle(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchVehicles = async (page = 1, perPage = filtersRef.current.perPage || 10) => {
    setLoading(true);
    try {
      const { search: s, status, sortBy: sb, sortDir: sd } = filtersRef.current;
      const params = { page, per_page: perPage, sort_by: sb, sort_dir: sd };
      if (s)      params.search = s;
      if (status) params.status = status;
      const res = await api.get('/vehicles', { params });
      const d = res.data;
      setVehicles(d.data || []);
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
    searchTimeout.current = setTimeout(() => fetchVehicles(1), 350);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    filtersRef.current.status = value;
    if (value) setSearchParams({ status: value });
    else setSearchParams({});
    fetchVehicles(1);
  };

  const handleSort = (col) => {
    const newDir = filtersRef.current.sortBy === col && filtersRef.current.sortDir === 'asc' ? 'desc' : 'asc';
    setSortBy(col); setSortDir(newDir);
    filtersRef.current.sortBy = col;
    filtersRef.current.sortDir = newDir;
    fetchVehicles(1);
  };

  const clearAll = () => {
    clearTimeout(searchTimeout.current);
    setSearch(''); setStatusFilter('');
    filtersRef.current.search = ''; filtersRef.current.status = '';
    setSearchParams({});
    fetchVehicles(1);
  };

  const handlePageChange    = (page)    => { setSelectedVehicle(null); fetchVehicles(page); };
  const handlePerPageChange = (perPage) => { setSelectedVehicle(null); filtersRef.current.perPage = perPage; fetchVehicles(1, perPage); };

  const handleRowClick = (event, vehicle) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: event.clientX, y: rect.bottom });
    setSelectedVehicle(vehicle);
  };

  const handleView   = () => { navigate(`/vehicles/${selectedVehicle.id}`);      setSelectedVehicle(null); };
  const handleEdit   = () => { navigate(`/vehicles/${selectedVehicle.id}/edit`); setSelectedVehicle(null); };
  const handleDelete = async () => {
    if (!window.confirm(t('vehicles.delete_confirm'))) { setSelectedVehicle(null); return; }
    try {
      const res = await api.delete(`/vehicles/${selectedVehicle.id}`);
      alert(res.data.message || t('vehicles.delete_success'));
      setSelectedVehicle(null);
      fetchVehicles(pagination.currentPage);
    } catch (err) {
      console.error(err);
      alert(t('vehicles.delete_error'));
      setSelectedVehicle(null);
    }
  };

  const hasFilter = search || statusFilter;

  const thProps = { sortBy, sortDir, onSort: handleSort };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-primary fw-bold mb-0">{t('vehicles.list_title')}</h2>
        <button className="btn btn-success" onClick={() => navigate('/vehicles/create')}>{t('vehicles.add_btn')}</button>
      </div>

      {/* Barre recherche + filtre */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '14px' }}>
        <div className="card-body py-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-7">
              <div className="input-group">
                <span className="input-group-text bg-white" style={{ border: '2px solid #e9ecef', borderRight: 'none' }}>🔍</span>
                <input type="text" className="form-control" placeholder={t('vehicles.search_placeholder')}
                  value={search} onChange={e => handleSearchChange(e.target.value)}
                  style={{ border: '2px solid #e9ecef', borderLeft: 'none' }} />
                {search && (
                  <button className="btn btn-outline-secondary" style={{ border: '2px solid #e9ecef' }}
                    onClick={() => handleSearchChange('')}>✕</button>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={statusFilter} onChange={e => handleStatusChange(e.target.value)}
                style={{ border: '2px solid #e9ecef' }}>
                <option value="">{t('vehicles.all_statuses')}</option>
                <option value="operational">{t('vehicles.status_operational')}</option>
                <option value="maintenance">{t('vehicles.status_maintenance')}</option>
                <option value="out_of_service">{t('vehicles.status_out_of_service')}</option>
                <option value="maintenance,out_of_service">{t('vehicles.status_out_of_service')} / {t('vehicles.status_maintenance')}</option>
              </select>
            </div>
            {hasFilter && (
              <div className="col-md-1">
                <button className="btn btn-sm btn-outline-danger w-100" style={{ borderRadius: '10px' }} onClick={clearAll}>
                  {t('vehicles.clear_filters')}
                </button>
              </div>
            )}
          </div>
          {hasFilter && (
            <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
              <small className="text-muted">{t('vehicles.filter_active')}</small>
              {search && <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary" style={{ fontWeight: 600 }}>"{search}"</span>}
              {statusFilter && statusFilter.split(',').map(s => (
                <span key={s} className="badge rounded-pill" style={{ background: STATUS_STYLE[s]?.badge.bg || '#f1f5f9', color: STATUS_STYLE[s]?.badge.color || '#64748b', border: `1px solid ${STATUS_STYLE[s]?.badge.border || '#e2e8f0'}`, fontWeight: 700 }}>
                  {t(STATUS_LABELS_KEYS[s] || 'vehicles.status_operational')}
                </span>
              ))}
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
                <Th col="marque"        label={t('vehicles.brand')}         {...thProps} />
                <Th col="model"         label={t('vehicles.model')}         {...thProps} />
                <Th col="license_plate" label={t('vehicles.license_plate')} {...thProps} />
                <Th col="status"        label={t('vehicles.status')}        {...thProps} />
              </tr>
            </thead>
            <tbody>
              {vehicles.length > 0 ? vehicles.map((vehicle) => {
                const st = STATUS_STYLE[vehicle.status] || STATUS_STYLE.operational;
                const isSelected = selectedVehicle?.id === vehicle.id;
                return (
                  <tr key={vehicle.id} className="text-center"
                    onClick={(e) => handleRowClick(e, vehicle)} title={t('vehicles.click_hint')}
                    style={{ cursor: 'pointer', backgroundColor: isSelected ? '#0d6efd' : st.row, color: isSelected ? 'white' : 'inherit', transition: 'all 0.2s', borderLeft: vehicle.status !== 'operational' ? `4px solid ${st.badge.border}` : undefined }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = st.hover; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = st.row; }}
                  >
                    <td>{vehicle.marque}</td>
                    <td>{vehicle.model}</td>
                    <td><span className="badge" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#6c757d', color: 'white' }}>{vehicle.license_plate}</span></td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 700, background: isSelected ? 'rgba(255,255,255,0.2)' : st.badge.bg, color: isSelected ? '#fff' : st.badge.color, border: `1px solid ${isSelected ? 'rgba(255,255,255,0.3)' : st.badge.border}` }}>
                        {t(STATUS_LABELS_KEYS[vehicle.status] || 'vehicles.status_operational')}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="4" className="text-center text-muted py-5">
                  <div className="fs-1 mb-3">🚗</div>
                  <p className="mb-0">{hasFilter ? t('vehicles.no_search_results') : t('vehicles.no_vehicles')}</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} total={pagination.total} perPage={pagination.perPage} from={pagination.from} to={pagination.to} onPageChange={handlePageChange} onPerPageChange={handlePerPageChange} />

      {selectedVehicle && (
        <div ref={menuRef} style={{ position: 'fixed', top: `${menuPosition.y}px`, left: `${menuPosition.x}px`, zIndex: 1000, transform: 'translateX(-50%)', animation: 'fadeIn 0.2s ease-in-out' }}>
          <div className="card shadow-lg border-0" style={{ minWidth: '220px', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="card-header bg-primary text-white py-2"><small className="fw-bold">{t('common.actions')}</small></div>
            <div className="list-group list-group-flush">
              {[
                { label: t('common.view'),   sub: t('common.view_details'),     color: '#0d6efd', icon: '👁️', fn: handleView },
                { label: t('common.edit'),   sub: t('common.edit_info'),         color: '#ffc107', icon: '✏️', fn: handleEdit },
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
