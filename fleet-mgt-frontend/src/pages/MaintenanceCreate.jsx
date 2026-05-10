import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";

export default function MaintenanceCreate() {
    const [form, setForm] = useState({
        scheduled_date: "",
        vehicle_id: "",
        driver_id: "",
        maintenance_type: "",
        maintenance_company: "",
        cost: "",
        description: ""
    });
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Date minimum = aujourd'hui
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiclesRes, driversRes] = await Promise.all([
                    api.get("/vehicles-list", { headers: { Authorization: `Bearer ${token}` } }),
                    api.get("/drivers", { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setVehicles(vehiclesRes.data);
                setDrivers(driversRes.data);
            } catch (err) {
                console.error(err);
                alert("⚠️ Erreur chargement véhicules ou chauffeurs !");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const handleChange = e => {
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
        if (!form.scheduled_date) {
            newErrors.scheduled_date = "La date est obligatoire";
        } else if (form.scheduled_date < today) {
            newErrors.scheduled_date = "⚠️ La date ne peut pas être dans le passé";
        }

        // Validation des autres champs
        if (!form.vehicle_id) newErrors.vehicle_id = "Le véhicule est obligatoire";
        if (!form.driver_id) newErrors.driver_id = "Le chauffeur est obligatoire";
        if (!form.maintenance_type) newErrors.maintenance_type = "Le type est obligatoire";
        if (!form.maintenance_company) newErrors.maintenance_company = "La compagnie est obligatoire";
        if (!form.cost || parseFloat(form.cost) <= 0) {
            newErrors.cost = "Le coût doit être supérieur à 0";
        }
        if (!form.description) newErrors.description = "La description est obligatoire";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();

        // Valider le formulaire avant l'envoi
        if (!validateForm()) {
            return;
        }

        try {
            const payload = { ...form, cost: parseFloat(form.cost) };
            await api.post("/maintenances", payload, { headers: { Authorization: `Bearer ${token}` } });
            setMessage("✅ Maintenance ajoutée !");
            setTimeout(() => navigate("/maintenances"), 2000);
        } catch (err) {
            console.error(err);
            alert("❌ Erreur lors de la création !");
        }
    };

    if (loading) return <p className="text-center mt-4">Chargement...</p>;

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 border-0 rounded-4 mx-auto" style={{ maxWidth: "600px" }}>
                <h3 className="text-center mb-4 text-primary">Ajouter une Maintenance</h3>
                {message && <div className="alert alert-success text-center">{message}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Date de maintenance */}
                    <div className="mb-3">
                        <label className="form-label">Date de maintenance :</label>
                        <input
                            type="date"
                            name="scheduled_date"
                            value={form.scheduled_date}
                            onChange={handleChange}
                            className={`form-control ${errors.scheduled_date ? 'is-invalid' : ''}`}
                            min={today}
                            required
                        />
                        {errors.scheduled_date && (
                            <div className="invalid-feedback d-block">
                                {errors.scheduled_date}
                            </div>
                        )}
                    </div>

                    {/* Véhicule */}
                    <div className="mb-3">
                        <label className="form-label">Véhicule :</label>
                        <select
                            name="vehicle_id"
                            value={form.vehicle_id}
                            onChange={handleChange}
                            className={`form-select ${errors.vehicle_id ? 'is-invalid' : ''}`}
                            required
                        >
                            <option value="">-- Sélectionner un véhicule --</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.license_plate}</option>
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
                            value={form.driver_id}
                            onChange={handleChange}
                            className={`form-select ${errors.driver_id ? 'is-invalid' : ''}`}
                            required
                        >
                            <option value="">-- Sélectionner un chauffeur --</option>
                            {drivers.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        {errors.driver_id && (
                            <div className="invalid-feedback d-block">
                                {errors.driver_id}
                            </div>
                        )}
                    </div>

                    {/* Type de maintenance */}
                    <div className="mb-3">
                        <label className="form-label">Type de maintenance :</label>
                        <select
                            name="maintenance_type"
                            value={form.maintenance_type}
                            onChange={handleChange}
                            className={`form-select ${errors.maintenance_type ? 'is-invalid' : ''}`}
                            required
                        >
                            <option value="">Sélectionnez un type</option>
                            <option value="vidange">Vidange</option>
                            <option value="pneus">Pneus</option>
                            <option value="freins">Freins</option>
                            <option value="batterie">Batterie</option>
                            <option value="révision">Révision</option>
                            <option value="carrosserie">Carrosserie</option>
                            <option value="autre">Autre</option>
                        </select>
                        {errors.maintenance_type && (
                            <div className="invalid-feedback d-block">
                                {errors.maintenance_type}
                            </div>
                        )}
                    </div>

                    {/* Compagnie */}
                    <div className="mb-3">
                        <label className="form-label">Compagnie de maintenance :</label>
                        <input
                            type="text"
                            name="maintenance_company"
                            value={form.maintenance_company}
                            onChange={handleChange}
                            className={`form-control ${errors.maintenance_company ? 'is-invalid' : ''}`}
                            required
                        />
                        {errors.maintenance_company && (
                            <div className="invalid-feedback d-block">
                                {errors.maintenance_company}
                            </div>
                        )}
                    </div>

                    {/* Coût */}
                    <div className="mb-3">
                        <label className="form-label">Coût (FCFA) :</label>
                        <input
                            type="number"
                            name="cost"
                            value={form.cost}
                            onChange={handleChange}
                            className={`form-control ${errors.cost ? 'is-invalid' : ''}`}
                            min="0"
                            step="0.01"
                            required
                        />
                        {errors.cost && (
                            <div className="invalid-feedback d-block">
                                {errors.cost}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                        <label className="form-label">Description :</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                            rows="3"
                            placeholder="Détails de la maintenance..."
                            required
                        />
                        {errors.description && (
                            <div className="invalid-feedback d-block">
                                {errors.description}
                            </div>
                        )}
                    </div>

                    {/* Boutons */}
                    <div className="d-flex justify-content-center gap-2 mt-3">
                        <button type="submit" className="btn btn-success px-4">
                            ✅ Ajouter
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/maintenances")}
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