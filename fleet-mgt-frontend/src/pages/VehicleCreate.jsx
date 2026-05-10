import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function VehicleCreate() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        marque: "",
        model: "",
        license_plate: "",
        year: "",
        fuel_type: "",
        fuel_card: "",
        mileage: 0,
        status: "operational",
        current_driver_id: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            await axios.post("http://localhost:8000/api/vehicles", form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            alert("✅ Véhicule ajouté avec succès !");
            navigate("/vehicles");
        } catch (err) {
            console.error(err.response?.data);

            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else if (err.response?.status === 403) {
                alert("⛔ Accès non autorisé.");
            } else if (err.response?.status === 401) {
                alert("⚠️ Session expirée, veuillez vous reconnecter.");
            } else {
                alert(err.response?.data?.message || "Erreur lors de l’ajout du véhicule.");
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg">
                <div className="card-header bg-success text-white text-center">
                    <h4>Ajouter un véhicule</h4>
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {/* Marque */}
                        <div className="mb-3">
                            <label className="form-label">Marque</label>
                            <input
                                type="text"
                                name="marque"
                                value={form.marque}
                                onChange={handleChange}
                                className={`form-control ${errors.marque ? "is-invalid" : ""}`}
                                required
                            />
                            {errors.marque && (
                                <div className="invalid-feedback">{errors.marque.join(", ")}</div>
                            )}
                        </div>

                        {/* Modèle */}
                        <div className="mb-3">
                            <label className="form-label">Modèle</label>
                            <input
                                type="text"
                                name="model"
                                value={form.model}
                                onChange={handleChange}
                                className={`form-control ${errors.model ? "is-invalid" : ""}`}
                                required
                            />
                            {errors.model && (
                                <div className="invalid-feedback">{errors.model.join(", ")}</div>
                            )}
                        </div>

                        {/* Immatriculation */}
                        <div className="mb-3">
                            <label className="form-label">Immatriculation</label>
                            <input
                                type="text"
                                name="license_plate"
                                value={form.license_plate}
                                onChange={handleChange}
                                className={`form-control ${errors.license_plate ? "is-invalid" : ""
                                    }`}
                                required
                            />
                            {errors.license_plate && (
                                <div className="invalid-feedback">
                                    {errors.license_plate.join(", ")}
                                </div>
                            )}
                        </div>

                        {/* Année */}
                        <div className="mb-3">
                            <label className="form-label">Année</label>
                            <input
                                type="number"
                                name="year"
                                value={form.year}
                                onChange={handleChange}
                                className={`form-control ${errors.year ? "is-invalid" : ""}`}
                                required
                            />
                            {errors.year && (
                                <div className="invalid-feedback">{errors.year.join(", ")}</div>
                            )}
                        </div>

                        {/* Type de carburant */}
                        <div className="mb-3">
                            <label className="form-label">Type de carburant</label>
                            <select
                                name="fuel_type"
                                value={form.fuel_type}
                                onChange={handleChange}
                                className={`form-select ${errors.fuel_type ? "is-invalid" : ""}`}
                                required
                            >
                                <option value="">Sélectionner...</option>
                                <option value="essence">Essence</option>
                                <option value="diesel">Diesel</option>
                                <option value="hybride">Hybride</option>
                                <option value="électrique">Électrique</option>
                                <option value="gpl">GPL</option>
                                <option value="autre">Autre</option>
                            </select>
                            {errors.fuel_type && (
                                <div className="invalid-feedback">
                                    {errors.fuel_type.join(", ")}
                                </div>
                            )}
                        </div>

                        {/* Carte carburant */}
                        <div className="mb-3">
                            <label className="form-label">Carte carburant (optionnel)</label>
                            <input
                                type="text"
                                name="fuel_card"
                                value={form.fuel_card}
                                onChange={handleChange}
                                className="form-control"
                            />
                            {errors.fuel_card && (
                                <div className="invalid-feedback">
                                    {errors.fuel_card.join(", ")}
                                </div>
                            )}
                        </div>

                        {/* Kilométrage */}
                        <div className="mb-3">
                            <label className="form-label">Kilométrage</label>
                            <input
                                type="number"
                                name="mileage"
                                value={form.mileage}
                                onChange={handleChange}
                                className={`form-control ${errors.mileage ? "is-invalid" : ""}`}
                                required
                            />
                            {errors.mileage && (
                                <div className="invalid-feedback">
                                    {errors.mileage.join(", ")}
                                </div>
                            )}
                        </div>

                        {/* Statut */}
                        <div className="mb-3">
                            <label className="form-label">Statut</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className={`form-select ${errors.status ? "is-invalid" : ""}`}
                                required
                            >
                                <option value="operational">Opérationnel</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="out_of_service">Hors service</option>
                            </select>
                            {errors.status && (
                                <div className="invalid-feedback">{errors.status.join(", ")}</div>
                            )}
                        </div>

                        {/* Boutons */}
                        <div className="d-flex justify-content-between mt-4">
                            <Link to="/vehicles" className="btn btn-secondary">
                                ← Retour
                            </Link>
                            <button type="submit" className="btn btn-success">
                                💾 Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
