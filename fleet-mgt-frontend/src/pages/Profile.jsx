import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import React from 'react';
import { Link } from 'react-router-dom'; // ← pour le lien vers l'accueil

export default function Profile() {
  const { user, token, setUser } = useAuth();
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Profil mis à jour avec succès !');
      setError('');
      setUser(response.data.user);
    } catch (err) {
      setError("Erreur lors de la mise à jour.");
      setSuccess('');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Mon Profil</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block text-sm">Nom complet</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            type="email"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enregistrer
        </button>
        {success && <p className="text-green-600">{success}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>

      {/* Lien texte pour retourner à l'accueil */}
      <div className="mt-4">
        <Link to="/" className="text-blue-600 hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
