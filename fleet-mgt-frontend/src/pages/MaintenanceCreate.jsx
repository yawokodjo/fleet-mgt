import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../axios";

export default function MaintenanceCreate() {
    const [form, setForm] = useState({
        scheduled_date: "", vehicle_id: "", driver_id: "",
        maintenance_type: "", maintenance_company: "", cost: "",
        description: "", mileage_at_service: ""
    });
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
                    api.get("/drivers", { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setVehicles(vehiclesRes.data);
                setDrivers(driversRes.data);
            } catch (err) {
                console.error(err);
                alert(t('common.error'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, t]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.scheduled_date) newErrors.scheduled_date = t('common.error');
        else if (form.scheduled_date < today) newErrors.scheduled_date = "⚠️ " + t('maintenances.date');
        if (!form.vehicle_id) newErrors.vehicle_id = t('common.error');
        if (!form.driver_id) newErrors.driver_id = t('common.error');
        if (!form.maintenance_type) newErrors.maintenance_type = t('common.error');
        if (!form.maintenance_company) newErrors.maintenance_company = t('common.error');
        if (!form.cost || parseFloat(form.cost) <= 0) newErrors.cost = t('common.error');
        if (!form.description) newErrors.description = t('common.error');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const payload = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v !== "") payload.append(k, v); });
            payload.append('cost', parseFloat(form.cost));
            if (documentFile) payload.append('document', documentFile);

            await api.post("/maintenances", payload, { headers: { Authorization: `Bearer ${token}` } });
            setMessage(t('maintenances.add_success'));
            setTimeout(() => navigate("/maintenances"), 2000);
        } catch (err) {
            console.error(err);
            alert(t('maintenances.add_error'));
        }
    };

    if (loading) return <p className="text-center mt-4">{t('common.loading')}</p>;

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 border-0 rounded-4 mx-auto" style={{ maxWidth: "620px" }}>
                <h3 className="text-center mb-4 text-primary">{t('maintenances.add_title')}</h3>
                {message && <div className="alert alert-success text-center">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.date')} :</label>
                        <input type="date" name="scheduled_date" value={form.scheduled_date} onChange={handleChange} className={`form-control ${errors.scheduled_date ? 'is-invalid' : ''}`} min={today} required />
                        {errors.scheduled_date && <div className="invalid-feedback d-block">{errors.scheduled_date}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.vehicle')} :</label>
                        <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} className={`form-select ${errors.vehicle_id ? 'is-invalid' : ''}`} required>
                            <option value="">{t('maintenances.select_vehicle')}</option>
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate}</option>)}
                        </select>
                        {errors.vehicle_id && <div className="invalid-feedback d-block">{errors.vehicle_id}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.driver')} :</label>
                        <select name="driver_id" value={form.driver_id} onChange={handleChange} className={`form-select ${errors.driver_id ? 'is-invalid' : ''}`} required>
                            <option value="">{t('maintenances.select_driver')}</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        {errors.driver_id && <div className="invalid-feedback d-block">{errors.driver_id}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.type')} :</label>
                        <select name="maintenance_type" value={form.maintenance_type} onChange={handleChange} className={`form-select ${errors.maintenance_type ? 'is-invalid' : ''}`} required>
                            <option value="">{t('maintenances.select_type')}</option>
                            <option value="vidange">{t('maintenances.type_oil')}</option>
                            <option value="pneus">{t('maintenances.type_tires')}</option>
                            <option value="freins">{t('maintenances.type_brakes')}</option>
                            <option value="batterie">{t('maintenances.type_battery')}</option>
                            <option value="révision">{t('maintenances.type_revision')}</option>
                            <option value="carrosserie">{t('maintenances.type_bodywork')}</option>
                            <option value="autre">{t('maintenances.type_other')}</option>
                        </select>
                        {errors.maintenance_type && <div className="invalid-feedback d-block">{errors.maintenance_type}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.company_full')} :</label>
                        <input type="text" name="maintenance_company" value={form.maintenance_company} onChange={handleChange} className={`form-control ${errors.maintenance_company ? 'is-invalid' : ''}`} required />
                        {errors.maintenance_company && <div className="invalid-feedback d-block">{errors.maintenance_company}</div>}
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">{t('maintenances.cost')} :</label>
                            <input type="number" name="cost" value={form.cost} onChange={handleChange} className={`form-control ${errors.cost ? 'is-invalid' : ''}`} min="0" step="0.01" required />
                            {errors.cost && <div className="invalid-feedback d-block">{errors.cost}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">{t('maintenances.mileage_at_service')}</label>
                            <div className="input-group">
                                <input type="number" name="mileage_at_service" value={form.mileage_at_service} onChange={handleChange} className="form-control" min="0" step="1" placeholder="ex. 44 100" />
                                <span className="input-group-text">km</span>
                            </div>
                            <small className="text-muted">{t('maintenances.mileage_at_service_hint')}</small>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.description')} :</label>
                        <textarea name="description" value={form.description} onChange={handleChange} className={`form-control ${errors.description ? 'is-invalid' : ''}`} rows="3" placeholder={t('maintenances.details_description') + "..."} required />
                        {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.document')}</label>
                        <input
                            type="file"
                            className="form-control"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setDocumentFile(e.target.files[0] || null)}
                        />
                        <small className="text-muted">{t('maintenances.document_hint')}</small>
                    </div>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                        <button type="submit" className="btn btn-success px-4">✅ {t('common.add')}</button>
                        <button type="button" onClick={() => navigate("/maintenances")} className="btn btn-secondary px-4">🔙 {t('common.cancel')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
