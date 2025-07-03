
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers } from '@/api/users';
import { registerUser } from '@/api/auth';
import { createOrder } from '@/api/orders';
import { getProducts } from '@/api/products';
import { ArrowLeft, ArrowRight, User, UserPlus, Package, Plus, Minus } from 'lucide-react';

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  productName: string;
}

interface ThreeStepOrderCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThreeStepOrderCreation: React.FC<ThreeStepOrderCreationProps> = ({
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [orderData, setOrderData] = useState({
    shippingAddress: '',
    paymentMethod: 'MTN',
    items: [] as OrderItem[],
    totalPrice: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['all-users'],
    queryFn: getAllUsers,
    enabled: isOpen,
    staleTime: 0,
    retry: 2
  });

  const { data: productsResponse } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    enabled: isOpen && currentStep === 3
  });

  const products = productsResponse?.data || [];

  const createUserMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      const userId = data?.user?.id || data?.id;
      setSelectedUserId(userId);
      toast({
        title: "User created successfully",
        description: "New buyer has been registered and can now proceed to order creation"
      });
      if (newUserData.address) {
        setOrderData(prev => ({ ...prev, shippingAddress: newUserData.address }));
      }
      setCurrentStep(3);
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating user",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive"
      });
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast({
        title: "Order created successfully",
        description: "New order has been placed"
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating order",
        description: error.response?.data?.message || "Failed to create order",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedUserId(null);
    setIsCreatingNewUser(false);
    setNewUserData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: ''
    });
    setOrderData({
      shippingAddress: '',
      paymentMethod: 'MTN',
      items: [],
      totalPrice: 0
    });
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Calculate total when items change
  useEffect(() => {
    const total = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrderData(prev => ({ ...prev, totalPrice: total }));
  }, [orderData.items]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (isCreatingNewUser) {
        setCurrentStep(2);
      } else if (selectedUserId) {
        setCurrentStep(3);
      } else {
        toast({
          title: "Please select a user",
          description: "Choose an existing user or create a new one",
          variant: "destructive"
        });
      }
    } else if (currentStep === 2) {
      if (!newUserData.name || !newUserData.email || !newUserData.password) {
        toast({
          title: "Please fill required fields",
          description: "Name, email and password are required",
          variant: "destructive"
        });
        return;
      }
      createUserMutation.mutate({
        ...newUserData,
        role: 'buyer'
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
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

  const handleCreateOrder = () => {
    if (!selectedUserId || orderData.items.length === 0 || !orderData.shippingAddress) {
      toast({
        title: "Please complete order details",
        description: "Select items, add shipping address, and ensure all fields are filled",
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

    // Ensure we have a valid selectedUserId
    if (!selectedUserId || typeof selectedUserId !== 'number' || isNaN(selectedUserId)) {
      toast({
        title: "Invalid user selection",
        description: "Please select a valid customer",
        variant: "destructive"
      });
      return;
    }

    console.log('Creating order with userId:', selectedUserId, 'type:', typeof selectedUserId);

    createOrderMutation.mutate({
      userId: selectedUserId,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      items: validItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice: orderData.totalPrice
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <User className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Step 1: Select or Create Buyer</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={!isCreatingNewUser ? "default" : "outline"}
          onClick={() => setIsCreatingNewUser(false)}
          className="h-24 flex flex-col items-center justify-center space-y-2"
        >
          <User className="w-6 h-6" />
          <span>Select Existing User</span>
        </Button>
        <Button
          variant={isCreatingNewUser ? "default" : "outline"}
          onClick={() => setIsCreatingNewUser(true)}
          className="h-24 flex flex-col items-center justify-center space-y-2"
        >
          <UserPlus className="w-6 h-6" />
          <span>Create New Buyer</span>
        </Button>
      </div>

      {!isCreatingNewUser && (
        <div className="space-y-2">
          <Label htmlFor="user-select">Select User</Label>
          {usersLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            </div>
          ) : usersError ? (
            <div className="text-red-600 p-2 border border-red-300 rounded">
              Error loading users. Please try again.
            </div>
          ) : (
            <Select value={selectedUserId?.toString() || ""} onValueChange={(value) => setSelectedUserId(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(users?.data) ? users.data.map((user: any) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </SelectItem>
                )) : Array.isArray(users) ? users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </SelectItem>
                )) : (
                  <SelectItem value="no-users" disabled>No users available</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <UserPlus className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Step 2: Create New Buyer</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={newUserData.name}
            onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
            placeholder="Enter full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={newUserData.email}
            onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
            placeholder="Enter email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          value={newUserData.password}
          onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
          placeholder="Enter password"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={newUserData.phone}
            onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
            placeholder="Enter phone number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={newUserData.address}
            onChange={(e) => setNewUserData({...newUserData, address: e.target.value})}
            placeholder="Enter address"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Package className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Step 3: Create Order</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shipping">Shipping Address *</Label>
          <Input
            id="shipping"
            value={orderData.shippingAddress}
            onChange={(e) => setOrderData({...orderData, shippingAddress: e.target.value})}
            placeholder="Enter shipping address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment">Payment Method</Label>
          <Select value={orderData.paymentMethod} onValueChange={(value) => setOrderData({...orderData, paymentMethod: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MTN">MTN Mobile Money</SelectItem>
              <SelectItem value="PAY_ON_DELIVERY">Pay on Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Order Items *</Label>
            <Button type="button" onClick={handleAddItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {orderData.items.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Item {index + 1}</h4>
                <Button
                  type="button"
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
                      <SelectValue placeholder="Select product" />
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
                    <strong>Selected:</strong> {item.productName}
                  </p>
                  <p className="text-sm">
                    <strong>Unit Price:</strong> {item.price?.toLocaleString()} Rwf
                  </p>
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
              <p className="text-sm text-gray-500">Click "Add Item" to start building the order</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Order Preview:</h4>
          <p className="text-sm mb-2">
            <strong>Payment Method:</strong> {orderData.paymentMethod === 'PAY_ON_DELIVERY' ? 'Pay on Delivery' : 'MTN Mobile Money'}
          </p>
          <p className="text-sm mb-2">
            <strong>Items:</strong> {orderData.items.length}
          </p>
          <p className="text-sm mb-2">
            <strong>Total Amount:</strong> {orderData.items.filter(item => item.productId > 0 && item.quantity > 0)
              .reduce((sum, item) => sum + (item.price * item.quantity), 0)
              .toLocaleString()} Rwf
          </p>
          <p className="text-sm mb-2">
            <strong>Shipping Address:</strong> {orderData.shippingAddress || 'Not provided'}
          </p>
          {orderData.paymentMethod === 'MTN' && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-600">
                <strong>MoMo Payment Code:</strong> 0784720884
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center mb-6">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        <div className="min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? 'Creating...' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateOrder}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? 'Creating Order...' : 'Create Order'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
