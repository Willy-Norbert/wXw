
import { useState, useMemo } from 'react';
import { Product } from '@/api/products';
import { Category } from '@/api/categories';

interface FilterState {
  priceRange: [number, number];
  selectedCategories: number[];
  selectedSizes: string[];
  searchQuery: string;
}

export const useProductFilters = (products: Product[], categories: Category[]) => {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [5000, 3000000],
    selectedCategories: [],
    selectedSizes: [],
    searchQuery: ''
  });

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Price filter
      const priceInRange = product.price >= filters.priceRange[0] && 
                           product.price <= filters.priceRange[1];
      
      // Category filter
      const categoryMatch = filters.selectedCategories.length === 0 || 
                           filters.selectedCategories.includes(product.categoryId);
      
      // Search filter
      const searchMatch = filters.searchQuery === '' || 
                         product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(filters.searchQuery.toLowerCase());

      return priceInRange && categoryMatch && searchMatch;
    });
  }, [products, filters]);

  const updatePriceRange = (newRange: [number, number]) => {
    setFilters(prev => ({ ...prev, priceRange: newRange }));
  };

  const toggleCategory = (categoryId: number) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  };

  const toggleSize = (size: string) => {
    setFilters(prev => ({
      ...prev,
      selectedSizes: prev.selectedSizes.includes(size)
        ? prev.selectedSizes.filter(s => s !== size)
        : [...prev.selectedSizes, size]
    }));
  };

  const updateSearchQuery = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [5000, 3000000],
      selectedCategories: [],
      selectedSizes: [],
      searchQuery: ''
    });
  };

  return {
    filteredProducts,
    filters,
    updatePriceRange,
    toggleCategory,
    toggleSize,
    updateSearchQuery,
    clearFilters
  };
};
