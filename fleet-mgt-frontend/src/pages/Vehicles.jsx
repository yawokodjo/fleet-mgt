import React, { useEffect, useState, useRef } from 'react';
import api from '../axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectedVehicle(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules :', err);
      alert('Impossible de charger la liste des véhicules.');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (event, vehicle) => {
    event.preventDefault();

    // Calculer la position du menu
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = rect.bottom;

    setMenuPosition({ x, y });
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
    if (!window.confirm('Voulez-vous vraiment supprimer ce véhicule ?')) {
      setSelectedVehicle(null);
      return;
    }

    try {
      const res = await api.delete(`/vehicles/${selectedVehicle.id}`);
      alert(res.data.message || 'Véhicule supprimé avec succès !');
      fetchVehicles();
      setSelectedVehicle(null);
    } catch (err) {
      console.error('Erreur lors de la suppression :', err);
      alert('Impossible de supprimer ce véhicule.');
      setSelectedVehicle(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold mb-0">
          🚗 Liste des véhicules
        </h2>
        <button
          className="btn btn-success"
          onClick={() => navigate("/vehicles/create")}
        >
          ➕ Ajouter un véhicule
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light text-center">
            <tr>
              <th>Marque</th>
              <th>Modèle</th>
              <th>Immatriculation</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.data && vehicles.data.length > 0 ? (
              vehicles.data.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="text-center"
                  onClick={(e) => handleRowClick(e, vehicle)}
                  title="Cliquez pour afficher les actions disponibles (Voir, Modifier, Supprimer)"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedVehicle?.id === vehicle.id ? '#0d6efd' : 'transparent',
                    color: selectedVehicle?.id === vehicle.id ? 'white' : 'inherit',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedVehicle?.id !== vehicle.id) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedVehicle?.id !== vehicle.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <td>{vehicle.marque}</td>
                  <td>{vehicle.model}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: selectedVehicle?.id === vehicle.id ? 'rgba(255,255,255,0.3)' : '#6c757d',
                        color: selectedVehicle?.id === vehicle.id ? 'white' : 'white'
                      }}
                    >
                      {vehicle.license_plate}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-muted py-5">
                  <div className="fs-1 mb-3">🚫</div>
                  <p className="mb-0">Aucun véhicule trouvé.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Menu contextuel */}
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
          <div
            className="card shadow-lg border-0"
            style={{
              minWidth: '220px',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <div className="card-header bg-primary text-white py-2">
              <small className="fw-bold">Actions disponibles</small>
            </div>
            <div className="list-group list-group-flush">
              <button
                onClick={handleView}
                className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
                style={{ border: 'none', cursor: 'pointer' }}
              >
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#0d6efd',
                    borderRadius: '8px',
                    fontSize: '1.2rem'
                  }}
                >
                  👁️
                </div>
                <div className="flex-grow-1">
                  <strong className="d-block">Voir</strong>
                  <small className="text-muted">Détails du véhicule</small>
                </div>
              </button>

              <button
                onClick={handleEdit}
                className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
                style={{ border: 'none', cursor: 'pointer' }}
              >
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#ffc107',
                    borderRadius: '8px',
                    fontSize: '1.2rem'
                  }}
                >
                  ✏️
                </div>
                <div className="flex-grow-1">
                  <strong className="d-block">Modifier</strong>
                  <small className="text-muted">Éditer les informations</small>
                </div>
              </button>

              <button
                onClick={handleDelete}
                className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
                style={{ border: 'none', cursor: 'pointer' }}
              >
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#dc3545',
                    borderRadius: '8px',
                    fontSize: '1.2rem'
                  }}
                >
                  🗑️
                </div>
                <div className="flex-grow-1">
                  <strong className="d-block">Supprimer</strong>
                  <small className="text-muted">Retirer définitivement</small>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS pour l'animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
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