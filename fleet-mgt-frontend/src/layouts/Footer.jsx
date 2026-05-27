import React from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer style={{ backgroundColor: '#001f3f', padding: '1rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{t('footer.copyright')}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem 1.5rem', marginBottom: '0.5rem' }}>
        <a href="https://www.economie.gouv.fr/entreprises/reglement-general-protection-donnees-rgpd#"
          style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
          {t('footer.all_rights')}
        </a>
        <a href="mailto:yawo.kodjo@yahoo.com"
          style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
          {t('footer.contact')}
        </a>
        <a href="tel:+22890807108"
          style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
          {t('footer.phone')}
        </a>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{t('footer.fleet_mgmt')}</span>
      </div>
    </footer>
  );
}
