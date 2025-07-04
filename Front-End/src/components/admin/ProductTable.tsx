import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Eye, ExternalLink, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface ProductTableProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (productId: string) => void;
  userRole?: string;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete, userRole }) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {userRole === 'seller' ? 'My Products' : t('products.all')} ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left">{t('products.name')}</th>
                <th className="px-4 py-3 text-left">{t('products.category')}</th>
                <th className="px-4 py-3 text-left">{t('products.price')}</th>
                <th className="px-4 py-3 text-left">{t('products.stock')}</th>
                {userRole === 'admin' && (
                  <th className="px-4 py-3 text-left">Seller</th>
                )}
                <th className="px-4 py-3 text-left">Reviews</th>
                <th className="px-4 py-3 text-left">{t('products.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length > 0 ? products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link 
                      to={`/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{product.category?.name || 'N/A'}</td>
                  <td className="px-4 py-3">{product.price.toLocaleString()} Rwf</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  {userRole === 'admin' && (
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {product.createdBy?.businessName || product.createdBy?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">
                        {typeof product.averageRating === 'number'
                          ? product.averageRating.toFixed(1)
                          : '0.0'}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({product.numReviews || 0})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Link to={`/products/${product.id}`}>
                        <Button variant="ghost" size="sm" title="View Product Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {/* <Link to={`/store`} target="_blank">
                        <Button variant="ghost" size="sm" title="View on Store" className="text-green-600 hover:text-green-800">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link> */}
                      <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDelete(product.id.toString())} 
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={userRole === 'admin' ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
                    {userRole === 'seller' ? 'No products created yet' : t('products.no_products')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
