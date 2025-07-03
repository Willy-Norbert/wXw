
import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Package, User, MapPin, CreditCard, Edit } from 'lucide-react';
import { getOrderById, updateOrderStatus } from '@/api/orders';
import { AuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import  OrderEditModal  from '@/components/OrderEditModal';

const OrderPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: orderResponse, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(Number(id!)),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ isPaid, isDelivered }: { isPaid?: boolean; isDelivered?: boolean }) => {
      return updateOrderStatus(Number(id!), isPaid, isDelivered);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast({
        title: 'Order updated',
        description: 'Order status has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update order',
        variant: 'destructive',
      });
    },
  });

  const order = orderResponse?.data;

  if (isLoading) {
    return (
      <DashboardLayout currentPage="orders">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout currentPage="orders">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-600">Order not found</h2>
          <Button onClick={() => navigate('/orders')} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handlePaymentToggle = (isPaid: boolean) => {
    updateStatusMutation.mutate({ isPaid });
  };

  const handleDeliveryToggle = (isDelivered: boolean) => {
    updateStatusMutation.mutate({ isDelivered });
  };

  const formatShippingAddress = (address: any) => {
    if (typeof address === 'object' && address !== null) {
      const { street, city, district, sector } = address;
      return [street, city, district, sector].filter(Boolean).join(', ');
    }
    return String(address);
  };

  const userRole = user?.role?.toLowerCase();
  const canEdit = userRole === 'ADMIN' || userRole === 'seller';
  const isSeller = userRole === 'seller';
  const isAdmin = userRole === 'ADMIN';

  // Filter items for sellers - show only their products
  const displayItems = isSeller 
    ? order.items?.filter((item: any) => item.product?.createdById === user?.id) || []
    : order.items || [];

  return (
    <DashboardLayout currentPage="orders">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/orders')} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600">
                Order placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Order</span>
              </Button>
            )}
            <Badge variant={order.isPaid ? 'default' : 'secondary'}>
              {order.isPaid ? 'Paid' : 'Pending Payment'}
            </Badge>
            <Badge variant={order.isDelivered ? 'default' : 'secondary'}>
              {order.isDelivered ? 'Delivered' : 'Pending Delivery'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Only show Order Status card for admins */}
          {isAdmin && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>Order Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment Status</p>
                      <p className="text-sm text-gray-600">Mark as paid/unpaid</p>
                    </div>
                    <Switch
                      checked={order.isPaid}
                      onCheckedChange={handlePaymentToggle}
                      disabled={updateStatusMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delivery Status</p>
                      <p className="text-sm text-gray-600">Mark as delivered</p>
                    </div>
                    <Switch
                      checked={order.isDelivered}
                      onCheckedChange={handleDeliveryToggle}
                      disabled={updateStatusMutation.isPending}
                    />
                  </div>

                  {order.isConfirmedByAdmin && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800">✓ Admin Confirmed</p>
                      <p className="text-xs text-green-600">
                        {order.confirmedAt &&
                          `Confirmed on ${new Date(order.confirmedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{order.user?.name || order.customerName || 'Guest'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{order.user?.email || order.customerEmail || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Shipping & Payment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Shipping Address</p>
                    <p className="font-medium">{formatShippingAddress(order.shippingAddress)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-medium">
                        {order.paymentMethod === 'PAY_ON_DELIVERY' ? 'Pay on Delivery' : 
                         order.paymentMethod === 'MTN' ? 'MTN Mobile Money' : 
                         order.paymentMethod}
                      </span>
                    </div>
                    {order.paymentMethod === 'MTN' && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-600">
                          <strong>MoMo Code:</strong> {order.paymentCode || '0784720884'}
                        </p>
                      </div>
                    )}
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                      <h4 className="font-medium text-sm mb-2">Order Status</h4>
                      <div className="space-y-1 text-xs">
                        <p><strong>Payment Status:</strong> <span className={`${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>{order.isPaid ? 'Paid' : 'Pending Payment'}</span></p>
                        <p><strong>Delivery Status:</strong> <span className={`${order.isDelivered ? 'text-green-600' : 'text-orange-600'}`}>{order.isDelivered ? 'Delivered' : 'Pending Delivery'}</span></p>
                        {order.isPaid && order.paidAt && <p><strong>Paid At:</strong> {new Date(order.paidAt).toLocaleString()}</p>}
                        {order.isDelivered && order.deliveredAt && <p><strong>Delivered At:</strong> {new Date(order.deliveredAt).toLocaleString()}</p>}
                        {order.isConfirmedByAdmin && order.confirmedAt && <p><strong>Admin Confirmed:</strong> {new Date(order.confirmedAt).toLocaleString()}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isSeller ? 'Your Products in this Order' : 'Order Items'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayItems.length > 0 ? (
                    displayItems.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={item.product?.coverImage}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product?.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">
                            Unit Price: {item.price?.toLocaleString()} Rwf
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {(item.price * item.quantity).toLocaleString()} Rwf
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      {isSeller ? 'No products from your store in this order' : 'No items found'}
                    </p>
                  )}
                </div>

                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span>Subtotal:</span>
                      <span>{((order.totalPrice || 0) - (order.shippingPrice || 0) + (order.discountAmount || 0)).toLocaleString()} Rwf</span>
                    </div>
                    {order.discountAmount && order.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span>Discount:</span>
                        <span>-{order.discountAmount.toLocaleString()} Rwf</span>
                      </div>
                    )}
                    {order.shippingPrice && order.shippingPrice > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span>Delivery Fee:</span>
                        <span>{order.shippingPrice.toLocaleString()} Rwf</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Total Amount:</span>
                    <span>{order.totalPrice?.toLocaleString()} Rwf</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {isAdmin && (
          <OrderEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            order={order}
            userRole={userRole || ''}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrderPreview;
