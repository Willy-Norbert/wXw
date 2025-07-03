import { useMemo, useContext } from 'react';
import  { AuthContext }  from '@/contexts/AuthContext';

export interface SellerPermissions {
  canConfirmOrder: boolean;
  canEditOrder: boolean;
  canCancelOrder: boolean;
  canDeleteOrder: boolean;
  canCreateCustomers: boolean;
}

export const useSellerPermissions = (): SellerPermissions => {
  const { user } = useContext(AuthContext);

  return useMemo(() => {
    console.log('🔍 useSellerPermissions: Current user:', user);
    console.log('🔍 useSellerPermissions: sellerPermissions:', user?.sellerPermissions);
    
    if (!user?.sellerPermissions) {
      console.log('🔍 useSellerPermissions: No permissions found, returning false for all');
      return {
        canConfirmOrder: false,
        canEditOrder: false,
        canCancelOrder: false,
        canDeleteOrder: false,
        canCreateCustomers: false
      };
    }

    try {
      const permissions = typeof user.sellerPermissions === 'string' 
        ? JSON.parse(user.sellerPermissions) 
        : user.sellerPermissions;
      
      return {
        canConfirmOrder: permissions.canConfirmOrder || false,
        canEditOrder: permissions.canEditOrder || false,
        canCancelOrder: permissions.canCancelOrder || false,
        canDeleteOrder: permissions.canDeleteOrder || false,
        canCreateCustomers: permissions.canCreateCustomers || false
      };
    } catch (error) {
      console.error('Error parsing seller permissions:', error);
      return {
        canConfirmOrder: false,
        canEditOrder: false,
        canCancelOrder: false,
        canDeleteOrder: false,
        canCreateCustomers: false
      };
    }
  }, [user?.sellerPermissions]);
};