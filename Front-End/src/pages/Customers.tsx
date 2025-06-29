
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import SellerCustomers from './SellerCustomers';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import { useLanguage } from '@/contexts/LanguageContext';

const Customers = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'buyer') {
      navigate('/');
    }
  }, [user, navigate]);

  // If user is a seller, show seller-specific customers
  if (user?.role === 'SELLER') {
    return <SellerCustomers />;
  }

  // Admin view - show all users (only if user is admin)
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const response = await api.get('/auth/users');
      return response.data;
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  if (!user || user.role === 'buyer') {
    return null;
  }

  // If user is not admin, redirect to dashboard
  if (user.role !== 'ADMIN') {
    navigate('/dashboard');
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout currentPage="customers">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading users...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout currentPage="customers">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">Failed to load users</div>
        </div>
      </DashboardLayout>
    );
  }

  const users = usersData || [];
  const buyers = users.filter((user: any) => user.role.toLowerCase() === 'buyer');
  const sellers = users.filter((user: any) => user.role.toLowerCase() === 'seller');

  return (
    <DashboardLayout currentPage="customers">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search users..." className="pl-10 bg-gray-50 border-gray-200" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{buyers.length}</p>
                  <p className="text-gray-600">Total Buyers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{sellers.length}</p>
                  <p className="text-gray-600">Total Sellers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            {user.businessName && (
                              <p className="text-sm text-gray-500">{user.businessName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role.toLowerCase() === 'admin' 
                            ? 'bg-red-100 text-red-800'
                            : user.role.toLowerCase() === 'seller'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.role.toLowerCase() === 'seller' ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive && user.sellerStatus === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.isActive && user.sellerStatus === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Customers;
