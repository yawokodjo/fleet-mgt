import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../axios";

export default function ConsumptionEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

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

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 🔹 Récupérer la consommation
                const consumptionRes = await api.get(`/consumptions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = consumptionRes.data;
                setForm({
                    date: data.date || "",
                    fuel_volume: data.fuel_volume || "",
                    fuel_cost: data.fuel_cost || "",
                    vehicle_id: data.vehicle?.id || "",
                    driver_id: data.driver?.id || "",
                });

                // 🔹 Récupérer véhicules + chauffeurs
                const [vehiclesRes, driversRes] = await Promise.all([
                    api.get("/vehicles-list", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    api.get("/drivers", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setVehicles(vehiclesRes.data);
                setDrivers(driversRes.data);
            } catch (err) {
                console.error("Erreur chargement consommation :", err);
                if (err.response?.status === 401) {
                    alert("Session expirée. Veuillez vous reconnecter.");
                    navigate("/login");
                } else if (err.response?.status === 403) {
                    alert("Accès non autorisé !");
                } else if (err.response?.status === 404) {
                    alert("Consommation introuvable !");
                    navigate("/consumptions");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/consumptions/${id}`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("✅ Consommation mise à jour !");
            navigate("/consumptions");
        } catch (err) {
            console.error("Erreur mise à jour consommation :", err);
            alert("❌ Erreur lors de la mise à jour !");
        }
    };

    if (loading)
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2">Chargement des données...</p>
            </div>
        );

    return (
        <div className="container py-4">
            <div className="card shadow-sm mx-auto" style={{ maxWidth: "600px" }}>
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">🛠 Modifier la consommation</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Date :</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Véhicule :</label>
                            <select
                                value={form.vehicle_id}
                                onChange={(e) =>
                                    setForm({ ...form, vehicle_id: e.target.value })
                                }
                                className="form-select"
                                required
                            >
                                <option value="">-- Choisir un véhicule --</option>
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.license_plate}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Chauffeur :</label>
                            <select
                                value={form.driver_id}
                                onChange={(e) =>
                                    setForm({ ...form, driver_id: e.target.value })
                                }
                                className="form-select"
                                required
                            >
                                <option value="">-- Choisir un chauffeur --</option>
                                {drivers.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Litres :</label>
                            <input
                                type="number"
                                value={form.fuel_volume}
                                onChange={(e) =>
                                    setForm({ ...form, fuel_volume: e.target.value })
                                }
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Montant (FCFA) :</label>
                            <input
                                type="number"
                                value={form.fuel_cost}
                                onChange={(e) =>
                                    setForm({ ...form, fuel_cost: e.target.value })
                                }
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="d-flex justify-content-between">
                            <button type="submit" className="btn btn-success">
                                💾 Mettre à jour
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate("/consumptions")}
                            >
                                ↩ Annuler
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
