
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartQuantityControlsProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  isLoading?: boolean;
}

export const CartQuantityControls: React.FC<CartQuantityControlsProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  isLoading = false
}) => {
  return (
    <div className="flex w-24 items-center border rounded-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={onDecrease}
        disabled={quantity <= 1 || isLoading}
        className="h-8 w-8 p-0"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
        {quantity}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onIncrease}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};
