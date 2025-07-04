import { SellerPermissions } from '@/hooks/useSellerPermissions';

export const getPermissionActions = (permissions: SellerPermissions) => {
  return {
    canConfirmPayment: permissions.canConfirmOrder,
    canMarkDelivered: permissions.canConfirmOrder,
    canCancelOrder: permissions.canCancelOrder,
    canDeleteOrder: permissions.canDeleteOrder,
    canEditOrder: permissions.canEditOrder,
    canCreateCustomers: permissions.canCreateCustomers
  };
};

export const getPermissionBadgeVariant = (hasPermission: boolean) => {
  return hasPermission ? 'default' : 'outline';
};

export const formatPermissionName = (permission: keyof SellerPermissions): string => {
  const names: Record<keyof SellerPermissions, string> = {
    canConfirmOrder: 'Confirm Orders',
    canEditOrder: 'Edit Orders', 
    canCancelOrder: 'Cancel Orders',
    canDeleteOrder: 'Delete Orders',
    canCreateCustomers: 'Create Customers'
  };
  return names[permission];
};