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

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Récupérer la maintenance
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

                // Récupérer véhicules et chauffeurs
                const [vehiclesRes, driversRes] = await Promise.all([
                    api.get("/vehicles-list", { headers: { Authorization: `Bearer ${token}` } }),
                    api.get("/drivers", { headers: { Authorization: `Bearer ${token}` } })
                ]);

                setVehicles(vehiclesRes.data);
                setDrivers(driversRes.data);
            } catch (err) {
                console.error("Erreur chargement maintenance :", err);
                if (err.response?.status === 401) {
                    alert("Session expirée. Veuillez vous reconnecter.");
                    navigate("/login");
                } else if (err.response?.status === 403) {
                    alert("Accès non autorisé !");
                } else if (err.response?.status === 404) {
                    alert("Maintenance introuvable !");
                    navigate("/maintenances");
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
            await api.put(`/maintenances/${id}`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Maintenance mise à jour !");
            navigate("/maintenances");
        } catch (err) {
            console.error("Erreur mise à jour maintenance :", err);
            alert("❌ Erreur lors de la mise à jour !");
        }
    };

    if (loading) return <p>Chargement...</p>;

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded bg-gray-50 max-w-lg mx-auto">
            <h3 className="text-lg font-semibold mb-2">Modifier la maintenance</h3>

            <div className="mb-2">
                <label>Date de planification de maintenance :</label>
                <input
                    type="date"
                    value={form.schedule_date}
                    onChange={(e) => setForm({ ...form, schedule_date: e.target.value })}
                    className="border p-1 rounded w-full"
                    required
                />
            </div>

            <div className="mb-2">
                <label>Véhicule :</label>
                <select
                    value={form.vehicle_id}
                    onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
                    className="border p-1 rounded w-full"
                    required
                >
                    <option value="">-- Choisir un véhicule --</option>
                    {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>{v.license_plate}</option>
                    ))}
                </select>
            </div>

            <div className="mb-2">
                <label>Chauffeur :</label>
                <select
                    value={form.driver_id}
                    onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
                    className="border p-1 rounded w-full"
                    required
                >
                    <option value="">-- Choisir un chauffeur --</option>
                    {drivers.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>

            <div className="mb-2">
                <label>Type de maintenance :</label>
                <input
                    type="text"
                    value={form.maintenance_type}
                    onChange={(e) => setForm({ ...form, maintenance_type: e.target.value })}
                    className="border p-1 rounded w-full"
                    required
                />
            </div>

            <div className="mb-2">
                <label>Compagnie de maintenance :</label>
                <input
                    type="text"
                    value={form.maintenance_company}
                    onChange={(e) => setForm({ ...form, maintenance_company: e.target.value })}
                    className="border p-1 rounded w-full"
                    required
                />
            </div>

            <div className="mb-2">
                <label>Cout de maintenance (FCFA) :</label>
                <input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="border p-1 rounded w-full"
                    required
                />
            </div>

            <div className="mb-2">
                <label>Description :</label>
                <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="border p-1 rounded w-full"
                    required
                />
            </div>

            <div className="flex gap-2 mt-2">
                <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Mettre à jour</button>
                <button type="button" onClick={() => navigate("/maintenances")} className="px-3 py-1 bg-gray-500 text-white rounded">Annuler</button>
            </div>
        </form>
    );
}

