import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../axios";

export default function ConsumptionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [consumption, setConsumption] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConsumption = async () => {
            try {
                const res = await api.get(`/consumptions/${id}`);
                setConsumption(res.data);
            } catch (err) {
                console.error(err);
                alert(t('consumptions.not_found'));
                navigate("/consumptions");
            } finally {
                setLoading(false);
            }
        };
        fetchConsumption();
    }, [id, navigate, t]);

    if (loading) return <p className="text-center mt-5">{t('common.loading')}</p>;
    if (!consumption) return <p className="text-danger text-center mt-5">{t('consumptions.not_found')}</p>;

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 border-0 rounded-4">
                <h2 className="text-center mb-4">{t('consumptions.detail_title')}</h2>
                <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item"><strong>{t('consumptions.detail_date')}</strong> {consumption.date}</li>
                    <li className="list-group-item"><strong>{t('consumptions.detail_vehicle')}</strong> {consumption.vehicle?.license_plate || "-"}</li>
                    <li className="list-group-item"><strong>{t('consumptions.detail_driver')}</strong> {consumption.driver?.name || "-"}</li>
                    <li className="list-group-item"><strong>{t('consumptions.detail_liters')}</strong> {consumption.fuel_volume}</li>
                    <li className="list-group-item"><strong>{t('consumptions.detail_amount')}</strong> {consumption.fuel_cost}</li>
                </ul>
                <div className="d-flex justify-content-center gap-2 mt-3">
                    <button className="btn btn-primary" onClick={() => navigate(`/consumptions/${id}/edit`)}>✏ {t('common.edit')}</button>
                    <button className="btn btn-secondary" onClick={() => navigate("/consumptions")}>🔙 {t('common.back_to_list')}</button>
                </div>
            </div>
        </div>
    );
}
