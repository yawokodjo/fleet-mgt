import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../axios";

export default function MaintenanceEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        schedule_date: "",
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

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const maintenanceRes = await api.get(`/maintenances/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = maintenanceRes.data;
                setForm({
                    schedule_date: data.schedule_date || "",
                    vehicle_id: data.vehicle?.id || "",
                    driver_id: data.driver?.id || "",
                    maintenance_type: data.maintenance_type || "",
                    maintenance_company: data.maintenance_company || "",
                    cost: data.cost || "",
                    description: data.description || ""
                });

                const [vehiclesRes, driversRes] = await Promise.all([
                    api.get("/vehicles-list", { headers: { Authorization: `Bearer ${token}` } }),
                    api.get("/drivers", { headers: { Authorization: `Bearer ${token}` } })
                ]);

                setVehicles(vehiclesRes.data);
                setDrivers(driversRes.data);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) {
                    setMessage("⚠️ Session expirée. Veuillez vous reconnecter.");
                    setTimeout(() => navigate("/login"), 2000);
                } else if (err.response?.status === 403) {
                    setMessage("❌ Accès non autorisé !");
                } else if (err.response?.status === 404) {
                    setMessage("⚠️ Maintenance introuvable !");
                    setTimeout(() => navigate("/maintenances"), 2000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation JS
        if (
            !form.schedule_date ||
            !form.vehicle_id ||
            !form.driver_id ||
            !form.maintenance_type ||
            !form.maintenance_company ||
            !form.cost ||
            !form.description
        ) {
            setMessage("⚠️ Veuillez remplir tous les champs.");
            return;
        }

        try {
            const payload = {
                ...form,
                cost: parseFloat(form.cost)
            };

            await api.put(`/maintenances/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage("✅ Maintenance mise à jour avec succès !");
            setTimeout(() => navigate("/maintenances"), 2000);
        } catch (err) {
            console.error(err);
            setMessage("❌ Erreur lors de la mise à jour !");
        }
    };

    if (loading) return <p className="text-center mt-4">Chargement...</p>;

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 border-0 rounded-4 mx-auto" style={{ maxWidth: "600px" }}>
                <h3 className="text-center mb-4 text-primary">Modifier la Maintenance</h3>

                {message && <div className="alert alert-info text-center">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Date de planification :</label>
                        <input
                            type="date"
                            className="form-control"
                            value={form.schedule_date}
                            onChange={(e) => setForm({ ...form, schedule_date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Véhicule :</label>
                        <select
                            className="form-select"
                            value={form.vehicle_id}
                            onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
                            required
                        >
                            <option value="">-- Sélectionner un véhicule --</option>
                            {vehicles.map((v) => (
                                <option key={v.id} value={v.id}>{v.license_plate}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Chauffeur :</label>
                        <select
                            className="form-select"
                            value={form.driver_id}
                            onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
                            required
                        >
                            <option value="">-- Sélectionner un chauffeur --</option>
                            {drivers.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Type de maintenance :</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.maintenance_type}
                            onChange={(e) => setForm({ ...form, maintenance_type: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Compagnie :</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.maintenance_company}
                            onChange={(e) => setForm({ ...form, maintenance_company: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Coût (FCFA) :</label>
                        <input
                            type="number"
                            className="form-control"
                            value={form.cost}
                            onChange={(e) => setForm({ ...form, cost: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description :</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-center gap-2 mt-3">
                        <button type="submit" className="btn btn-success px-4">✅ Mettre à jour</button>
                        <button type="button" onClick={() => navigate("/maintenances")} className="btn btn-secondary px-4">🔙 Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
