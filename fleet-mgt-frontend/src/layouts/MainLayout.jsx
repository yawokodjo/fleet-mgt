import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MainLayout({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', height: '100vh', overflow: 'hidden', background: '#f8f9fa' }}>
      <Header />

      <div style={{ display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', minWidth: 0, minHeight: 0 }}>
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
