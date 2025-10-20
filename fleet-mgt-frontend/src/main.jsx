import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import './index.css'
import App from './App.jsx'
import './i18n';


createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>

)
