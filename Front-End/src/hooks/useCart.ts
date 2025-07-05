
import { useState, useEffect, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, addToCart, removeFromCart, Cart as CartType } from '@/api/orders';
import { AuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useCart = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cartId, setCartId] = useState<number | null>(null);

  console.log('🔍 useCart hook initialized - User state:', {
    userExists: !!user,
    userId: user?.id,
    userEmail: user?.email,
    isAuthenticated: !!user,
    authLoading
  });

  // Handle cartId state based on authentication
  useEffect(() => {
    console.log('🔄 useCart useEffect: Auth state changed:', {
      userExists: !!user,
      userId: user?.id,
      authLoading
    });

    // Don't process if auth is still loading
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return;
    }

    if (user && user.id) {
      // User is authenticated - clear anonymous cart data
      console.log('👤 User authenticated, clearing anonymous cart data');
      localStorage.removeItem('anonymous_cart_id');
      setCartId(null);
    } else {
      // User is not authenticated - try to load anonymous cart
      const storedCartId = localStorage.getItem('anonymous_cart_id');
      console.log('👻 User not authenticated - checking for anonymous cart:', storedCartId);
      
      if (storedCartId && !isNaN(parseInt(storedCartId))) {
        const parsedCartId = parseInt(storedCartId);
        setCartId(parsedCartId);
        console.log('🛒 Loaded anonymous cart ID:', parsedCartId);
      } else {
        console.log('🛒 No valid anonymous cart found');
        setCartId(null);
      }
    }
  }, [user, authLoading]);

  // Create proper query key that changes when auth state changes
  const queryKey = user && user.id
    ? ['cart', 'authenticated', user.id] 
    : ['cart', 'anonymous', cartId || 'no-cart'];

  console.log('🔑 useCart query key:', queryKey);

  const { data: cartResponse, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        console.log('🔍 useCart query starting with:', {
          userExists: !!user,
          userId: user?.id,
          userEmail: user?.email,
          cartId: cartId,
          isAuthenticated: !!user,
          authLoading
        });
        
        // For authenticated users, never pass cartId
        // For anonymous users, pass the cartId from state
        const cartIdToUse = (user && user.id) ? null : cartId;
        
        console.log('📤 Calling getCart with cartId:', cartIdToUse, 'for user type:', (user && user.id) ? 'authenticated' : 'anonymous');
        
        const response = await getCart(cartIdToUse);
        const cartData = response?.data?.data || response?.data || null;

        console.log('📦 Cart query response:', {
          cartExists: !!cartData,
          cartId: cartData?.id,
          itemsCount: cartData?.items?.length || 0,
          isAuthenticated: !!(user && user.id),
          userId: user?.id
        });

        // For anonymous users only, store cart ID if we get one back
        if (!user && cartData?.id && cartData.id !== cartId) {
          localStorage.setItem('anonymous_cart_id', cartData.id.toString());
          setCartId(cartData.id);
          console.log('💾 Stored new anonymous cart ID:', cartData.id);
        }

        return cartData;
      } catch (err) {
        console.error('❌ useCart query error:', err);
        return null;
      }
    },
    staleTime: 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !authLoading, // Don't run query while auth is loading
  });

  const cart: CartType | null = cartResponse || null;

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      // For authenticated users, NEVER pass cartId
      // For anonymous users, pass the cartId from state
      const cartIdToUse = (user && user.id) ? null : cartId;
      
      console.log('➕ Adding to cart:', { 
        productId, 
        quantity, 
        currentCartId: cartIdToUse, 
        isAuthenticated: !!(user && user.id),
        userId: user?.id,
        userEmail: user?.email
      });
      
      const response = await addToCart(productId, quantity, cartIdToUse);
      return response;
    },
    onSuccess: (data) => {
      const responseCartId = data?.data?.cartId;
      
      console.log('✅ Add to cart success:', {
        responseCartId,
        isAuthenticated: !!(user && user.id),
        currentCartId: cartId,
        userId: user?.id
      });
      
      // Handle cartId from response for anonymous users only
      if (!user && responseCartId && responseCartId !== cartId) {
        localStorage.setItem('anonymous_cart_id', responseCartId.toString());
        setCartId(responseCartId);
        console.log('💾 Updated anonymous cart ID from response:', responseCartId);
      }

      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      setTimeout(() => {
        refetch().catch(err => {
          console.error('❌ Refetch error after add:', err);
        });
      }, 100);

      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: any) => {
      console.error('❌ Add to cart error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (productId: number) => {
      // For authenticated users, NEVER pass cartId
      // For anonymous users, pass the cartId from state
      const cartIdToUse = (user && user.id) ? null : cartId;
      
      console.log('➖ Removing from cart:', { 
        productId, 
        cartId: cartIdToUse, 
        isAuthenticated: !!(user && user.id),
        userId: user?.id
      });
      
      return removeFromCart(productId, cartIdToUse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      setTimeout(() => {
        refetch().catch(err => {
          console.error('❌ Refetch after remove error:', err);
        });
      }, 200);
      
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: any) => {
      console.error('❌ Remove from cart error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove item",
        variant: "destructive",
      });
    }
  });

  const cartItemsCount = (() => {
    try {
      if (!cart?.items || !Array.isArray(cart.items)) return 0;
      return cart.items.reduce((total: number, item: any) => {
        const quantity = parseInt(item?.quantity) || 0;
        return total + quantity;
      }, 0);
    } catch (err) {
      console.error('❌ Error calculating cart items count:', err);
      return 0;
    }
  })();

  console.log('🛒 useCart final state:', {
    hasCart: !!cart,
    cartItemsCount,
    isAuthenticated: !!(user && user.id),
    userId: user?.id,
    authLoading
  });

  return {
    cart,
    cartItemsCount,
    isLoading: isLoading || authLoading,
    error,
    addToCart: addToCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    refetchCart: refetch,
  };
};
