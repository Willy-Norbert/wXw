import React from 'react';
import { Star, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllReviews } from '@/api/reviews';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
    },
    {
      id: 4,
      name: "John Smith",
      rating: 5,
      comment: "Outstanding quality and reasonable prices. Very satisfied with my purchase.",
      product: "Excellent Value"
    },
    {
      id: 5,
      name: "Maria Garcia",
      rating: 5,
      comment: "Fast shipping and great customer support. Will order again soon!",
      product: "Fast Delivery"
    },
    {
      id: 6,
      name: "David Wilson",
      rating: 5,
      comment: "High-quality products and professional service. Highly recommended!",
      product: "Professional Service"
    }
  ];

  // Use real reviews if available, otherwise fallback
  const displayTestimonials = reviews.length > 0 
    ? reviews.slice(0, 12).map(review => ({
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

        <div className="max-w-6xl mx-auto">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={true}
            pagination={{ 
              clickable: true,
              dynamicBullets: true
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            loop={true}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
            className="testimonials-swiper"
          >
            {displayTestimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow h-full">
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
                  <p className="text-gray-600 mb-4 line-clamp-3">"{testimonial.comment}"</p>
                  <div className="text-sm text-purple-600 font-medium">
                    {testimonial.product}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {!isLoading && reviews.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Be the first to leave a review and help other customers!
            </p>
          </div>
        )}

        <style>{`
          .testimonials-swiper .swiper-button-next,
          .testimonials-swiper .swiper-button-prev {
            color: #7c3aed;
          }
          
          .testimonials-swiper .swiper-pagination-bullet {
            background-color: #d1d5db;
          }
          
          .testimonials-swiper .swiper-pagination-bullet-active {
            background-color: #7c3aed;
          }
          
          .testimonials-swiper .swiper-button-next:after,
          .testimonials-swiper .swiper-button-prev:after {
            font-size: 20px;
          }
        `}</style>
      </div>
    </section>
  );
};

export default TestimonialSection;
