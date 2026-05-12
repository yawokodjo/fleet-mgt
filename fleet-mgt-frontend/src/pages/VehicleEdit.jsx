import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../axios";

export default function VehicleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [vehicle, setVehicle] = useState({
    marque: "", model: "", license_plate: "", year: "",
    fuel_type: "", fuel_card: "", mileage: "", status: "operational",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/vehicles/${id}`)
      .then((res) => { setVehicle(res.data); setLoading(false); })
      .catch((err) => {
        setLoading(false);
        if (err.response?.status === 403) alert(t('common.unauthorized'));
        if (err.response?.status === 500) alert(t('common.error'));
      });
  }, [id, t]);

  const handleChange = (e) => setVehicle({ ...vehicle, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    api.put(`/vehicles/${id}`, vehicle)
      .then(() => { alert(t('vehicles.update_success')); navigate("/vehicles"); })
      .catch((err) => {
        if (err.response?.status === 422) setErrors(err.response.data.errors || {});
        else if (err.response?.status === 403) alert(t('common.unauthorized'));
        else alert(err.response?.data?.message || t('common.error'));
      });
  };

  if (loading) return <p>{t('common.loading')}</p>;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center">
          <h4>{t('vehicles.edit_title')}</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">{t('vehicles.brand')}</label>
              <input type="text" name="marque" value={vehicle.marque} onChange={handleChange} className="form-control" />
              {errors.marque && <div className="text-danger">{errors.marque[0]}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">{t('vehicles.model')}</label>
              <input type="text" name="model" value={vehicle.model} onChange={handleChange} className="form-control" />
              {errors.model && <div className="text-danger">{errors.model[0]}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">{t('vehicles.license_plate_long')}</label>
              <input type="text" name="license_plate" value={vehicle.license_plate} onChange={handleChange} className="form-control" />
              {errors.license_plate && <div className="text-danger">{errors.license_plate[0]}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">{t('vehicles.year')}</label>
              <input type="number" name="year" value={vehicle.year} onChange={handleChange} className="form-control" />
              {errors.year && <div className="text-danger">{errors.year[0]}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">{t('vehicles.fuel_type')}</label>
              <select name="fuel_type" value={vehicle.fuel_type} onChange={handleChange} className="form-select">
                <option value="">-- {t('vehicles.select_fuel')} --</option>
                <option value="essence">{t('vehicles.fuel_gasoline')}</option>
                <option value="diesel">{t('vehicles.fuel_diesel')}</option>
                <option value="hybride">{t('vehicles.fuel_hybrid')}</option>
                <option value="électrique">{t('vehicles.fuel_electric')}</option>
                <option value="gpl">{t('vehicles.fuel_gpl')}</option>
                <option value="autre">{t('vehicles.fuel_other')}</option>
              </select>
              {errors.fuel_type && <div className="text-danger">{errors.fuel_type[0]}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">{t('vehicles.fuel_card')}</label>
              <input type="text" name="fuel_card" value={vehicle.fuel_card || ""} onChange={handleChange} className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">{t('vehicles.mileage')}</label>
              <input type="number" name="mileage" value={vehicle.mileage} onChange={handleChange} className="form-control" />
              {errors.mileage && <div className="text-danger">{errors.mileage[0]}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">{t('vehicles.status')}</label>
              <select name="status" value={vehicle.status} onChange={handleChange} className="form-select">
                <option value="operational">{t('vehicles.status_operational')}</option>
                <option value="maintenance">{t('vehicles.status_maintenance')}</option>
                <option value="out_of_service">{t('vehicles.status_out_of_service')}</option>
              </select>
              {errors.status && <div className="text-danger">{errors.status[0]}</div>}
            </div>
            <div className="d-flex justify-content-between">
              <Link to="/vehicles" className="btn btn-secondary">{t('vehicles.back_to_list')}</Link>
              <button type="submit" className="btn btn-primary">💾 {t('common.update')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
