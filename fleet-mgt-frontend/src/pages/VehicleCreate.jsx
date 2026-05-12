import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../axios";

export default function VehicleCreate() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [form, setForm] = useState({
        marque: "", model: "", license_plate: "", year: "",
        fuel_type: "", fuel_card: "", mileage: 0, status: "operational", current_driver_id: "",
    });
    const [documentFile, setDocumentFile] = useState(null);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            const payload = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v !== "" && v !== null) payload.append(k, v); });
            if (documentFile) payload.append('document', documentFile);
            await api.post("/vehicles", payload);
            alert(t('vehicles.add_success'));
            navigate("/vehicles");
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors);
            else if (err.response?.status === 403) alert(t('common.unauthorized'));
            else if (err.response?.status === 401) alert(t('common.session_expired'));
            else alert(err.response?.data?.message || t('common.error'));
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg">
                <div className="card-header bg-success text-white text-center">
                    <h4>{t('vehicles.add_title')}</h4>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">{t('vehicles.brand')}</label>
                            <input type="text" name="marque" value={form.marque} onChange={handleChange} className={`form-control ${errors.marque ? "is-invalid" : ""}`} required />
                            {errors.marque && <div className="invalid-feedback">{errors.marque.join(", ")}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t('vehicles.model')}</label>
                            <input type="text" name="model" value={form.model} onChange={handleChange} className={`form-control ${errors.model ? "is-invalid" : ""}`} required />
                            {errors.model && <div className="invalid-feedback">{errors.model.join(", ")}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t('vehicles.license_plate')}</label>
                            <input type="text" name="license_plate" value={form.license_plate} onChange={handleChange} className={`form-control ${errors.license_plate ? "is-invalid" : ""}`} required />
                            {errors.license_plate && <div className="invalid-feedback">{errors.license_plate.join(", ")}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t('vehicles.year')}</label>
                            <input type="number" name="year" value={form.year} onChange={handleChange} className={`form-control ${errors.year ? "is-invalid" : ""}`} required />
                            {errors.year && <div className="invalid-feedback">{errors.year.join(", ")}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t('vehicles.fuel_type')}</label>
                            <select name="fuel_type" value={form.fuel_type} onChange={handleChange} className={`form-select ${errors.fuel_type ? "is-invalid" : ""}`} required>
                                <option value="">{t('vehicles.select_fuel')}</option>
                                <option value="essence">{t('vehicles.fuel_gasoline')}</option>
                                <option value="diesel">{t('vehicles.fuel_diesel')}</option>
                                <option value="hybride">{t('vehicles.fuel_hybrid')}</option>
                                <option value="électrique">{t('vehicles.fuel_electric')}</option>
                                <option value="gpl">{t('vehicles.fuel_gpl')}</option>
                                <option value="autre">{t('vehicles.fuel_other')}</option>
                            </select>
                            {errors.fuel_type && <div className="invalid-feedback">{errors.fuel_type.join(", ")}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t('vehicles.fuel_card_optional')}</label>
                            <input type="text" name="fuel_card" value={form.fuel_card} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t('vehicles.mileage')}</label>
                            <input type="number" name="mileage" value={form.mileage} onChange={handleChange} className={`form-control ${errors.mileage ? "is-invalid" : ""}`} required />
                            {errors.mileage && <div className="invalid-feedback">{errors.mileage.join(", ")}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t('vehicles.status')}</label>
                            <select name="status" value={form.status} onChange={handleChange} className={`form-select ${errors.status ? "is-invalid" : ""}`} required>
                                <option value="operational">{t('vehicles.status_operational')}</option>
                                <option value="maintenance">{t('vehicles.status_maintenance')}</option>
                                <option value="out_of_service">{t('vehicles.status_out_of_service')}</option>
                            </select>
                            {errors.status && <div className="invalid-feedback">{errors.status.join(", ")}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">{t('vehicles.document')}</label>
                            <input
                                type="file"
                                className="form-control"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setDocumentFile(e.target.files[0] || null)}
                            />
                            <small className="text-muted">{t('vehicles.document_hint')}</small>
                        </div>
                        <div className="d-flex justify-content-between mt-4">
                            <Link to="/vehicles" className="btn btn-secondary">← {t('common.back')}</Link>
                            <button type="submit" className="btn btn-success">💾 {t('common.save')}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
