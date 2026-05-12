import React from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="text-light py-4 mt-5" style={{ backgroundColor: '#001f3f' }}>
      <div className="container text-center">
        <p className="mb-2 small">
          <strong>{t('footer.copyright')}</strong>
        </p>
        <p className="mb-2 small">
          <a href="https://www.economie.gouv.fr/entreprises/reglement-general-protection-donnees-rgpd#" className="text-light text-decoration-none me-3 text-primary underline">
            {t('footer.all_rights')}
          </a>
          <a href="mailto:yawo.kodjo@yahoo.com" className="text-light text-decoration-none me-3 text-primary underline">
            {t('footer.contact')}
          </a>
          <a href="tel:+22890807108" className="text-light text-decoration-none text-primary underline">
            {t('footer.phone')}
          </a>
        </p>
        <p className="mb-0 small">{t('footer.fleet_mgmt')}</p>
      </div>
    </footer>
  );
}
