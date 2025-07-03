
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrder, updateOrderStatus } from '@/api/orders';
import { useToast } from '@/hooks/use-toast';
import { Package, Truck, CheckCircle } from 'lucide-react';

interface OrderUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  userRole: string;
}

export const OrderUpdateDialog: React.FC<OrderUpdateDialogProps> = ({ 
  isOpen, 
  onClose, 
  order,
  userRole 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isDelivered, setIsDelivered] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (order) {
      setShippingAddress(order.shippingAddress || '');
      setPaymentMethod(order.paymentMethod || '');
      setIsDelivered(order.isDelivered || false);
      setIsPaid(order.isPaid || false);
    }
  }, [order]);

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: any }) => updateOrderStatus(id, status.isPaid, status.isDelivered),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const handleUpdateOrder = () => {
    if (!order) return;

    const updateData = {
      shippingAddress,
      paymentMethod,
    };

    updateOrderMutation.mutate({ id: order.id, data: updateData });
  };

  const handleUpdateStatus = () => {
    if (!order) return;

    updateStatusMutation.mutate({ 
      id: order.id, 
      status: { isPaid, isDelivered } 
    });
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Update Order #{order.id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Order Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Customer:</span>
                <div>{order.user?.name}</div>
                <div className="text-gray-600">{order.user?.email}</div>
              </div>
              <div>
                <span className="font-medium">Total:</span>
                <div className="font-bold text-lg">{order.totalPrice?.toLocaleString()} Rwf</div>
              </div>
              <div>
                <span className="font-medium">Items:</span>
                <div>{order.items?.length || 0} item(s)</div>
              </div>
              <div>
                <span className="font-medium">Date:</span>
                <div>{new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              <div className="space-y-2">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div className="flex items-center gap-2">
                      <img 
                        src={item.product?.coverImage} 
                        alt={item.product?.name} 
                        className="w-8 h-8 object-cover rounded"
                      />
                      <span>{item.product?.name}</span>
                    </div>
                    <div className="text-right">
                      <div>Qty: {item.quantity}</div>
                      <div className="font-medium">{(item.price * item.quantity).toLocaleString()} Rwf</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Update Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Shipping Address</Label>
              <Textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter shipping address"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
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

            {/* Status Updates */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Order Status</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <Label>Payment Received</Label>
                </div>
                <Switch
                  checked={isPaid}
                  onCheckedChange={setIsPaid}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <Label>Delivered</Label>
                </div>
                <Switch
                  checked={isDelivered}
                  onCheckedChange={setIsDelivered}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpdateOrder}
              disabled={updateOrderMutation.isPending}
              className="flex-1"
            >
              {updateOrderMutation.isPending ? 'Updating...' : 'Update Order'}
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
