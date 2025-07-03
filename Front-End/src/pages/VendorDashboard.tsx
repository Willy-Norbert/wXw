
import React, { useContext, useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BarChart3, Clock, Users, Package, Plus, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';

interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
}

interface SellerOrder {
  id: number;
  totalPrice: number;
  isPaid: boolean;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      coverImage: string;
    };
  }>;
}

interface SellerProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  coverImage: string;
  category: {
    name: string;
  } | null;
  _count: {
    orderItems: number;
    reviews: number;
  };
}

const VendorDashboard = () => {
  const { t } = useLanguage();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🏪 VendorDashboard: useEffect - loading:', loading, 'user:', user);
    
    if (loading) return;

    if (!user) {
      console.log('❌ VendorDashboard: No user, redirecting to login');
      navigate('/login');
      return;
    }

    const userRole = user.role?.toLowerCase();
    console.log('🔍 VendorDashboard: User role check:', userRole);

    if (userRole !== 'seller') {
      console.log('❌ VendorDashboard: User is not seller, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }

    console.log('✅ VendorDashboard: Seller authenticated, userId:', user.id);
  }, [user, loading, navigate]);

  // Fetch seller-specific stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['seller-stats', user?.id],
    queryFn: async () => {
      console.log('📊 Fetching seller stats for user:', user?.id);
      const response = await api.get('/sellers/my-stats');
      console.log('📈 Seller stats response:', response.data);
      return response.data;
    },
    enabled: !!user && user.role?.toLowerCase() === 'seller',
  });

  // Fetch seller-specific orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      console.log('📋 Fetching seller orders for user:', user?.id);
      const response = await api.get('/sellers/my-orders');
      console.log('📦 Seller orders response:', response.data?.length, 'orders');
      return response.data;
    },
    enabled: !!user && user.role?.toLowerCase() === 'seller',
  });

  // Fetch seller-specific products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      console.log('🛍️ Fetching seller products for user:', user?.id);
      const response = await api.get('/sellers/my-products');
      console.log('📦 Seller products response:', response.data?.length, 'products');
      return response.data;
    },
    enabled: !!user && user.role?.toLowerCase() === 'seller',
  });

  // Fetch seller-specific customers
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['seller-customers', user?.id],
    queryFn: async () => {
      console.log('👥 Fetching seller customers for user:', user?.id);
      const response = await api.get('/sellers/my-customers');
      console.log('👨‍👩‍👧‍👦 Seller customers response:', response.data?.length, 'customers');
      return response.data;
    },
    enabled: !!user && user.role?.toLowerCase() === 'seller',
  });

  if (loading || !user || user.role?.toLowerCase() !== 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const stats: SellerStats = statsData || { totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalCustomers: 0 };
  const recentOrders: SellerOrder[] = (ordersData || []).slice(0, 5);
  const products: SellerProduct[] = (productsData || []).slice(0, 5);
  const customers = (customersData || []).slice(0, 5);

  console.log('📊 VendorDashboard render data:', {
    stats,
    recentOrdersCount: recentOrders.length,
    productsCount: products.length,
    customersCount: customers.length
  });

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/admin-products">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Link>
            <Link to="/orders">
              <Button variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatsCard
            title="Total Orders"
            value={statsLoading ? "..." : (stats.totalOrders ?? 0).toString()}
            icon={BarChart3}
            color="text-red-500"
          />
          <StatsCard
            title="Total Revenue"
            value={statsLoading ? "..." : `${(stats.totalRevenue ?? 0).toLocaleString()} Rwf`}
            icon={Clock}
            color="text-green-500"
          />
          <StatsCard
            title="Total Customers"
            value={statsLoading ? "..." : (stats.totalCustomers ?? 0).toString()}
            icon={Users}
            color="text-blue-500"
          />
          <StatsCard
            title="Total Products"
            value={statsLoading ? "..." : (stats.totalProducts ?? 0).toString()}
            icon={Package}
            color="text-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex justify-between items-center">
                My Products
                <Link to="/admin-products">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-gray-500">Loading products...</div>
                </div>
              ) : products.length > 0 ? (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50">
                      <img 
                        src={product.coverImage} 
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${product.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block">
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-500">{product.category?.name || 'No Category'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{product.price.toLocaleString()} Rwf</p>
                        <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No products found. <Link to="/admin-products" className="text-blue-600 underline">Create your first product</Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="font-semibold">{stats.totalRevenue.toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Order Value</span>
                  <span className="font-semibold">
                    {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : '0'} Rwf
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-semibold">{stats.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Customers</span>
                  <span className="font-semibold">{stats.totalCustomers}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex justify-between items-center">
              Recent Orders
              <Link to="/orders">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading orders...</div>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Products</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">#{order.id}</td>
                        <td className="px-4 py-3 text-sm">{order.user?.name || 'Guest'}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center space-x-2">
                            {order.items.slice(0, 2).map((item) => (
                              <img
                                key={item.id}
                                src={item.product?.coverImage || '/placeholder.svg'}
                                alt={item.product?.name || 'Product'}
                                className="w-8 h-8 rounded object-cover"
                              />
                            ))}
                            {order.items.length > 2 && (
                              <span className="text-xs text-gray-500">+{order.items.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          {order.totalPrice.toLocaleString()} Rwf
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.isPaid 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No orders found for your products
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex justify-between items-center">
              Recent Customers
              <Link to="/customers">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading customers...</div>
              </div>
            ) : customers.length > 0 ? (
              <div className="space-y-3">
                {customers.map((customer: any) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{customer.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{customer._count?.orders || 0} orders</p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No customers found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;
