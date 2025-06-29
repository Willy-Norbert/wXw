
import React from 'react';
import { Star, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllReviews } from '@/api/reviews';

const TestimonialSection = () => {
  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: getAllReviews,
    staleTime: 300000, // 5 minutes
  });

  const reviews = reviewsData?.data || [];

  // Fallback testimonials if no reviews or loading
  const fallbackTestimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      comment: "Amazing products and fast delivery! Will definitely shop here again.",
      product: "Premium Quality"
    },
    {
      id: 2,
      name: "Mike Chen",
      rating: 5,
      comment: "Excellent customer service and great value for money.",
      product: "Great Service"
    },
    {
      id: 3,
      name: "Emma Davis",
      rating: 5,
      comment: "Love the variety of products available. Highly recommended!",
      product: "Wide Selection"
    }
  ];

  // Use real reviews if available, otherwise fallback
  const displayTestimonials = reviews.length > 0 
    ? reviews.slice(0, 6).map(review => ({
        id: review.id,
        name: review.user.name,
        rating: review.rating,
        comment: review.comment,
        product: "Verified Purchase"
      }))
    : fallbackTestimonials;

  if (error) {
    console.error('Error loading reviews for testimonials:', error);
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {reviews.length > 0 
              ? `Read what our ${reviews.length} satisfied customers have to say about their experience`
              : "Discover why customers love shopping with us"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayTestimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < testimonial.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
              <div className="text-sm text-purple-600 font-medium">
                {testimonial.product}
              </div>
            </div>
          ))}
        </div>

        {!isLoading && reviews.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Be the first to leave a review and help other customers!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialSection;
