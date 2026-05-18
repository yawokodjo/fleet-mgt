import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MainLayout({ children }) {
  return (
    <div className="d-flex flex-column bg-light" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* En-tête toujours visible */}
      <Header />

      {/* Corps principal */}
      <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>
        {/* Barre latérale */}
        <div className="d-none d-md-block bg-white border-end" style={{ width: '250px', overflowY: 'auto' }}>
          <Sidebar />
        </div>

        {/* Contenu principal — seule zone qui défile */}
        <main className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
