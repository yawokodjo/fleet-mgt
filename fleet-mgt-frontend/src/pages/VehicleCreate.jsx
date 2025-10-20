import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function VehicleCreate() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        marque: "",
        model: "",
        license_plate: "",
        year: "",
        fuel_type: "",
        fuel_card: "",
        mileage: 0,
        status: "operational",
        current_driver_id: "",
    });

    const [errors, setErrors] = useState({}); // Pour stocker les erreurs Laravel

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // reset erreurs
        try {
            await axios.post("http://localhost:8000/api/vehicles", form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            alert("Véhicule ajouté avec succès !");
            navigate("/vehicles");
        } catch (err) {
            console.error(err.response?.data);

            if (err.response?.status === 422) {
                // erreurs de validation
                setErrors(err.response.data.errors);
            } else if (err.response?.status === 403) {
                alert("Accès non autorisé : vous n'avez pas la permission.");
            } else if (err.response?.status === 401) {
                alert("Non connecté : veuillez vous reconnecter.");
            } else {
                alert(err.response?.data?.message || "Erreur lors de l’ajout du véhicule.");
            }
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Ajouter un véhicule</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Marque */}
                <input
                    type="text"
                    name="marque"
                    placeholder="Marque"
                    value={form.marque}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />
                {errors.marque && <p className="text-red-600">{errors.marque.join(", ")}</p>}

                {/* Modèle */}
                <input
                    type="text"
                    name="model"
                    placeholder="Modèle"
                    value={form.model}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />
                {errors.model && <p className="text-red-600">{errors.model.join(", ")}</p>}

                {/* Immatriculation */}
                <input
                    type="text"
                    name="license_plate"
                    placeholder="Immatriculation"
                    value={form.license_plate}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />
                {errors.license_plate && <p className="text-red-600">{errors.license_plate.join(", ")}</p>}

                {/* Année */}
                <input
                    type="number"
                    name="year"
                    placeholder="Année"
                    value={form.year}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />
                {errors.year && <p className="text-red-600">{errors.year.join(", ")}</p>}

                {/* Type de carburant */}
                <select
                    name="fuel_type"
                    value={form.fuel_type}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                >
                    <option value="">Sélectionner type de carburant</option>
                    <option value="essence">essence</option>
                    <option value="diesel">diesel</option>
                    <option value="hybride">hybride</option>
                    <option value="électrique">électrique</option>
                    <option value="gpl">gpl</option>
                    <option value="autre">autre</option>
                </select>
                {errors.fuel_type && <p className="text-red-600">{errors.fuel_type.join(", ")}</p>}

                {/* Carte carburant (optionnel) */}
                <input
                    type="text"
                    name="fuel_card"
                    placeholder="Carte carburant (optionnel)"
                    value={form.fuel_card}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                {errors.fuel_card && <p className="text-red-600">{errors.fuel_card.join(", ")}</p>}

                {/* Kilométrage */}
                <input
                    type="number"
                    name="mileage"
                    placeholder="Kilométrage"
                    value={form.mileage}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />
                {errors.mileage && <p className="text-red-600">{errors.mileage.join(", ")}</p>}

                {/* Statut */}
                <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                >
                    <option value="operational">opérationnel</option>
                    <option value="maintenance">maintenance</option>
                    <option value="out_of_service">hors service</option>
                </select>
                {errors.status && <p className="text-red-600">{errors.status.join(", ")}</p>}
                <button
                    type="submit"
                    className="px-4 py-2 text-white bg-green-600 rounded"
                >
                    Enregistrer
                </button>
                <Link
                    to="/vehicles"
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                    Retour à la liste
                </Link>

            </form>
        </div>
    );
}
