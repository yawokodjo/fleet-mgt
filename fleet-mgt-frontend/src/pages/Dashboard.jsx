import React from 'react';
import { useTranslation } from 'react-i18next'; // ✅ Import manquant

export default function Dashboard() {
  const { t, i18n } = useTranslation();

  return (
    <div className="p-6 space-y-6">
      <div className="space-x-2">
        <button onClick={() => i18n.changeLanguage('en')} className="px-3 py-1 bg-gray-200 rounded">
          EN
        </button>
        <button onClick={() => i18n.changeLanguage('fr')} className="px-3 py-1 bg-gray-200 rounded">
          FR
        </button>
      </div>

      <h2 className="text-2xl font-semibold">{t('welcome')} 👋🏽</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">{t('registered_vehicles')}</h3>
          <p className="text-2xl font-bold text-blue-600">42</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">{t('maintenance_alerts')}</h3>
          <p className="text-2xl font-bold text-red-500">5</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">{t('average_consumption')}</h3>
          <p className="text-2xl font-bold text-green-600">6.3 L / 100km</p>
        </div>
      </div>
    </div>
  );
}
