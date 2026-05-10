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

    if (loading) return <p className="text-center mt-5">Chargement de la consommation...</p>;
    if (!consumption)
        return <p className="text-danger text-center mt-5">⚠️ Consommation introuvable.</p>;

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 border-0 rounded-4">
                <h2 className="text-center mb-4">Détails de la consommation</h2>

                <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item">
                        <strong>Date :</strong> {consumption.date}
                    </li>
                    <li className="list-group-item">
                        <strong>Véhicule :</strong> {consumption.vehicle?.license_plate || "-"}
                    </li>
                    <li className="list-group-item">
                        <strong>Chauffeur :</strong> {consumption.driver?.name || "-"}
                    </li>
                    <li className="list-group-item">
                        <strong>Litres :</strong> {consumption.fuel_volume}
                    </li>
                    <li className="list-group-item">
                        <strong>Montant (FCFA) :</strong> {consumption.fuel_cost}
                    </li>
                </ul>

                <div className="d-flex justify-content-center gap-2 mt-3">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/consumptions/${id}/edit`)}
                    >
                        ✏ Modifier
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate("/consumptions")}>
                        🔙 Retour à la liste
                    </button>
                </div>
            </div>
        </div>
    );
}
