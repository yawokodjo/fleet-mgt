import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";

export default function Consumptions() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsumption, setSelectedConsumption] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectedConsumption(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/consumptions");
      setLogs(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (event, consumption) => {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = rect.bottom;

    setMenuPosition({ x, y });
    setSelectedConsumption(consumption);
  };

  const handleView = () => {
    navigate(`/consumptions/${selectedConsumption.id}`);
    setSelectedConsumption(null);
  };

  const handleEdit = () => {
    navigate(`/consumptions/${selectedConsumption.id}/edit`);
    setSelectedConsumption(null);
  };

  const handleDelete = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette consommation ?")) {
      setSelectedConsumption(null);
      return;
    }

    try {
      await api.delete(`/consumptions/${selectedConsumption.id}`);
      alert("✅ Consommation supprimée avec succès !");
      fetchData();
      setSelectedConsumption(null);
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la suppression !");
      setSelectedConsumption(null);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    try {
      const datePart = new Date(dateString);
      const now = new Date();

      const year = datePart.getFullYear();
      const month = String(datePart.getMonth() + 1).padStart(2, '0');
      const day = String(datePart.getDate()).padStart(2, '0');

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return dateString;
    }
  };

  const formatNumber = (num) => {
    if (!num) return "-";
    return num.toLocaleString("fr-FR");
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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold mb-0">⛽ Liste des Consommations</h2>
        <button
          className="btn btn-success"
          onClick={() => navigate("/consumptions/create")}
        >
          ➕ Ajouter une consommation
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light text-center">
            <tr>
              <th>Date</th>
              <th>Véhicule</th>
              <th>Chauffeur</th>
              <th>Litres</th>
              <th>Montant (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((c) => (
                <tr
                  key={c.id}
                  onClick={(e) => handleRowClick(e, c)}
                  title="Cliquez pour afficher les actions disponibles (Voir, Modifier, Supprimer)"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedConsumption?.id === c.id ? '#0d6efd' : 'transparent',
                    color: selectedConsumption?.id === c.id ? 'white' : 'inherit',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedConsumption?.id !== c.id) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedConsumption?.id !== c.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <td className="text-center" style={{ fontSize: '0.9rem' }}>
                    {formatDateTime(c.date)}
                  </td>
                  <td className="text-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: selectedConsumption?.id === c.id ? 'rgba(255,255,255,0.3)' : '#6c757d',
                        color: 'white'
                      }}
                    >
                      {c.vehicle?.license_plate}
                    </span>
                  </td>
                  <td className="text-center">{c.driver?.name}</td>
                  <td className="text-center">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: selectedConsumption?.id === c.id ? 'rgba(255,255,255,0.3)' : '#17a2b8',
                        color: 'white',
                        fontSize: '0.9rem'
                      }}
                    >
                      {c.fuel_volume} L
                    </span>
                  </td>
                  <td className="text-center">
                    <strong style={{ color: selectedConsumption?.id === c.id ? 'white' : '#28a745' }}>
                      {formatNumber(c.fuel_cost)}
                    </strong>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted py-5">
                  <div className="fs-1 mb-3">⛽</div>
                  <p className="mb-0">Aucune consommation enregistrée.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Menu contextuel */}
      {selectedConsumption && (
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
                    backgroundColor: '#28a745',
                    borderRadius: '8px',
                    fontSize: '1.2rem'
                  }}
                >
                  👁️
                </div>
                <div className="flex-grow-1">
                  <strong className="d-block">Voir</strong>
                  <small className="text-muted">Détails de la consommation</small>
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