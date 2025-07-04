
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Toaster } from '@/components/ui/toaster';
// import { AuthProvider } from '@/contexts/AuthContext';
// // import Layout from '@/components/Layout';
// // import Home from '@/pages/Home';
// import Login from '@/pages/Login';
// import Register from '@/pages/Register';
// import Products from '@/pages/Products';
// // import ProductDetail from '@/pages/ProductDetail';
// import Cart from '@/pages/Cart';
// import Orders from '@/pages/Orders';
// import SellerOrders from '@/pages/SellerOrders';
// import OrderPreview from '@/pages/OrderPreview';
// import OrderCreation from '@/components/OrderCreation';
// import OrderEditModal from '@/components/OrderEditModal';
// // import AdminDashboard from '@/pages/AdminDashboard';
// // import ProductManagement from '@/pages/ProductManagement';
// import UserManagement from '@/pages/UserManagement';
// // import OrderManagement from '@/pages/OrderManagement';
// import SellerManagement from '@/pages/SellerManagement';
// // import SellerRequestForm from '@/pages/SellerRequestForm';
// // import ProtectedRoute from '@/components/ProtectedRoute';

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       refetchOnWindowFocus: false,
//     },
//   },
// });

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <AuthProvider>
//         <Router>
//           {/* <Layout> */}
//             <Routes>
//               {/* <Route path="/" element={<Home />} /> */}
//               <Route path="/login" element={<Login />} />
//               <Route path="/register" element={<Register />} />
//               <Route path="/products" element={<Products />} />
//               {/* <Route path="/products/:id" element={<ProductDetail />} /> */}
//               <Route path="/cart" element={<Cart />} />
//               {/* <Route path="/become-seller" element={<SellerRequestForm />} /> */}
              
//               {/* Protected Routes */}
//               <Route path="/orders" element={
//                 // <ProtectedRoute allowedRoles={['admin', 'buyer']}>
//                   <Orders />
//                 // </ProtectedRoute>
//               } />
              
//               <Route path="/seller/orders" element={
//                 <ProtectedRoute allowedRoles={['seller']}>
//                   <SellerOrders />
//                 </ProtectedRoute>
//               } />

//               <Route path="/orders/create" element={
//                 <ProtectedRoute allowedRoles={['admin', 'seller']}>
//                   <OrderCreation />
//                 </ProtectedRoute>
//               } />

//               <Route path="/orders/:id" element={
//                 <ProtectedRoute allowedRoles={['admin', 'seller', 'buyer']}>
//                   <OrderPreview />
//                 </ProtectedRoute>
//               } />

//               <Route path="/orders/:id/edit" element={
//                 <ProtectedRoute allowedRoles={['admin', 'seller']}>
//                   <OrderEditModal />
//                 </ProtectedRoute>
//               } />

//               {/* Admin Routes */}
//               <Route path="/admin" element={
//                 <ProtectedRoute allowedRoles={['admin']}>
//                   <AdminDashboard />
//                 </ProtectedRoute>
//               } />
//               <Route path="/admin/products" element={
//                 <ProtectedRoute allowedRoles={['admin']}>
//                   <ProductManagement />
//                 </ProtectedRoute>
//               } />
//               <Route path="/admin/users" element={
//                 <ProtectedRoute allowedRoles={['admin']}>
//                   <UserManagement />
//                 </ProtectedRoute>
//               } />
//               <Route path="/admin/orders" element={
//                 <ProtectedRoute allowedRoles={['admin']}>
//                   <OrderManagement />
//                 </ProtectedRoute>
//               } />
//               <Route path="/admin/sellers" element={
//                 <ProtectedRoute allowedRoles={['admin']}>
//                   <SellerManagement />
//                 </ProtectedRoute>
//               } />
//             </Routes>
//           </Layout>
//           <Toaster />
//         </Router>
//       </AuthProvider>
//     </QueryClientProvider>
//   );
// }

// export default App;
