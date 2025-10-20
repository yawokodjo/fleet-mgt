import { NavLink } from 'react-router-dom';
import React from 'react';
export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow h-screen p-4 md:block">
      <nav className="flex flex-col space-y-4">
        <NavLink to="/" className="hover:text-blue-600">🏠 Tableau de bord</NavLink>
        <NavLink to="/vehicles" className="hover:text-blue-600">🚗 Véhicules</NavLink>
        <NavLink to="/consumptions" className="hover:text-blue-600">⛽ Consommation</NavLink>
        <NavLink to="/maintenances" className="hover:text-blue-600">🔧 Maintenance</NavLink>
        <NavLink to="/reports" className="hover:text-blue-600">📊 Rapports</NavLink>
        <NavLink to="/users" className="hover:text-blue-600">👥 Utilisateurs</NavLink>
        <NavLink to="/profile" className="hover:text-blue-600">👤 Profil</NavLink>
      </nav>
    </aside>
  );
}
