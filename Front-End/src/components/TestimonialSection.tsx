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

  // Get reviews from API response (assuming data structure has data array)
  const reviews = reviewsData?.data || [];

  // Example filter: only 5-star reviews (remove or change as needed)
  const filteredReviews = reviews.filter(review => review.rating === 5);

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
            {filteredReviews.length > 0 
              ? `Read what our ${filteredReviews.length} satisfied customers have to say about their experience`
              : "No reviews available at the moment."
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
            loop={filteredReviews.length > 3} // loop only if more than 3 reviews
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
            {filteredReviews.slice(0, 12).map((review) => (
              <SwiperSlide key={review.id}>
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < review.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">"{review.comment}"</p>
                  <div className="text-sm text-purple-600 font-medium">
                    Verified Purchase
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {!isLoading && filteredReviews.length === 0 && (
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
