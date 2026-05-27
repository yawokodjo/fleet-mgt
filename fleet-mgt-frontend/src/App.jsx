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
import VehicleReport from './pages/reports/VehicleReport';
import ReportsDashboard from './pages/reports/ReportsDashboard';

// Context
import PrivateRoute from './components/PrivateRoute';

// ── Rôles ──────────────────────────────────────────────────────────────────
const ALL         = ['admin', 'manager', 'driver', 'accountant'];
const MANAGERS    = ['admin', 'manager'];
const NO_DRIVER   = ['admin', 'manager', 'accountant'];
const ADMIN_ONLY  = ['admin'];

// Tableau des entités CRUD avec leurs rôles autorisés
const entities = [
  {
    name: 'vehicles',
    roles: NO_DRIVER,
    list: Vehicles,
    create: VehicleCreate,
    detail: VehicleDetail,
    edit: VehicleEdit,
  },
  {
    name: 'maintenances',
    roles: MANAGERS,
    list: Maintenances,
    create: MaintenanceCreate,
    detail: MaintenanceDetail,
    edit: MaintenanceEdit,
  },
  {
    name: 'consumptions',
    roles: NO_DRIVER,
    list: Consumptions,
    create: ConsumptionCreate,
    detail: ConsumptionDetail,
    edit: ConsumptionEdit,
  },
];

function PR({ children, roles }) {
  return (
    <PrivateRoute roles={roles}>
      <MainLayout>{children}</MainLayout>
    </PrivateRoute>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"                element={<Home />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path="/debug-auth"      element={<DebugAuth />} />

      {/* Dashboard & Profil — tous les rôles connectés */}
      <Route path="/dashboard" element={<PR roles={ALL}><Dashboard /></PR>} />
      <Route path="/profile"   element={<PR roles={ALL}><Profile /></PR>} />

      {/* Rapports — admin, manager, accountant */}
      <Route path="/reports"              element={<PR roles={NO_DRIVER}><ReportsDashboard /></PR>} />
      <Route path="/reports/vehicles"     element={<PR roles={NO_DRIVER}><VehicleReport /></PR>} />
      <Route path="/reports/consumption"  element={<PR roles={NO_DRIVER}><ConsumptionReport /></PR>} />
      <Route path="/reports/maintenance"  element={<PR roles={NO_DRIVER}><MaintenanceReport /></PR>} />

      {/* Utilisateurs — admin uniquement */}
      <Route path="/users"           element={<PR roles={ADMIN_ONLY}><Users /></PR>} />
      <Route path="/users/create"    element={<PR roles={ADMIN_ONLY}><UserForm /></PR>} />
      <Route path="/users/:id"       element={<PR roles={ADMIN_ONLY}><UserDetail /></PR>} />
      <Route path="/users/:id/edit"  element={<PR roles={ADMIN_ONLY}><UserForm /></PR>} />

      {/* CRUD dynamique — rôles définis par entité */}
      {entities.map((entity) => (
        <React.Fragment key={entity.name}>
          <Route path={`/${entity.name}`}           element={<PR roles={entity.roles}><entity.list /></PR>} />
          {entity.create && <Route path={`/${entity.name}/create`}    element={<PR roles={entity.roles}><entity.create /></PR>} />}
          {entity.detail && <Route path={`/${entity.name}/:id`}       element={<PR roles={entity.roles}><entity.detail /></PR>} />}
          {entity.edit   && <Route path={`/${entity.name}/:id/edit`}  element={<PR roles={entity.roles}><entity.edit /></PR>} />}
        </React.Fragment>
      ))}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
