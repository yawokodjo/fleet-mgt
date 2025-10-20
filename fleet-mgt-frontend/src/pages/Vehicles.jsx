import { useEffect, useState } from 'react';
import api from '../axios';
import { Link, useNavigate } from 'react-router-dom';
import React from 'react';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = () => {
    setLoading(true);
    api.get('/vehicles')
      .then(res => {
        setVehicles(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur lors du chargement des véhicules :", err);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Voulez-vous vraiment supprimer ce véhicule ?');
    if (!confirm) return;

    try {
      const res = await api.delete(`/vehicles/${id}`);
      alert(res.data.message || 'Véhicule supprimé avec succès !'); // ← message de confirmation
      fetchVehicles(); // recharge la liste
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      alert('Impossible de supprimer ce véhicule.');
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-800 text-center"> 🚗 Liste des véhicules</h2>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Nom</th>
            <th>Marque</th>
            <th>Immatriculation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.data.map(vehicle => (
            <tr key={vehicle.id} className="text-center border-b">
              <td className="p-2">{vehicle.marque}</td>
              <td>{vehicle.model}</td>
              <td>{vehicle.license_plate}</td>
              <td className="flex justify-center gap-2">
                <Link
                  to={`/vehicles/${vehicle.id}`}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Voir
                </Link>
                <Link
                  to={`/vehicles/${vehicle.id}/edit`}
                  className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                >
                  Modifier
                </Link>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => navigate('/vehicles/create')}
        className="px-4 py-2 text-white bg-green-600 rounded mt-4"
      >
        Ajouter Véhicule
      </button>
    </div>
  );
}
