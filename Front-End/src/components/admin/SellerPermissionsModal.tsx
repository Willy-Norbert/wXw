
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Settings, CheckCircle, Edit, X, Trash2 } from 'lucide-react';
import api from '@/api/api';

interface SellerPermission {
  canConfirmOrder: boolean;
  canEditOrder: boolean;
  canCancelOrder: boolean;
  canDeleteOrder: boolean;
  canCreateCustomers: boolean;
}

interface SellerPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: any;
}

export const SellerPermissionsModal: React.FC<SellerPermissionsModalProps> = ({
  isOpen,
  onClose,
  seller
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [permissions, setPermissions] = useState<SellerPermission>({
    canConfirmOrder: false,
    canEditOrder: false,
    canCancelOrder: false,
    canDeleteOrder: false,
    canCreateCustomers: false
  });

  useEffect(() => {
    if (seller?.sellerPermissions) {
      try {
        const parsedPermissions = JSON.parse(seller.sellerPermissions);
        setPermissions({
          canConfirmOrder: parsedPermissions.canConfirmOrder || false,
          canEditOrder: parsedPermissions.canEditOrder || false,
          canCancelOrder: parsedPermissions.canCancelOrder || false,
          canDeleteOrder: parsedPermissions.canDeleteOrder || false,
          canCreateCustomers: parsedPermissions.canCreateCustomers || false
        });
      } catch (error) {
        console.error('Error parsing seller permissions:', error);
      }
    }
  }, [seller]);

  const updatePermissionsMutation = useMutation({
    mutationFn: async (permissionsData: SellerPermission) => {
      console.log('🔄 Updating seller permissions:', { sellerId: seller.id, permissions: permissionsData });
      return api.put(`/sellers/${seller.id}/status`, {
        status: seller.sellerStatus,
        permissions: permissionsData
      });
    },
    onSuccess: (response) => {
      console.log('✅ Permissions updated successfully:', response.data);
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['pending-sellers'] });
      // Force refresh of user context if this is the current user
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: "Permissions Updated",
        description: "Seller permissions have been updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      console.error('❌ Error updating permissions:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update permissions",
        variant: "destructive",
      });
    }
  });

  const handlePermissionChange = (key: keyof SellerPermission, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    updatePermissionsMutation.mutate(permissions);
  };

  if (!seller) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Manage Seller Permissions</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seller Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{seller.name}</h3>
              <Badge variant={seller.sellerStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                {seller.sellerStatus}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{seller.email}</p>
            {seller.businessName && (
              <p className="text-sm text-gray-600">Business: {seller.businessName}</p>
            )}
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h4 className="font-semibold">Order Management Permissions</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Confirm Orders</p>
                    <p className="text-sm text-gray-600">Allow seller to confirm payment status</p>
                  </div>
                </div>
                <Switch
                  checked={permissions.canConfirmOrder}
                  onCheckedChange={(value) => handlePermissionChange('canConfirmOrder', value)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Edit className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Edit Orders</p>
                    <p className="text-sm text-gray-600">Allow seller to modify order details</p>
                  </div>
                </div>
                <Switch
                  checked={permissions.canEditOrder}
                  onCheckedChange={(value) => handlePermissionChange('canEditOrder', value)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <X className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Cancel Orders</p>
                    <p className="text-sm text-gray-600">Allow seller to cancel orders</p>
                  </div>
                </div>
                <Switch
                  checked={permissions.canCancelOrder}
                  onCheckedChange={(value) => handlePermissionChange('canCancelOrder', value)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium">Delete Orders</p>
                    <p className="text-sm text-gray-600">Allow seller to permanently delete orders</p>
                  </div>
                </div>
                <Switch
                  checked={permissions.canDeleteOrder}
                  onCheckedChange={(value) => handlePermissionChange('canDeleteOrder', value)}
                />
              </div>
            </div>

            <h4 className="font-semibold pt-4">Customer Management Permissions</h4>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Create New Customers</p>
                  <p className="text-sm text-gray-600">Allow seller to add new customers when creating orders</p>
                </div>
              </div>
              <Switch
                checked={permissions.canCreateCustomers}
                onCheckedChange={(value) => handlePermissionChange('canCreateCustomers', value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updatePermissionsMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Permissions'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
