import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getProducts } from '@/api/products';
import { createOrder } from '@/api/orders';
import { useAuth } from '@/contexts/AuthContext';
import { useSellerPermissions } from '@/hooks/useSellerPermissions';
import { ShoppingCart, User, Package, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

const OrderCreation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const permissions = useSellerPermissions();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!permissions.canCreateCustomers) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create orders",
        variant: "destructive",
      });
      navigate('/seller/orders');
    }
  }, [permissions.canCreateCustomers, navigate, toast]);

  // Get products (filtered for sellers to only show their products)
  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    enabled: !!user
  });

  const products = Array.isArray(productsResponse) ? productsResponse : productsResponse?.data || [];

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      navigate('/seller/orders');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create order",
        variant: "destructive",
      });
    }
  });

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;

    const existingItem = selectedProducts.find(item => item.productId === product.id);
    if (existingItem) {
      setSelectedProducts(prev => 
        prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedProducts(prev => [...prev, {
        productId: product.id,
        quantity: 1,
        price: product.price
      }]);
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedProducts(prev => prev.filter(item => item.productId !== productId));
    } else {
      setSelectedProducts(prev => 
        prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerEmail || !shippingAddress || selectedProducts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select at least one product",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod: paymentMethod || 'PAY_ON_DELIVERY',
      items: selectedProducts,
      totalPrice: calculateTotal(),
      shippingPrice: 1200, // Example shipping price, can be dynamic
    };

    createOrderMutation.mutate(orderData);
  };

  if (!permissions.canCreateCustomers) {
    return null;
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
            <ShoppingCart className="mr-3 h-8 w-8" />
            Create New Order
          </h1>
          <p className="text-gray-600 mt-1">Create an order for a customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter customer email"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter customer phone (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address *</Label>
              <Textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter complete shipping address"
                required
              />
            </div>
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
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productSelect">Add Product</Label>
              <Select onValueChange={addProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product to add" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - {product.price.toLocaleString()} Rwf
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Selected Products:</h4>
                {selectedProducts.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <img
                          src={product?.coverImage}
                          alt={product?.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{product?.name}</p>
                          <p className="text-sm text-gray-600">{item.price.toLocaleString()} Rwf each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <span className="ml-4 font-medium">
                          {(item.price * item.quantity).toLocaleString()} Rwf
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center p-3 border-t font-bold text-lg">
                  <span>Total:</span>
                  <span>{calculateTotal().toLocaleString()} Rwf</span>
                </div>
              </div>
            )}
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
            disabled={createOrderMutation.isPending || selectedProducts.length === 0}
          >
            {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderCreation;