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
        if (err.response?.status === 500)
          alert("Erreur serveur, impossible de charger le véhicule.");
      });
  }, [id, navigate, token]);

  const handleChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    axios
      .put(`${API_BASE_URL}/vehicles/${id}`, vehicle, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Véhicule mis à jour avec succès !");
        navigate("/vehicles");
      })
      .catch((err) => {
        if (err.response?.status === 422) {
          setErrors(err.response.data.errors || {});
        } else if (err.response?.status === 401) {
          alert("Session expirée. Veuillez vous reconnecter.");
          navigate("/login");
        } else {
          console.error("Erreur lors de la mise à jour :", err);
          alert("Une erreur est survenue lors de la mise à jour.");
        }
      });
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center">
          <h4>Modifier un véhicule</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Marque</label>
              <input
                type="text"
                name="marque"
                value={vehicle.marque}
                onChange={handleChange}
                className="form-control"
              />
              {errors.marque && (
                <div className="text-danger">{errors.marque[0]}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Modèle</label>
              <input
                type="text"
                name="model"
                value={vehicle.model}
                onChange={handleChange}
                className="form-control"
              />
              {errors.model && (
                <div className="text-danger">{errors.model[0]}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Plaque d'immatriculation</label>
              <input
                type="text"
                name="license_plate"
                value={vehicle.license_plate}
                onChange={handleChange}
                className="form-control"
              />
              {errors.license_plate && (
                <div className="text-danger">{errors.license_plate[0]}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Année</label>
              <input
                type="number"
                name="year"
                value={vehicle.year}
                onChange={handleChange}
                className="form-control"
              />
              {errors.year && (
                <div className="text-danger">{errors.year[0]}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Type de carburant</label>
              <select
                name="fuel_type"
                value={vehicle.fuel_type}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">-- Sélectionner --</option>
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="hybride">Hybride</option>
                <option value="électrique">Électrique</option>
                <option value="gpl">GPL</option>
                <option value="autre">Autre</option>
              </select>
              {errors.fuel_type && (
                <div className="text-danger">{errors.fuel_type[0]}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Carte carburant</label>
              <input
                type="text"
                name="fuel_card"
                value={vehicle.fuel_card || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Kilométrage</label>
              <input
                type="number"
                name="mileage"
                value={vehicle.mileage}
                onChange={handleChange}
                className="form-control"
              />
              {errors.mileage && (
                <div className="text-danger">{errors.mileage[0]}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Statut</label>
              <select
                name="status"
                value={vehicle.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="operational">Opérationnel</option>
                <option value="maintenance">Maintenance</option>
                <option value="out_of_service">Hors service</option>
              </select>
              {errors.status && (
                <div className="text-danger">{errors.status[0]}</div>
              )}
            </div>

            <div className="d-flex justify-content-between">
              <Link to="/vehicles" className="btn btn-secondary">
                ← Retour à la liste
              </Link>
              <button type="submit" className="btn btn-primary">
                💾 Mettre à jour
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
