
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, updateProduct, deleteProduct, CreateProductData } from '@/api/products';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { uploadFile } from '@/lib/supabase';

export const useProductMutations = (
  uploadImage: (file: File) => Promise<string>,
  selectedFile: File | null,
  imageUrl: string,
  resetForm: () => void
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();

  const createProductMutation = useMutation({
    mutationFn: async (data: CreateProductData) => {
      let finalImageUrl = data.coverImage;
      
      // If there's a selected file, upload it to Supabase
      if (selectedFile) {
        try {
          const uploadResult = await uploadFile(selectedFile, 'ecommerce');
          finalImageUrl = uploadResult.url;
        } catch (error) {
          console.error('Image upload failed:', error);
          toast({ 
            title: t('common.error'), 
            description: 'Image upload failed. Please try again.', 
            variant: 'destructive' 
          });
          throw error;
        }
      }
      // If there's an image URL from FileUpload or manual URL input, use it
      else if (imageUrl) {
        finalImageUrl = imageUrl;
      }
      
      return createProduct({ ...data, coverImage: finalImageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      toast({ title: t('common.success'), description: t('products.created') });
    },
    onError: (error) => {
      console.error('Create product error:', error);
      toast({ title: t('common.error'), description: t('products.create_failed'), variant: 'destructive' });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProductData> }) => {
      let finalImageUrl = data.coverImage;
      
      // If there's a selected file, upload it to Supabase
      if (selectedFile) {
        try {
          const uploadResult = await uploadFile(selectedFile, 'ecommerce');
          finalImageUrl = uploadResult.url;
        } catch (error) {
          console.error('Image upload failed:', error);
          toast({ 
            title: t('common.error'), 
            description: 'Image upload failed. Please try again.', 
            variant: 'destructive' 
          });
          throw error;
        }
      }
      // If there's an image URL from FileUpload or manual URL input, use it
      else if (imageUrl) {
        finalImageUrl = imageUrl;
      }
      
      return updateProduct(id, { ...data, coverImage: finalImageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      toast({ title: t('common.success'), description: t('products.updated') });
    },
    onError: (error) => {
      console.error('Update product error:', error);
      toast({ title: t('common.error'), description: t('products.update_failed'), variant: 'destructive' });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: t('common.success'), description: t('products.deleted') });
    },
    onError: () => {
      toast({ title: t('common.error'), description: t('products.delete_failed'), variant: 'destructive' });
    }
  });

  return {
    createProductMutation,
    updateProductMutation,
    deleteProductMutation
  };
};
