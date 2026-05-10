import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axios";

export default function MaintenanceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [maintenance, setMaintenance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchMaintenance = async () => {
            try {
                const res = await api.get(`/maintenances/${id}`);
                setMaintenance(res.data);
            } catch (err) {
                console.error(err);
                setMessage("⚠️ Impossible de charger la maintenance !");
                setTimeout(() => navigate("/maintenances"), 2000);
            } finally {
                setLoading(false);
            }
        };

        fetchMaintenance();
    }, [id, navigate]);

    if (loading) return <p className="text-center mt-4">Chargement maintenance...</p>;
    if (!maintenance) return <p className="text-center text-danger mt-4">⚠️ Maintenance introuvable.</p>;

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 border-0 rounded-4 mx-auto" style={{ maxWidth: "600px" }}>
                <h2 className="text-center mb-4 text-primary">Détails de la Maintenance</h2>

                {message && <div className="alert alert-danger text-center">{message}</div>}

                <div className="mb-3">
                    <strong>Date de maintenance :</strong> {maintenance.scheduled_date || "-"}
                </div>
                <div className="mb-3">
                    <strong>Véhicule :</strong> {maintenance.vehicle?.license_plate || "-"}
                </div>
                <div className="mb-3">
                    <strong>Chauffeur :</strong> {maintenance.driver?.name || "-"}
                </div>
                <div className="mb-3">
                    <strong>Type de maintenance :</strong> {maintenance.maintenance_type || "-"}
                </div>
                <div className="mb-3">
                    <strong>Compagnie de maintenance :</strong> {maintenance.maintenance_company || "-"}
                </div>
                <div className="mb-3">
                    <strong>Coût de maintenance (FCFA) :</strong> {maintenance.cost || "-"}
                </div>
                <div className="mb-3">
                    <strong>Description :</strong> {maintenance.description || "-"}
                </div>

                <div className="d-flex justify-content-center gap-2 mt-3">
                    <button
                        className="btn btn-primary px-4"
                        onClick={() => navigate(`/maintenances/${id}/edit`)}
                    >
                        ✏ Modifier
                    </button>
                    <button
                        className="btn btn-secondary px-4"
                        onClick={() => navigate("/maintenances")}
                    >
                        🔙 Retour
                    </button>
                </div>
            </div>
        </div>
    );
}
