import React, { useState, useEffect, useContext } from 'react';
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
import { getSellerProducts } from '@/api/sellers';
import { AuthContext } from '@/contexts/AuthContext';
import { useSellerPermissions } from '@/hooks/useSellerPermissions';
import { 
  Edit3, 
  ArrowLeft, 
  Package, 
  Calendar, 
  Plus, 
  Minus, 
  Save,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { format } from 'date-fns';

interface OrderItem {
  id?: number;
  productId: number;
  quantity: number;
  price: number;
  productName?: string;
  productImage?: string;
  isEditing?: boolean;
}

interface EnhancedOrderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
}

const EnhancedOrderEditModal: React.FC<EnhancedOrderEditModalProps> = ({
  isOpen,
  onClose,
  orderId
}) => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const permissions = useSellerPermissions();

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [originalItems, setOriginalItems] = useState<OrderItem[]>([]);

  // Get order details
  const { data: orderResponse, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId && isOpen
  });

  // Get seller's products for adding new items
  const { data: sellerProducts = [] } = useQuery({
    queryKey: ['seller-products'],
    queryFn: getSellerProducts,
    enabled: isOpen
  });

  const order = orderResponse?.data;

  useEffect(() => {
    if (!permissions.canEditOrder && isOpen) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit orders",
        variant: "destructive",
      });
      onClose();
    }
  }, [permissions.canEditOrder, isOpen, toast, onClose]);

  // Populate form when order data loads
  useEffect(() => {
    if (order) {
      setShippingAddress(order.shippingAddress ? String(order.shippingAddress) : '');
      setPaymentMethod(order.paymentMethod ? String(order.paymentMethod) : '');
      setStatus(order.status || 'PENDING');
      setCustomerNotes(order.customerNotes || '');
      
      // Filter and set order items to only show seller's products
      const sellerItems = order.items?.filter((item: any) => 
        item.product?.createdById === user?.id
      ).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: item.product?.name,
        productImage: item.product?.coverImage,
        isEditing: false
      })) || [];
      
      setOrderItems(sellerItems);
      setOriginalItems(sellerItems);
    }
  }, [order, user?.id]);

  const updateOrderMutation = useMutation({
    mutationFn: (data: any) => updateOrder(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      onClose();
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
      customerNotes,
      // Include updated items with seller-specific changes
      items: orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice: calculateTotal()
    };

    updateOrderMutation.mutate(updateData);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleAddItem = () => {
    setOrderItems(prev => [...prev, {
      productId: 0,
      quantity: 1,
      price: 0,
      productName: '',
      productImage: '',
      isEditing: true
    }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    setOrderItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (field === 'productId') {
        const product = sellerProducts.data.find((p: any) => p.id === value);

        if (product) {
          newItems[index].productName = product.name;
          newItems[index].price = product.price;
          newItems[index].productImage = product.coverImage;
        }
      }
      
      return newItems;
    });
  };

  const toggleItemEdit = (index: number) => {
    setOrderItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], isEditing: !newItems[index].isEditing };
      return newItems;
    });
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

  if (orderLoading) {
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
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Edit3 className="mr-3 h-8 w-8" />
            Edit Order #{order.orderNumber}
          </h1>
          <p className="text-gray-600 mt-1">Update order details, products, and pricing</p>
        </div>
        <Badge className={getStatusColor(order.status)} variant="secondary">
          {order.status || 'PENDING'}
        </Badge>
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
              <p className="font-medium">{order.customerName || order.user?.name}</p>
              <p className="text-sm text-gray-600">{order.customerEmail || order.user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Total</p>
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
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
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

        {/* Editable Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Your Products in this Order
              </div>
              <Button
                type="button"
                onClick={handleAddItem}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderItems.length > 0 ? (
              orderItems.map((item, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Product {index + 1}</h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleItemEdit(index)}
                      >
                        <Edit3 className="w-4 h-4" />
                        {item.isEditing ? 'Save' : 'Edit'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {item.isEditing || !item.productName ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Product</Label>
                        <Select
                          value={item.productId.toString()}
                          onValueChange={(value) => handleItemChange(index, 'productId', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your product" />
                          </SelectTrigger>
                          <SelectContent>
                            {sellerProducts.data.map((product: any) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} - {product.price?.toLocaleString()} Rwf
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Custom Price (Rwf)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="Override default price"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × {item.price?.toLocaleString()} Rwf
                        </p>
                        <p className="text-sm font-medium">
                          Total: {(item.price * item.quantity).toLocaleString()} Rwf
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No products from your store in this order</p>
                <p className="text-sm text-gray-500">Click "Add Product" to include your products</p>
              </div>
            )}

            {orderItems.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <DollarSign className="w-5 h-5" />
                    Updated Total:
                  </span>
                  <span className="text-xl font-bold text-purple-600">
                    {calculateTotal().toLocaleString()} Rwf
                  </span>
                </div>
                <p className="text-sm text-purple-600 mt-1">
                  This reflects your products only. Other sellers' items are calculated separately.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateOrderMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {updateOrderMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedOrderEditModal;