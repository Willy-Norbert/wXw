
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, Category } from '@/api/categories';
import { useLanguage } from '@/contexts/LanguageContext';

const CategorySection = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getCategories();
        setCategories(response.data.slice(0, 6)); // Show first 6 categories for the grid layout
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Default category data with colors and images
  const defaultCategories = [
    {
      id: 1,
      name: "Cosmetics and Personal Products",
      description: "Beauty and personal care items",
      bgColor: "bg-pink-100",
      textColor: "text-pink-800",
      image: "/Cosmetics.jpeg"
    },
    {
      id: 2,
      name: "Clothes",
      description: "Fashion and apparel",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      image: "/Hero01.jpg"
    },
    {
      id: 3,
      name: "Made in Rwanda",
      description: "Local Rwandan products",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      image: "/Convention.jpg"
    },
    {
      id: 4,
      name: "Household Products",
      description: "Home and kitchen items",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      image: "/Gentil.jpg"
    },
    {
      id: 5,
      name: "Shoes",
      description: "Footwear for all occasions",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      image: "/Shoes.jpeg"
    },
    {
      id: 6,
      name: "Electronics",
      description: "Tech and gadgets",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      image: "/Hero.jpg"
    }
  ];

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-lg text-gray-600">{t('categories.loading')}</div>
          </div>
        </div>
      </section>
    );
  }

  // Use fetched categories if available, otherwise use default categories
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          BROWSE BY CATEGORIES
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCategories.slice(0, 6).map((category, index) => {
              const defaultCat = defaultCategories[index] || defaultCategories[0];
              return (
                <Link
                  key={category.id}
                  to={`/store?category=${category.id}`}
                  className="group"
                >
                  <div className={`${defaultCat.bgColor} rounded-2xl p-6 h-48 flex flex-col justify-between transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg relative overflow-hidden`}>
                    {/* Background image overlay */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                      style={{ backgroundImage: `url(${defaultCat.image})` }}
                    />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className={`text-lg font-bold ${defaultCat.textColor} mb-2 leading-tight`}>
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className={`text-sm ${defaultCat.textColor} opacity-80`}>
                          {category.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Product illustration/icon in bottom right */}
                    <div className="relative z-10 flex justify-end">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <img 
                          src={defaultCat.image} 
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded-lg opacity-80"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
