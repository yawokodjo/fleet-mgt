import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import React from 'react';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* En-tête fixe */}
      <Header />

      {/* Corps principal avec sidebar + contenu */}
      <div className="flex flex-1">
        {/* Menu latéral (affiché uniquement en desktop) */}
        <Sidebar />

        {/* Zone principale de contenu */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}
