import React, { useEffect, useState, useRef } from 'react';
import api from '../axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Pagination from '../components/Pagination';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 10, from: 0, to: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchVehicles(pagination.currentPage, pagination.perPage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectedVehicle(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchVehicles = async (page = 1, perPage = 10) => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles', { params: { page, per_page: perPage } });
      const d = res.data;
      setVehicles(d.data || []);
      setPagination({
        currentPage: d.current_page ?? 1,
        lastPage: d.last_page ?? 1,
        total: d.total ?? 0,
        perPage: d.per_page ?? perPage,
        from: d.from ?? 0,
        to: d.to ?? 0,
      });
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules :', err);
      alert(t('vehicles.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setSelectedVehicle(null);
    fetchVehicles(page, pagination.perPage);
  };

  const handlePerPageChange = (perPage) => {
    setSelectedVehicle(null);
    fetchVehicles(1, perPage);
  };

  const handleRowClick = (event, vehicle) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: event.clientX, y: rect.bottom });
    setSelectedVehicle(vehicle);
  };

  const handleView = () => {
    navigate(`/vehicles/${selectedVehicle.id}`);
    setSelectedVehicle(null);
  };

  const handleEdit = () => {
    navigate(`/vehicles/${selectedVehicle.id}/edit`);
    setSelectedVehicle(null);
  };

  const handleDelete = async () => {
    if (!window.confirm(t('vehicles.delete_confirm'))) {
      setSelectedVehicle(null);
      return;
    }
    try {
      const res = await api.delete(`/vehicles/${selectedVehicle.id}`);
      alert(res.data.message || t('vehicles.delete_success'));
      fetchVehicles(pagination.currentPage, pagination.perPage);
      setSelectedVehicle(null);
    } catch (err) {
      console.error('Erreur lors de la suppression :', err);
      alert(t('vehicles.delete_error'));
      setSelectedVehicle(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold mb-0">{t('vehicles.list_title')}</h2>
        <button className="btn btn-success" onClick={() => navigate("/vehicles/create")}>
          {t('vehicles.add_btn')}
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light text-center">
            <tr>
              <th>{t('vehicles.brand')}</th>
              <th>{t('vehicles.model')}</th>
              <th>{t('vehicles.license_plate')}</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="text-center"
                  onClick={(e) => handleRowClick(e, vehicle)}
                  title={t('vehicles.click_hint')}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedVehicle?.id === vehicle.id ? '#0d6efd' : 'transparent',
                    color: selectedVehicle?.id === vehicle.id ? 'white' : 'inherit',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { if (selectedVehicle?.id !== vehicle.id) e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                  onMouseLeave={(e) => { if (selectedVehicle?.id !== vehicle.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td>{vehicle.marque}</td>
                  <td>{vehicle.model}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: selectedVehicle?.id === vehicle.id ? 'rgba(255,255,255,0.3)' : '#6c757d', color: 'white' }}>
                      {vehicle.license_plate}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-muted py-5">
                  <div className="fs-1 mb-3">🚫</div>
                  <p className="mb-0">{t('vehicles.no_vehicles')}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        lastPage={pagination.lastPage}
        total={pagination.total}
        perPage={pagination.perPage}
        from={pagination.from}
        to={pagination.to}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />

      {selectedVehicle && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            zIndex: 1000,
            transform: 'translateX(-50%)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <div className="card shadow-lg border-0" style={{ minWidth: '220px', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="card-header bg-primary text-white py-2">
              <small className="fw-bold">{t('common.actions')}</small>
            </div>
            <div className="list-group list-group-flush">
              <button onClick={handleView} className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3" style={{ border: 'none', cursor: 'pointer' }}>
                <div className="d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#0d6efd', borderRadius: '8px', fontSize: '1.2rem' }}>👁️</div>
                <div className="flex-grow-1">
                  <strong className="d-block">{t('common.view')}</strong>
                  <small className="text-muted">{t('common.view_details')}</small>
                </div>
              </button>
              <button onClick={handleEdit} className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3" style={{ border: 'none', cursor: 'pointer' }}>
                <div className="d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#ffc107', borderRadius: '8px', fontSize: '1.2rem' }}>✏️</div>
                <div className="flex-grow-1">
                  <strong className="d-block">{t('common.edit')}</strong>
                  <small className="text-muted">{t('common.edit_info')}</small>
                </div>
              </button>
              <button onClick={handleDelete} className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3" style={{ border: 'none', cursor: 'pointer' }}>
                <div className="d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#dc3545', borderRadius: '8px', fontSize: '1.2rem' }}>🗑️</div>
                <div className="flex-grow-1">
                  <strong className="d-block">{t('common.delete')}</strong>
                  <small className="text-muted">{t('common.delete_permanently')}</small>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .list-group-item-action:hover {
          background-color: #f8f9fa !important;
          transform: translateX(3px);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}
