import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";

export default function ConsumptionCreate() {
    const [form, setForm] = useState({
        date: "",
        fuel_volume: "",
        fuel_cost: "",
        vehicle_id: "",
        driver_id: "",
    });
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Date maximum = aujourd'hui (bloque le futur)
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiclesRes, driversRes] = await Promise.all([
                    api.get("/vehicles-list", { headers: { Authorization: `Bearer ${token}` } }),
                    api.get("/drivers", { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setVehicles(vehiclesRes.data);
                setDrivers(driversRes.data);
            } catch (err) {
                console.error("Erreur chargement :", err);
                if (err.response?.status === 401) {
                    alert("Session expirée. Veuillez vous reconnecter.");
                    navigate("/login");
                } else {
                    alert("⚠️ Erreur de chargement des données !");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Effacer l'erreur pour ce champ
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validation de la date
        if (!form.date) {
            newErrors.date = "La date est obligatoire";
        } else if (form.date > today) {
            newErrors.date = "⚠️ La date ne peut pas être dans le futur";
        }

        // Validation des autres champs
        if (!form.vehicle_id) newErrors.vehicle_id = "Le véhicule est obligatoire";
        if (!form.driver_id) newErrors.driver_id = "Le chauffeur est obligatoire";
        if (!form.fuel_volume || parseFloat(form.fuel_volume) <= 0) {
            newErrors.fuel_volume = "Le volume doit être supérieur à 0";
        }
        if (!form.fuel_cost || parseFloat(form.fuel_cost) <= 0) {
            newErrors.fuel_cost = "Le montant doit être supérieur à 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Valider le formulaire avant l'envoi
        if (!validateForm()) {
            return;
        }

        // Conversion des nombres
        const payload = {
            ...form,
            fuel_volume: parseFloat(form.fuel_volume),
            fuel_cost: parseFloat(form.fuel_cost),
        };

        try {
            await api.post("/consumptions", payload, { headers: { Authorization: `Bearer ${token}` } });
            setMessage("✅ Consommation ajoutée avec succès !");
            setTimeout(() => navigate("/consumptions"), 2000);
        } catch (err) {
            console.error("Erreur création :", err);
            alert("❌ Échec de l'enregistrement !");
        }
    };

    if (loading) return <p className="text-center mt-4">Chargement des données...</p>;

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 border-0 rounded-4 mx-auto" style={{ maxWidth: "600px" }}>
                <h3 className="text-center mb-4 text-primary">Ajouter une Consommation</h3>

                {message && <div className="alert alert-success text-center">{message}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Date */}
                    <div className="mb-3">
                        <label className="form-label">Date de consommation :</label>
                        <input
                            type="date"
                            name="date"
                            className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                            value={form.date}
                            onChange={handleChange}
                            max={today}
                            required
                        />
                        {errors.date && (
                            <div className="invalid-feedback d-block">
                                {errors.date}
                            </div>
                        )}
                        <small className="text-muted">La date ne peut pas être dans le futur</small>
                    </div>

                    {/* Véhicule */}
                    <div className="mb-3">
                        <label className="form-label">Véhicule :</label>
                        <select
                            name="vehicle_id"
                            className={`form-select ${errors.vehicle_id ? 'is-invalid' : ''}`}
                            value={form.vehicle_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Sélectionner un véhicule --</option>
                            {vehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.license_plate}
                                </option>
                            ))}
                        </select>
                        {errors.vehicle_id && (
                            <div className="invalid-feedback d-block">
                                {errors.vehicle_id}
                            </div>
                        )}
                    </div>

                    {/* Chauffeur */}
                    <div className="mb-3">
                        <label className="form-label">Chauffeur :</label>
                        <select
                            name="driver_id"
                            className={`form-select ${errors.driver_id ? 'is-invalid' : ''}`}
                            value={form.driver_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Sélectionner un chauffeur --</option>
                            {drivers.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                        {errors.driver_id && (
                            <div className="invalid-feedback d-block">
                                {errors.driver_id}
                            </div>
                        )}
                    </div>

                    <div className="row">
                        {/* Litres */}
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Litres :</label>
                            <input
                                type="number"
                                name="fuel_volume"
                                className={`form-control ${errors.fuel_volume ? 'is-invalid' : ''}`}
                                value={form.fuel_volume}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                            />
                            {errors.fuel_volume && (
                                <div className="invalid-feedback d-block">
                                    {errors.fuel_volume}
                                </div>
                            )}
                        </div>

                        {/* Montant */}
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Montant (FCFA) :</label>
                            <input
                                type="number"
                                name="fuel_cost"
                                className={`form-control ${errors.fuel_cost ? 'is-invalid' : ''}`}
                                value={form.fuel_cost}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                            />
                            {errors.fuel_cost && (
                                <div className="invalid-feedback d-block">
                                    {errors.fuel_cost}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Boutons */}
                    <div className="d-flex justify-content-center gap-2 mt-3">
                        <button type="submit" className="btn btn-success px-4">
                            ✅ Ajouter
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/consumptions")}
                            className="btn btn-secondary px-4"
                        >
                            🔙 Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}