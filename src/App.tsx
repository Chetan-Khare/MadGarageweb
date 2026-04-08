import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import PartRequestPage from './pages/PartRequestPage';
import LoginPage from './pages/LoginPage';
import GarageDashboard from './pages/GarageDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminVehicleManagement from './pages/AdminVehicleManagement';
import AdminPartRequestReview from './pages/AdminPartRequestReview';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminInventoryManagement from './pages/AdminInventoryManagement';
import AdminOrderManagement from './pages/AdminOrderManagement';
import SellerInventory from './pages/SellerInventory';
import SellerOrderManagement from './pages/SellerOrderManagement';
import SellerFlaggedProducts from './pages/SellerFlaggedProducts';
import AIChatPage from './pages/AIChatPage';
import AddProductPage from './pages/AddProductPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import CatalogPage from './pages/CatalogPage';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { role } = useAuth();

  return (
    <Routes>
      {/* Public Routes with Layout */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="request-part" element={<PartRequestPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="product/:id" element={<ProductDetailsPage />} />
      </Route>

      {/* Auth Routes - No Main Layout */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Specific Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
        <Route path="/admin/add-product" element={<AddProductPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/vehicles" element={<AdminVehicleManagement />} />
        <Route path="/admin/requests" element={<AdminPartRequestReview />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/inventory" element={<AdminInventoryManagement />} />
        <Route path="/admin/orders" element={<AdminOrderManagement />} />
      </Route>
      
      {/* Seller Specific Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_SELLER']} />}>
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/inventory" element={<SellerInventory />} />
        <Route path="/seller/orders" element={<SellerOrderManagement />} />
        <Route path="/seller/flagged-items" element={<SellerFlaggedProducts />} />
        <Route path="/seller/add-product" element={<AddProductPage />} />
      </Route>

      {/* Global AI Chat & Global Order Details (Requires Auth) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<AIChatPage />} />
        <Route path="/order/:id" element={<OrderDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>

      {/* Garage Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_GARAGE']} />}>
        <Route path="/dashboard" element={<GarageDashboard />} />
      </Route>

      {/* Customer Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_CUSTOMER']} />}>
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
      </Route>

      {/* Default Dashboard Redirect based on Role */}
      <Route element={<ProtectedRoute />}>
         <Route path="/user-dashboard" element={
             role === 'ROLE_ADMIN' ? <Navigate to="/admin" replace /> :
             role === 'ROLE_SELLER' ? <Navigate to="/seller" replace /> :
             role === 'ROLE_CUSTOMER' ? <Navigate to="/customer-dashboard" replace /> :
             <Navigate to="/dashboard" replace />
         } />
      </Route>
    </Routes>
  );
}

export default App;
