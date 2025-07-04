
import { useState, useEffect } from 'react';
import { useAutoSave } from './useAutoSave';
import { useToast } from '@/hooks/use-toast';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  coverImage: string;
  images: string[];
  variants?: any[];
}

export const useProductAutoSave = (initialData: Partial<ProductFormData>, productId?: number) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<ProductFormData>>(initialData);

  const saveProductDraft = async (data: Partial<ProductFormData>) => {
    const draftKey = productId ? `product-draft-${productId}` : 'new-product-draft';
    localStorage.setItem(draftKey, JSON.stringify({
      ...data,
      lastSaved: new Date().toISOString()
    }));
  };

  // Auto-save form data
  useAutoSave({
    data: formData,
    onSave: saveProductDraft,
    delay: 2000,
    enabled: Object.values(formData).some(value => 
      value !== undefined && value !== null && value !== ''
    )
  });

  // Load draft on mount
  useEffect(() => {
    const draftKey = productId ? `product-draft-${productId}` : 'new-product-draft';
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        const lastSaved = new Date(parsed.lastSaved);
        const hoursSinceLastSave = (Date.now() - lastSaved.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastSave < 24) { // Only restore if less than 24 hours old
          setFormData(prev => ({ ...prev, ...parsed }));
          toast({
            title: "Draft Restored",
            description: `Form data from ${lastSaved.toLocaleString()} has been restored.`,
            duration: 4000,
          });
        }
      } catch (error) {
        console.error('Failed to restore product draft:', error);
      }
    }
  }, [productId, toast]);

  const clearDraft = () => {
    const draftKey = productId ? `product-draft-${productId}` : 'new-product-draft';
    localStorage.removeItem(draftKey);
  };

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    formData,
    updateFormData,
    clearDraft,
    setFormData
  };
};
