
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { getCategories } from '@/api/categories';
import { useLanguage } from '@/contexts/LanguageContext';

const CategorySection = () => {
  const { t } = useLanguage();
  
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const categories = categoriesData?.data?.slice(0, 5) || [];

  // Category display data with colors and product images
  const categoryDisplayData = [
    {
      name: 'Cosmetics and Personal Products',
      bgColor: 'bg-pink-100',
      image: '/Cosmetics.jpeg'
    },
    {
      name: 'Clothes',
      bgColor: 'bg-yellow-100',
      image: '/Shoes.jpeg'
    },
    {
      name: 'Made In Rwanda',
      bgColor: 'bg-purple-100',
      image: '/Convention.jpg'
    },
    {
      name: 'Household Products',
      bgColor: 'bg-gray-100',
      image: '/Hero.jpg'
    },
    {
      name: 'Shoes',
      bgColor: 'bg-green-100',
      image: '/Shoes.jpeg'
    }
  ];

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">BROWSE BY CATEGORIES</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-3xl p-8 animate-pulse bg-gray-200 h-48">
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-wide">
            {t('categories.browse_categories')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* First row - 2 large cards */}
          <div className="lg:col-span-1">
            <Link to={`/products?category=${categories[0]?.id || ''}`}>
              <Card className={`${categoryDisplayData[0].bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer h-48 rounded-3xl border-0 overflow-hidden group`}>
                <CardContent className="p-8 h-full flex flex-col justify-between relative">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                      {categoryDisplayData[0].name}
                    </h3>
                  </div>
                  <div className="flex justify-center">
                    <img 
                      src={categoryDisplayData[0].image} 
                      alt={categoryDisplayData[0].name}
                      className="w-24 h-20 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="lg:col-span-1">
            <Link to={`/products?category=${categories[1]?.id || ''}`}>
              <Card className={`${categoryDisplayData[1].bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer h-48 rounded-3xl border-0 overflow-hidden group`}>
                <CardContent className="p-8 h-full flex flex-col justify-between relative">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                      {categoryDisplayData[1].name}
                    </h3>
                  </div>
                  <div className="flex justify-center">
                    <img 
                      src={categoryDisplayData[1].image} 
                      alt={categoryDisplayData[1].name}
                      className="w-24 h-20 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Second row - 3 cards */}
          <div className="lg:col-span-1">
            <Link to={`/products?category=${categories[2]?.id || ''}`}>
              <Card className={`${categoryDisplayData[2].bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer h-48 rounded-3xl border-0 overflow-hidden group`}>
                <CardContent className="p-8 h-full flex flex-col justify-between relative">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                      {categoryDisplayData[2].name}
                    </h3>
                  </div>
                  <div className="flex justify-center">
                    <img 
                      src={categoryDisplayData[2].image} 
                      alt={categoryDisplayData[2].name}
                      className="w-20 h-16 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="lg:col-span-1">
            <Link to={`/products?category=${categories[3]?.id || ''}`}>
              <Card className={`${categoryDisplayData[3].bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer h-48 rounded-3xl border-0 overflow-hidden group`}>
                <CardContent className="p-8 h-full flex flex-col justify-between relative">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                      {categoryDisplayData[3].name}
                    </h3>
                  </div>
                  <div className="flex justify-center">
                    <img 
                      src={categoryDisplayData[3].image} 
                      alt={categoryDisplayData[3].name}
                      className="w-24 h-20 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="lg:col-span-1">
            <Link to={`/products?category=${categories[4]?.id || ''}`}>
              <Card className={`${categoryDisplayData[4].bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer h-48 rounded-3xl border-0 overflow-hidden group`}>
                <CardContent className="p-8 h-full flex flex-col justify-between relative">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                      {categoryDisplayData[4].name}
                    </h3>
                  </div>
                  <div className="flex justify-center">
                    <img 
                      src={categoryDisplayData[4].image} 
                      alt={categoryDisplayData[4].name}
                      className="w-24 h-20 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link 
            to="/categories" 
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('categories.view_all')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
