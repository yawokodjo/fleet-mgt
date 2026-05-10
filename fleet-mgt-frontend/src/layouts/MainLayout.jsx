import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MainLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* En-tête fixe */}
      <Header />

      {/* Corps principal */}
      <div className="d-flex flex-grow-1">
        {/* Barre latérale */}
        <div className="d-none d-md-block bg-white border-end" style={{ width: '250px' }}>
          <Sidebar />
        </div>

        {/* Contenu principal */}
        <main className="flex-grow-1 p-4 overflow-auto">
          {children}
        </main>
      </div>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}
