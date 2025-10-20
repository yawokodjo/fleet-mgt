import React from 'react';

export default function Reports() {
  // Ici tu peux ajouter Chart.js, Recharts ou ApexCharts plus tard
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Rapports & Statistiques</h2>

      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-semibold mb-2">Total des véhicules</h3>
        <p className="text-2xl text-blue-600">42</p>
      </div>

      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-semibold mb-2">Alertes de maintenance</h3>
        <p className="text-2xl text-red-500">7</p>
      </div>

      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-semibold mb-2">Consommation moyenne</h3>
        <p className="text-2xl text-green-600">6.8 L / 100km</p>
      </div>
    </div>
  );
}
