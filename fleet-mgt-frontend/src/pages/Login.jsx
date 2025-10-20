import { useState } from 'react';
import api from '../axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from "react";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e =>
    setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/login', credentials);
      login(res.data.user, res.data.access_token);
      navigate('/'); // Redirige vers la page d’accueil ou dashboard
    } catch (err) {
      setError('Email ou mot de passe invalide.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto space-y-4 bg-white shadow rounded mt-10">
      <h2 className="text-xl font-bold text-center">Connexion</h2>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        required
        className="border px-3 py-2 w-full rounded"
      />

      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        onChange={handleChange}
        required
        className="border px-3 py-2 w-full rounded"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Se connecter
      </button>
      <div className="flex justify-between items-center">
        Mot de passe oublié ? <Link to="/forgot-password" className="text-blue-600 text-sm hover:underline">
          Réinitialiser
        </Link> <br />
        <span className="text-sm">
          Pas de compte ? <Link to="/register" className="text-blue-600 hover:underline">Créer un compte</Link>
        </span>
      </div>


    </form>
  );
}
