import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const mainLinks = [
    { to: "/", icon: "🏠", label: "Accueil", color: "#4CAF50" },
    { to: "/dashboard", icon: "📊", label: "Tableau de bord", color: "#4CAF50" },
    { to: "/vehicles", icon: "🚗", label: "Véhicules", color: "#2196F3" },
  ];

  const moreLinks = [
    { to: "/consumptions", icon: "⛽", label: "Consommation", color: "#FF9800" },
    { to: "/maintenances", icon: "🔧", label: "Maintenance", color: "#9C27B0" },
    { to: "/reports", icon: "📊", label: "Rapports généraux", color: "#00BCD4" },
    { to: "/reports/consumption", icon: "📈", label: "Rapport consommation", color: "#FF5722" },
    { to: "/reports/maintenance", icon: "🧰", label: "Rapport maintenance", color: "#795548" },
    { to: "/users", icon: "👥", label: "Utilisateurs", color: "#E91E63" },
    { to: "/profile", icon: "👤", label: "Profil", color: "#607D8B" },
    { to: "/debug-auth", icon: "🛠️", label: "Debug Auth", color: "#673AB7" },
  ];

  return (
    <>
      <style>{`
        .sidebar-link {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .sidebar-link:hover {
          transform: translateX(8px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .sidebar-link.active {
          transform: translateX(8px);
          box-shadow: 0 6px 16px rgba(33, 150, 243, 0.3);
        }
        
        .sidebar-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background: currentColor;
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }
        
        .sidebar-link:hover::before,
        .sidebar-link.active::before {
          transform: scaleY(1);
        }
        
        .icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .sidebar-link:hover .icon-wrapper {
          transform: rotate(10deg) scale(1.1);
        }
        
        .sidebar-link.active .icon-wrapper {
          background: rgba(255,255,255,0.2);
          box-shadow: 0 0 20px rgba(255,255,255,0.3);
        }
        
        .more-button {
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          margin: 8px 0;
        }
        
        .more-button:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .sidebar-container {
          background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        .sidebar-content {
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          direction: rtl;
        }
        
        .sidebar-inner {
          direction: ltr;
        }
        
        /* Style de la scrollbar (à gauche grâce à direction: rtl) */
        .sidebar-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .sidebar-content::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
          margin: 10px 0;
        }
        
        .sidebar-content::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        .sidebar-content::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #764ba2 0%, #667eea 100%);
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
        }
        
        /* Firefox */
        .sidebar-content {
          scrollbar-width: thin;
          scrollbar-color: #667eea rgba(0, 0, 0, 0.05);
        }
        
        .menu-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }
        
        .collapse-animation {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .hamburger-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }
        
        .hamburger-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
        
        /* Footer styles */
        .sidebar-footer {
          background: linear-gradient(135deg, #001f3f 0%, #003366 100%);
          color: white;
          padding: 1.2rem;
          margin: 0;
          box-shadow: 0 -4px 12px rgba(0, 31, 63, 0.2);
        }
        
        .sidebar-footer-icon {
          font-size: 1.5rem;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>

      {/* Hamburger menu pour mobile */}
      <button
        className="hamburger-btn btn btn-primary d-md-none m-2 rounded-3"
        onClick={() => setOpen(!open)}
      >
        ☰ Menu
      </button>

      {/* Sidebar */}
      <div
        className={`sidebar-container border-end position-fixed h-100 d-flex flex-column ${open ? "start-0" : "-start-100"
          } d-md-flex`}
        style={{
          width: "260px",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1050,
        }}
      >
        {/* Contenu scrollable */}
        <div className="sidebar-content flex-grow-1">
          <div className="sidebar-inner">
            {/* Header */}
            <div className="p-3">
              <div className="text-center mb-4">
                <div className="menu-title">Navigation</div>
                <div style={{
                  width: "40px",
                  height: "3px",
                  background: "linear-gradient(90deg, #667eea, #764ba2)",
                  margin: "0 auto",
                  borderRadius: "2px"
                }}></div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="nav flex-column px-3 pb-3">
              {/* Liens principaux */}
              {mainLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `sidebar-link nav-link d-flex align-items-center mb-2 p-3 rounded-3 text-decoration-none ${isActive ? "active text-white" : "text-dark"
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive
                      ? `linear-gradient(135deg, ${link.color}, ${link.color}dd)`
                      : "transparent",
                    color: isActive ? "white" : "#333",
                  })}
                  onClick={() => setOpen(false)}
                >
                  <div className="icon-wrapper me-3">
                    <span style={{ fontSize: "1.2rem" }}>{link.icon}</span>
                  </div>
                  <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>
                    {link.label}
                  </span>
                </NavLink>
              ))}

              {/* Bouton Voir plus/moins */}
              <button
                className="more-button btn w-100 d-flex align-items-center justify-content-between p-3 rounded-3"
                onClick={() => setShowMore(!showMore)}
              >
                <div className="d-flex align-items-center">
                  <span className="me-2" style={{ fontSize: "1.1rem" }}>📑</span>
                  <span style={{ fontWeight: 500 }}>
                    {showMore ? "Voir moins" : "Voir plus"}
                  </span>
                </div>
                <span style={{
                  transition: "transform 0.3s ease",
                  transform: showMore ? "rotate(180deg)" : "rotate(0deg)",
                  fontSize: "1.2rem"
                }}>
                  ▼
                </span>
              </button>

              {/* Autres liens avec animation */}
              {showMore && (
                <div className="collapse-animation">
                  {moreLinks.map((link, index) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `sidebar-link nav-link d-flex align-items-center mb-2 p-3 rounded-3 text-decoration-none ${isActive ? "active text-white" : "text-dark"
                        }`
                      }
                      style={({ isActive }) => ({
                        background: isActive
                          ? `linear-gradient(135deg, ${link.color}, ${link.color}dd)`
                          : "transparent",
                        color: isActive ? "white" : "#333",
                        animationDelay: `${index * 0.05}s`,
                        paddingLeft: "1.5rem",
                      })}
                      onClick={() => setOpen(false)}
                    >
                      <div className="icon-wrapper me-3">
                        <span style={{ fontSize: "1.1rem" }}>{link.icon}</span>
                      </div>
                      <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                        {link.label}
                      </span>
                    </NavLink>
                  ))}
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Footer - TOUJOURS VISIBLE EN BAS */}
        <div className="text-light py-4 mt-5" style={{ backgroundColor: '#001f3f' }}>
          <div className="text-center">
            <div className="sidebar-footer-icon mb-4">🚗</div>
            <p className="mb-4" style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '0.5px'
            }}>
              CI Togo Vehicle Fleet
            </p>
            <p className="mb-0" style={{
              fontSize: "0.75rem",
              color: '#ffffff',
              opacity: 1
            }}>
              © 2025 • Version 1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Overlay pour mobile */}
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-md-none"
          onClick={() => setOpen(false)}
          style={{
            zIndex: 1040,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            transition: "all 0.3s ease",
          }}
        ></div>
      )}

      {/* Décalage du contenu principal */}
      <div className="d-none d-md-block" style={{ width: "260px" }}></div>
    </>
  );
}