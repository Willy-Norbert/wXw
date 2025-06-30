import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Index from './pages/Index';
import Products from './pages/Products';
import SingleProduct from './pages/SingleProduct';
import Categories from './pages/Categories';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderComplete from './pages/OrderComplete';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import Customers from './pages/Customers';
import UserManagement from './pages/UserManagement';
import SellerManagement from './pages/SellerManagement';
import SellerCustomers from './pages/SellerCustomers';
import VendorDashboard from './pages/VendorDashboard';
import Vendors from './pages/Vendors';
import SellerRequest from './pages/SellerRequest';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import CommunityChat from './pages/CommunityChat';
import ProductStore from './pages/ProductStore';
import OrderPreview from './pages/OrderPreview';
import { SellerBlocked } from './components/seller/SellerBlocked';
import { SellerGuard } from './components/guards/SellerGuard';

import './index.css';
import process from 'process';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<SingleProduct />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-complete" element={<OrderComplete />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/store" element={<ProductStore />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/seller-request" element={<SellerRequest />} />

              {/* Protected Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderPreview />} />
              <Route path="/chat" element={<CommunityChat />} />
              
              <Route path="/community-chat" element={<SellerGuard><CommunityChat /></SellerGuard>} />

              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<SellerGuard><Dashboard /></SellerGuard>} />
              <Route path="/admin-products" element={<SellerGuard><AdminProducts /></SellerGuard>} />
              <Route path="/admin-categories" element={<SellerGuard><AdminCategories /></SellerGuard>} />
              <Route path="/customers" element={<SellerGuard><Customers /></SellerGuard>} />
              <Route path="/user-management" element={<SellerGuard><UserManagement /></SellerGuard>} />
              <Route path="/seller-management" element={<SellerGuard><SellerManagement /></SellerGuard>} />
              <Route path="/seller-customers" element={<SellerGuard><SellerCustomers /></SellerGuard>} />
              <Route path="/vendors" element={<SellerGuard><Vendors /></SellerGuard>} />
              <Route path="/analytics" element={<SellerGuard><Analytics /></SellerGuard>} />
              <Route path="/reports" element={<SellerGuard><Reports /></SellerGuard>} />

              {/* Protected Seller Route */}
              <Route
                path="/vendor-dashboard"
                element={
                  <SellerGuard>
                    <VendorDashboard />
                  </SellerGuard>
                }
              />

              {/* Seller Restricted Page */}
              <Route path="/seller/restricted" element={<SellerBlocked />} />

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
