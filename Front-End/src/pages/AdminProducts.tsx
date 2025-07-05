import React, { useState, useContext } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductTable } from '@/components/admin/ProductTable';
import { ProductForm } from '@/components/admin/ProductForm';
import { SellerBlocked } from '@/components/seller/SellerBlocked';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useProductMutations } from '@/hooks/useProductMutations';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getSellerProducts } from '@/api/products';
import { getCategories } from '@/api/categories';
import { useToast } from '@/components/ui/use-toast';
import FileUpload, { FileData } from '@/components/chat/FileUpload';


const AdminProducts = () => {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const userRole = user?.role?.toLowerCase();
  const isSeller = userRole === 'seller';

  const sellerNotApproved = isSeller && (user?.sellerStatus !== 'ACTIVE' || !user?.isActive);
  if (sellerNotApproved) return <SellerBlocked />;

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: isSeller ? ['seller-products'] : ['products'],
    queryFn: () => (isSeller ? getSellerProducts() : getProducts()),
    select: (res) => res.data || [],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (res) => res.data || [],
  });

  const { createProductMutation, updateProductMutation, deleteProductMutation } = useProductMutations(
    async (file: File) => {
      if (uploadedImageUrl) {
        return uploadedImageUrl;
      }
      throw new Error('No image URL available');
    },
    null,
    uploadedImageUrl,
    () => {
      setUploadedImageUrl('');
      setPreviewImage(null);
      setIsFormOpen(false);
      setEditingProduct(null);
    }
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = async (data) => {
    try {
      // Use the uploaded image URL if available
      const productData = {
        ...data,
        coverImage: uploadedImageUrl || data.coverImage
      };
      await createProductMutation.mutateAsync(productData);
      toast({ title: 'Success', description: 'Product created successfully!' });
      refetch();
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create product',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProduct = async (data) => {
    try {
      // Use the uploaded image URL if available, otherwise keep existing
      const productData = {
        ...data,
        coverImage: uploadedImageUrl || data.coverImage
      };
      await updateProductMutation.mutateAsync({ id: editingProduct.id, data: productData });
      toast({ title: 'Success', description: 'Product updated successfully!' });
      setEditingProduct(null);
      setIsFormOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update product',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductMutation.mutateAsync(productId);
        toast({ title: 'Success', description: 'Product deleted successfully!' });
        refetch();
      } catch (error) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to delete product',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setUploadedImageUrl('');
    setPreviewImage(null);
  };

  const handleFileSelect = (files: FileData[]) => {
    const imageFile = files.find(f => f.type === 'image');
    if (imageFile) {
      setUploadedImageUrl(imageFile.url);
      setPreviewImage(imageFile.preview || imageFile.url);
    }
  };

  const handleUrlChange = (url: string) => {
    setUploadedImageUrl(url);
    setPreviewImage(url);
  };

  return (
    <DashboardLayout currentPage="products">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {isSeller ? 'My Products' : t('products.title')}
          </h1>
          <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {t('products.add_product')}
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t('products.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        <ProductTable
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          userRole={userRole}
        />

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {editingProduct ? t('products.edit_product') : t('products.add_product')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductForm
                  editingProduct={editingProduct}
                  categories={categories}
                  onUrlChange={handleUrlChange}
                  onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  onCancel={handleCloseForm}
                  previewImage={previewImage}
                  isLoading={createProductMutation.isPending || updateProductMutation.isPending} onFileChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
                    throw new Error('Function not implemented.');
                  } }                />

                {/* 👇 FileUpload inserted below the form */}
                <div className="mt-4">
                  <FileUpload onFileSelect={handleFileSelect} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminProducts;
