
import React, { useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Package, Plus, Trash2, Edit, Eye, X } from 'lucide-react';
import { getAllOrders, confirmOrderPayment, deleteOrder, updateOrderStatus } from '@/api/orders';
import { AuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ThreeStepOrderCreation } from '@/components/admin/ThreeStepOrderCreation';
import { ThreeStepSellerOrderCreation } from '@/components/seller/ThreeStepSellerOrderCreation';
import { OrderUpdateDialog } from '@/components/OrderUpdateDialog';
import { Link } from 'react-router-dom';
import { useSellerPermissions } from '@/hooks/useSellerPermissions';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isUpdateOrderOpen, setIsUpdateOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Get seller permissions for permission-based button visibility
  const sellerPermissions = useSellerPermissions();

  const { data: ordersResponse, isLoading, error } = useQuery({
    queryKey: ['all-orders', user?.role, user?.id],
    queryFn: async () => {
      return getAllOrders(user?.role?.toLowerCase() || '', user?.id);
    },
    enabled: !!user && (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'seller'),
    staleTime: 30000,
    retry: (failureCount, error) => failureCount < 2,
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (orderId: number) => confirmOrderPayment(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['all-orders', user?.role, user?.id] });
      toast({ title: 'Payment confirmed', description: `Order #${orderId} payment confirmed.` });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to confirm payment',
        variant: 'destructive',
      });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) =>
      updateOrderStatus(orderId, undefined, undefined, { status: 'CANCELLED', isCancelled: true }),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['all-orders', user?.role, user?.id] });
      toast({ title: 'Order cancelled', description: `Order #${orderId} has been cancelled.` });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel order',
        variant: 'destructive',
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: number) => deleteOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['all-orders', user?.role, user?.id] });
      toast({ title: 'Order deleted', description: `Order #${orderId} has been deleted.` });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete order',
        variant: 'destructive',
      });
    },
  });

  const orders = React.useMemo(() => {
    if (Array.isArray(ordersResponse?.data)) return ordersResponse.data;
    if (Array.isArray(ordersResponse)) return ordersResponse;
    return [];
  }, [ordersResponse]);

  const handleConfirmPayment = (orderId: number) => {
    confirmPaymentMutation.mutate(orderId);
  };

  const handleCancelOrder = (orderId: number) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  const handleDeleteOrder = (orderId: number) => {
    if (window.confirm('Are you sure you want to delete this order? This cannot be undone.')) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const handleUpdateOrder = (order: any) => {
    setSelectedOrder(order);
    setIsUpdateOrderOpen(true);
  };

  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === 'admin';
  const isSeller = userRole === 'seller';

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
    return (
      <DashboardLayout currentPage="orders">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">Failed to load orders</div>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['all-orders', user?.role, user?.id] })}>
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
            <h1 className="text-3xl font-bold text-purple-700">Order Management</h1>
          </div>
          {(isAdmin || (isSeller && sellerPermissions.canCreateCustomers)) && (
            <Button onClick={() => setIsCreateOrderOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          )}
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
                      <TableCell>
                        <Link to={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                          #{order.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.user?.name || order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.user?.email || order.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        {isSeller 
                          ? order.items?.filter((item: any) => item.product?.createdById === user?.id).length || 0
                          : order.items?.length || 0
                        }
                      </TableCell>
                      <TableCell>{order.totalPrice?.toLocaleString() || 0} Rwf</TableCell>
                      <TableCell>
                        <Badge variant={order.isPaid ? 'default' : 'secondary'}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </Badge>
                        {order.isConfirmedByAdmin && order.status !== 'CANCELLED' && (
                          <Badge variant="outline" className="ml-1 text-green-600 border-green-600">
                            Admin Confirmed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.isDelivered ? 'default' : 'secondary'}>
                          {order.isDelivered ? 'Delivered' : 'Pending'}
                        </Badge>
                        {order.status === 'CANCELLED' && (
                          <Badge variant="destructive" className="ml-1">Cancelled</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Link to={`/orders/${order.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          
                          {/* Admin actions - always show all buttons */}
                          {isAdmin && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleUpdateOrder(order)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              {!order.isPaid && (
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirmPayment(order.id)}
                                  disabled={confirmPaymentMutation.isPending}
                                  className="bg-green-600 text-white"
                                >
                                  {confirmPaymentMutation.isPending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Confirm
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelOrder(order.id)}
                                className="text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteOrder(order.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          {/* Seller actions - permission-based button visibility */}
                          {isSeller && order.status !== 'CANCELLED' && (
                            <>
                              {/* Edit Order - only if has edit permission */}
                              {sellerPermissions.canEditOrder && (
                                <Button size="sm" variant="outline" onClick={() => handleUpdateOrder(order)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {/* Confirm Payment - only if has confirm permission and order is unpaid */}
                              {sellerPermissions.canConfirmOrder && !order.isPaid && (
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirmPayment(order.id)}
                                  disabled={confirmPaymentMutation.isPending}
                                  className="bg-green-600 text-white"
                                >
                                  {confirmPaymentMutation.isPending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Confirm
                                    </>
                                  )}
                                </Button>
                              )}
                              
                              {/* Cancel Order - only if has cancel permission */}
                              {sellerPermissions.canCancelOrder && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="text-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {/* Delete Order - only if has delete permission */}
                              {sellerPermissions.canDeleteOrder && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </>
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

        {(isAdmin || isSeller) && (
          <>
            {/* Order Creation Dialog - show for admin or seller with create permission */}
            {(isAdmin) && (
              <ThreeStepOrderCreation isOpen={isCreateOrderOpen} onClose={() => setIsCreateOrderOpen(false)} />
            )}
               {((isSeller && sellerPermissions.canCreateCustomers)) && (
              <ThreeStepSellerOrderCreation isOpen={isCreateOrderOpen} onClose={() => setIsCreateOrderOpen(false)} />
            )}



            {/* Order Update Dialog - show for admin or seller with edit permission */}
            {selectedOrder && (isAdmin || (isSeller && sellerPermissions.canEditOrder)) && (
              <OrderUpdateDialog
                isOpen={isUpdateOrderOpen}
                onClose={() => {
                  setIsUpdateOrderOpen(false);
                  setSelectedOrder(null);
                }}
                order={selectedOrder}
                userRole={userRole || ''}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
