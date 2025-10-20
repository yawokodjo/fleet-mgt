import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Vehicles from './pages/Vehicles';
import VehicleCreate from "./pages/VehicleCreate";
import VehicleDetail from './pages/VehicleDetail';
import VehicleEdit from './pages/VehicleEdit';
import Reports from './pages/Reports';
import Maintenances from './pages/Maintenances';
import Consumptions from './pages/Consumptions';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ConsumptionCreate from "./pages/ConsumptionCreate";
import ConsumptionDetail from "./pages/ConsumptionDetail";
import ConsumptionEdit from "./pages/ConsumptionEdit";
import MaintenanceCreate from "./pages/MaintenanceCreate";
import MaintenanceEdit from "./pages/MaintenanceEdit";
import MaintenanceDetail from "./pages/MaintenanceDetail";

// Context
import { AuthProvider } from './context/AuthContext';

// Route protection
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/vehicles/create" element={<VehicleCreate />} />
          <Route path="/vehicles/:id/edit" element={<VehicleEdit />} />
          <Route path="/consumptions/create" element={<ConsumptionCreate />} />
          <Route path="/maintenances/create" element={<MaintenanceCreate />} />

          {/* Routes privées */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />

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

          <Route
            path="/vehicles"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Vehicles />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/vehicles/:id"
            element={
              <PrivateRoute>
                <MainLayout>
                  <VehicleDetail />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/maintenances"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Maintenances />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/maintenances/:id"
            element={
              <PrivateRoute>
                <MainLayout>
                  <MaintenanceDetail />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/maintenances/:id/edit"
            element={
              <PrivateRoute>
                <MainLayout>
                  <MaintenanceEdit />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/consumptions"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Consumptions />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/consumptions/:id"
            element={
              <PrivateRoute>
                <MainLayout>
                  <ConsumptionDetail />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/consumptions/:id/edit"
            element={
              <PrivateRoute>
                <MainLayout>
                  <ConsumptionEdit />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
