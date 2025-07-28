import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';

import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import MedicineListPage from './pages/MedicineListPage.jsx';
import MedicineDetailPage from './pages/MedicineDetailPage.jsx';
import OrderPage from './pages/OrderPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/customer/ProfilePage.jsx';
import DashboardPage from './pages/staff/DashboardPage.jsx';
import PrescriptionUploadPage from './pages/PrescriptionUploadPage.jsx';

const AppLayout = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
    <Header />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="medicines" element={<MedicineListPage />} />
              <Route path="medicines/:id" element={<MedicineDetailPage />} />
              <Route path="order" element={<OrderPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="order/:orderId/upload-prescription" element={<PrescriptionUploadPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['pharmacist', 'cashier', 'branchManager', 'warehousePersonnel']} />}>
                  <Route path="dashboard" element={<DashboardPage />} />
              </Route>
            </Route>
            
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
