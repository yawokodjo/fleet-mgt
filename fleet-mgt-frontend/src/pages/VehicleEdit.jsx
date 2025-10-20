import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function VehicleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState({
    marque: "",
    model: "",
    license_plate: "",
    year: "",
    fuel_type: "",
    fuel_card: "",
    mileage: "",
    status: "operational",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("token");

  // Charger les données du véhicule
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_BASE_URL}/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setVehicle(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement :", err);
        setLoading(false);
        if (err.response?.status === 401) navigate("/login");
        if (err.response?.status === 403) alert("Accès non autorisé !");
        if (err.response?.status === 500) alert("Erreur serveur, impossible de charger le véhicule.");
      });
  }, [id, navigate, token]);

  // Gestion des changements dans les inputs
  const handleChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };

  // Soumettre le formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    axios
      .put(`${API_BASE_URL}/vehicles/${id}`, vehicle, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Véhicule mis à jour avec succès !"); // confirmation
        navigate("/vehicles"); // redirection vers la liste
      })
      .catch((err) => {
        if (err.response?.status === 422) {
          setErrors(err.response.data.errors || {});
        } else if (err.response?.status === 401) {
          alert("Session expirée. Veuillez vous reconnecter.");
          navigate("/login");
        } else {
          console.error("Erreur lors de la mise à jour :", err);
          alert("Une erreur est survenue lors de la mise à jour."); // message d'erreur serveur
        }
      });
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Modifier un véhicule</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Marque</label>
          <input
            type="text"
            name="marque"
            value={vehicle.marque}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.marque && <p className="text-red-600">{errors.marque[0]}</p>}
        </div>

        <div>
          <label className="block mb-1">Modèle</label>
          <input
            type="text"
            name="model"
            value={vehicle.model}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.model && <p className="text-red-600">{errors.model[0]}</p>}
        </div>

        <div>
          <label className="block mb-1">Plaque d'immatriculation</label>
          <input
            type="text"
            name="license_plate"
            value={vehicle.license_plate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.license_plate && <p className="text-red-600">{errors.license_plate[0]}</p>}
        </div>

        <div>
          <label className="block mb-1">Année</label>
          <input
            type="number"
            name="year"
            value={vehicle.year}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.year && <p className="text-red-600">{errors.year[0]}</p>}
        </div>

        <div>
          <label className="block mb-1">Type de carburant</label>
          <select
            name="fuel_type"
            value={vehicle.fuel_type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Sélectionner --</option>
            <option value="essence">Essence</option>
            <option value="diesel">Diesel</option>
            <option value="hybride">Hybride</option>
            <option value="électrique">Électrique</option>
            <option value="gpl">GPL</option>
            <option value="autre">Autre</option>
          </select>
          {errors.fuel_type && <p className="text-red-600">{errors.fuel_type[0]}</p>}
        </div>

        <div>
          <label className="block mb-1">Carte carburant</label>
          <input
            type="text"
            name="fuel_card"
            value={vehicle.fuel_card || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Kilométrage</label>
          <input
            type="number"
            name="mileage"
            value={vehicle.mileage}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.mileage && <p className="text-red-600">{errors.mileage[0]}</p>}
        </div>

        <div>
          <label className="block mb-1">Statut</label>
          <select
            name="status"
            value={vehicle.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="operational">Opérationnel</option>
            <option value="maintenance">Maintenance</option>
            <option value="out_of_service">Hors service</option>
          </select>
          {errors.status && <p className="text-red-600">{errors.status[0]}</p>}
        </div>

        <Link
          to="/vehicles"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          Retour à la liste
        </Link>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
        >
          Mettre à jour
        </button>
      </form>
    </div>
  );
}
