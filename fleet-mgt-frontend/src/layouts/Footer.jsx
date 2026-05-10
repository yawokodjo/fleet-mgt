import React from "react";

export default function Footer() {
  return (
    <footer className="text-light py-4 mt-5" style={{ backgroundColor: '#001f3f' }}>
      <div className="container text-center">
        <p className="mb-2 small">
          © 2025 <strong>CITG Vehicle Fleet Manager</strong>
        </p>
        <p className="mb-2 small">
          <a
            href="https://www.economie.gouv.fr/entreprises/reglement-general-protection-donnees-rgpd#"
            className="text-light text-decoration-none me-3 text-primary underline"
          >
            Tous droits réservés
          </a>
          <a
            href="mailto:yawo.kodjo@yahoo.com"
            className="text-light text-decoration-none me-3 text-primary underline"
          >
            Nous joindre par mail
          </a>
          <a href="tel:+22890807108" className="text-light text-decoration-none text-primary underline">
            Numero de telephone
          </a>
        </p>
        <p className="mb-0 small">Gestion de flotte Compassion International Togo</p>
      </div>
    </footer>
  );
}
