import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../axios";

export default function MaintenanceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
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
                setMessage(t('maintenances.not_found'));
                setTimeout(() => navigate("/maintenances"), 2000);
            } finally {
                setLoading(false);
            }
        };
        fetchMaintenance();
    }, [id, navigate, t]);

    if (loading) return <p className="text-center mt-4">{t('common.loading')}</p>;
    if (!maintenance) return <p className="text-center text-danger mt-4">{t('maintenances.not_found')}</p>;

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 border-0 rounded-4 mx-auto" style={{ maxWidth: "600px" }}>
                <h2 className="text-center mb-4 text-primary">{t('maintenances.detail_title')}</h2>
                {message && <div className="alert alert-danger text-center">{message}</div>}
                <div className="mb-3"><strong>{t('maintenances.detail_date')}</strong> {maintenance.scheduled_date || "-"}</div>
                <div className="mb-3"><strong>{t('maintenances.detail_vehicle')}</strong> {maintenance.vehicle?.license_plate || "-"}</div>
                <div className="mb-3"><strong>{t('maintenances.detail_driver')}</strong> {maintenance.driver?.name || "-"}</div>
                <div className="mb-3"><strong>{t('maintenances.detail_type')}</strong> {maintenance.maintenance_type || "-"}</div>
                <div className="mb-3"><strong>{t('maintenances.detail_company')}</strong> {maintenance.maintenance_company || "-"}</div>
                <div className="mb-3"><strong>{t('maintenances.detail_cost')}</strong> {maintenance.cost || "-"}</div>
                <div className="mb-3"><strong>{t('maintenances.detail_desc')}</strong> {maintenance.description || "-"}</div>
                <div className="d-flex justify-content-center gap-2 mt-3">
                    <button className="btn btn-primary px-4" onClick={() => navigate(`/maintenances/${id}/edit`)}>✏ {t('common.edit')}</button>
                    <button className="btn btn-secondary px-4" onClick={() => navigate("/maintenances")}>🔙 {t('common.back')}</button>
                </div>
            </div>
        </div>
    );
}
