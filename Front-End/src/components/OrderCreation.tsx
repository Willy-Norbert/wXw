
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, createUser } from '@/api/users';
import { getProducts } from '@/api/products';
import { createOrder, CreateOrderData } from '@/api/orders';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, X, UserPlus } from 'lucide-react';

interface OrderCreationProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  userId?: number;
}

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  productName: string;
  productImage?: string;
}

interface NewUser {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export const OrderCreation: React.FC<OrderCreationProps> = ({ 
  isOpen, 
  onClose, 
  userRole,
  userId: currentUserId 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [orderType, setOrderType] = useState<'existing' | 'new'>('existing');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState<NewUser>({ name: '', email: '', phone: '', address: '' });
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(1200);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Fetch users for admin
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    enabled: userRole === 'admin',
  });

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create order",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      console.log('New user created:', data.data);
      return data.data;
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const users = usersData?.data || [];
  const products = productsData?.data || [];
  
  // Filter products for sellers (only their products)
  const availableProducts = userRole === 'seller' 
    ? products.filter((p: any) => p.createdById === currentUserId)
    : products;

  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: 0, quantity: 1, price: 0, productName: '', productImage: '' }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Update product name, price, and image when product is selected
    if (field === 'productId') {
      const product = availableProducts.find((p: any) => p.id === value);
      if (product) {
        updated[index].productName = product.name;
        updated[index].price = product.price;
        updated[index].productImage = product.coverImage;
      }
    }
    
    setOrderItems(updated);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + deliveryFee;
  };

  const handleSubmit = async () => {
    if (!shippingAddress || !paymentMethod || orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one item",
        variant: "destructive",
      });
      return;
    }

    const validItems = orderItems.filter(item => item.productId > 0 && item.quantity > 0);
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add valid items to the order",
        variant: "destructive",
      });
      return;
    }

    let finalUserId = selectedUserId;

    // Create new user if needed
    if (orderType === 'new') {
      if (!newUser.name || !newUser.email) {
        toast({
          title: "Error",
          description: "Please provide name and email for new user",
          variant: "destructive",
        });
        return;
      }

      try {
        const createdUser = await createUserMutation.mutateAsync({
          ...newUser,
          role: 'buyer',
          password: 'tempPassword123' // You might want to handle this differently
        });
        finalUserId = createdUser.id;
      } catch (error) {
        return; // Error already handled in mutation
      }
    }

    if (!finalUserId) {
      toast({
        title: "Error",
        description: "Please select a customer or create a new one",
        variant: "destructive",
      });
      return;
    }

    const orderData: CreateOrderData = {
      userId: finalUserId,
      shippingAddress,
      paymentMethod,
      items: validItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice: calculateTotal(),
      shippingPrice: deliveryFee
    };

    createOrderMutation.mutate(orderData);
  };

  const handleClose = () => {
    setOrderType('existing');
    setSelectedUserId(null);
    setNewUser({ name: '', email: '', phone: '', address: '' });
    setShippingAddress('');
    setPaymentMethod('');
    setDeliveryFee(1200);
    setOrderItems([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-4">
            <Label>Customer Selection *</Label>
            <RadioGroup value={orderType} onValueChange={(value: 'existing' | 'new') => setOrderType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing">Select Existing Customer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">Create New Customer</Label>
              </div>
            </RadioGroup>

            {orderType === 'existing' ? (
              <Select value={selectedUserId?.toString() || ''} onValueChange={(value) => setSelectedUserId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter((user: any) => user.role.toLowerCase() === 'buyer').map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Customer email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="Customer phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={newUser.address}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                    placeholder="Customer address"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Shipping Address */}
          <div className="space-y-2">
            <Label>Shipping Address *</Label>
            <Textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter shipping address"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Fee */}
          <div className="space-y-2">
            <Label>Delivery Fee (Rwf)</Label>
            <Input
              type="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(parseInt(e.target.value) || 0)}
              placeholder="Delivery fee"
            />
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Order Items *</Label>
              <Button type="button" onClick={addOrderItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {orderItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end border p-4 rounded">
                <div className="col-span-4">
                  <Label>Product</Label>
                  <Select 
                    value={item.productId.toString()} 
                    onValueChange={(value) => updateOrderItem(index, 'productId', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product: any) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          <div className="flex items-center gap-2">
                            <img src={product.coverImage} alt={product.name} className="w-8 h-8 object-cover rounded" />
                            <span>{product.name} - {product.price.toLocaleString()} Rwf</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="col-span-3">
                  <Label>Subtotal</Label>
                  <div className="h-10 flex items-center text-sm font-medium">
                    {(item.price * item.quantity).toLocaleString()} Rwf
                  </div>
                </div>

                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOrderItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {orderItems.length > 0 && (
              <div className="text-right space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{calculateSubtotal().toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span className="font-medium">{deliveryFee.toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{calculateTotal().toLocaleString()} Rwf</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleSubmit}
              disabled={createOrderMutation.isPending || createUserMutation.isPending}
              className="flex-1"
            >
              {createOrderMutation.isPending || createUserMutation.isPending ? 'Creating...' : 'Create Order'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
