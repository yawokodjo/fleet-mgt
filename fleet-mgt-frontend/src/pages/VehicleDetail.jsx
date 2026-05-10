import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../axios.js";
import React from "react";

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    api
      .get(`/vehicles/${id}`)
      .then((res) => setVehicle(res.data))
      .catch((err) =>
        console.error("Erreur lors du chargement du véhicule :", err)
      );
  }, [id]);

  if (!vehicle)
    return <p className="text-center mt-4">Chargement du véhicule...</p>;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center">
          <h4>Détails du véhicule</h4>
        </div>

        <div className="card-body">
          <h5 className="card-title text-center mb-4">
            {vehicle.marque} {vehicle.model}
          </h5>

          <table className="table table-bordered">
            <tbody>
              <tr>
                <th>Immatriculation</th>
                <td>{vehicle.license_plate}</td>
              </tr>
              <tr>
                <th>Kilométrage</th>
                <td>{vehicle.mileage} km</td>
              </tr>
              <tr>
                <th>Année</th>
                <td>{vehicle.year}</td>
              </tr>
              <tr>
                <th>Type de carburant</th>
                <td>{vehicle.fuel_type}</td>
              </tr>
              <tr>
                <th>Carte carburant</th>
                <td>{vehicle.fuel_card || "N/A"}</td>
              </tr>
              <tr>
                <th>Statut</th>
                <td>
                  <span
                    className={`badge ${vehicle.status === "operational"
                        ? "bg-success"
                        : vehicle.status === "maintenance"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                      }`}
                  >
                    {vehicle.status === "operational"
                      ? "Opérationnel"
                      : vehicle.status === "maintenance"
                        ? "Maintenance"
                        : "Hors service"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="d-flex justify-content-between mt-4">
            <Link to="/vehicles" className="btn btn-secondary">
              ← Retour à la liste
            </Link>
            <Link to={`/vehicles/${id}/edit`} className="btn btn-primary">
              ✏️ Modifier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
