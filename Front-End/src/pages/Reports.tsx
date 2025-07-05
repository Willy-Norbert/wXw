
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '@/api/orders';
import { getSellerOrders, getSellerProducts, getSellerStats } from '@/api/sellers';
import api from '@/api/api';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'buyer') {
      navigate('/');
    }
  }, [user, navigate]);

  const isSeller = user?.role?.toLowerCase() === 'seller';

  // For sellers, use seller-specific API calls
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: isSeller ? ['seller-orders'] : ['orders'],
    queryFn: () => isSeller ? getSellerOrders() : getAllOrders()
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/auth/users'),
    enabled: !isSeller // Only fetch users for admins
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: isSeller ? ['seller-products'] : ['products'],
    queryFn: () => isSeller ? getSellerProducts() : api.get('/products')
  });

  if (!user || user.role === 'buyer') {
    return null;
  }

  if (ordersLoading || usersLoading || productsLoading) {
    return (
      <DashboardLayout currentPage="reports">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading reports...</div>
        </div>
      </DashboardLayout>
    );
  }

  const orders = ordersData?.data || [];
  const users = usersData?.data || [];
  const products = productsData?.data || [];
  
  // Calculate metrics based on user role
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.totalPrice || 0), 0);
  const totalCustomers = isSeller ? 
    orders.filter((order: any, index: number, arr: any[]) => 
      arr.findIndex((o: any) => o.customerEmail === order.customerEmail) === index
    ).length : 
    users.filter((u: any) => u.role === 'BUYER' || u.role === 'buyer').length;
  const totalVendors = isSeller ? 1 : users.filter((u: any) => u.role === 'SELLER' || u.role === 'seller').length;
  const totalProducts = products.length;
  const totalOrders = orders.length;
  
  // Calculate monthly revenue
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlyRevenue = orders.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
  }).reduce((sum: number, order: any) => sum + Number(order.totalPrice || 0), 0);

  const paidOrders = orders.filter((order: any) => order.isPaid);
  const paidRevenue = paidOrders.reduce((sum: number, order: any) => sum + Number(order.totalPrice || 0), 0);
  
  // Calculate percentage changes (comparing to previous period - simplified)
  const revenueGrowth = totalRevenue > 0 ? ((monthlyRevenue / totalRevenue) * 100).toFixed(1) : '0.0';
  const customerGrowth = totalCustomers > 0 ? '12.5' : '0.0'; // Basic calculation
  const vendorGrowth = totalVendors > 0 ? '3.2' : '0.0';
  const orderGrowth = totalOrders > 0 ? '6.8' : '0.0';

  return (
    <DashboardLayout currentPage="reports">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r text-purple-300 bg-clip-text text-transparent">
            {isSeller ? 'My Sales Reports & Analytics' : 'Reports & Analytics'}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Customers Report */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">
                {isSeller ? 'My Customers' : 'Customer Analytics'}
              </CardTitle>
              
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{totalCustomers.toLocaleString()}</div>
               
              </div>
              <div className="h-20 bg-gradient-to-r  rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r bg-gray-400"></div>
                <TrendingUp className="w-8 h-8 text-purple-500 relative z-10" />
              </div>
            </CardContent>
          </Card>

          {/* Vendor Report - Hide for sellers */}
          {!isSeller && (
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">Vendor Performance</CardTitle>
                
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">{totalVendors}</div>
                  
                </div>
                <div className="h-20 bg-gradient-to-r rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r bg-gray-200"></div>
                  <BarChart3 className="w-8 h-8 text-blue-500 relative z-10" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sales Report */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 md:col-span-2 xl:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">
                {isSeller ? 'My Sales Overview' : 'Sales Overview'}
              </CardTitle>
              
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{totalRevenue.toLocaleString()} Rwf</div>
             
              </div>
              <div className="h-20 bg-gradient-to-r bg-gray-200 rounded-lg p-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r bg-gray-200"></div>
                <div className="flex items-end justify-between h-full space-x-1 relative z-10">
                  {[60, 80, 45, 90, 70, 85, 95, 75].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col justify-end">
                      <div 
                        className="bg-gradient-to-t bg-gray-300 rounded-sm min-h-[8px] transition-all duration-300 hover:from-gray-600 hover:to-gray-500"
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue Report */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">Monthly Revenue</CardTitle>
              
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{monthlyRevenue.toLocaleString()} Rwf</div>
              </div>
              <div className="h-20 bg-gradient-to-r bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r bg-gray-200"></div>
                <PieChart className="w-8 h-8 text-orange-500 relative z-10" />
              </div>
            </CardContent>
          </Card>

          {/* Products Report */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">
                {isSeller ? 'My Products' : 'Product Analytics'}
              </CardTitle>
              
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{totalProducts}</div>
              </div>
              <div className="h-20 bg-gradient-to-r bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r bg-gray-200"></div>
                <BarChart3 className="w-8 h-8 text-pink-500 relative z-10" />
              </div>
            </CardContent>
          </Card>

          {/* Orders Report */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">
                {isSeller ? 'My Orders' : 'Order Analytics'}
              </CardTitle>
              
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{totalOrders}</div>
              </div>
              <div className="h-20 bg-gradient-to-r bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r bg-gray-200"></div>
                <BarChart3 className="w-8 h-8 text-indigo-500 relative z-10" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section - Real Data */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              {isSeller ? 'My Business Summary' : 'Database Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{totalOrders}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()} Rwf</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{totalCustomers}</div>
                <div className="text-sm text-gray-600">{isSeller ? 'My Customers' : 'Total Customers'}</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{paidOrders.length}</div>
                <div className="text-sm text-gray-600">Paid Orders</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
