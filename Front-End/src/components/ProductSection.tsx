
import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/api/products';

interface ProductSectionProps {
  title: string;
  products: Product[];
}

const ProductSection = ({ title, products }: ProductSectionProps) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id.toString()}
              image={product.coverImage}
              title={product.name}
              price={`${product.price.toLocaleString()} Rwf`}
              rating={product.averageRating || 0}
              numReviews={product.numReviews || 0}
              averageRating={product.averageRating || 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
