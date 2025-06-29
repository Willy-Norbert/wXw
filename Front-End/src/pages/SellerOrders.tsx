
import React, { useState, useContext, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SellerBlocked } from '@/components/seller/SellerBlocked';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Clock, CheckCircle, Truck, Eye } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import api from '@/api/api';

interface SellerOrder {
  id: number;
  orderNumber: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  status: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  customerName: string | null;
  customerEmail: string | null;
  shippingAddress: string;
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

const SellerOrders = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);

  const userRole = user?.role?.toLowerCase();
  const isSeller = userRole === 'seller';

  // Check if seller is approved
  const sellerNotApproved = isSeller && (user?.sellerStatus !== 'ACTIVE' || !user?.isActive);

  if (sellerNotApproved) {
    return <SellerBlocked />;
  }

  // Fetch seller orders
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const response = await api.get('/sellers/my-orders');
      return response.data;
    },
    enabled: !!user && isSeller && user.sellerStatus === 'ACTIVE' && user.isActive
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status, isPaid, isDelivered }: { 
      orderId: number; 
      status?: string; 
      isPaid?: boolean; 
      isDelivered?: boolean; 
    }) => {
      const response = await api.put(`/orders/${orderId}/status`, {
        status,
        isPaid,
        isDelivered
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      setSelectedOrder(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string, isPaid: boolean, isDelivered: boolean) => {
    if (isDelivered) return 'bg-green-100 text-green-800';
    if (isPaid && status === 'processing') return 'bg-blue-100 text-blue-800';
    if (isPaid) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, isPaid: boolean, isDelivered: boolean) => {
    if (isDelivered) return 'Delivered';
    if (status) return status.charAt(0).toUpperCase() + status.slice(1);
    if (isPaid) return 'Paid';
    return 'Pending';
  };

  if (isLoading) {
    return (
      <DashboardLayout currentPage="orders">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="orders">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <div className="text-sm text-gray-600">
            Total Orders: {orders.length}
          </div>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 text-center">
                Orders for your products will appear here when customers make purchases.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order: SellerOrder) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Customer: {order.user?.name || order.customerName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Email: {order.user?.email || order.customerEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status, order.isPaid, order.isDelivered)}>
                        {getStatusText(order.status, order.isPaid, order.isDelivered)}
                      </Badge>
                      <p className="text-lg font-semibold mt-2">
                        {order.totalPrice.toLocaleString()} Rwf
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium mb-2">Items:</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3">
                            <img 
                              src={item.product.coverImage} 
                              alt={item.product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.product.name}</p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity} × {item.price.toLocaleString()} Rwf
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-medium mb-1">Shipping Address:</h4>
                      <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Update Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Status Update Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Update Order Status</CardTitle>
                <p className="text-sm text-gray-600">
                  Order #{selectedOrder.orderNumber}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Order Status</label>
                  <Select
                    onValueChange={(value) => {
                      updateOrderMutation.mutate({
                        orderId: selectedOrder.id,
                        status: value
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateOrderMutation.mutate({
                        orderId: selectedOrder.id,
                        isPaid: !selectedOrder.isPaid
                      });
                    }}
                    className={selectedOrder.isPaid ? 'bg-green-50 text-green-700' : ''}
                  >
                    {selectedOrder.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateOrderMutation.mutate({
                        orderId: selectedOrder.id,
                        isDelivered: !selectedOrder.isDelivered
                      });
                    }}
                    className={selectedOrder.isDelivered ? 'bg-green-50 text-green-700' : ''}
                  >
                    {selectedOrder.isDelivered ? 'Mark as Undelivered' : 'Mark as Delivered'}
                  </Button>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SellerOrders;
