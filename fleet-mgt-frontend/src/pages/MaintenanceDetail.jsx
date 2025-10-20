import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axios";

export default function MaintenanceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [maintenance, setMaintenance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaintenance = async () => {
            try {
                const res = await api.get(`/maintenances/${id}`);
                setMaintenance(res.data);
            } catch (err) {
                console.error("Erreur chargement maintenance :", err);
                alert("⚠️ Impossible de charger la maintenance !");
                navigate("/maintenances");
            } finally {
                setLoading(false);
            }
        };

        fetchMaintenance();
    }, [id, navigate]);

    if (loading) return <p>Chargement maintenance...</p>;
    if (!maintenance) return <p className="text-red-600">⚠️ Maintenance introuvable.</p>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-center">Détails de la maintenance</h2>

            <div className="space-y-2">
                <p>
                    <strong>Date de maintenance :</strong> {maintenance.schedule_date}
                </p>
                <p>
                    <strong>Véhicule :</strong> {maintenance.vehicle?.license_plate || "-"}
                </p>
                <p>
                    <strong>Chauffeur :</strong> {maintenance.driver?.name || "-"}
                </p>
                <p>
                    <strong>Type de maintenance :</strong> {maintenance.maintenance_type}
                </p>
                <p>
                    <strong>Compagnie de maintenance :</strong> {maintenance.maintenance_company}
                </p>
                <p>
                    <strong>Cout de maintenance (FCFA) :</strong> {maintenance.cost}
                </p>

                <p>
                    <strong>Description :</strong> {maintenance.description}
                </p>
            </div>

            <div className="flex gap-2 mt-4">
                <button
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() => navigate(`/maintenances/${id}/edit`)}
                >
                    ✏ Modifier
                </button>
                <button
                    className="px-3 py-1 bg-gray-500 text-white rounded"
                    onClick={() => navigate("/maintenances")}
                >
                    🔙 Retour à la liste
                </button>
            </div>
        </div>
    );
}

