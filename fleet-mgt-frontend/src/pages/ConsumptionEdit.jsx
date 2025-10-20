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
        driver_id: ""
    });
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Récupérer la consommation
                const consumptionRes = await api.get(`/consumptions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = consumptionRes.data;
                setForm({
                    date: data.date || "",
                    fuel_volume: data.fuel_volume || "",
                    fuel_cost: data.fuel_cost || "",
                    vehicle_id: data.vehicle?.id || "",
                    driver_id: data.driver?.id || ""
                });

                // Récupérer véhicules et chauffeurs
                const [vehiclesRes, driversRes] = await Promise.all([
                    api.get("/vehicles-list", { headers: { Authorization: `Bearer ${token}` } }),
                    api.get("/drivers", { headers: { Authorization: `Bearer ${token}` } })
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
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Consommation mise à jour !");
            navigate("/consumptions");
        } catch (err) {
            console.error("Erreur mise à jour consommation :", err);
            alert("❌ Erreur lors de la mise à jour !");
        }
    };

    if (loading) return <p>Chargement...</p>;

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded bg-gray-50 max-w-lg mx-auto">
            <h3 className="text-lg font-semibold mb-2">Modifier la consommation</h3>

            <div className="mb-2">
                <label>Date :</label>
                <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
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
                <label>Litres :</label>
                <input
                    type="number"
                    value={form.fuel_volume}
                    onChange={(e) => setForm({ ...form, fuel_volume: e.target.value })}
                    className="border p-1 rounded w-full"
                    required
                />
            </div>

            <div className="mb-2">
                <label>Montant (FCFA) :</label>
                <input
                    type="number"
                    value={form.fuel_cost}
                    onChange={(e) => setForm({ ...form, fuel_cost: e.target.value })}
                    className="border p-1 rounded w-full"
                    required
                />
            </div>

            <div className="flex gap-2 mt-2">
                <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Mettre à jour</button>
                <button type="button" onClick={() => navigate("/consumptions")} className="px-3 py-1 bg-gray-500 text-white rounded">Annuler</button>
            </div>
        </form>
    );
}
