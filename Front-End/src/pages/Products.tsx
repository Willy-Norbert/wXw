
import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/api/products';
import { getCategories } from '@/api/categories';
import { useProductFilters } from '@/hooks/useProductFilters';
import { useLanguage } from '@/contexts/LanguageContext';

const Products = () => {
  const { t } = useLanguage();
  
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  const {
    filteredProducts,
    filters,
    updatePriceRange,
    toggleCategory,
    updateSearchQuery,
    clearFilters
  } = useProductFilters(products, categories);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">{t('error.failed_load_products')}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5" />
                <h2 className="text-lg font-semibold">{t('translation.filters')}</h2>
              </div>

              {/* Search Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">{t('products.search')}</h3>
                <Input
                  placeholder={t('products.search_placeholder')}
                  value={filters.searchQuery}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">{t('products.category')}</h3>
                <div className="space-y-2 text-sm">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.selectedCategories.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="mr-2"
                        />
                        <span>{category.name}</span>
                      </label>
                      <span className="text-gray-500">
                        {products.filter(p => p.categoryId === category.id).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{t('products.price_range')}</h3>
                  <ChevronDown className="w-4 h-4" />
                </div>
                <div className="space-y-3">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updatePriceRange(value as [number, number])}
                    max={3000000}
                    min={5000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <span>{filters.priceRange[0].toLocaleString()} Rwf</span>
                    <span>-</span>
                    <span>{filters.priceRange[1].toLocaleString()} Rwf</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={clearFilters}
                variant="outline" 
                className="w-full mb-3"
              >
                {t('products.clear_filters')}
              </Button>

              <div className="text-sm text-gray-500">
                {t('products.showing_results', { count: filteredProducts.length, total: products.length })}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{t('products.no_products_matching')}</p>
                <Button onClick={clearFilters} variant="outline" className="mt-4">
                  {t('products.clear_filters')}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      id={product.id.toString()}
                      image={product.coverImage}
                      title={product.name}
                      price={`${product.price.toLocaleString()} Rwf`}
                      rating={5}
                    />
                  ))}
                </div>

                {/* Pagination Placeholder */}
                <div className="flex items-center justify-center gap-2">
                  <button className="px-3 py-2 text-sm text-gray-500 hover:text-purple">
                    {t('products.previous')}
                  </button>
                  
                  <button className="w-8 h-8 bg-purple text-white text-sm rounded">
                    1
                  </button>
                  <button className="w-8 h-8 text-sm text-gray-700 hover:text-purple">
                    2
                  </button>
                  <button className="w-8 h-8 text-sm text-gray-700 hover:text-purple">
                    3
                  </button>
                  <span className="px-2 text-gray-500">...</span>
                  
                  <button className="px-3 py-2 text-sm text-gray-500 hover:text-purple">
                    {t('products.next')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
