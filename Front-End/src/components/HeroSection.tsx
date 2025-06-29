
import { Button } from '@/components/ui/button';
import { Link } from "react-router-dom";
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-r from-purple-50 to-purple-100 py-24 min-h-[800px] flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0 animate-slide-in-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              {t('hero.description')}
            </p>
            <Link to="/products">
              <Button className="bg-purple hover:bg-purple-600 text-white px-8 py-4 text-lg rounded-full">
                {t('hero.shop_now')}
              </Button>
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center animate-fade-in">
            <div className="relative">
              <img 
                src="/Hero01.jpg"
                alt={t('hero.image_alt')}
                className="rounded-2xl shadow-2xl w-100 h-100 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
