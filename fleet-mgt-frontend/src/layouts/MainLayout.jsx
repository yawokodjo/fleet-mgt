import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MainLayout({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', height: '100vh', background: '#f8f9fa' }}>
      {/* En-tête toujours visible */}
      <Header />

      {/* Corps principal — 1fr prend exactement l'espace restant */}
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <Sidebar />

        {/* Contenu principal — seule zone qui défile */}
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', minWidth: 0 }}>
          {children}
        </main>
      </div>

      {/* Pied de page — toujours visible */}
      <Footer />
    </div>
  );
}
