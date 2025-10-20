import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (!form.role) {
      setError('Veuillez sélectionner un rôle.');
      return;
    }

    try {
      const res = await api.post('/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
        role: form.role
      });

      // Laravel renvoie l'utilisateur et le token
      const { user, access_token } = res.data;

      // Sauvegarde dans le contexte
      login(user, access_token);

      // Redirection vers la page d'accueil
      navigate('/');
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        setError(firstError);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erreur lors de l’inscription");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 p-8 bg-white shadow-lg rounded-2xl border border-gray-200 space-y-5"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Créer un compte
      </h2>

      {error && (
        <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>
      )}

      <input
        type="text"
        name="name"
        placeholder="Nom complet"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">Sélectionnez un rôle</option>
        <option value="admin">admin</option>
        <option value="manager">manager</option>
        <option value="driver">driver</option>
        <option value="accountant">accountant</option>
      </select>

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        value={form.password}
        onChange={handleChange}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirmer le mot de passe"
        value={form.confirmPassword}
        onChange={handleChange}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <button
        type="submit"
        className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-200 shadow"
      >
        ✅ S'inscrire
      </button>

      <p className="text-center text-sm text-gray-500">
        Vous avez déjà un compte ? <a href="/login" className="text-green-600 hover:underline">Connectez-vous</a>
      </p>
    </form>
  );
}
