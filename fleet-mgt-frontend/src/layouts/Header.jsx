import React, { useState } from "react";
import LiveSearch from "../components/LiveSearch";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSelectResult = (item) => {
    console.log("Résultat sélectionné:", item);
    setSearchQuery("");
    setShowResults(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.length > 0); // Affiche les résultats si la recherche n'est pas vide
  };

  const handleBlur = () => {
    // Délai pour permettre le clic sur un résultat avant de fermer
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <header className="text-white py-3" style={{ backgroundColor: '#001f3f' }}>
      <div className="container">
        {/* Desktop Layout */}
        <div className="d-none d-lg-flex justify-content-between align-items-center">
          <a href="https://www.compassion.com/" target="_blank" rel="noopener noreferrer">
            <img src="/src/assets/logo-ci.png" alt="Logo" width={50} height={50} />
          </a>

          <h1 className="text-center text-white fs-4 fw-bold m-0 flex-grow-1 mx-3">
            Gestion de Flotte Véhicule Compassion International Togo
          </h1>

          <div className="d-flex align-items-center gap-3">
            <div className="position-relative" style={{ minWidth: '250px' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="🔍 Rechercher..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setShowResults(true)}
                onBlur={handleBlur}
              />
              {showResults && (
                <LiveSearch
                  query={searchQuery}
                  onSelectResult={handleSelectResult}
                />
              )}
            </div>

            <select className="form-select form-select-sm bg-secondary text-white border-0" style={{ width: 'auto' }}>
              <option>FR</option>
              <option>EN</option>
            </select>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="d-lg-none">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <a href="https://www.compassion.com/" target="_blank" rel="noopener noreferrer">
              <img src="/src/assets/logo-ci.png" alt="Logo" width={40} height={40} />
            </a>
            <select className="form-select form-select-sm bg-secondary text-white border-0" style={{ width: 'auto' }}>
              <option>FR</option>
              <option>EN</option>
            </select>
          </div>

          <h1 className="text-center text-white fs-6 fw-bold mb-2">
            Gestion de Flotte - CI Togo
          </h1>

          <div className="position-relative">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="🔍 Rechercher..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowResults(true)}
              onBlur={handleBlur}
            />
            {showResults && (
              <LiveSearch
                query={searchQuery}
                onSelectResult={handleSelectResult}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}