import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Reports() {
  const { t } = useTranslation();
  return (
    <div className="p-4">
      <h2 className="fw-semibold mb-4">{t('reports.title')}</h2>
      <div className="p-4 bg-white rounded shadow mb-3">
        <h3 className="fw-semibold mb-2">{t('reports.total_vehicles')}</h3>
        <p className="text-primary fs-3 mb-0">42</p>
      </div>
      <div className="p-4 bg-white rounded shadow mb-3">
        <h3 className="fw-semibold mb-2">{t('reports.maintenance_alerts')}</h3>
        <p className="text-danger fs-3 mb-0">7</p>
      </div>
      <div className="p-4 bg-white rounded shadow mb-3">
        <h3 className="fw-semibold mb-2">{t('reports.average_consumption')}</h3>
        <p className="text-success fs-3 mb-0">6.8 L / 100km</p>
      </div>
    </div>
  );
}
