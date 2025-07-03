
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '@/api/products';
import { getCategories } from '@/api/categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Search, Star, Filter, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

const ProductStore = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const { addToCart, cartItemsCount, isAddingToCart } = useCart();

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  // Filter products based on search and category
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      if (categoryFromUrl) {
        matchesCategory = product.categoryId === parseInt(categoryFromUrl);
      } else {
        matchesCategory = product.category?.name === selectedCategory;
      }
    }
    
    return matchesSearch && matchesCategory && product.isVisible && product.stock > 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleAddToCart = (productId: number) => {
    addToCart({ productId, quantity: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error loading products</h1>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-purple-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Product Store
                  </h1>
                  <p className="text-gray-600">Discover amazing products from our sellers</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/cart">
                <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 relative">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Cart
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6 border-purple-100 shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name or description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-purple-600">{currentProducts.length}</span> of{' '}
            <span className="font-semibold text-purple-600">{filteredProducts.length}</span> products
            {searchTerm && <span> for "<span className="font-semibold">{searchTerm}</span>"</span>}
          </p>
          <div className="text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Products Grid */}
        {currentProducts.length === 0 ? (
          <Card className="border-purple-100">
            <CardContent className="text-center py-12">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setCurrentPage(1);
                }}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map((product: any) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-purple-100 hover:border-purple-300 bg-white">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.coverImage}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.averageRating && (
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md">
                        <div className="flex items-center text-xs">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="ml-1 font-medium">{product.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {product.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2 h-10">
                      {product.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {product.price.toLocaleString()} Rwf
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
                        {product.category?.name}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {product.stock} in stock
                      </span>
                      <span className="text-xs">By: {product.createdBy?.businessName || product.createdBy?.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/products/${product.id}`} className="flex-1">
                        <Button variant="outline" className="w-full text-purple-600 border-purple-200 hover:bg-purple-50">
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        onClick={() => handleAddToCart(product.id)}
                        disabled={isAddingToCart || product.stock === 0}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className={currentPage === page 
                      ? "bg-purple-600 hover:bg-purple-700" 
                      : "border-purple-200 text-purple-600 hover:bg-purple-50"
                    }
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductStore;
