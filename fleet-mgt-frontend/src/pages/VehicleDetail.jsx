import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../axios.js';
import React from 'react';

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    api.get(`/vehicles/${id}`)
      .then(res => setVehicle(res.data))
      .catch(err => console.error("Erreur lors du chargement du véhicule :", err));
  }, [id]);

  if (!vehicle) return <p className="text-center mt-6">Chargement...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {vehicle.marque} {vehicle.model}
      </h2>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <tbody>
          <tr className="bg-gray-100">
            <td className="px-4 py-2 font-semibold">Immatriculation:</td>
            <td className="px-4 py-2">{vehicle.license_plate}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-semibold">Kilométrage:</td>
            <td className="px-4 py-2">{vehicle.mileage} km</td>
          </tr>
          <tr className="bg-gray-100">
            <td className="px-4 py-2 font-semibold">Année:</td>
            <td className="px-4 py-2">{vehicle.year}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-semibold">Carburant:</td>
            <td className="px-4 py-2">{vehicle.fuel_type}</td>
          </tr>
          <tr className="bg-gray-100">
            <td className="px-4 py-2 font-semibold">Carte carburant:</td>
            <td className="px-4 py-2">{vehicle.fuel_card || "N/A"}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-semibold">Status:</td>
            <td className="px-4 py-2">{vehicle.status}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 flex justify-between">
        <Link
          to="/vehicles"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          Retour à la liste
        </Link>
        <Link
          to={`/vehicles/${id}/edit`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Mettre à jour
        </Link>
      </div>
    </div>
  );
}
