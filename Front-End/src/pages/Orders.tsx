import React, { useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Package, Plus, Trash2, Edit, Eye } from 'lucide-react';
import { getAllOrders, confirmOrderPayment, deleteOrder } from '@/api/orders';
import { AuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { OrderCreation } from '@/components/OrderCreation';
import { OrderUpdateDialog } from '@/components/OrderUpdateDialog';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isUpdateOrderOpen, setIsUpdateOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  console.log('📋 Orders page - User:', user?.role, user?.id);

  const { data: ordersResponse, isLoading, error } = useQuery({
    queryKey: ['all-orders', user?.role, user?.id],
    queryFn: async () => {
      console.log('🔄 Fetching orders for user role:', user?.role, 'userID:', user?.id);
      try {
        const response = await getAllOrders(user?.role?.toLowerCase() || '', user?.id);
        console.log('✅ Orders API response received:', response);
        return response;
      } catch (error) {
        console.error('❌ Orders fetch error:', error);
        throw error;
      }
    },
    enabled: !!user && (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'seller'),
    staleTime: 30000,
    retry: (failureCount, error) => {
      console.log('🔄 Orders query retry attempt:', failureCount, error);
      return failureCount < 2;
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async (orderId: number) => {
      console.log('💳 Confirming payment for order:', orderId);
      return confirmOrderPayment(orderId);
    },
    onSuccess: (data, orderId) => {
      console.log('✅ Payment confirmed successfully for order:', orderId);
      queryClient.invalidateQueries({ queryKey: ['all-orders', user?.role, user?.id] });
      toast({
        title: 'Payment confirmed',
        description: 'Order payment has been confirmed and customer notified',
      });
    },
    onError: (error: any, orderId) => {
      console.error('❌ Payment confirmation error for order:', orderId, error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to confirm payment',
        variant: 'destructive',
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      console.log('🗑️ Deleting order:', orderId);
      return deleteOrder(orderId);
    },
    onSuccess: (data, orderId) => {
      console.log('✅ Order deleted successfully:', orderId);
      queryClient.invalidateQueries({ queryKey: ['all-orders', user?.role, user?.id] });
      toast({
        title: 'Order deleted',
        description: 'Order has been deleted successfully',
      });
    },
    onError: (error: any, orderId) => {
      console.error('❌ Order deletion error for order:', orderId, error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete order',
        variant: 'destructive',
      });
    },
  });

  const orders = React.useMemo(() => {
    console.log('🔍 Processing orders data:', ordersResponse);
    
    let result = [];
    
    if (Array.isArray(ordersResponse?.data)) {
      result = ordersResponse.data;
      console.log('📊 Using ordersResponse.data (array):', result.length, 'items');
    } else if (Array.isArray(ordersResponse)) {
      result = ordersResponse;
      console.log('📊 Using ordersResponse (direct array):', result.length, 'items');
    } else {
      result = [];
      console.log('📊 No valid orders data found');
    }
    
    console.log('📋 Final processed orders:', result);
    return result;
  }, [ordersResponse]);

  const handleConfirmPayment = (orderId: number) => {
    console.log('🎯 Handling payment confirmation for order:', orderId);
    confirmPaymentMutation.mutate(orderId);
  };

  const handleDeleteOrder = (orderId: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      console.log('✅ User confirmed order deletion:', orderId);
      deleteOrderMutation.mutate(orderId);
    } else {
      console.log('❌ User cancelled order deletion:', orderId);
    }
  };

  const handleUpdateOrder = (order: any) => {
    console.log('✏️ Opening update dialog for order:', order.id);
    setSelectedOrder(order);
    setIsUpdateOrderOpen(true);
  };

  console.log('🖥️ Orders page render - Loading:', isLoading, 'Error:', error, 'Orders count:', orders.length);

  if (isLoading) {
    return (
      <DashboardLayout currentPage="orders">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    console.error('❌ Orders page error:', error);
    return (
      <DashboardLayout currentPage="orders">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">Failed to load orders</div>
            <Button onClick={() => {
              console.log('🔄 Retrying orders fetch...');
              queryClient.invalidateQueries({ queryKey: ['all-orders', user?.role, user?.id] });
            }}>
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="orders">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Order Management
            </h1>
          </div>
          <Button onClick={() => setIsCreateOrderOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders found</p>
                <p className="text-sm text-gray-500 mt-2">
                  {user?.role?.toLowerCase() === 'seller' ? 'Orders for your products will appear here' : 'All system orders will appear here'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link to={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-800">
                          #{order.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.user?.name || 'Guest'}</div>
                          <div className="text-sm text-gray-500">{order.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{order.items?.length || 0} item(s)</div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {order.totalPrice?.toLocaleString() || 0} Rwf
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.isPaid ? 'default' : 'secondary'}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </Badge>
                        {order.isConfirmedByAdmin && (
                          <Badge variant="outline" className="ml-1 text-green-600 border-green-600">
                            Admin Confirmed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.isDelivered ? 'default' : 'secondary'}>
                          {order.isDelivered ? 'Delivered' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/orders/${order.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateOrder(order)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!order.isPaid && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmPayment(order.id)}
                              disabled={confirmPaymentMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {confirmPaymentMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Confirm Payment
                                </>
                              )}
                            </Button>
                          )}
                          {order.isPaid && !order.isConfirmedByAdmin && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmPayment(order.id)}
                              disabled={confirmPaymentMutation.isPending}
                              variant="outline"
                              className="border-green-600 text-green-600 hover:bg-green-50"
                            >
                              {confirmPaymentMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Admin Confirm
                                </>
                              )}
                            </Button>
                          )}
                          {user?.role?.toLowerCase() === 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteOrder(order.id)}
                              disabled={deleteOrderMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <OrderCreation
          isOpen={isCreateOrderOpen}
          onClose={() => setIsCreateOrderOpen(false)}
          userRole={user?.role?.toLowerCase() || ''}
          userId={user?.id}
        />

        {selectedOrder && (
          <OrderUpdateDialog
            isOpen={isUpdateOrderOpen}
            onClose={() => {
              setIsUpdateOrderOpen(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
            userRole={user?.role?.toLowerCase() || ''}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
