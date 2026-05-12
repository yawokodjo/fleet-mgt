import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../axios";

export default function MaintenanceEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [form, setForm] = useState({
        schedule_date: "", vehicle_id: "", driver_id: "",
        maintenance_type: "", maintenance_company: "", cost: "", description: ""
    });
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const maintenanceRes = await api.get(`/maintenances/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                const data = maintenanceRes.data;
                setForm({
                    schedule_date: data.schedule_date || "",
                    vehicle_id: data.vehicle?.id || "",
                    driver_id: data.driver?.id || "",
                    maintenance_type: data.maintenance_type || "",
                    maintenance_company: data.maintenance_company || "",
                    cost: data.cost || "",
                    description: data.description || ""
                });
                const [vehiclesRes, driversRes] = await Promise.all([
                    api.get("/vehicles-list", { headers: { Authorization: `Bearer ${token}` } }),
                    api.get("/drivers", { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setVehicles(vehiclesRes.data);
                setDrivers(driversRes.data);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) { setMessage(t('common.session_expired')); setTimeout(() => navigate("/login"), 2000); }
                else if (err.response?.status === 403) setMessage(t('common.unauthorized'));
                else if (err.response?.status === 404) { setMessage(t('maintenances.not_found')); setTimeout(() => navigate("/maintenances"), 2000); }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate, token, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.schedule_date || !form.vehicle_id || !form.driver_id || !form.maintenance_type || !form.maintenance_company || !form.cost || !form.description) {
            setMessage(t('maintenances.fill_all'));
            return;
        }
        try {
            await api.put(`/maintenances/${id}`, { ...form, cost: parseFloat(form.cost) }, { headers: { Authorization: `Bearer ${token}` } });
            setMessage(t('maintenances.update_success'));
            setTimeout(() => navigate("/maintenances"), 2000);
        } catch (err) {
            console.error(err);
            setMessage(t('maintenances.update_error'));
        }
    };

    if (loading) return <p className="text-center mt-4">{t('common.loading')}</p>;

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 border-0 rounded-4 mx-auto" style={{ maxWidth: "600px" }}>
                <h3 className="text-center mb-4 text-primary">{t('maintenances.edit_title')}</h3>
                {message && <div className="alert alert-info text-center">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.scheduled_date')} :</label>
                        <input type="date" className="form-control" value={form.schedule_date} onChange={(e) => setForm({ ...form, schedule_date: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.vehicle')} :</label>
                        <select className="form-select" value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} required>
                            <option value="">{t('maintenances.select_vehicle')}</option>
                            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.license_plate}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.driver')} :</label>
                        <select className="form-select" value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })} required>
                            <option value="">{t('maintenances.select_driver')}</option>
                            {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.type')} :</label>
                        <input type="text" className="form-control" value={form.maintenance_type} onChange={(e) => setForm({ ...form, maintenance_type: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.company')} :</label>
                        <input type="text" className="form-control" value={form.maintenance_company} onChange={(e) => setForm({ ...form, maintenance_company: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.cost')} :</label>
                        <input type="number" className="form-control" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">{t('maintenances.description')} :</label>
                        <input type="text" className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                    </div>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                        <button type="submit" className="btn btn-success px-4">✅ {t('common.update')}</button>
                        <button type="button" onClick={() => navigate("/maintenances")} className="btn btn-secondary px-4">🔙 {t('common.cancel')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
