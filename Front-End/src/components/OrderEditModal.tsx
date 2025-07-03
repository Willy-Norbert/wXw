import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getOrderById, updateOrder } from '@/api/orders';
import { AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';
import { useSellerPermissions } from '@/hooks/useSellerPermissions';
import { Edit3, ArrowLeft, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const OrderEditModal = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const permissions = useSellerPermissions();

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Get order id from URL params
  const { id } = useParams<{ id: string }>();

  // Get order details
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(parseInt(id!)),
    enabled: !!id
  });

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!permissions.canEditOrder) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit orders",
        variant: "destructive",
      });
      navigate('/seller/orders');
    }
  }, [permissions.canEditOrder, navigate, toast]);

  // Populate form when order data loads
  useEffect(() => {
    if (order) {
      setShippingAddress(order.data.shippingAddress ? String(order.data.shippingAddress) : '');
      setPaymentMethod(order.data.paymentMethod ? String(order.data.paymentMethod) : '');
      setStatus(order.data.status || 'PENDING');
      setCustomerNotes(order.data.customerNotes || '');
    }
  }, [order]);

  const updateOrderMutation = useMutation({
    mutationFn: (data: any) => updateOrder(parseInt(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      navigate('/seller/orders');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData = {
      shippingAddress,
      paymentMethod,
      status,
      customerNotes
    };

    updateOrderMutation.mutate(updateData);
  };

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

  if (!permissions.canEditOrder) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900">Order not found</h3>
          <p className="text-gray-500">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/seller/orders')} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/seller/orders')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Edit3 className="mr-3 h-8 w-8" />
            Edit Order #{order.data.orderNumber}
          </h1>
          <p className="text-gray-600 mt-1">Update order details and status</p>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium">{order.data.customerName}</p>
              <p className="text-sm text-gray-600">{order.data.customerEmail || ''}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-lg">{order.data.totalPrice?.toLocaleString()} Rwf</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(order.data.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Current Status</p>
            <Badge className={getStatusColor(String(order.status))}>
              {order.status || 'PENDING'}
            </Badge>
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">Items</p>
            <div className="space-y-2">
              {order.data.items?.map((item: any, index: number) => (
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
        </CardContent>
      </Card>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <Textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter shipping address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAY_ON_DELIVERY">Pay on Delivery</SelectItem>
                    <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerNotes">Customer Notes</Label>
              <Textarea
                id="customerNotes"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Add any notes for the customer..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/seller/orders')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateOrderMutation.isPending}
          >
            {updateOrderMutation.isPending ? 'Updating...' : 'Update Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderEditModal;