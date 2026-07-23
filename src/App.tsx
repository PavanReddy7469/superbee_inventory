import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardEntry from './pages/DashboardEntry';
import CategoriesPage from './pages/CategoriesPage';
import VendorsManufacturersPage from './pages/VendorsManufacturersPage';
import InventoryPage from './pages/InventoryPage';
import FixedInventoryPage from './pages/FixedInventoryPage';
import ExternalTestersPage from './pages/ExternalTestersPage';
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
import UnauthorizedPage from './pages/UnauthorizedPage';
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
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <DashboardEntry />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/buyers"
              element={
                <PrivateRoute requiredRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <BuyersPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/ae-requests"
              element={
                <PrivateRoute requiredRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <AeRequestsPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/drones"
              element={
                <PrivateRoute requiredRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <DronesPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/drone-types"
              element={
                <PrivateRoute requiredRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <DroneTypesPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/drones/add"
              element={
                <PrivateRoute requiredRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <AddDronePage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/generate-invoice"
              element={
                <PrivateRoute requiredRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <GenerateInvoicePage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/generate-ao"
              element={
                <PrivateRoute requiredRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <GenerateAOPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />


            <Route
              path="/dashboard/pi-request"
              element={
                <PrivateRoute requiredRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <PiRequestPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/categories"
              element={
                <PrivateRoute requiredRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <CategoriesPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/vendors"
              element={
                <PrivateRoute requiredRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <VendorsManufacturersPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/inventory"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <InventoryPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/fixed-inventory"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <FixedInventoryPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/external-testers"
              element={
                <PrivateRoute requiredRoles={['superadmin', 'admin']}>
                  <DashboardLayout>
                    <ExternalTestersPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/cart"
              element={
                <PrivateRoute requiredRoles={['technician', 'admin', 'superadmin']}>
                  <DashboardLayout>
                    <CartPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/inventory/register"
              element={
                <PrivateRoute requiredRoles={['superadmin', 'admin', 'technician']}>
                  <DashboardLayout>
                    <RegisterPartPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/send-request"
              element={
                <PrivateRoute requiredRoles={['technician']}>
                  <DashboardLayout>
                    <SendRequestPage />
                  </DashboardLayout>
                </PrivateRoute>
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
