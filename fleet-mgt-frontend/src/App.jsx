import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Routes, Route } from 'react-router-dom';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DebugAuth from './pages/DebugAuth';

// Vehicles
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import VehicleCreate from './pages/VehicleCreate';
import VehicleEdit from './pages/VehicleEdit';

// Maintenances
import Maintenances from './pages/Maintenances';
import MaintenanceCreate from './pages/MaintenanceCreate';
import MaintenanceDetail from './pages/MaintenanceDetail';
import MaintenanceEdit from './pages/MaintenanceEdit';

// Consumptions
import Consumptions from './pages/Consumptions';
import ConsumptionCreate from './pages/ConsumptionCreate';
import ConsumptionDetail from './pages/ConsumptionDetail';
import ConsumptionEdit from './pages/ConsumptionEdit';

// Users
import Users from './pages/Users';
import UserForm from './pages/UserForm';
import UserDetail from './pages/UserDetail';

// Reports
import ConsumptionReport from './pages/reports/ConsumptionReport';
import MaintenanceReport from './pages/reports/MaintenanceReport';
import ReportsDashboard from './pages/reports/ReportsDashboard';

// Context
import PrivateRoute from './components/PrivateRoute';

// Tableau des entités CRUD
const entities = [
  {
    name: 'vehicles',
    list: Vehicles,
    create: VehicleCreate,
    detail: VehicleDetail,
    edit: VehicleEdit,
  },
  {
    name: 'maintenances',
    list: Maintenances,
    create: MaintenanceCreate,
    detail: MaintenanceDetail,
    edit: MaintenanceEdit,
  },
  {
    name: 'consumptions',
    list: Consumptions,
    create: ConsumptionCreate,
    detail: ConsumptionDetail,
    edit: ConsumptionEdit,
  },
];

export default function App() {
  return (
    <Routes>
      {/* ========================================
          PAGE D'ACCUEIL PUBLIQUE
      ======================================== */}
      <Route path="/" element={<Home />} />

      {/* ========================================
              ROUTES PUBLIQUES (AUTH)
          ======================================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/debug-auth" element={<DebugAuth />} />
      {/* ========================================
              DASHBOARD (ROUTE PRIVÉE)
          ======================================== */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* ========================================
              PROFIL
          ======================================== */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* ========================================
              RAPPORTS
          ======================================== */}
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <MainLayout>
              <ReportsDashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/reports/consumption"
        element={
          <PrivateRoute>
            <MainLayout>
              <ConsumptionReport />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/reports/maintenance"
        element={
          <PrivateRoute>
            <MainLayout>
              <MaintenanceReport />
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* ========================================
              UTILISATEURS
          ======================================== */}
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <MainLayout>
              <Users />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/users/:id"
        element={
          <PrivateRoute>
            <MainLayout>
              <UserDetail />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/users/create"
        element={
          <PrivateRoute>
            <MainLayout>
              <UserForm />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/users/:id/edit"
        element={
          <PrivateRoute>
            <MainLayout>
              <UserForm />
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* ========================================
              ROUTES CRUD DYNAMIQUES
          ======================================== */}
      {entities.map((entity) => (
        <React.Fragment key={entity.name}>
          {/* Liste */}
          <Route
            path={`/${entity.name}`}
            element={
              <PrivateRoute>
                <MainLayout>
                  <entity.list />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Création */}
          {entity.create && (
            <Route
              path={`/${entity.name}/create`}
              element={
                <PrivateRoute>
                  <MainLayout>
                    <entity.create />
                  </MainLayout>
                </PrivateRoute>
              }
            />
          )}

          {/* Détail */}
          {entity.detail && (
            <Route
              path={`/${entity.name}/:id`}
              element={
                <PrivateRoute>
                  <MainLayout>
                    <entity.detail />
                  </MainLayout>
                </PrivateRoute>
              }
            />
          )}

          {/* Édition */}
          {entity.edit && (
            <Route
              path={`/${entity.name}/:id/edit`}
              element={
                <PrivateRoute>
                  <MainLayout>
                    <entity.edit />
                  </MainLayout>
                </PrivateRoute>
              }
            />
          )}
        </React.Fragment>
      ))}

      {/* ========================================
              PAGE 404
          ======================================== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}