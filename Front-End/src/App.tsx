
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import CommunityChat from './pages/CommunityChat';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductStore from './pages/ProductStore';
import AdminProducts from './pages/AdminProducts';
import SingleProduct from './pages/SingleProduct';
import Categories from './pages/Categories';
import AdminCategories from './pages/AdminCategories';
import Orders from './pages/Orders';
import OrderPreview from './pages/OrderPreview';
import UserManagement from './pages/UserManagement';
import Customers from './pages/Customers';
import SellerManagement from './pages/SellerManagement';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderComplete from './pages/OrderComplete';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import VendorDashboard from './pages/VendorDashboard';
import Reports from './pages/Reports';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/store" element={<ProductStore />} />
              <Route path="/products/:id" element={<SingleProduct />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-complete" element={<OrderComplete />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />

              {/* Protected routes */}
              <Route path="/community-chat" element={<CommunityChat />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vendor-dashboard" element={<VendorDashboard />} />
              <Route path="/reports" element={<Reports />} />
    
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin-products" element={<AdminProducts />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderPreview />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/seller-management" element={<SellerManagement />} />
              <Route path="/profile" element={<Profile />} />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
