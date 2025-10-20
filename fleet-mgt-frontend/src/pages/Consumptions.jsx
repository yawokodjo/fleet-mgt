import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";

export default function Consumptions() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
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

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ?")) return;
    try {
      await api.delete(`/consumptions/${id}`);
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
      <h2 className="text-2xl font-semibold mb-4">Liste des Consommations</h2>

      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th>Date</th>
            <th>Véhicule</th>
            <th>Chauffeur</th>
            <th>Litres</th>
            <th>Montant</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((c) => (
            <tr key={c.id} className="text-center border-b">
              <td>{c.date}</td>
              <td>{c.vehicle?.license_plate}</td>
              <td>{c.driver?.name}</td>
              <td>{c.fuel_volume}</td>
              <td>{c.fuel_cost}</td>
              <td className="space-x-2">
                <button
                  className="px-2 py-1 bg-green-600 text-white rounded"
                  onClick={() => navigate(`/consumptions/${c.id}`)}
                >
                  👁 Voir
                </button>
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => navigate(`/consumptions/${c.id}/edit`)}
                >
                  ✏ Modifier
                </button>
                <button
                  className="px-2 py-1 bg-red-600 text-white rounded"
                  onClick={() => handleDelete(c.id)}
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
          onClick={() => navigate("/consumptions/create")}
        >
          Ajouter une consommation
        </button>
      </div>
    </div>
  );
}
