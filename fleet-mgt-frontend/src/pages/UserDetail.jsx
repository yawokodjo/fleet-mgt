import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axios";

export default function UserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
            fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/users/${id}`);
            setUser(res.data.user || res.data.data || res.data);
        } catch (err) {
            console.error("Erreur chargement utilisateur:", err);
            alert("❌ Impossible de charger les détails de l'utilisateur");
            navigate("/users");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-center mt-4">Chargement...</p>;
    if (!user) return <p className="text-center mt-4">Utilisateur introuvable</p>;

    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">👤 Détails de l'utilisateur</h3>
                    <button
                        className="btn btn-light btn-sm"
                        onClick={() => navigate("/users")}
                    >
                        🔙 Retour
                    </button>
                </div>

                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <strong>Nom :</strong>
                                <p className="text-muted">{user.name || "-"}</p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="mb-3">
                                <strong>Email :</strong>
                                <p className="text-muted">{user.email || "-"}</p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="mb-3">
                                <strong>Rôle :</strong>
                                <p className="text-muted">
                                    <span className={`badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'driver' ? 'bg-success' : 'bg-secondary'}`}>
                                        {user.role || "-"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="mb-3">
                                <strong>Statut :</strong>
                                <p className="text-muted">
                                    <span className={`badge ${user.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                                        {user.status === 'active' ? 'Actif' : 'Inactif'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="mb-3">
                                <strong>Date de création :</strong>
                                <p className="text-muted">{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : "-"}</p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="mb-3">
                                <strong>Dernière mise à jour :</strong>
                                <p className="text-muted">{user.updated_at ? new Date(user.updated_at).toLocaleDateString('fr-FR') : "-"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                        <button
                            className="btn btn-warning"
                            onClick={() => navigate(`/users/${id}/edit`)}
                        >
                            ✏️ Modifier
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate("/users")}
                        >
                            🔙 Retour à la liste
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}