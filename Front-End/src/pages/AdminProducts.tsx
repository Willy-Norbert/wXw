
import React, { useState, useContext, useEffect } from 'react';
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
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';

const AdminProducts = () => {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const userRole = user?.role?.toLowerCase();
  const isSeller = userRole === 'seller';
  const isAdmin = userRole === 'admin';

  console.log('🛍️ AdminProducts: User role:', userRole, 'Is Seller:', isSeller);

  // Check if seller is approved
  const sellerNotApproved = isSeller && (user?.sellerStatus !== 'ACTIVE' || !user?.isActive);

  // If seller is not approved, show blocked page
  if (sellerNotApproved) {
    return <SellerBlocked />;
  }

  // Fetch products based on user role
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: isSeller ? ['seller-products'] : ['products'],
    queryFn: () => {
      console.log('📦 Fetching products for role:', userRole);
      return isSeller ? getSellerProducts() : getProducts();
    },
    select: (response) => {
      const productData = response.data || [];
      console.log('✅ Products fetched:', productData.length, 'items');
      return productData;
    }
  });

  // Fetch categories for the form
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (response) => response.data || []
  });

  // Image upload hook
  const { uploadImage, selectedFile, setSelectedFile, imageUrl, setImageUrl, previewImage, resetForm } = useImageUpload();

  // Product mutations with improved error handling
  const { createProductMutation, updateProductMutation, deleteProductMutation } = useProductMutations(
    uploadImage,
    selectedFile,
    imageUrl,
    () => {
      resetForm();
      setIsFormOpen(false);
      setEditingProduct(null);
    }
  );

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = async (data) => {
    try {
      console.log('➕ Creating product:', data);
      await createProductMutation.mutateAsync(data);
      console.log('✅ Product creation successful');
      toast({
        title: "Success",
        description: "Product created successfully!",
      });
      setIsFormOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error('❌ Error creating product:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create product",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProduct = async (data) => {
    try {
      console.log('🔄 Updating product:', editingProduct.id, data);
      await updateProductMutation.mutateAsync({ id: editingProduct.id, data });
      console.log('✅ Product update successful');
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });
      setEditingProduct(null);
      setIsFormOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error('❌ Error updating product:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        console.log('🗑️ Deleting product:', productId);
        await deleteProductMutation.mutateAsync(productId);
        console.log('✅ Product deletion successful');
        toast({
          title: "Success",
          description: "Product deleted successfully!",
        });
        refetch();
      } catch (error) {
        console.error('❌ Error deleting product:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete product",
          variant: "destructive"
        });
      }
    }
  };

  const handleEditProduct = (product) => {
    console.log('✏️ Editing product:', product.id);
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageUrl('');
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setSelectedFile(null);
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

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder={t('products.search_placeholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200" 
          />
        </div>

        {/* Product Table */}
        <ProductTable 
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          userRole={userRole}
        />

        {/* Product Form Modal */}
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
                  onFileChange={handleFileChange}
                  onUrlChange={handleUrlChange}
                  previewImage={previewImage}
                  isLoading={createProductMutation.isPending || updateProductMutation.isPending}
                  onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  onCancel={handleCloseForm}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminProducts;
