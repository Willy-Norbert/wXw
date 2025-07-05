import React, { useState, useContext } from 'react';
import { Star, ShoppingCart, MessageSquare, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createProductReview, getProductReviews } from '@/api/reviews';

// Import supabase client to construct full image URL
import { supabase } from '@/lib/supabase';  // Adjust this import path if necessary

interface ProductCardProps {
  id: string;
  image: string; // can be full URL or storage path
  title: string;
  price: string;
  originalPrice?: string;
  rating?: number;
  numReviews?: number;
  averageRating?: number;
  seller?: {
    name: string;
    businessName?: string;
  };
}

// Helper to get full public URL for an image stored in Supabase storage
const getPublicImageUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // Already a full URL
  // Build the URL based on your Supabase storage public URL and bucket name
  // Adjust bucket name if different
  const bucketName = 'ecommerce';
  return supabase.storage.from(bucketName).getPublicUrl(path).data.publicUrl || '';
};

const ProductCard = ({ 
  id, 
  image, 
  title, 
  price, 
  originalPrice, 
  rating = 0, 
  numReviews = 0,
  averageRating = 0,
  seller
}: ProductCardProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const queryClient = useQueryClient();
  const { addToCart, isAddingToCart, refetchCart } = useCart();
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const { data: reviewsData } = useQuery({
    queryKey: ['product-reviews', id],
    queryFn: () => getProductReviews(id),
    select: (response) => response.data || [],
    enabled: !!id
  });

  const realTimeRating = reviewsData && reviewsData.length > 0 
    ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length 
    : averageRating || rating || 0;

  const realTimeNumReviews = reviewsData ? reviewsData.length : numReviews;

  const submitReviewMutation = useMutation({
    mutationFn: (reviewData: { rating: number; comment: string }) => {
      if (!id) {
        throw new Error('Product ID is required');
      }
      return createProductReview(id, reviewData);
    },
    onSuccess: () => {
      toast({
        title: t('review.submitted') || "Review submitted",
        description: t('review.thank_you') || "Thank you for your review!",
      });
      setReviewComment('');
      setReviewRating(5);
      setShowReviewDialog(false);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      let errorMessage = t('review.submission_error') || "Failed to submit review";
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const productId = parseInt(id);
      if (isNaN(productId)) {
        throw new Error('Invalid product ID');
      }
      
      await addToCart({ productId, quantity: 1 });
      setTimeout(() => refetchCart(), 500);
      
    } catch (err: unknown) {
      let errorMessage = t('cart.failed_to_add') || "Failed to add to cart";
      if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      }
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSubmitReview = () => {
    if (!reviewComment.trim()) {
      toast({
        title: t('common.error'),
        description: t('review.comment_required') || "Please write a comment for your review",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: t('auth.login_required'),
        description: t('review.login_to_review') || "You must be logged in to submit a review",
        variant: "destructive",
      });
      return;
    }

    submitReviewMutation.mutate({ 
      rating: reviewRating, 
      comment: reviewComment.trim() 
    });
  };

  const StarRating = ({ value, onChange, readonly = false }: { 
    value: number; 
    onChange?: (value: number) => void; 
    readonly?: boolean;
  }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 cursor-pointer transition-colors ${
            star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
          } ${readonly ? 'cursor-default' : 'hover:text-yellow-300'}`}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  );

  return (
    <Link to={`/products/${id}`} className="block">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group hover:scale-105">
        <div className="relative overflow-hidden rounded-t-xl">
          <img 
            src={getPublicImageUrl(image)} 
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ShoppingCart className="w-4 h-4 text-purple-500" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">{title}</h3>
          
          {seller && (
            <div className="flex items-center mb-2 text-xs text-gray-600">
              <User className="w-3 h-3 mr-1" />
              <span>{seller.businessName || seller.name}</span>
            </div>
          )}
          
          <div className="flex items-center mb-2 space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${
                    i < Math.floor(realTimeRating) 
                      ? 'text-yellow-400 fill-current' 
                      : i < realTimeRating 
                      ? 'text-yellow-400 fill-current opacity-50' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            {realTimeNumReviews > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <MessageSquare className="w-3 h-3 mr-1" />
                <span>({realTimeNumReviews})</span>
              </div>
            )}
            {realTimeRating > 0 && (
              <span className="text-xs text-gray-600">
                {typeof realTimeRating === 'number' ? realTimeRating.toFixed(1) : 'N/A'}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-purple-500">{price}</span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                t('cart.add_to_cart') || 'Add to Cart'
              )}
            </Button>
            
            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!user) {
                      toast({
                        title: t('auth.login_required'),
                        description: t('review.login_to_review') || "Please log in to add a review",
                        variant: "destructive",
                      });
                      return;
                    }
                    setShowReviewDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                  <DialogTitle>{t('review.add_review_for') || 'Add Review for'} {title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('review.rating') || 'Rating'}
                    </label>
                    <StarRating value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('review.comment') || 'Comment'}
                    </label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={t('review.share_experience') || "Share your experience with this product..."}
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={submitReviewMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {submitReviewMutation.isPending 
                        ? t('review.submitting') || 'Submitting...' 
                        : t('review.submit') || 'Submit Review'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowReviewDialog(false);
                        setReviewComment('');
                        setReviewRating(5);
                      }}
                    >
                      {t('common.cancel') || 'Cancel'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
