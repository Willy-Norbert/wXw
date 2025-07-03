
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProductSection from '@/components/ProductSection';
import CategorySection from '@/components/CategorySection';
import TestimonialSection from '@/components/TestimonialSection';
import Footer from '@/components/Footer';
import { getProducts } from '@/api/products';
import { Product } from '@/api/products';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t } = useLanguage();
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [topSelling, setTopSelling] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        const products = response.data;
        
        // Split products for different sections (you can implement your own logic)
        const half = Math.ceil(products.length / 2);
        setNewArrivals(products.slice(0, half));
        setTopSelling(products.slice(half));
      } catch (err: any) {
        setError(t('error.failed_load_products'));
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [t]);

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ProductSection title={t('home.new_arrivals')} products={newArrivals} />
      <ProductSection title={t('home.top_selling')} products={topSelling} />
      <CategorySection />
      <TestimonialSection />
      <Footer />
    </div>
  );
};

export default Index;
