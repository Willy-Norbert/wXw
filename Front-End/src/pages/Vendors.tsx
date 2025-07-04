
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '@/api/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface CreateVendorData {
  name: string;
  email: string;
  password: string;
  role: 'seller';
}

const Vendors = () => {
  const { t } = useLanguage();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const form = useForm<CreateVendorData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'seller',
    },
  });

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    // Only ADMINs can access vendors page
    if (user.role.toLowerCase() !== 'admin') {
      navigate('/dashboard');
      return;
    }
  }, [user, loading, navigate]);

  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      console.log('Fetching vendors data...');
      const response = await api.get('/auth/users');
      console.log('Vendors API response:', response.data);
      return response;
    },
    enabled: !!user && user.role.toLowerCase() === 'admin',
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  });

  const createVendorMutation = useMutation({
    mutationFn: async (data: CreateVendorData) => {
      console.log('Creating vendor:', data);
      const response = await api.post('/auth/register', data);
      console.log('Vendor created response:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setIsCreateModalOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Vendor created successfully.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create vendor';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Filter vendors from the users data
  const allUsers = usersData?.data || [];
  const vendors = allUsers.filter((u: any) => {
    const userRole = u.role?.toLowerCase();
    return userRole === 'seller';
  });

  // Filter vendors based on search term
  const filteredVendors = vendors.filter((vendor: any) =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('All users:', allUsers.length, 'Vendors found:', vendors.length, 'Filtered:', filteredVendors.length);

  const onSubmit = (data: CreateVendorData) => {
    createVendorMutation.mutate(data);
  };

  const resetForm = () => {
    form.reset();
    setIsCreateModalOpen(false);
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout currentPage="vendors">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role.toLowerCase() !== 'admin') {
    return null;
  }

  if (error) {
    console.error('Vendors fetch error:', error);
    return (
      <DashboardLayout currentPage="vendors">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">
            {t('error.failed_load_products')}
            <Button onClick={() => refetch()} className="ml-2">{t('common.retry')}</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="vendors">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('vendors.title')}</h1>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => resetForm()}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('vendors.add_vendor')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    rules={{ 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createVendorMutation.isPending}
                      className="flex-1"
                    >
                      {createVendorMutation.isPending ? 'Creating...' : 'Create Vendor'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder={t('vendors.search_vendors')} 
              className="pl-10 bg-gray-50 border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Total Vendors Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('vendors.total_vendors')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{vendors.length}</p>
              <p className="text-sm text-gray-500">{t('vendors.active_sellers')}</p>
            </CardContent>
          </Card>

          {/* Total Users Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('vendors.total_users')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{allUsers.length}</p>
              <p className="text-sm text-gray-500">{t('vendors.all_registered')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('vendors.title')} ({filteredVendors.length})</h2>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm">{t('customers.import')}</Button>
                <Button variant="outline" size="sm">{t('customers.export')}</Button>
              </div>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('vendors.vendor').toUpperCase()}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('customers.email').toUpperCase()}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('vendors.role').toUpperCase()}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('customers.joined').toUpperCase()}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('customers.status').toUpperCase()}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('customers.actions').toUpperCase()}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor: any) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center text-white font-medium">
                          {vendor.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{vendor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{vendor.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {vendor.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-green-600">
                        {t('customers.active').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? `${t('vendors.no_vendors')} "${searchTerm}"` : t('vendors.no_vendors')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Vendors;
