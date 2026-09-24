import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import { PageLoader } from './components/common/Loader';

// Pages are loaded on demand (code-splitting) so the first visit stays fast.
const Home = lazy(() => import('./pages/public/Home'));
const Products = lazy(() => import('./pages/public/Products'));
const ProductDetail = lazy(() => import('./pages/public/ProductDetail'));
const Markets = lazy(() => import('./pages/public/Markets'));
const MarketDetail = lazy(() => import('./pages/public/MarketDetail'));
const Farmers = lazy(() => import('./pages/public/Farmers'));
const FarmerDetail = lazy(() => import('./pages/public/FarmerDetail'));
const MapExplore = lazy(() => import('./pages/public/MapExplore'));
const About = lazy(() => import('./pages/public/About'));
const Terms = lazy(() => import('./pages/public/Terms'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Cart = lazy(() => import('./pages/public/Cart'));
const Checkout = lazy(() => import('./pages/public/Checkout'));
const CheckoutSuccess = lazy(() => import('./pages/public/CheckoutSuccess'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const RegisterFarmer = lazy(() => import('./pages/auth/RegisterFarmer'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

const Notifications = lazy(() => import('./pages/customer/Notifications'));
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const CustomerOrders = lazy(() => import('./pages/customer/Orders'));
const OrderDetail = lazy(() => import('./pages/customer/OrderDetail'));
const Favorites = lazy(() => import('./pages/customer/Favorites'));
const Profile = lazy(() => import('./pages/customer/Profile'));

const FarmerDashboard = lazy(() => import('./pages/farmer/Dashboard'));
const FarmerOrders = lazy(() => import('./pages/farmer/Orders'));
const FarmerProducts = lazy(() => import('./pages/farmer/Products'));
const FarmerPickup = lazy(() => import('./pages/farmer/Pickup'));
const FarmerProfile = lazy(() => import('./pages/farmer/Profile'));
const FarmerReviews = lazy(() => import('./pages/farmer/Reviews'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminFarmers = lazy(() => import('./pages/admin/Farmers'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminMarkets = lazy(() => import('./pages/admin/Markets'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminMessages = lazy(() => import('./pages/admin/Messages'));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="markets" element={<Markets />} />
            <Route path="markets/:slug" element={<MarketDetail />} />
            <Route path="farmers" element={<Farmers />} />
            <Route path="farmers/:slug" element={<FarmerDetail />} />
            <Route path="about" element={<About />} />
            <Route path="terms" element={<Terms />} />
            <Route path="contact" element={<Contact />} />
            <Route path="cart" element={<Cart />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="register/farmer" element={<RegisterFarmer />} />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />

            {/* Customer area */}
            <Route element={<ProtectedRoute roles={['customer']} />}>
              <Route path="checkout" element={<Checkout />} />
              <Route path="checkout/success" element={<CheckoutSuccess />} />
              <Route path="account" element={<DashboardLayout role="customer" />}>
                <Route index element={<CustomerDashboard />} />
                <Route path="orders" element={<CustomerOrders />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="profile" element={<Profile />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>
            </Route>

            {/* Farmer area */}
            <Route element={<ProtectedRoute roles={['farmer']} />}>
              <Route path="farmer" element={<DashboardLayout role="farmer" />}>
                <Route index element={<FarmerDashboard />} />
                <Route path="orders" element={<FarmerOrders />} />
                <Route path="products" element={<FarmerProducts />} />
                <Route path="pickup" element={<FarmerPickup />} />
                <Route path="profile" element={<FarmerProfile />} />
                <Route path="reviews" element={<FarmerReviews />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="orders/:id" element={<OrderDetail />} />
              </Route>
            </Route>

            {/* Admin area */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="admin" element={<DashboardLayout role="admin" />}>
                <Route index element={<AdminDashboard />} />
                <Route path="farmers" element={<AdminFarmers />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="markets" element={<AdminMarkets />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="map" element={<PublicLayout footer={false} />}>
            <Route index element={<MapExplore />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
