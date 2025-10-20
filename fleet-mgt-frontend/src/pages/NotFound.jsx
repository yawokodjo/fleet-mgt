import { Link } from 'react-router-dom';
import React from 'react';

export default function NotFound() {
  return (
    <div className="text-center p-10">
      <h1 className="text-4xl font-bold text-red-600">404</h1>
      <p>Oups… cette page n’existe pas.</p>
      <Link to="/" className="text-blue-600 underline">Retour à l’accueil</Link>
    </div>
  );
}
