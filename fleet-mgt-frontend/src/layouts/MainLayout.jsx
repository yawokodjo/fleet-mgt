import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -40 },
};

const pageTransition = { duration: 0.22, ease: 'easeInOut' };

export default function MainLayout({ children }) {
  const location = useLocation();

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', height: '100vh', overflow: 'hidden', background: '#f8f9fa' }}>
      <Header />

      <div style={{ display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, minHeight: 0, position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              style={{ padding: '1.5rem' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Footer />
    </div>
  );
}
