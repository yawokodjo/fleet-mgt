import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../axios.js";
import React from "react";

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    api.get(`/vehicles/${id}`)
      .then((res) => setVehicle(res.data))
      .catch((err) => console.error("Error loading vehicle:", err));
  }, [id]);

  if (!vehicle) return <p className="text-center mt-4">{t('common.loading')}</p>;

  const statusLabel =
    vehicle.status === "operational" ? t('vehicles.status_operational') :
    vehicle.status === "maintenance" ? t('vehicles.status_maintenance') :
    t('vehicles.status_out_of_service');

  const statusClass =
    vehicle.status === "operational" ? "bg-success" :
    vehicle.status === "maintenance" ? "bg-warning text-dark" : "bg-danger";

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center">
          <h4>{t('vehicles.detail_title')}</h4>
        </div>
        <div className="card-body">
          <h5 className="card-title text-center mb-4">{vehicle.marque} {vehicle.model}</h5>
          <table className="table table-bordered">
            <tbody>
              <tr><th>{t('vehicles.license_plate')}</th><td>{vehicle.license_plate}</td></tr>
              <tr><th>{t('vehicles.mileage')}</th><td>{vehicle.mileage} km</td></tr>
              <tr><th>{t('vehicles.year')}</th><td>{vehicle.year}</td></tr>
              <tr><th>{t('vehicles.fuel_type')}</th><td>{vehicle.fuel_type}</td></tr>
              <tr><th>{t('vehicles.fuel_card')}</th><td>{vehicle.fuel_card || "N/A"}</td></tr>
              <tr>
                <th>{t('vehicles.status')}</th>
                <td><span className={`badge ${statusClass}`}>{statusLabel}</span></td>
              </tr>
            </tbody>
          </table>
          <div className="d-flex justify-content-between mt-4">
            <Link to="/vehicles" className="btn btn-secondary">{t('vehicles.back_to_list')}</Link>
            <Link to={`/vehicles/${id}/edit`} className="btn btn-primary">✏️ {t('common.edit')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
