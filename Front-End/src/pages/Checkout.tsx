
import { useState, useEffect, useContext } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { placeOrder, placeAnonymousOrder } from '@/api/orders';
import { useToast } from '@/hooks/use-toast';
import { APP_CONSTANTS, ROUTES } from '@/constants/app';
import { GuestCheckoutModal } from '@/components/GuestCheckoutModal';
import { useAutoSave } from '@/hooks/useAutoSave';

const Checkout = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { toast } = useToast();
  const { cart, isLoading } = useCart();
  const [paymentMethod, setPaymentMethod] = useState(APP_CONSTANTS.PAYMENT_METHODS.MTN);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentCode, setPaymentCode] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    streetLine: '',
    shippingAddress: ''
  });

  // Auto-save checkout form data
  const autoSaveCheckoutData = async (data: typeof formData) => {
    localStorage.setItem('checkoutFormData', JSON.stringify(data));
  };

  useAutoSave({
    data: formData,
    onSave: autoSaveCheckoutData,
    delay: 1500,
    enabled: Object.values(formData).some(value => value.trim() !== '')
  });

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('checkoutFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error('Failed to load saved checkout data:', error);
      }
    }
  }, []);

  // Handle payment method change
  const handlePaymentMethodChange = async (method: string) => {
    setPaymentMethod(method);
    
    if (method === APP_CONSTANTS.PAYMENT_METHODS.MTN) {
      setPaymentCode(APP_CONSTANTS.PAYMENT_CODE);
    } else {
      setPaymentCode('');
    }
  };

  const handleCompleteOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.location || !formData.streetLine) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email is required for anonymous users
    if (!auth?.user && !formData.email) {
      toast({
        title: "Error",
        description: "Email is required to receive order confirmation",
        variant: "destructive",
      });
      return;
    }

    const shippingAddress = sameAsBilling 
      ? `${formData.streetLine}, ${formData.location}`
      : formData.shippingAddress || `${formData.streetLine}, ${formData.location}`;

    if (auth?.user) {
      // Authenticated user - use existing placeOrder
      setProcessing(true);
      try {
        const orderResponse = await placeOrder({
          shippingAddress,
          paymentMethod
        });
        
        const orderId = orderResponse.data.id;
        setCurrentOrderId(orderId);

        // Clear saved form data after successful order
        localStorage.removeItem('checkoutFormData');

        if (paymentMethod === APP_CONSTANTS.PAYMENT_METHODS.MTN) {
          toast({
            title: "Order Placed Successfully!",
            description: "Please use the MoMo code below to complete your payment. You will receive email confirmation shortly.",
          });
        } else if (paymentMethod === APP_CONSTANTS.PAYMENT_METHODS.PAY_ON_DELIVERY) {
          toast({
            title: "Order Placed Successfully!",
            description: "Your order will be delivered and payment will be collected on delivery. You will receive email confirmation shortly.",
          });
        }
      } catch (error: any) {
        console.error('Checkout error:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to place order",
          variant: "destructive",
        });
      } finally {
        setProcessing(false);
      }
    } else {
      // Anonymous user - show guest registration modal
      setShowGuestModal(true);
    }
  };

  const handleGuestOrderSuccess = () => {
    // Clear saved form data after successful order
    localStorage.removeItem('checkoutFormData');
    setCurrentOrderId(1); // Just to show success state
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSameAsBillingChange = (checked: boolean | "indeterminate") => {
    setSameAsBilling(checked === true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discount = Math.round(subtotal * APP_CONSTANTS.DISCOUNT_RATE);
  const subtotalAfterDiscount = subtotal - discount;
  
  // Hide delivery fee if Pay on Delivery is selected
  const showDeliveryFee = paymentMethod !== APP_CONSTANTS.PAYMENT_METHODS.PAY_ON_DELIVERY;
  const deliveryFee = showDeliveryFee ? APP_CONSTANTS.DELIVERY_FEE : 0;
  const total = subtotalAfterDiscount + deliveryFee;

  const guestCheckoutData = {
    customerName: `${formData.firstName} ${formData.lastName}`,
    customerEmail: formData.email,
    shippingAddress: sameAsBilling 
      ? `${formData.streetLine}, ${formData.location}`
      : formData.shippingAddress || `${formData.streetLine}, ${formData.location}`,
    paymentMethod,
    cartId: cart?.id || 0
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to={ROUTES.CART} className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">Your cart is empty</p>
            <Link to="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Forms */}
            <div className="space-y-8">
              {/* Customer Information */}
              <div>
                <div className="flex items-center mb-4">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  <h2 className="text-xl font-semibold">Customer Information</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input 
                    placeholder="First Name *" 
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                  <Input 
                    placeholder="Last Name *" 
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input 
                    placeholder={auth?.user ? "Email" : "Email *"} 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  <Input 
                    placeholder="Location *" 
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
                
                <Input 
                  placeholder="Street Line *" 
                  className="mb-4" 
                  value={formData.streetLine}
                  onChange={(e) => handleInputChange('streetLine', e.target.value)}
                />
                
                {!auth?.user && (
                  <p className="text-sm text-gray-600">
                    * Required fields. You will receive order confirmation via email.
                  </p>
                )}
              </div>

              {/* Shipping Address */}
              <div>
                <div className="flex items-center mb-4">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="same-address" 
                    checked={sameAsBilling}
                    onCheckedChange={handleSameAsBillingChange}
                  />
                  <Label htmlFor="same-address" className="text-purple-600">Same as billing address</Label>
                </div>

                {!sameAsBilling && (
                  <Input 
                    placeholder="Shipping Address" 
                    value={formData.shippingAddress}
                    onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                  />
                )}
              </div>

              {/* Payment Method */}
              <div>
                <div className="flex items-center mb-4">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm mr-3">3</span>
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>
                
                <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="mb-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={APP_CONSTANTS.PAYMENT_METHODS.MTN} id="mtn" />
                    <Label htmlFor="mtn">MTN MOMO</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={APP_CONSTANTS.PAYMENT_METHODS.PAY_ON_DELIVERY} id="pay-on-delivery" />
                    <Label htmlFor="pay-on-delivery">Pay on Delivery</Label>
                  </div>
                </RadioGroup>

                {/* MoMo Payment Code Display */}
                {paymentMethod === APP_CONSTANTS.PAYMENT_METHODS.MTN && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">MoMo Payment Code</h3>
                    <div className="bg-white p-3 rounded border-2 border-green-500">
                      <h6>* Beritha Niyotwagira</h6>
                      <div className="text-lg font-bold text-green-600">{paymentCode}</div>
                      <p className="text-sm text-gray-600 mt-1">
                        Use this number to complete your MoMo payment
                      </p>
                    </div>
                    {currentOrderId && (
                      <p className="text-sm text-blue-600 mt-2">
                        ✅ Order placed successfully! Check your email for confirmation.
                      </p>
                    )}
                  </div>
                )}

                {/* Pay on Delivery Notice */}
                {paymentMethod === APP_CONSTANTS.PAYMENT_METHODS.PAY_ON_DELIVERY && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2 text-blue-800">Pay on Delivery</h3>
                    <p className="text-sm text-blue-700">
                      Your order will be delivered to your address. Payment including delivery fee will be collected upon delivery.
                    </p>
                    {currentOrderId && (
                      <p className="text-sm text-blue-600 mt-2">
                        ✅ Order placed successfully! Check your email for confirmation.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2 mt-4">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Secure Payment</span>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Your purchases are secured by industry-standard encryption
                </p>
              </div>

              <Button 
                onClick={handleCompleteOrder}
                disabled={processing || currentOrderId !== null}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg"
              >
                {processing ? "Processing..." : currentOrderId ? "Order Completed ✓" : "Complete Order →"}
              </Button>

              {currentOrderId && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Order Completed!</h3>
                  <p className="text-green-700 text-sm">
                    Your order has been placed successfully. 
                    {paymentMethod === APP_CONSTANTS.PAYMENT_METHODS.MTN && " Please complete the payment using the MoMo code above."}
                    {paymentMethod === APP_CONSTANTS.PAYMENT_METHODS.PAY_ON_DELIVERY && " Payment will be collected on delivery."}
                    You will receive email updates about your order status.
                  </p>
                  <Link to="/products" className="inline-block mt-2">
                    <Button variant="outline" size="sm">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:pl-8">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img 
                      src={item.product.coverImage} 
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-gray-600">{item.product.price.toLocaleString()} Rwf</p>
                    </div>
                    <span className="font-semibold">{item.quantity} ×</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Discount ({(APP_CONSTANTS.DISCOUNT_RATE * 100)}%)</span>
                  <span>-{discount.toLocaleString()} Rwf</span>
                </div>
                {showDeliveryFee ? (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{APP_CONSTANTS.DELIVERY_FEE.toLocaleString()} Rwf</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-blue-600">
                    <span>Delivery Fee</span>
                    <span>Paid on delivery</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{total.toLocaleString()} Rwf</span>
                </div>
                {!showDeliveryFee && (
                  <p className="text-sm text-blue-600 text-center mt-2">
                    + {APP_CONSTANTS.DELIVERY_FEE.toLocaleString()} Rwf delivery fee to be paid on delivery
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guest Checkout Modal */}
      <GuestCheckoutModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        checkoutData={guestCheckoutData}
        onSuccess={handleGuestOrderSuccess}
      />

      <Footer />
    </div>
  );
};

export default Checkout;
