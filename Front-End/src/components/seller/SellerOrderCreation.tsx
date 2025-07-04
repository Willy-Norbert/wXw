
import React, { useState, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/api/orders';
import { getProducts } from '@/api/products';
import { AuthContext } from '@/contexts/AuthContext';
import { Package, Plus, Minus, User } from 'lucide-react';
import api from '@/api/api';

interface SellerOrderItem {
  productId: number;
  quantity: number;
  price: number;
  productName: string;
}

interface SellerOrderCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SellerOrderCreation: React.FC<SellerOrderCreationProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'customer123'
  });
  const [orderData, setOrderData] = useState({
    shippingAddress: '',
    paymentMethod: 'PAY_ON_DELIVERY',
    items: [] as SellerOrderItem[]
  });

  // Get seller's products
  const { data: productsResponse } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      return api.get('/sellers/my-products');
    },
    enabled: isOpen && !!user
  });

  // Get seller's customers
  const { data: customersResponse } = useQuery({
    queryKey: ['seller-customers'],
    queryFn: async () => {
      return api.get('/sellers/my-customers');
    },
    enabled: isOpen && !!user
  });

  const products = productsResponse?.data || [];
  const customers = customersResponse?.data || [];

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast({
        title: "Order created successfully",
        description: "New order has been placed"
      });
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating order",
        description: error.response?.data?.message || "Failed to create order",
        variant: "destructive"
      });
    }
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      return api.post('/auth/register', {
        ...customerData,
        role: 'buyer'
      });
    },
    onSuccess: (data) => {
      const customerId = data.data?.user?.id || data.data?.id;
      setSelectedCustomerId(customerId);
      queryClient.invalidateQueries({ queryKey: ['seller-customers'] });
      toast({
        title: "Customer created successfully",
        description: "New customer has been added"
      });
      setIsCreatingNewCustomer(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating customer",
        description: error.response?.data?.message || "Failed to create customer",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setSelectedCustomerId(null);
    setIsCreatingNewCustomer(false);
    setNewCustomerData({
      name: '',
      email: '',
      phone: '',
      password: 'customer123'
    });
    setOrderData({
      shippingAddress: '',
      paymentMethod: 'PAY_ON_DELIVERY',
      items: []
    });
  };

  const handleAddItem = () => {
    setOrderData(prev => ({
      ...prev,
      items: [...prev.items, { productId: 0, quantity: 1, price: 0, productName: '' }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: keyof SellerOrderItem, value: any) => {
    setOrderData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (field === 'productId') {
        const product = products.find((p: any) => p.id === value);
        if (product) {
          newItems[index].productName = product.name;
          newItems[index].price = product.price;
        }
      }
      
      return { ...prev, items: newItems };
    });
  };

  const calculateTotal = () => {
    return orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCreateCustomer = () => {
    if (!newCustomerData.name || !newCustomerData.email) {
      toast({
        title: "Please fill required fields",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }
    createCustomerMutation.mutate(newCustomerData);
  };

  const handleCreateOrder = () => {
    if (!selectedCustomerId || orderData.items.length === 0 || !orderData.shippingAddress) {
      toast({
        title: "Please complete order details",
        description: "Select customer, add items, and provide shipping address",
        variant: "destructive"
      });
      return;
    }

    const validItems = orderData.items.filter(item => item.productId > 0 && item.quantity > 0);
    if (validItems.length === 0) {
      toast({
        title: "Please add valid items",
        description: "At least one item with valid product and quantity is required",
        variant: "destructive"
      });
      return;
    }

    const selectedCustomer = customers?.find((c: any) => c.id === selectedCustomerId);
    
  createOrderMutation.mutate({
  customerName: selectedCustomer?.name || '',
  customerEmail: selectedCustomer?.email || '',
  shippingAddress: orderData.shippingAddress,
  paymentMethod: orderData.paymentMethod,
  items: validItems.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.price
  })),
  totalPrice: calculateTotal(),
  shippingPrice: 1200 // ✅ ADD THIS LINE — or whatever default you're using
});

  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Select Customer</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={!isCreatingNewCustomer ? "default" : "outline"}
                onClick={() => setIsCreatingNewCustomer(false)}
                className="h-20 flex flex-col space-y-2"
              >
                <User className="w-6 h-6" />
                <span>Existing Customer</span>
              </Button>
              <Button
                variant={isCreatingNewCustomer ? "default" : "outline"}
                onClick={() => setIsCreatingNewCustomer(true)}
                className="h-20 flex flex-col space-y-2"
              >
                <Plus className="w-6 h-6" />
                <span>New Customer</span>
              </Button>
            </div>

            {!isCreatingNewCustomer ? (
              <div className="space-y-2">
                <Label>Select Customer</Label>
                <Select
                  value={selectedCustomerId?.toString() || ""}
                  onValueChange={(value) => setSelectedCustomerId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name} ({customer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">New Customer Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={newCustomerData.name}
                      onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={newCustomerData.email}
                      onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Customer email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newCustomerData.phone}
                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Customer phone"
                  />
                </div>
                <Button
                  onClick={handleCreateCustomer}
                  disabled={createCustomerMutation.isPending}
                  className="w-full"
                >
                  {createCustomerMutation.isPending ? 'Creating...' : 'Create Customer'}
                </Button>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Order Details</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shipping Address *</Label>
                <Input
                  value={orderData.shippingAddress}
                  onChange={(e) => setOrderData(prev => ({ ...prev, shippingAddress: e.target.value }))}
                  placeholder="Enter shipping address"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={orderData.paymentMethod}
                  onValueChange={(value) => setOrderData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAY_ON_DELIVERY">Pay on Delivery</SelectItem>
                    <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Order Items</h3>
              <Button onClick={handleAddItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {orderData.items.map((item, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        {products.map((product: any) => (
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
                </div>

                {item.productName && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">
                      <strong>Total:</strong> {(item.price * item.quantity).toLocaleString()} Rwf
                    </p>
                  </div>
                )}
              </div>
            ))}

            {orderData.items.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No items added yet</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {orderData.items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Order Summary</h4>
              <p className="text-lg font-bold">Total: {calculateTotal().toLocaleString()} Rwf</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={createOrderMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
