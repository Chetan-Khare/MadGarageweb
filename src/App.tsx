import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LocationProvider } from './context/LocationContext';

// Lazy Load Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const PartRequestPage = lazy(() => import('./pages/PartRequestPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CompleteProfilePage = lazy(() => import('./pages/CompleteProfilePage'));
const GarageDashboard = lazy(() => import('./pages/GarageDashboard'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const AdminVehicleManagement = lazy(() => import('./pages/AdminVehicleManagement'));
const AdminPartRequestReview = lazy(() => import('./pages/AdminPartRequestReview'));
const AdminUserManagement = lazy(() => import('./pages/AdminUserManagement'));
const AdminInventoryManagement = lazy(() => import('./pages/AdminInventoryManagement'));
const AdminOrderManagement = lazy(() => import('./pages/AdminOrderManagement'));
const SellerInventory = lazy(() => import('./pages/SellerInventory'));
const SellerOrderManagement = lazy(() => import('./pages/SellerOrderManagement'));
const SellerFlaggedProducts = lazy(() => import('./pages/SellerFlaggedProducts'));
const AIChatPage = lazy(() => import('./pages/AIChatPage'));
const AddProductPage = lazy(() => import('./pages/AddProductPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'));
const OrderLookupPage = lazy(() => import('./pages/OrderLookupPage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AddressPage = lazy(() => import('./pages/AddressPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));

// Fallback Loader Component
const PageLoader = () => (
  <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
    <div className="h-12 w-12 border-2 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(223,35,36,0.2)]" />
  </div>
);

function App() {
  const { role } = useAuth();

  return (
    <LocationProvider>
      <CartProvider>
        <WishlistProvider>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes with Layout */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="request-part" element={<PartRequestPage />} />
                <Route path="product/:id" element={<ProductDetailsPage />} />
                <Route path="cart" element={<CartPage />} />
              </Route>

              {/* Auth Routes - No Main Layout */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/complete-profile" element={<CompleteProfilePage />} />

              {/* Admin Specific Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
                <Route path="/admin/add-product" element={<AddProductPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/admin/vehicles" element={<AdminVehicleManagement />} />
                <Route path="/admin/requests" element={<AdminPartRequestReview />} />
                <Route path="/admin/users" element={<AdminUserManagement />} />
                <Route path="/admin/inventory" element={<AdminInventoryManagement />} />
                <Route path="/admin/orders" element={<AdminOrderManagement />} />
                <Route path="/admin/parts-db" element={<CatalogPage />} />
              </Route>

              {/* Redirects */}
              <Route path="/catalog" element={<Navigate to="/" replace />} />
              
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
                <Route path="/order" element={<OrderLookupPage />} />
                <Route path="/order/:id" element={<OrderDetailsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/addresses" element={<AddressPage />} />
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
          </Suspense>
        </WishlistProvider>
      </CartProvider>
    </LocationProvider>
  );
}

export default App;
