
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { registerUser } from '@/api/auth';
import { placeAnonymousOrder } from '@/api/orders';
import { Loader2, User, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutData: {
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    paymentMethod: string;
    cartId: number;
  };
  onSuccess: () => void;
}

export const GuestCheckoutModal: React.FC<GuestCheckoutModalProps> = ({
  isOpen,
  onClose,
  checkoutData,
  onSuccess
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'register' | 'order'>('register');
  const [loading, setLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: checkoutData.customerName,
    email: checkoutData.customerEmail,
    password: '',
    confirmPassword: ''
  });

  const handleRegistration = async () => {
    if (!registrationData.password || registrationData.password !== registrationData.confirmPassword) {
      toast({
        title: "Password Error",
        description: "Passwords don't match or are empty",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: registrationData.name,
        email: registrationData.email,
        password: registrationData.password,
        role: 'buyer'
      });

      toast({
        title: "Registration Successful!",
        description: "Account created. Now placing your order...",
      });

      setStep('order');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPlacement = async () => {
    setLoading(true);
    try {
      await placeAnonymousOrder(checkoutData);
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed and confirmation email sent.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.response?.data?.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkipRegistration = async () => {
    setLoading(true);
    try {
      await placeAnonymousOrder(checkoutData);
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed and confirmation email sent.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.response?.data?.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {step === 'register' ? (
              <>
                <User className="w-5 h-5" />
                <span>Create Account (Optional)</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Place Order</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'register' ? (
            <>
              <p className="text-sm text-gray-600">
                Create an account to track your orders and get exclusive offers, or skip to place order as guest.
              </p>
                 <Link to="/login">Create account</Link>


              <div className="flex space-x-3">
               
                
                <Button
                  variant="outline"
                  onClick={handleSkipRegistration}
                  disabled={loading}
                  className="flex-1"
                >
                  Skip & Place Order
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Account created successfully! Now placing your order...
              </p>
              
              <Button
                onClick={handleOrderPlacement}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Place Order
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
