import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axios";

export default function ConsumptionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [consumption, setConsumption] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConsumption = async () => {
            try {
                const res = await api.get(`/consumptions/${id}`);
                setConsumption(res.data);
            } catch (err) {
                console.error("Erreur chargement consommation :", err);
                alert("⚠️ Impossible de charger la consommation !");
                navigate("/consumptions");
            } finally {
                setLoading(false);
            }
        };

        fetchConsumption();
    }, [id, navigate]);

    if (loading) return <p>Chargement consommation...</p>;
    if (!consumption) return <p className="text-red-600">⚠️ Consommation introuvable.</p>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-center">Détails de la consommation</h2>

            <div className="space-y-2">
                <p>
                    <strong>Date :</strong> {consumption.date}
                </p>
                <p>
                    <strong>Véhicule :</strong> {consumption.vehicle?.license_plate || "-"}
                </p>
                <p>
                    <strong>Chauffeur :</strong> {consumption.driver?.name || "-"}
                </p>
                <p>
                    <strong>Litres :</strong> {consumption.fuel_volume}
                </p>
                <p>
                    <strong>Montant (FCFA) :</strong> {consumption.fuel_cost}
                </p>
            </div>

            <div className="flex gap-2 mt-4">
                <button
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() => navigate(`/consumptions/${id}/edit`)}
                >
                    ✏ Modifier
                </button>
                <button
                    className="px-3 py-1 bg-gray-500 text-white rounded"
                    onClick={() => navigate("/consumptions")}
                >
                    🔙 Retour à la liste
                </button>
            </div>
        </div>
    );
}
