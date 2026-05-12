import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../axios";

export default function ConsumptionCreate() {
    const [form, setForm] = useState({ date: "", fuel_volume: "", fuel_cost: "", vehicle_id: "", driver_id: "", mileage: "" });
    const [documentFile, setDocumentFile] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { t } = useTranslation();
    const token = localStorage.getItem("token");
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiclesRes, driversRes] = await Promise.all([
                    api.get("/vehicles-list", { headers: { Authorization: `Bearer ${token}` } }),
                    api.get("/drivers", { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setVehicles(vehiclesRes.data);
                setDrivers(driversRes.data);
            } catch (err) {
                if (err.response?.status === 401) { alert(t('common.session_expired')); navigate("/login"); }
                else alert(t('common.error'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate, token, t]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.date) newErrors.date = t('common.error');
        else if (form.date > today) newErrors.date = t('consumptions.date_future_error');
        if (!form.vehicle_id) newErrors.vehicle_id = t('common.error');
        if (!form.driver_id) newErrors.driver_id = t('common.error');
        if (!form.fuel_volume || parseFloat(form.fuel_volume) <= 0) newErrors.fuel_volume = t('common.error');
        if (!form.fuel_cost || parseFloat(form.fuel_cost) <= 0) newErrors.fuel_cost = t('common.error');
        if (form.mileage && parseInt(form.mileage) < 0) newErrors.mileage = t('common.error');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const payload = new FormData();
            payload.append('date', form.date);
            payload.append('vehicle_id', form.vehicle_id);
            payload.append('driver_id', form.driver_id);
            payload.append('fuel_volume', parseFloat(form.fuel_volume));
            payload.append('fuel_cost', parseFloat(form.fuel_cost));
            if (form.mileage) payload.append('mileage', parseInt(form.mileage));
            if (documentFile) payload.append('document', documentFile);

            await api.post("/consumptions", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage(t('consumptions.add_success'));
            setTimeout(() => navigate("/consumptions"), 2000);
        } catch (err) {
            console.error(err);
            alert(t('common.error'));
        }
    };

    if (loading) return <p className="text-center mt-4">{t('common.loading')}</p>;

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 border-0 rounded-4 mx-auto" style={{ maxWidth: "620px" }}>
                <h3 className="text-center mb-4 text-primary">{t('consumptions.add_title')}</h3>
                {message && <div className="alert alert-success text-center">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">{t('consumptions.consumption_date')}</label>
                        <input type="date" name="date" className={`form-control ${errors.date ? 'is-invalid' : ''}`} value={form.date} onChange={handleChange} max={today} required />
                        {errors.date && <div className="invalid-feedback d-block">{errors.date}</div>}
                        <small className="text-muted">{t('consumptions.date_hint')}</small>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('consumptions.vehicle')}</label>
                        <select name="vehicle_id" className={`form-select ${errors.vehicle_id ? 'is-invalid' : ''}`} value={form.vehicle_id} onChange={handleChange} required>
                            <option value="">{t('consumptions.select_vehicle')}</option>
                            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.license_plate}</option>)}
                        </select>
                        {errors.vehicle_id && <div className="invalid-feedback d-block">{errors.vehicle_id}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('consumptions.driver')}</label>
                        <select name="driver_id" className={`form-select ${errors.driver_id ? 'is-invalid' : ''}`} value={form.driver_id} onChange={handleChange} required>
                            <option value="">{t('consumptions.select_driver')}</option>
                            {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        {errors.driver_id && <div className="invalid-feedback d-block">{errors.driver_id}</div>}
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">{t('consumptions.liters')}</label>
                            <input type="number" name="fuel_volume" className={`form-control ${errors.fuel_volume ? 'is-invalid' : ''}`} value={form.fuel_volume} onChange={handleChange} min="0" step="0.01" required />
                            {errors.fuel_volume && <div className="invalid-feedback d-block">{errors.fuel_volume}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">{t('consumptions.amount')}</label>
                            <input type="number" name="fuel_cost" className={`form-control ${errors.fuel_cost ? 'is-invalid' : ''}`} value={form.fuel_cost} onChange={handleChange} min="0" step="0.01" required />
                            {errors.fuel_cost && <div className="invalid-feedback d-block">{errors.fuel_cost}</div>}
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('consumptions.mileage')}</label>
                        <div className="input-group">
                            <input type="number" name="mileage" className={`form-control ${errors.mileage ? 'is-invalid' : ''}`} value={form.mileage} onChange={handleChange} min="0" step="1" placeholder="ex. 45 230" />
                            <span className="input-group-text">km</span>
                        </div>
                        <small className="text-muted">{t('consumptions.mileage_hint')}</small>
                        {errors.mileage && <div className="text-danger small">{errors.mileage}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('consumptions.document')}</label>
                        <input
                            type="file"
                            className="form-control"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setDocumentFile(e.target.files[0] || null)}
                        />
                        <small className="text-muted">{t('consumptions.document_hint')}</small>
                    </div>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                        <button type="submit" className="btn btn-success px-4">✅ {t('common.add')}</button>
                        <button type="button" onClick={() => navigate("/consumptions")} className="btn btn-secondary px-4">🔙 {t('common.cancel')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
