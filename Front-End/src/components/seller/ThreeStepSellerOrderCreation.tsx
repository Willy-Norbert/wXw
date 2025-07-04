import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getSellerCustomers, getSellerProducts } from '@/api/sellers';
import { createOrder } from '@/api/orders';
import { AuthContext } from '@/contexts/AuthContext';
import { ArrowLeft, ArrowRight, User, UserPlus, Package, Plus, Minus, CheckCircle, Mail } from 'lucide-react';

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  productName: string;
  productImage?: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  coverImage: string;
  stock: number;
}

interface ThreeStepSellerOrderCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThreeStepSellerOrderCreation: React.FC<ThreeStepSellerOrderCreationProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: ''
  });
  const [orderData, setOrderData] = useState({
    shippingAddress: '',
    paymentMethod: 'PAY_ON_DELIVERY',
    items: [] as OrderItem[],
    totalPrice: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get seller's customers
  const { data: customersResponse, isLoading: customersLoading } = useQuery({
    queryKey: ['seller-customers'],
    queryFn: getSellerCustomers,
    enabled: isOpen && currentStep === 1,
  });

  // Get seller's products
  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: getSellerProducts,
    enabled: isOpen && currentStep === 2,
  });

  // Extract data from API responses
  const customers = customersResponse?.data || [];
  const products = productsResponse?.data || [];

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast({
        title: "Order created successfully",
        description: `Order has been created for customer. They will receive a confirmation email.`,
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating order",
        description: error.response?.data?.message || "Failed to create order",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedCustomer(null);
    setIsCreatingNewCustomer(false);
    setNewCustomerData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      shippingAddress: ''
    });
    setOrderData({
      shippingAddress: '',
      paymentMethod: 'PAY_ON_DELIVERY',
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
      if (isCreatingNewCustomer) {
        if (!newCustomerData.customerName || !newCustomerData.customerEmail) {
          toast({
            title: "Please fill required fields",
            description: "Customer name and email are required",
            variant: "destructive"
          });
          return;
        }
        setCurrentStep(2);
      } else if (selectedCustomer) {
        setCurrentStep(2);
      } else {
        toast({
          title: "Please select a customer",
          description: "Choose an existing customer or create a new one",
          variant: "destructive"
        });
      }
    } else if (currentStep === 2) {
      if (orderData.items.length === 0) {
        toast({
          title: "Please add products",
          description: "At least one product is required",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep(3);
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
      items: [...prev.items, { productId: 0, quantity: 1, price: 0, productName: '', productImage: '' }]
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
          newItems[index].productImage = product.coverImage;
        }
      }
      
      return { ...prev, items: newItems };
    });
  };

  const handleCreateOrder = () => {
    const finalShippingAddress = isCreatingNewCustomer 
      ? newCustomerData.shippingAddress 
      : orderData.shippingAddress;

    if (!finalShippingAddress || orderData.items.length === 0) {
      toast({
        title: "Please complete order details",
        description: "Shipping address and at least one product are required",
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

    const orderPayload = {
      userId: isCreatingNewCustomer ? null : selectedCustomer?.id,
      customerName: isCreatingNewCustomer ? newCustomerData.customerName : selectedCustomer?.name || '',
      customerEmail: isCreatingNewCustomer ? newCustomerData.customerEmail : selectedCustomer?.email || '',
      customerPhone: isCreatingNewCustomer ? newCustomerData.customerPhone : selectedCustomer?.phone || '',
      shippingAddress: finalShippingAddress,
      paymentMethod: orderData.paymentMethod,
      items: validItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice: orderData.totalPrice,
      // Add seller info for the confirmation message
      sellerName: user?.name || 'Your Seller',
      sellerEmail: user?.email || ''
    };

    createOrderMutation.mutate(orderPayload);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <User className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Step 1: Select Customer</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={!isCreatingNewCustomer ? "default" : "outline"}
          onClick={() => setIsCreatingNewCustomer(false)}
          className="h-24 flex flex-col items-center justify-center space-y-2"
        >
          <User className="w-6 h-6" />
          <span>Select Existing Customer</span>
        </Button>
        <Button
          variant={isCreatingNewCustomer ? "default" : "outline"}
          onClick={() => setIsCreatingNewCustomer(true)}
          className="h-24 flex flex-col items-center justify-center space-y-2"
        >
          <UserPlus className="w-6 h-6" />
          <span>New Customer</span>
        </Button>
      </div>

      {!isCreatingNewCustomer && (
        <div className="space-y-2">
          <Label htmlFor="customer-select">Select Customer</Label>
          {customersLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <Select 
              value={selectedCustomer?.id.toString() || ""} 
              onValueChange={(value) => {
                const customer = customers.find((c: any) => c.id === parseInt(value));
                setSelectedCustomer(customer || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.length > 0 ? customers.map((customer: any) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name} ({customer.email})
                  </SelectItem>
                )) : (
                  <SelectItem value="no-customers" disabled>
                    No customers found. Create orders to build your customer base.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {isCreatingNewCustomer && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name *</Label>
              <Input
                id="customer-name"
                value={newCustomerData.customerName}
                onChange={(e) => setNewCustomerData({...newCustomerData, customerName: e.target.value})}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-email">Customer Email *</Label>
              <Input
                id="customer-email"
                type="email"
                value={newCustomerData.customerEmail}
                onChange={(e) => setNewCustomerData({...newCustomerData, customerEmail: e.target.value})}
                placeholder="Enter customer email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Customer Phone</Label>
            <Input
              id="customer-phone"
              value={newCustomerData.customerPhone}
              onChange={(e) => setNewCustomerData({...newCustomerData, customerPhone: e.target.value})}
              placeholder="Enter customer phone"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping-address">Shipping Address *</Label>
            <Textarea
              id="shipping-address"
              value={newCustomerData.shippingAddress}
              onChange={(e) => setNewCustomerData({...newCustomerData, shippingAddress: e.target.value})}
              placeholder="Enter complete shipping address"
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Package className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Step 2: Add Products</h3>
        <Badge variant="secondary" className="ml-auto">
          Your Products Only
        </Badge>
      </div>

      {!isCreatingNewCustomer && (
        <div className="space-y-2">
          <Label htmlFor="shipping">Shipping Address *</Label>
          <Textarea
            id="shipping"
            value={orderData.shippingAddress}
            onChange={(e) => setOrderData({...orderData, shippingAddress: e.target.value})}
            placeholder="Enter shipping address"
            rows={3}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="payment">Payment Method</Label>
        <Select value={orderData.paymentMethod} onValueChange={(value) => setOrderData({...orderData, paymentMethod: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PAY_ON_DELIVERY">Pay on Delivery</SelectItem>
            <SelectItem value="MTN">MTN Mobile Money</SelectItem>
            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Order Items *</Label>
          <Button type="button" onClick={handleAddItem} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {orderData.items.map((item, index) => (
          <div key={index} className="border p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Product {index + 1}</h4>
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
                    <SelectValue placeholder="Select your product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: any) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - {product.price?.toLocaleString()} Rwf (Stock: {product.stock})
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

            <div className="space-y-2">
              <Label>Custom Price (Optional)</Label>
              <Input
                type="number"
                min="0"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                placeholder="Override default price"
              />
            </div>

            {item.productName && (
              <div className="bg-gray-50 p-3 rounded flex items-center space-x-3">
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity} × {item.price?.toLocaleString()} Rwf = {(item.price * item.quantity).toLocaleString()} Rwf
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {orderData.items.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No products added yet</p>
            <p className="text-sm text-gray-500">Click "Add Product" to start building the order</p>
          </div>
        )}

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Amount:</span>
            <span className="text-xl font-bold text-purple-600">
              {orderData.items.filter(item => item.productId > 0 && item.quantity > 0)
                .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                .toLocaleString()} Rwf
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const customerInfo = isCreatingNewCustomer ? newCustomerData : selectedCustomer;
    const shippingAddress = isCreatingNewCustomer ? newCustomerData.shippingAddress : orderData.shippingAddress;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircle className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Step 3: Review & Submit Order</h3>
        </div>

        {/* Seller Confirmation Message */}
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-800">Order Confirmation</span>
          </div>
          <p className="text-purple-700">
            This order was created for you by <strong>{user?.name || 'Your Seller'}</strong>
          </p>
          <p className="text-sm text-purple-600 mt-1">
            The customer will receive an email confirmation with this message.
          </p>
        </div>

        {/* Customer Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Customer Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{customerInfo?.customerName || customerInfo?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{customerInfo?.customerEmail || customerInfo?.email}</p>
            </div>
            {(customerInfo?.customerPhone || customerInfo?.phone) && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{customerInfo?.customerPhone || customerInfo?.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium">
                {orderData.paymentMethod === 'PAY_ON_DELIVERY' ? 'Pay on Delivery' : 
                 orderData.paymentMethod === 'MTN' ? 'MTN Mobile Money' :
                 'Bank Transfer'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Shipping Address</p>
            <p className="font-medium">{shippingAddress}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Order Items</h4>
          <div className="space-y-3">
            {orderData.items.filter(item => item.productId > 0).map((item, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded">
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} × {item.price?.toLocaleString()} Rwf
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{(item.price * item.quantity).toLocaleString()} Rwf</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total Amount:</span>
              <span className="text-xl font-bold text-purple-600">
                {orderData.items.filter(item => item.productId > 0 && item.quantity > 0)
                  .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                  .toLocaleString()} Rwf
              </span>
            </div>
          </div>
        </div>

        {orderData.paymentMethod === 'MTN' && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">
              <strong>MTN Mobile Money Payment Code:</strong> 0784720884
            </p>
            <p className="text-xs text-blue-500 mt-1">
              Customer will receive this information in their confirmation email.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Order for Customer</DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-purple-600' : 'bg-gray-200'}`} />
              )}
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
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateOrder}
                disabled={createOrderMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
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

export default ThreeStepSellerOrderCreation;