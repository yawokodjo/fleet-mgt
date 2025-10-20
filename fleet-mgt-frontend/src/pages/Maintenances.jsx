import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";

export default function Maintenances() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/maintenances");
      setLogs(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ?")) return;
    try {
      await api.delete(`/maintenances/${id}`);
      alert("Supprimée !");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Erreur suppression !");
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Liste des Maintenances</h2>

      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th>Date de maintenance</th>
            <th>Véhicule</th>
            <th>Chauffeur</th>
            <th>Type de maintenance</th>
            <th>Compagnie de maintenance</th>
            <th>Coût (FCFA)</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((m) => (
            <tr key={m.id} className="text-center border-b">
              <td>{m.scheduled_date}</td>
              <td>{m.vehicle?.license_plate}</td>
              <td>{m.driver?.name}</td>
              <td>{m.maintenance_type}</td>
              <td>{m.maintenance_company}</td>
              <td>{m.cost}</td>
              <td>{m.description}</td>
              <td>
                <button
                  className="px-2 py-1 bg-green-600 text-white rounded mr-2"
                  onClick={() => navigate(`/maintenances/${m.id}`)}
                >
                  👁 Voir
                </button>
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
                  onClick={() => navigate(`/maintenances/${m.id}/edit`)}
                >
                  ✏ Modifier
                </button>
                <button
                  className="px-2 py-1 bg-red-600 text-white rounded"
                  onClick={() => handleDelete(m.id)}
                >
                  🗑 Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* bouton ajouter en bas */}
      <div className="mt-4">
        <button
          className="px-3 py-1 bg-green-700 text-white rounded"
          onClick={() => navigate("/maintenances/create")}
        >
          Ajouter une maintenance
        </button>
      </div>
    </div>
  );
}
