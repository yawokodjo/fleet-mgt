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
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

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
                console.error("Erreur chargement véhicules ou chauffeurs : ", err);
                if (err.response?.status === 401) {
                    alert("Session expirée. Veuillez vous reconnecter.");
                    navigate("/login");
                } else if (err.response?.status === 403) {
                    alert("Accès non autorisé !");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, token]);

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/maintenances", form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Maintenance ajoutée !");
            navigate("/maintenances");
        } catch (err) {
            console.error("Erreur création maintenance :", err);
            alert("❌ Erreur lors de la création !");
        }
    };

    if (loading) return <p>Chargement...</p>;

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded bg-gray-50 max-w-lg mx-auto">
            <h3 className="text-lg font-semibold mb-2">Ajouter une maintenance</h3>

            <div className="mb-2">
                <label>Date de maintenance :</label>
                <input
                    type="date"
                    value={form.scheduled_date}
                    onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
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

            <select
                name="maintenance_type"
                value={form.maintenance_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                <option value="">Sélectionnez un type de maintenance</option>
                <option value="vidange">Vidange</option>
                <option value="pneus">Pneus</option>
                <option value="freins">Freins</option>
                <option value="batterie">Batterie</option>
                <option value="révision">Révision</option>
                <option value="carrosserie">Carrosserie</option>
                <option value="autre">Autre </option>
            </select>



            <div className="mb-2">
                <label>Compagnie  de maintenance :</label>
                <input
                    type="text"
                    value={form.maintenance_company}
                    onChange={(e) => setForm({ ...form, maintenance_company: e.target.value })}
                    className="border p-1 rounded w-full"
                    required
                />
            </div>
            <div className="mb-2">
                <label>Coût (FCFA) :</label>
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
                <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Ajouter</button>
                <button type="button" onClick={() => navigate("/maintenances")} className="px-3 py-1 bg-gray-500 text-white rounded">Annuler</button>
            </div>
        </form>
    );
}
