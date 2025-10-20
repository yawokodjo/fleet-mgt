import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import React from 'react';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/reset-password', {
        token: params.get('token'),
        email: params.get('email'),
        password,
        password_confirmation: confirm,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000); // Redirection après 2 secondes

    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <form onSubmit={handleReset} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Réinitialiser le mot de passe</h2>
      <input
        type="password"
        placeholder="Nouveau mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Réinitialiser
      </button>
      {message && <p className="text-sm text-gray-700 mt-2">{message}</p>}
    </form>
  );
}
