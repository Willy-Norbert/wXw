
import React, { useContext } from 'react';
import { Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/contexts/LanguageContext';
import { APP_CONSTANTS, ROUTES } from '@/constants/app';
import { CartQuantityControls } from '@/components/cart/CartQuantityControls';

const Cart = () => {
  const { t } = useLanguage();
  const auth = useContext(AuthContext);
  const { cart, isLoading, error, removeFromCart, addToCart, isRemovingFromCart, isAddingToCart } = useCart();

  console.log('Cart page - cart data:', cart);
  console.log('Cart page - cart items:', cart?.items);

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

  if (error) {
    console.error('Cart page error:', error);
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">Failed to load cart</div>
        </div>
        <Footer />
      </div>
    );
  }

  const cartItems = cart?.items || [];
  console.log('Cart page - final cartItems:', cartItems);
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discount = Math.round(subtotal * APP_CONSTANTS.DISCOUNT_RATE);
  const deliveryFee = APP_CONSTANTS.DELIVERY_FEE;
  const total = subtotal - discount + deliveryFee;

  const handleQuantityIncrease = (productId: number) => {
    addToCart({ productId, quantity: 1 });
  };

  const handleQuantityDecrease = (productId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      // For decreasing, we need to remove one item
      removeFromCart(productId);
      // Then add back the reduced quantity
      setTimeout(() => {
        addToCart({ productId, quantity: currentQuantity - 1 });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-2xl font-bold mb-6">{t('cart.title') || 'Your Cart'}</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">{t('cart.empty') || 'Your cart is empty'}</p>
            <Link to="/products">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                {t('cart.continue_shopping') || 'Continue Shopping'}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.productId}`} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img 
                    src={item.product.coverImage} 
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="font-semibold mt-1">{item.product.price.toLocaleString()} Rwf</p>
                    
                    {/* Quantity Controls */}
                    <div className="mt-2">
                      <CartQuantityControls
                        quantity={item.quantity}
                        onIncrease={() => handleQuantityIncrease(item.productId)}
                        onDecrease={() => handleQuantityDecrease(item.productId, item.quantity)}
                        isLoading={isAddingToCart || isRemovingFromCart}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      disabled={isRemovingFromCart}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded hover:bg-red-50"
                    >
                      {isRemovingFromCart ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-4">{t('cart.order_summary') || 'Order Summary'}</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.subtotal') || 'Subtotal'}</span>
                  <span className="font-semibold">{subtotal.toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>{t('cart.discount') || `Discount (${(APP_CONSTANTS.DISCOUNT_RATE * 100)}%)`}</span>
                  <span>-{discount.toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.delivery_fee') || 'Delivery Fee'}</span>
                  <span className="font-semibold">{deliveryFee.toLocaleString()} Rwf</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>{t('cart.total') || 'Total'}</span>
                  <span>{total.toLocaleString()} Rwf</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Link to={ROUTES.CHECKOUT}>
              <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-full">
                {t('cart.go_to_checkout') || 'Go to Checkout'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
