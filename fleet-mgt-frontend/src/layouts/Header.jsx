import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CommandSearch from "../components/CommandSearch";

export default function Header() {
  const { t, i18n } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLangChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <header className="text-white py-3" style={{ backgroundColor: '#001f3f' }}>
        <div className="container">
          {/* Desktop Layout */}
          <div className="d-none d-lg-flex justify-content-between align-items-center">
            <a href="https://www.compassion.com/" target="_blank" rel="noopener noreferrer">
              <img src="/src/assets/logo-ci.png" alt="Logo" width={50} height={50} />
            </a>

            <h1 className="text-center text-white fs-4 fw-bold m-0 flex-grow-1 mx-3">
              {t('header.title')}
            </h1>

            <div className="d-flex align-items-center gap-3">
              {/* Modern search trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  padding: '7px 14px',
                  color: 'rgba(255,255,255,0.75)',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  transition: 'all 0.2s',
                  minWidth: '200px',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  {t('header.search_placeholder')}
                </span>
                <kbd style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '4px', padding: '1px 6px',
                  fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'inherit',
                }}>
                  Ctrl K
                </kbd>
              </button>

              <select
                className="form-select form-select-sm bg-secondary text-white border-0"
                style={{ width: 'auto' }}
                value={i18n.language}
                onChange={handleLangChange}
              >
                <option value="fr">FR</option>
                <option value="en">EN</option>
              </select>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="d-lg-none">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <a href="https://www.compassion.com/" target="_blank" rel="noopener noreferrer">
                <img src="/src/assets/logo-ci.png" alt="Logo" width={40} height={40} />
              </a>
              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select form-select-sm bg-secondary text-white border-0"
                  style={{ width: 'auto' }}
                  value={i18n.language}
                  onChange={handleLangChange}
                >
                  <option value="fr">FR</option>
                  <option value="en">EN</option>
                </select>
              </div>
            </div>

            <h1 className="text-center text-white fs-6 fw-bold mb-2">
              {t('header.title_short')}
            </h1>

            <button
              onClick={() => setSearchOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '8px 14px',
                color: 'rgba(255,255,255,0.75)',
                cursor: 'pointer',
                fontSize: '0.88rem',
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              {t('header.search_placeholder')}
            </button>
          </div>
        </div>
      </header>

      <CommandSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
