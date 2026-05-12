import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../axios";

export default function ConsumptionEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [form, setForm] = useState({ date: "", fuel_volume: "", fuel_cost: "", vehicle_id: "", driver_id: "", mileage: "" });
    const [documentFile, setDocumentFile] = useState(null);
    const [existingDoc, setExistingDoc] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const consumptionRes = await api.get(`/consumptions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                const data = consumptionRes.data;
                setForm({
                    date: data.date ? data.date.split('T')[0] : "",
                    fuel_volume: data.fuel_volume || "",
                    fuel_cost: data.fuel_cost || "",
                    vehicle_id: data.vehicle?.id || "",
                    driver_id: data.driver?.id || "",
                    mileage: data.mileage || "",
                });
                setExistingDoc(data.document_url || null);
                const [vehiclesRes, driversRes] = await Promise.all([
                    api.get("/vehicles-list", { headers: { Authorization: `Bearer ${token}` } }),
                    api.get("/drivers", { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setVehicles(vehiclesRes.data);
                setDrivers(driversRes.data);
            } catch (err) {
                if (err.response?.status === 401) { alert(t('common.session_expired')); navigate("/login"); }
                else if (err.response?.status === 403) alert(t('common.unauthorized'));
                else if (err.response?.status === 404) { alert(t('consumptions.not_found')); navigate("/consumptions"); }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate, token, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            payload.append('date', form.date);
            payload.append('vehicle_id', form.vehicle_id);
            payload.append('driver_id', form.driver_id);
            payload.append('fuel_volume', parseFloat(form.fuel_volume));
            payload.append('fuel_cost', parseFloat(form.fuel_cost));
            if (form.mileage) payload.append('mileage', parseInt(form.mileage));
            if (documentFile) payload.append('document', documentFile);
            // PUT with FormData requires method spoofing
            payload.append('_method', 'PUT');

            await api.post(`/consumptions/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            alert(t('consumptions.update_success'));
            navigate("/consumptions");
        } catch (err) {
            console.error(err);
            alert(t('common.error'));
        }
    };

    if (loading) return (
        <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2">{t('common.loading')}</p>
        </div>
    );

    return (
        <div className="container py-4">
            <div className="card shadow-sm mx-auto" style={{ maxWidth: "620px" }}>
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">{t('consumptions.edit_title')}</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">{t('consumptions.date')} :</label>
                            <input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t('consumptions.vehicle')}</label>
                            <select className="form-select" value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} required>
                                <option value="">{t('consumptions.choose_vehicle')}</option>
                                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.license_plate}</option>)}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t('consumptions.driver')}</label>
                            <select className="form-select" value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })} required>
                                <option value="">{t('consumptions.choose_driver')}</option>
                                {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">{t('consumptions.liters')}</label>
                                <input type="number" className="form-control" value={form.fuel_volume} onChange={(e) => setForm({ ...form, fuel_volume: e.target.value })} required />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">{t('consumptions.amount')}</label>
                                <input type="number" className="form-control" value={form.fuel_cost} onChange={(e) => setForm({ ...form, fuel_cost: e.target.value })} required />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t('consumptions.mileage')}</label>
                            <div className="input-group">
                                <input type="number" className="form-control" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} min="0" step="1" placeholder="ex. 45 230" />
                                <span className="input-group-text">km</span>
                            </div>
                            <small className="text-muted">{t('consumptions.mileage_hint')}</small>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t('consumptions.document')}</label>
                            {existingDoc && (
                                <div className="mb-1">
                                    <a href={existingDoc} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-success">
                                        📄 {t('consumptions.document_view')}
                                    </a>
                                </div>
                            )}
                            <input
                                type="file"
                                className="form-control"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setDocumentFile(e.target.files[0] || null)}
                            />
                            <small className="text-muted">{t('consumptions.document_hint')}</small>
                        </div>
                        <div className="d-flex justify-content-between">
                            <button type="submit" className="btn btn-success">💾 {t('common.update')}</button>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate("/consumptions")}>↩ {t('common.cancel')}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
