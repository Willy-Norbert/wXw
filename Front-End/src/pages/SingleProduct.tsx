import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductReviews from '@/components/ProductReviews';
import RelatedProducts from '@/components/RelatedProducts';
import { getProductById, Product } from '@/api/products';
import { useCart } from '@/hooks/useCart';
import { AuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SingleProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const { addToCart, isAddingToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await getProductById(id);

        if (response.data) {
          setProduct(response.data);
          if (response.data.colors?.length > 0) setSelectedColor(response.data.colors[0]);
          if (response.data.sizes?.length > 0) setSelectedSize(response.data.sizes[0]);
        } else {
          throw new Error('No product data received');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load product';
        setError(errorMessage);
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart({ productId: product.id, quantity });
      toast({ title: 'Success', description: `${product.name} added to cart` });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add to cart',
        variant: 'destructive',
      });
    }
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">{error || 'Product not found'}</div>
            <Button onClick={() => window.location.reload()} className="bg-purple-500 hover:bg-purple-600">
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const productImages = product.coverImage ? [product.coverImage] : [];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-sm text-gray-500 mb-6">
          Home / Shop / {product.category?.name || 'Category'} / {product.name}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={productImages[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-500">(4.5)</span>
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-6">{product.price.toLocaleString()} Rwf</p>
            <p className="text-gray-600 mb-6">{product.description}</p>

            {product.colors?.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Color</h3>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-md text-sm ${
                        selectedColor === color ? 'border-purple bg-purple text-white' : 'border-gray-300 text-gray-700 hover:border-purple'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Size</h3>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md ${
                        selectedSize === size
                          ? 'border-purple bg-purple text-white'
                          : 'border-gray-300 text-gray-700 hover:border-purple'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              {product.stock > 0 ? (
                <span className="text-green-600">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <button onClick={decreaseQuantity} className="p-2 hover:bg-gray-100">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button onClick={increaseQuantity} className="p-2 hover:bg-gray-100">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            {['details', 'reviews', 'faq'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'details' ? 'Product Details' : tab === 'reviews' ? 'Rating & Reviews' : 'FAQs'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12">
          {activeTab === 'details' && (
            <div className="prose max-w-none">
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}
          {activeTab === 'reviews' && <ProductReviews productId={product.id} />}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">How should I care for this item?</h4>
                <p className="text-gray-600">Follow care instructions provided with the product</p>
              </div>
            </div>
          )}
        </div>

        <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
      </div>
      <Footer />
    </div>
  );
};

export default SingleProduct;
