
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { getProducts, Product } from '@/api/products';
import { useLanguage } from '@/contexts/LanguageContext';

interface RelatedProductsProps {
  categoryId: number;
  currentProductId: number;
}

const RelatedProducts = ({ categoryId, currentProductId }: RelatedProductsProps) => {
  const { t } = useLanguage();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        const filtered = response.data
          .filter(product => product.categoryId === categoryId && product.id !== currentProductId)
          .slice(0, 4);
        setRelatedProducts(filtered);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categoryId, currentProductId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-gray-600">{t('products.loading_related')}</div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-8">{t('products.you_might_like')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
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
    </section>
  );
};

export default RelatedProducts;
