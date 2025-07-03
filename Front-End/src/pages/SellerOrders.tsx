
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Search, 
  CheckCircle, 
  Edit3, 
  X, 
  Trash2, 
  Plus,
  Eye,
  Calendar,
  DollarSign,
  Truck,
  UserPlus
} from 'lucide-react';
import { getSellerOrders } from '@/api/sellers';
import { updateOrderStatus, deleteOrder } from '@/api/orders';
import { format } from 'date-fns';
import { AuthContext } from '@/contexts/AuthContext';
import { useSellerPermissions } from '@/hooks/useSellerPermissions';
import ThreeStepSellerOrderCreation from '@/components/seller/ThreeStepSellerOrderCreation';

const SellerOrders = () => {
  const { user } = React.useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const permissions = useSellerPermissions();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: getSellerOrders,
    enabled: !!user
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, updates }: { orderId: number; updates: any }) =>
      updateOrderStatus(orderId, updates.isPaid, updates.isDelivered, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete order",
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = (orderId: number, updates: any) => {
    updateStatusMutation.mutate({ orderId, updates });
  };

  const handleDeleteOrder = (orderId: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const handleCreateOrder = () => {
    setShowCreateOrderModal(true);
  };

  const filteredOrders = orders.filter((order: any) =>
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.displayEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="mr-3 h-8 w-8" />
            My Orders
          </h1>
          <p className="text-gray-600 mt-1">Manage orders for your products</p>
        </div>
        
        {/* Create Order Button - Only show if seller has permission */}
        {permissions.canCreateCustomers && (
          <Button 
            onClick={handleCreateOrder}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        )}
      </div>

      {/* Permissions Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Your Order Management Permissions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {permissions.canConfirmOrder && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Confirm Orders
              </Badge>
            )}
            {permissions.canEditOrder && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Edit3 className="w-3 h-3 mr-1" />
                Edit Orders
              </Badge>
            )}
            {permissions.canCancelOrder && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <X className="w-3 h-3 mr-1" />
                Cancel Orders
              </Badge>
            )}
            {permissions.canDeleteOrder && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <Trash2 className="w-3 h-3 mr-1" />
                Delete Orders
              </Badge>
            )}
            {permissions.canCreateCustomers && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <UserPlus className="w-3 h-3 mr-1" />
                Create Orders
              </Badge>
            )}
            {!permissions.canConfirmOrder && !permissions.canEditOrder && !permissions.canCancelOrder && !permissions.canDeleteOrder && !permissions.canCreateCustomers && (
              <Badge variant="outline" className="text-gray-600">
                No permissions assigned yet - Contact admin
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders by number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Orders will appear here when customers place them.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order: any) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status || 'PENDING'}
                      </Badge>
                      {order.isPaid && (
                        <Badge className="bg-green-100 text-green-800">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Paid
                        </Badge>
                      )}
                      {order.isDelivered && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Truck className="w-3 h-3 mr-1" />
                          Delivered
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium">{order.displayName}</p>
                        <p className="text-sm text-gray-600">{order.displayEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium text-lg">{order.totalPrice?.toLocaleString()} Rwf</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-medium flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Items</p>
                      <div className="space-y-2">
                        {order.items?.map((item: any, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            <img
                              src={item.product?.coverImage}
                              alt={item.product?.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.product?.name}</p>
                              <p className="text-xs text-gray-600">
                                Qty: {item.quantity} × {item.price?.toLocaleString()} Rwf
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Based on Permissions */}
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/orders/${order.id}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {/* Edit Order Button */}
                    {permissions.canEditOrder && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/orders/${order.id}/edit`}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit Order"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Confirm Payment Button */}
                    {permissions.canConfirmOrder && !order.isPaid && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, { isPaid: true })}
                        className="text-green-600 hover:text-green-700"
                        title="Confirm Payment"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Mark as Delivered Button */}
                    {permissions.canConfirmOrder && order.isPaid && !order.isDelivered && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, { isDelivered: true })}
                        className="text-blue-600 hover:text-blue-700"
                        title="Mark as Delivered"
                      >
                        <Truck className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Cancel Order Button */}
                    {permissions.canCancelOrder && order.status !== 'CANCELLED' && !order.isDelivered && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, { status: 'CANCELLED', isCancelled: true })}
                        className="text-orange-600 hover:text-orange-700"
                        title="Cancel Order"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Delete Order Button */}
                    {permissions.canDeleteOrder && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Three-Step Order Creation Modal */}
      <ThreeStepSellerOrderCreation
        isOpen={showCreateOrderModal}
        onClose={() => setShowCreateOrderModal(false)}
      />
    </div>
  );
};

export default SellerOrders;
