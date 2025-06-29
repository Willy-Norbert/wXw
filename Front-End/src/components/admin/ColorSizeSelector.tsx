
import React from 'react';
import { Button } from '@/components/ui/button';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { X } from 'lucide-react';

interface ColorSizeSelectorProps {
  type: 'colors' | 'sizes';
  selectedItems: string[];
  onItemsChange: (items: string[]) => void;
  field: any;
}

const AVAILABLE_COLORS = [
  'Black', 'White', 'Gray', 'Navy', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Brown', 'Orange'
];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const ColorSizeSelector: React.FC<ColorSizeSelectorProps> = ({ 
  type, 
  selectedItems, 
  onItemsChange, 
  field 
}) => {
  const { t } = useLanguage();
  const availableOptions = type === 'colors' ? AVAILABLE_COLORS : AVAILABLE_SIZES;

  const toggleItem = (item: string) => {
    const newItems = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];
    
    onItemsChange(newItems);
    field.onChange(newItems);
  };

  const removeItem = (item: string) => {
    const newItems = selectedItems.filter(i => i !== item);
    onItemsChange(newItems);
    field.onChange(newItems);
  };

  return (
    <FormItem>
      <FormLabel>
        {type === 'colors' ? t('products.colors') || 'Colors' : t('products.sizes') || 'Sizes'}
      </FormLabel>
      <FormControl>
        <div className="space-y-4">
          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    className="hover:bg-blue-200 rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Available Options */}
          <div className="grid grid-cols-3 gap-2">
            {availableOptions.map((option) => (
              <Button
                key={option}
                type="button"
                variant={selectedItems.includes(option) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleItem(option)}
                className="text-xs"
              >
                {option}
              </Button>
            ))}
          </div>

          {/* Hidden input to maintain form values */}
          <input type="hidden" {...field} />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
