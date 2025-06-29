import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface Seller {
  id: number;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  gender: string;
  sellerStatus: 'INACTIVE' | 'ACTIVE' | 'SUSPENDED';
  isActive: boolean;
  createdAt: string;
}

interface CreateSellerData {
  name: string;
  email: string;
  password: string;
  role: 'seller';
}

const SellerManagement = () => {
  const { t } = useLanguage();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const form = useForm<CreateSellerData>({
    defaultValues: { name: '', email: '', password: '', role: 'seller' },
  });

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate('/login');
    if (user.role !== 'ADMIN') navigate('/dashboard');
  }, [user, loading, navigate]);

  const { data: sellersData, isLoading, error } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => api.get('/sellers/pending'),
    enabled: !!user && user.role === 'ADMIN',
  });

  // ✅ Create Seller mutation (reuses auth/register endpoint)
  const createSellerMutation = useMutation({
    mutationFn: (data: CreateSellerData) => {
      console.log('Creating seller:', data);
      return api.post('/auth/register', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sellers']);
      setIsCreateModalOpen(false);
      form.reset();
      toast({ title: 'Success', description: 'Seller created successfully.' });
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create seller';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    },
  });

  const updateSellerStatusMutation = useMutation({
    mutationFn: ({ sellerId, status, isActive }: any) =>
      api.put(`/sellers/${sellerId}/status`, { status, isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['sellers']);
      toast({ title: 'Success', description: 'Seller status updated.' });
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || err.message || 'Error updating status';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    },
  });

  const sellers: Seller[] = sellersData?.data || [];
  const filteredSellers = sellers.filter((s) =>
    [s.name, s.email, s.businessName].some((str) =>
      str.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleStatusUpdate = (id: number, newStatus: any) =>
    updateSellerStatusMutation.mutate({ sellerId: id, status: newStatus, isActive: newStatus === 'ACTIVE' });

  const getStatusBadge = (s: Seller) =>
    s.sellerStatus === 'ACTIVE' && s.isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : s.sellerStatus === 'SUSPENDED' ? (
      <Badge className="bg-red-100 text-red-800">Suspended</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    );

  const counts = {
    total: sellers.length,
    active: sellers.filter((s) => s.sellerStatus === 'ACTIVE' && s.isActive).length,
    pending: sellers.filter((s) => s.sellerStatus === 'INACTIVE').length,
    suspended: sellers.filter((s) => s.sellerStatus === 'SUSPENDED').length,
  };

  if (loading || isLoading)
    return (
      <DashboardLayout currentPage="seller-management">
        <div className="flex items-center justify-center min-h-[400px]">{t('common.loading')}</div>
      </DashboardLayout>
    );

  if (!user || user.role !== 'ADMIN') return null;

  if (error)
    return (
      <DashboardLayout currentPage="seller-management">
        <div className="flex items-center justify-center min-h-[400px] text-red-600">
          {t('error.failed_load_products')}
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout currentPage="seller-management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => form.reset()}>
                <Plus className="w-4 h-4 mr-2" /> Add Seller
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Seller</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(data => createSellerMutation.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: 'Name required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{
                      required: 'Email required',
                      pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Invalid email' },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    rules={{
                      required: 'Password required',
                      minLength: { value: 6, message: 'Min 6 chars' },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={createSellerMutation.isLoading} className="flex-1">
                      {createSellerMutation.isLoading ? 'Creating...' : 'Create Seller'}
                    </Button>
                    <Button variant="outline" type="button" onClick={() => form.reset()} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['Total Sellers', 'Active', 'Pending', 'Suspended'].map((title, idx) => (
            <Card key={title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${
                    title === 'Active'
                      ? 'text-green-600'
                      : title === 'Pending'
                      ? 'text-yellow-600'
                      : title === 'Suspended'
                      ? 'text-red-600'
                      : ''
                  }`}
                >
                  {idx === 0
                    ? counts.total
                    : idx === 1
                    ? counts.active
                    : idx === 2
                    ? counts.pending
                    : counts.suspended}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search sellers..."
            className="pl-10 bg-gray-50 border-gray-200"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">All Sellers ({filteredSellers.length})</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['SELLER', 'BUSINESS', 'CONTACT', 'STATUS', 'JOINED', 'ACTIONS'].map(col => (
                  <th key={col} className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSellers.length > 0 ? (
                filteredSellers.map(seller => (
                  <tr key={seller.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center text-white font-medium">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{seller.name}</div>
                        <div className="text-sm text-gray-500">{seller.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{seller.businessName}</div>
                      <div className="text-sm text-gray-500 capitalize">{seller.gender}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{seller.phone}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(seller)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      {seller.sellerStatus === 'INACTIVE' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusUpdate(seller.id, 'ACTIVE')}
                          disabled={updateSellerStatusMutation.isLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      )}
                      {seller.sellerStatus === 'ACTIVE' && seller.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(seller.id, 'SUSPENDED')}
                          disabled={updateSellerStatusMutation.isLoading}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Suspend
                        </Button>
                      )}
                      {(seller.sellerStatus === 'SUSPENDED' || !seller.isActive) && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleStatusUpdate(seller.id, 'ACTIVE')}
                          disabled={updateSellerStatusMutation.isLoading}
                        >
                          <Clock className="w-4 h-4 mr-1" /> Reactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm
                      ? `No sellers found matching "${searchTerm}"`
                      : 'No sellers found'}
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

export default SellerManagement;
