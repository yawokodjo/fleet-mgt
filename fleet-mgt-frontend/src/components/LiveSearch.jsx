import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";

export default function LiveSearch({ query, onSelectResult }) {
  const [results, setResults] = useState({
    vehicles: [],
    drivers: [],
    maintenances: [],
    consumptions: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ vehicles: [], drivers: [], maintenances: [], consumptions: [] });
      return;
    }

    const searchData = async () => {
      setLoading(true);
      try {
        const [vehiclesRes, driversRes, maintenancesRes, consumptionsRes] = await Promise.all([
          api.get("/vehicles-list").catch(() => ({ data: [] })),
          api.get("/drivers").catch(() => ({ data: [] })),
          api.get("/maintenances").catch(() => ({ data: [] })),
          api.get("/consumptions").catch(() => ({ data: [] })),
        ]);

        const lowerQuery = query.toLowerCase().trim();

        // Extraire les données (gérer data.data ou data)
        const vehiclesData = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : (vehiclesRes.data.data || []);
        const driversData = Array.isArray(driversRes.data) ? driversRes.data : (driversRes.data.data || []);
        const maintenancesData = Array.isArray(maintenancesRes.data) ? maintenancesRes.data : (maintenancesRes.data.data || []);
        const consumptionsData = Array.isArray(consumptionsRes.data) ? consumptionsRes.data : (consumptionsRes.data.data || []);

        // Filtrer les véhicules
        const filteredVehicles = vehiclesData.filter(v =>
          v.license_plate?.toLowerCase().includes(lowerQuery) ||
          v.marque?.toLowerCase().includes(lowerQuery) ||
          v.model?.toLowerCase().includes(lowerQuery) ||
          v.fuel_type?.toLowerCase().includes(lowerQuery)
        );

        // Filtrer les chauffeurs
        const filteredDrivers = driversData.filter(d =>
          d.name?.toLowerCase().includes(lowerQuery)
        );

        // Filtrer les maintenances
        const filteredMaintenances = maintenancesData.filter(m =>
          m.maintenance_type?.toLowerCase().includes(lowerQuery) ||
          m.maintenance_company?.toLowerCase().includes(lowerQuery) ||
          m.vehicle?.license_plate?.toLowerCase().includes(lowerQuery) ||
          m.description?.toLowerCase().includes(lowerQuery)
        );

        // Filtrer les consommations
        const filteredConsumptions = consumptionsData.filter(c =>
          c.vehicle?.license_plate?.toLowerCase().includes(lowerQuery) ||
          c.driver?.name?.toLowerCase().includes(lowerQuery) ||
          c.date?.includes(query)
        );

        setResults({
          vehicles: filteredVehicles.slice(0, 5), // Limiter à 5 résultats par catégorie
          drivers: filteredDrivers.slice(0, 5),
          maintenances: filteredMaintenances.slice(0, 5),
          consumptions: filteredConsumptions.slice(0, 5),
        });
      } catch {
        // silently ignore search errors
      } finally {
        setLoading(false);
      }
    };

    // Debounce: attendre 300ms après la dernière saisie
    const timer = setTimeout(searchData, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleClick = (type, id, item) => {
    onSelectResult(item);

    // Navigation vers la page de détails
    switch (type) {
      case "vehicle":
        navigate(`/vehicles/${id}`);
        break;
      case "driver":
        navigate(`/users/${id}`);
        break;
      case "maintenance":
        navigate(`/maintenances/${id}`);
        break;
      case "consumption":
        navigate(`/consumptions/${id}`);
        break;
      default:
        break;
    }
  };

  const hasResults = results.vehicles.length > 0 ||
    results.drivers.length > 0 ||
    results.maintenances.length > 0 ||
    results.consumptions.length > 0;

  if (!query || query.trim().length < 2) return null;

  return (
    <div
      className="position-absolute w-100 bg-white border rounded shadow-lg mt-1"
      style={{
        zIndex: 1050,
        maxHeight: '400px',
        overflowY: 'auto',
        top: '100%'
      }}
    >
      {loading ? (
        <div className="p-3 text-center text-muted">
          <small>Recherche en cours...</small>
        </div>
      ) : !hasResults ? (
        <div className="p-3 text-center text-muted">
          <small>Aucun résultat trouvé pour "{query}"</small>
        </div>
      ) : (
        <div>
          {/* Véhicules */}
          {results.vehicles.length > 0 && (
            <div className="border-bottom">
              <div className="px-3 py-2 bg-light">
                <small className="fw-bold text-primary">🚗 Véhicules ({results.vehicles.length})</small>
              </div>
              {results.vehicles.map(v => (
                <div
                  key={v.id}
                  className="px-3 py-2 cursor-pointer hover-bg-light"
                  style={{ cursor: 'pointer' }}
                  onMouseDown={() => handleClick("vehicle", v.id, v)}
                >
                  <div className="fw-bold">{v.license_plate}</div>
                  <small className="text-muted">{v.marque} {v.model}</small>
                </div>
              ))}
            </div>
          )}

          {/* Chauffeurs */}
          {results.drivers.length > 0 && (
            <div className="border-bottom">
              <div className="px-3 py-2 bg-light">
                <small className="fw-bold text-success">👤 Chauffeurs ({results.drivers.length})</small>
              </div>
              {results.drivers.map(d => (
                <div
                  key={d.id}
                  className="px-3 py-2 cursor-pointer hover-bg-light"
                  style={{ cursor: 'pointer' }}
                  onMouseDown={() => handleClick("driver", d.id, d)}
                >
                  <div className="fw-bold">{d.name}</div>
                </div>
              ))}
            </div>
          )}

          {/* Maintenances */}
          {results.maintenances.length > 0 && (
            <div className="border-bottom">
              <div className="px-3 py-2 bg-light">
                <small className="fw-bold text-warning">🔧 Maintenances ({results.maintenances.length})</small>
              </div>
              {results.maintenances.map(m => (
                <div
                  key={m.id}
                  className="px-3 py-2 cursor-pointer hover-bg-light"
                  style={{ cursor: 'pointer' }}
                  onMouseDown={() => handleClick("maintenance", m.id, m)}
                >
                  <div className="fw-bold">{m.maintenance_type}</div>
                  <small className="text-muted">
                    {m.vehicle?.license_plate} - {m.maintenance_company}
                  </small>
                </div>
              ))}
            </div>
          )}

          {/* Consommations */}
          {results.consumptions.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-light">
                <small className="fw-bold text-danger">⛽ Consommations ({results.consumptions.length})</small>
              </div>
              {results.consumptions.map(c => (
                <div
                  key={c.id}
                  className="px-3 py-2 cursor-pointer hover-bg-light"
                  style={{ cursor: 'pointer' }}
                  onMouseDown={() => handleClick("consumption", c.id, c)}
                >
                  <div className="fw-bold">{c.vehicle?.license_plate}</div>
                  <small className="text-muted">
                    {c.fuel_volume}L - {c.date}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}