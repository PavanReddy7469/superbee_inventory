import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardEntry from './pages/DashboardEntry';
import CategoriesPage from './pages/CategoriesPage';
import InventoryPage from './pages/InventoryPage';
import RegisterPartPage from './pages/RegisterPartPage';
import BuyersPage from './pages/BuyersPage';
import CartPage from './pages/CartPage';
import AeRequestsPage from './pages/AeRequestsPage';
import PiRequestPage from './pages/PiRequestPage';
import DronesPage from './pages/DronesPage';
import DroneTypesPage from './pages/DroneTypesPage';
import AddDronePage from './pages/AddDronePage';
import SendRequestPage from './pages/SendRequestPage';
import GenerateInvoicePage from './pages/GenerateInvoicePage';
import GenerateAOPage from './pages/GenerateAOPage';
import { autoSeedIfNeeded } from './utils/seedDummyData';
import { initializeMockData } from './utils/mockData';

function App() {
  // Auto-seed dummy data for testing (only in development)
  useEffect(() => {
    autoSeedIfNeeded();
    initializeMockData();
  }, []);
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardEntry />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/buyers"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <BuyersPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/ae-requests"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <AeRequestsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/drones"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <DronesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/drone-types"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <DroneTypesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/drones/add"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <AddDronePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/generate-invoice"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <GenerateInvoicePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/generate-ao"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <GenerateAOPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />


            <Route
              path="/dashboard/pi-request"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <PiRequestPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/categories"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <CategoriesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/inventory"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <InventoryPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/cart"
              element={
                <ProtectedRoute allowedRoles={['technician', 'admin', 'superadmin']}>
                  <DashboardLayout>
                    <CartPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/inventory/register"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'technician']}>
                  <DashboardLayout>
                    <RegisterPartPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/send-request"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <DashboardLayout>
                    <SendRequestPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
